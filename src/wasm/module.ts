import { ByteWriter, SectionId, ValType } from './encoder.js'

export interface FuncType {
  params: ValType[]
  results: ValType[]
}

export interface WasmFunc {
  name: string
  type: FuncType
  /** Local declarations beyond params, in order */
  locals: ValType[]
  /** Encoded instruction body WITHOUT the trailing 0x0b end opcode */
  body: Uint8Array
  exported: boolean
}

function typeKey(t: FuncType): string {
  return `${t.params.join(',')}|${t.results.join(',')}`
}

export class ModuleBuilder {
  private types: FuncType[] = []
  private typeIndex = new Map<string, number>()
  private funcs: WasmFunc[] = []

  internType(t: FuncType): number {
    const k = typeKey(t)
    const existing = this.typeIndex.get(k)
    if (existing !== undefined) return existing
    const idx = this.types.length
    this.types.push(t)
    this.typeIndex.set(k, idx)
    return idx
  }

  addFunc(f: WasmFunc): number {
    this.internType(f.type)
    const idx = this.funcs.length
    this.funcs.push(f)
    return idx
  }

  /** Index of a function by its mangled name, or -1 */
  funcIndex(name: string): number {
    return this.funcs.findIndex((f) => f.name === name)
  }

  get functions(): readonly WasmFunc[] {
    return this.funcs
  }

  private section(id: SectionId, payload: ByteWriter): Uint8Array {
    const out = new ByteWriter()
    out.u8(id)
    const bytes = payload.toBytes()
    out.u32(bytes.length)
    out.bytes(bytes)
    return out.toBytes()
  }

  build(): Uint8Array {
    const out = new ByteWriter()
    // magic + version
    out.bytes([0x00, 0x61, 0x73, 0x6d])
    out.bytes([0x01, 0x00, 0x00, 0x00])

    // --- Type section ---
    {
      const w = new ByteWriter()
      w.u32(this.types.length)
      for (const t of this.types) {
        w.u8(0x60)
        w.u32(t.params.length)
        for (const p of t.params) w.u8(p)
        w.u32(t.results.length)
        for (const r of t.results) w.u8(r)
      }
      out.bytes(this.section(SectionId.Type, w))
    }

    // --- Function section ---
    {
      const w = new ByteWriter()
      w.u32(this.funcs.length)
      for (const f of this.funcs) w.u32(this.internType(f.type))
      out.bytes(this.section(SectionId.Function, w))
    }

    // --- Export section ---
    {
      const exported = this.funcs
        .map((f, i) => ({ f, i }))
        .filter(({ f }) => f.exported)
      const w = new ByteWriter()
      w.u32(exported.length)
      for (const { f, i } of exported) {
        w.name(f.name)
        w.u8(0x00) // func
        w.u32(i)
      }
      out.bytes(this.section(SectionId.Export, w))
    }

    // --- Code section ---
    {
      const w = new ByteWriter()
      w.u32(this.funcs.length)
      for (const f of this.funcs) {
        const fn = new ByteWriter()
        // Run-length encode locals
        const runs: Array<[number, ValType]> = []
        for (const l of f.locals) {
          const last = runs[runs.length - 1]
          if (last && last[1] === l) last[0]++
          else runs.push([1, l])
        }
        fn.u32(runs.length)
        for (const [count, t] of runs) {
          fn.u32(count)
          fn.u8(t)
        }
        fn.bytes(f.body)
        fn.u8(0x0b) // end

        const fnBytes = fn.toBytes()
        w.u32(fnBytes.length)
        w.bytes(fnBytes)
      }
      out.bytes(this.section(SectionId.Code, w))
    }

    return out.toBytes()
  }
}
