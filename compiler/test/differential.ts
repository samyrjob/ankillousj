/**
 * Differential test: run each method on the real JVM (via a generated harness)
 * and on our compiled WASM, then compare. The JVM is the oracle — no
 * hand-written expected values to get wrong.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { compileClass } from '../dist/compiler/compile.js'

const here = dirname(fileURLToPath(import.meta.url))
const javaDir = join(here, 'java')

interface Call { fn: string; args: Array<number | bigint> }

const CALLS: Call[] = [
  // shift masking
  { fn: 'ishlMask', args: [1, 32] }, { fn: 'ishlMask', args: [1, 33] },
  { fn: 'ishlMask', args: [1, -1] }, { fn: 'ishlMask', args: [5, 3] },
  { fn: 'ishrMask', args: [-16, 33] }, { fn: 'ishrMask', args: [-16, 2] },
  { fn: 'iushrMask', args: [-16, 33] }, { fn: 'iushrMask', args: [-1, 1] },
  { fn: 'iushrMask', args: [-16, 2] },
  { fn: 'lshlMask', args: [1n, 64] }, { fn: 'lshlMask', args: [1n, 65] },
  { fn: 'lshlMask', args: [3n, 10] },
  { fn: 'lushrMask', args: [-1n, 1] }, { fn: 'lushrMask', args: [-1n, 64] },
  { fn: 'lshrMask', args: [-256n, 4] },
  // overflow
  { fn: 'intOverflow', args: [] }, { fn: 'intMulOverflow', args: [] },
  { fn: 'longOverflow', args: [] },
  // narrowing
  { fn: 'narrowByte', args: [300] }, { fn: 'narrowByte', args: [-1] },
  { fn: 'narrowByte', args: [127] }, { fn: 'narrowByte', args: [128] },
  { fn: 'narrowChar', args: [-1] }, { fn: 'narrowChar', args: [65536] },
  { fn: 'narrowShort', args: [40000] }, { fn: 'narrowShort', args: [-40000] },
  // float/double truncation
  { fn: 'd2iNaN', args: [] }, { fn: 'd2iHuge', args: [] },
  { fn: 'd2iNegHuge', args: [] }, { fn: 'd2lHuge', args: [] },
  { fn: 'f2iNaN', args: [] },
  // NaN comparisons
  { fn: 'nanLess', args: [Number.NaN, 1] }, { fn: 'nanLess', args: [1, Number.NaN] },
  { fn: 'nanLess', args: [1, 2] },
  { fn: 'nanGreater', args: [Number.NaN, 1] }, { fn: 'nanGreater', args: [2, 1] },
  // control flow
  { fn: 'doWhile', args: [5] }, { fn: 'doWhile', args: [0] }, { fn: 'doWhile', args: [1] },
  { fn: 'nested', args: [1, 2, 3] }, { fn: 'nested', args: [3, 2, 1] },
  { fn: 'nested', args: [2, 3, 1] }, { fn: 'nested', args: [5, 5, 5] },
  { fn: 'chainAssign', args: [10] },
  { fn: 'chainAssignLong', args: [7n] },
  { fn: 'triple', args: [8] }, { fn: 'triple', args: [0] },
  { fn: 'skipEvens', args: [20] }, { fn: 'skipEvens', args: [100] },
  { fn: 'sparse', args: [1] }, { fn: 'sparse', args: [100] },
  { fn: 'sparse', args: [5000] }, { fn: 'sparse', args: [7] },
  { fn: 'fallthrough', args: [0] }, { fn: 'fallthrough', args: [1] },
  { fn: 'fallthrough', args: [2] }, { fn: 'fallthrough', args: [3] },
  { fn: 'fallthrough', args: [9] },
  { fn: 'isEven', args: [10] }, { fn: 'isEven', args: [7] },
  { fn: 'isOdd', args: [7] },
  { fn: 'slotReuse', args: [10] },
  { fn: 'negI', args: [-2147483648] }, { fn: 'negI', args: [5] },
  { fn: 'negL', args: [-9223372036854775808n] }, { fn: 'negL', args: [5n] },
  { fn: 'negF', args: [0] }, { fn: 'negD', args: [0] }, { fn: 'negD', args: [-3.5] },
  { fn: 'deep', args: [17] }, { fn: 'deep', args: [-5] },
]

// ---------------------------------------------------------------------------
// Build a Java harness that prints each result, so the JVM is our oracle
// ---------------------------------------------------------------------------

function javaLiteral(v: number | bigint, jtype: string): string {
  if (jtype === 'J') return `${v}L`
  if (jtype === 'D') {
    if (Number.isNaN(v as number)) return 'Double.NaN'
    return `${v}d`
  }
  if (jtype === 'F') return `${v}f`
  return `${v}`
}

// Read descriptors straight out of the class file so the harness always matches
const { parseClassFile, ACC } = await import('../dist/classfile/parser.js')
const stressClassPath = join(javaDir, 'Stress.class')
if (!existsSync(stressClassPath)) {
  console.error('Stress.class missing — run: javac -d test/java test/java/Stress.java')
  process.exit(2)
}
const cf = parseClassFile(new Uint8Array(readFileSync(stressClassPath)))
const descOf = new Map<string, string>()
for (const m of cf.methods) {
  if ((m.accessFlags & ACC.STATIC) !== 0) descOf.set(m.name, m.descriptor)
}

const lines: string[] = []
for (const c of CALLS) {
  const desc = descOf.get(c.fn)
  if (!desc) { console.error(`no such method ${c.fn}`); process.exit(2) }
  const paramTypes = desc.slice(1, desc.indexOf(')')).split('').filter((ch) => 'IJFDZ'.includes(ch))
  const args = c.args.map((a, i) => javaLiteral(a, paramTypes[i] ?? 'I')).join(', ')
  lines.push(`        System.out.println(Stress.${c.fn}(${args}));`)
}

const harness = `public class Harness {
    public static void main(String[] a) {
${lines.join('\n')}
    }
}
`
writeFileSync(join(javaDir, 'Harness.java'), harness)
execFileSync('javac', ['-d', javaDir, '-cp', javaDir, join(javaDir, 'Harness.java')], { stdio: 'pipe' })
const jvmOut = execFileSync('java', ['-cp', javaDir, 'Harness'], { encoding: 'utf8' })
  .trim().split('\n').map((s) => s.trim())

// ---------------------------------------------------------------------------
// Compile to WASM and run the same calls
// ---------------------------------------------------------------------------

const result = compileClass(new Uint8Array(readFileSync(stressClassPath)))
console.log(`compiled ${result.compiled.length}, skipped ${result.skipped.length}`)
for (const s of result.skipped) console.log(`  SKIP ${s.method}: ${s.reason}`)
console.log()

let inst: WebAssembly.Instance
try {
  inst = new WebAssembly.Instance(new WebAssembly.Module(result.wasm), {})
} catch (e) {
  console.error('WASM validation failed:', e)
  process.exit(1)
}
const ex = inst.exports as Record<string, CallableFunction>

function findExport(simple: string): CallableFunction | undefined {
  const prefix = `${result.className.replace(/\//g, '_')}_${simple}_`
  const k = Object.keys(ex).find((x) => x.startsWith(prefix))
  return k ? ex[k] : undefined
}

let pass = 0, fail = 0
const failures: string[] = []

CALLS.forEach((c, i) => {
  const label = `${c.fn}(${c.args.join(',')})`
  const want = jvmOut[i]
  const f = findExport(c.fn)
  if (!f) {
    failures.push(`${label.padEnd(34)} NOT COMPILED (jvm says ${want})`)
    fail++
    return
  }
  let got: string
  try {
    const r = f(...c.args)
    // Java prints booleans as true/false; our i32 returns 0/1
    const desc = descOf.get(c.fn)!
    const ret = desc.slice(desc.indexOf(')') + 1)
    // Java prints -0.0 distinctly; JS String(-0) is "0"
    if (ret === 'Z') got = String(r !== 0)
    else if (typeof r === 'number' && Object.is(r, -0)) got = '-0.0'
    else got = String(r)
  } catch (e) {
    failures.push(`${label.padEnd(34)} THREW ${e} (jvm says ${want})`)
    fail++
    return
  }
  if (got === want) {
    pass++
  } else {
    failures.push(`${label.padEnd(34)} got ${got}  want ${want}`)
    fail++
  }
})

for (const f of failures) console.log(`  ✗ ${f}`)
console.log()
console.log(`${pass} passed, ${fail} failed  (oracle: real JVM)`)
process.exit(fail === 0 ? 0 : 1)
