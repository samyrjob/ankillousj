import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { compileClass } from '../dist/compiler/compile.js'

const here = dirname(fileURLToPath(import.meta.url))
const classFile = join(here, 'java', 'Kernel.class')

const result = compileClass(new Uint8Array(readFileSync(classFile)))

console.log(`class: ${result.className}`)
console.log(`wasm:  ${result.wasm.length} bytes`)
console.log(`compiled ${result.compiled.length}, skipped ${result.skipped.length}`)
for (const s of result.skipped) console.log(`  SKIP ${s.method}: ${s.reason}`)
console.log()

const mod = new WebAssembly.Module(result.wasm)
const inst = new WebAssembly.Instance(mod, {})
const ex = inst.exports as Record<string, CallableFunction>

// Reference implementations (what the JVM would produce)
function jfib(n: number): number { return n < 2 ? n : jfib(n - 1) + jfib(n - 2) }
function jcollatz(n: number): number {
  let s = 0
  while (n !== 1) { n = n % 2 === 0 ? n / 2 : 3 * n + 1; s++ }
  return s
}

interface Case { name: string; fn: string; args: unknown[]; want: unknown }

const cases: Case[] = [
  { name: 'add(2,3)', fn: 'add', args: [2, 3], want: 5 },
  { name: 'add(-7,7)', fn: 'add', args: [-7, 7], want: 0 },
  { name: 'arith(9,4)', fn: 'arith', args: [9, 4], want: 9 * 4 - Math.trunc(9 / 2) + (4 % 7) },
  { name: 'max(3,9)', fn: 'max', args: [3, 9], want: 9 },
  { name: 'max(9,3)', fn: 'max', args: [9, 3], want: 9 },
  { name: 'abs(-42)', fn: 'abs', args: [-42], want: 42 },
  { name: 'abs(42)', fn: 'abs', args: [42], want: 42 },
  { name: 'sumTo(10)', fn: 'sumTo', args: [10], want: 55 },
  { name: 'sumTo(100)', fn: 'sumTo', args: [100], want: 5050 },
  { name: 'fib(10)', fn: 'fib', args: [10], want: jfib(10) },
  { name: 'fib(20)', fn: 'fib', args: [20], want: jfib(20) },
  { name: 'gcd(48,18)', fn: 'gcd', args: [48, 18], want: 6 },
  { name: 'gcd(1071,462)', fn: 'gcd', args: [1071, 462], want: 21 },
  { name: 'factorial(10)', fn: 'factorial', args: [10], want: 3628800n },
  { name: 'factorial(20)', fn: 'factorial', args: [20], want: 2432902008176640000n },
  { name: 'longMath(1000,7)', fn: 'longMath', args: [1000n, 7n], want: 1000n * 7n + (1000n >> 3n) - (7n & 0xffn) },
  { name: 'dmath(3,4)', fn: 'dmath', args: [3, 4], want: (3 * 4) / (3 + 4 + 1) },
  { name: 'compareDoubles(1,2)', fn: 'compareDoubles', args: [1, 2], want: -1 },
  { name: 'compareDoubles(2,1)', fn: 'compareDoubles', args: [2, 1], want: 1 },
  { name: 'compareDoubles(2,2)', fn: 'compareDoubles', args: [2, 2], want: 0 },
  { name: 'collatzSteps(27)', fn: 'collatzSteps', args: [27], want: jcollatz(27) },
  { name: 'collatzSteps(97)', fn: 'collatzSteps', args: [97], want: jcollatz(97) },
  { name: 'classify(0)', fn: 'classify', args: [0], want: 100 },
  { name: 'classify(2)', fn: 'classify', args: [2], want: 300 },
  { name: 'classify(99)', fn: 'classify', args: [99], want: -1 },
  { name: 'mixed(1,2,3,4)', fn: 'mixed', args: [1, 2n, 3, 4], want: 10 },
]

// Exported names are mangled: Kernel_add_II_I etc. Find by prefix.
function findExport(simpleName: string): CallableFunction | undefined {
  const prefix = `${result.className.replace(/\//g, '_')}_${simpleName}_`
  const key = Object.keys(ex).find((k) => k.startsWith(prefix))
  return key ? ex[key] : undefined
}

let pass = 0
let fail = 0

for (const c of cases) {
  const f = findExport(c.fn)
  if (!f) {
    console.log(`  ?  ${c.name.padEnd(28)} export not found`)
    fail++
    continue
  }
  try {
    const got = f(...c.args)
    const ok = typeof c.want === 'number' && typeof got === 'number'
      ? Math.abs(got - c.want) < 1e-9
      : got === c.want
    if (ok) {
      console.log(`  \u2713  ${c.name.padEnd(28)} = ${got}`)
      pass++
    } else {
      console.log(`  \u2717  ${c.name.padEnd(28)} got ${got}, want ${c.want}`)
      fail++
    }
  } catch (e) {
    console.log(`  \u2717  ${c.name.padEnd(28)} threw ${e}`)
    fail++
  }
}

console.log()
console.log(`${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
