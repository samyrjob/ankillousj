import {
  parseClassFile, ClassFile, ACC, MethodInfo, JType, parseMethodDescriptor,
} from '../classfile/parser.js'
import { ValType } from '../wasm/encoder.js'
import { ModuleBuilder, FuncType } from '../wasm/module.js'
import { translateMethod, mangle, UnsupportedError } from './translate.js'

export interface CompileResult {
  wasm: Uint8Array
  className: string
  compiled: string[]
  skipped: Array<{ method: string; reason: string }>
}

export function compileClass(data: Uint8Array): CompileResult {
  const cf: ClassFile = parseClassFile(data)
  const mod = new ModuleBuilder()

  // Candidate methods: static, has code, not <clinit>
  const candidates = cf.methods.filter(
    (m) => (m.accessFlags & ACC.STATIC) !== 0 && m.code !== undefined && m.name !== '<clinit>',
  )

  // Pass 1: assign a stable index to every candidate so calls can be resolved
  const indexOf = new Map<string, number>()
  candidates.forEach((m, i) => indexOf.set(mangle(cf.thisClass, m), i))
  const resolver = (name: string): number => {
    const i = indexOf.get(name)
    if (i === undefined) throw new UnsupportedError(`unresolved call target ${name}`)
    return i
  }

  // Pass 2: translate
  const compiled: string[] = []
  const skipped: Array<{ method: string; reason: string }> = []
  const translated: Array<{ m: MethodInfo; fn: ReturnType<typeof translateMethod> } | null> = []

  for (const m of candidates) {
    try {
      translated.push({ m, fn: translateMethod(cf, m, resolver) })
    } catch (e) {
      translated.push(null)
      skipped.push({
        method: `${m.name}${m.descriptor}`,
        reason: e instanceof Error ? e.message : String(e),
      })
    }
  }

  // A failed method still needs a slot to keep indices stable -> emit a stub that traps
  translated.forEach((t, i) => {
    const m = candidates[i]
    if (t) {
      mod.addFunc({
        name: t.fn.name,
        type: t.fn.type,
        locals: t.fn.locals,
        body: t.fn.body,
        exported: true,
      })
      compiled.push(`${m.name}${m.descriptor}`)
    } else {
      // trap stub with a matching signature
      const stub = stubFor(cf, m)
      mod.addFunc({ ...stub, exported: false })
    }
  })

  return { wasm: mod.build(), className: cf.thisClass, compiled, skipped }
}

function stubFor(cf: ClassFile, m: MethodInfo) {
  // Signature-compatible placeholder whose body traps, so indices stay stable
  const toVal = (t: JType): ValType => {
    if (t === 'I' || t === 'Z' || t === 'B' || t === 'C' || t === 'S') return ValType.i32
    if (t === 'J') return ValType.i64
    if (t === 'F') return ValType.f32
    if (t === 'D') return ValType.f64
    throw new Error('unsupported type in stub')
  }
  let type: FuncType
  try {
    const { params, ret } = parseMethodDescriptor(m.descriptor)
    type = { params: params.map(toVal), results: ret === 'V' ? [] : [toVal(ret)] }
  } catch {
    type = { params: [], results: [] }
  }
  return {
    name: mangle(cf.thisClass, m),
    type,
    locals: [] as ValType[],
    body: new Uint8Array([0x00]), // unreachable
  }
}
