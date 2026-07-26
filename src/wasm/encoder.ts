/**
 * WebAssembly binary format encoder.
 * Spec: https://webassembly.github.io/spec/core/binary/index.html
 */

export class ByteWriter {
  private buf: number[] = []

  get length(): number {
    return this.buf.length
  }

  u8(v: number): this {
    this.buf.push(v & 0xff)
    return this
  }

  bytes(v: ArrayLike<number>): this {
    for (let i = 0; i < v.length; i++) this.buf.push(v[i] & 0xff)
    return this
  }

  /** Unsigned LEB128 */
  u32(v: number): this {
    let x = v >>> 0
    do {
      let b = x & 0x7f
      x >>>= 7
      if (x !== 0) b |= 0x80
      this.buf.push(b)
    } while (x !== 0)
    return this
  }

  /** Signed LEB128 (32-bit) */
  i32(v: number): this {
    let x = v | 0
    let more = true
    while (more) {
      let b = x & 0x7f
      x >>= 7
      const signBit = (b & 0x40) !== 0
      if ((x === 0 && !signBit) || (x === -1 && signBit)) more = false
      else b |= 0x80
      this.buf.push(b)
    }
    return this
  }

  /** Signed LEB128 (64-bit, via BigInt) */
  i64(v: bigint): this {
    let x = BigInt.asIntN(64, v)
    let more = true
    while (more) {
      let b = Number(x & 0x7fn)
      x >>= 7n
      const signBit = (b & 0x40) !== 0
      if ((x === 0n && !signBit) || (x === -1n && signBit)) more = false
      else b |= 0x80
      this.buf.push(b)
    }
    return this
  }

  f32(v: number): this {
    const a = new Uint8Array(4)
    new DataView(a.buffer).setFloat32(0, v, true)
    return this.bytes(a)
  }

  f64(v: number): this {
    const a = new Uint8Array(8)
    new DataView(a.buffer).setFloat64(0, v, true)
    return this.bytes(a)
  }

  /** Length-prefixed UTF-8 string */
  name(s: string): this {
    const enc = new TextEncoder().encode(s)
    this.u32(enc.length)
    return this.bytes(enc)
  }

  /** Length-prefixed vector of pre-encoded elements */
  vecRaw(elems: ByteWriter[]): this {
    this.u32(elems.length)
    for (const e of elems) this.bytes(e.toBytes())
    return this
  }

  toBytes(): Uint8Array {
    return new Uint8Array(this.buf)
  }
}

// ---------------------------------------------------------------------------
// Value types
// ---------------------------------------------------------------------------

export const enum ValType {
  i32 = 0x7f,
  i64 = 0x7e,
  f32 = 0x7d,
  f64 = 0x7c,
}

export function valTypeName(t: ValType): string {
  switch (t) {
    case ValType.i32: return 'i32'
    case ValType.i64: return 'i64'
    case ValType.f32: return 'f32'
    case ValType.f64: return 'f64'
  }
}

// ---------------------------------------------------------------------------
// Instruction opcodes (subset needed for P0)
// ---------------------------------------------------------------------------

export const Op = {
  unreachable: 0x00,
  nop: 0x01,
  block: 0x02,
  loop: 0x03,
  if: 0x04,
  else: 0x05,
  end: 0x0b,
  br: 0x0c,
  br_if: 0x0d,
  br_table: 0x0e,
  return: 0x0f,
  call: 0x10,

  drop: 0x1a,
  select: 0x1b,

  local_get: 0x20,
  local_set: 0x21,
  local_tee: 0x22,

  i32_const: 0x41,
  i64_const: 0x42,
  f32_const: 0x43,
  f64_const: 0x44,

  i32_eqz: 0x45,
  i32_eq: 0x46,
  i32_ne: 0x47,
  i32_lt_s: 0x48,
  i32_lt_u: 0x49,
  i32_gt_s: 0x4a,
  i32_gt_u: 0x4b,
  i32_le_s: 0x4c,
  i32_le_u: 0x4d,
  i32_ge_s: 0x4e,
  i32_ge_u: 0x4f,

  i64_eqz: 0x50,
  i64_eq: 0x51,
  i64_ne: 0x52,
  i64_lt_s: 0x53,
  i64_gt_s: 0x55,
  i64_le_s: 0x57,
  i64_ge_s: 0x59,

  f32_eq: 0x5b,
  f32_ne: 0x5c,
  f32_lt: 0x5d,
  f32_gt: 0x5e,
  f32_le: 0x5f,
  f32_ge: 0x60,

  f64_eq: 0x61,
  f64_ne: 0x62,
  f64_lt: 0x63,
  f64_gt: 0x64,
  f64_le: 0x65,
  f64_ge: 0x66,

  i32_add: 0x6a,
  i32_sub: 0x6b,
  i32_mul: 0x6c,
  i32_div_s: 0x6d,
  i32_div_u: 0x6e,
  i32_rem_s: 0x6f,
  i32_rem_u: 0x70,
  i32_and: 0x71,
  i32_or: 0x72,
  i32_xor: 0x73,
  i32_shl: 0x74,
  i32_shr_s: 0x75,
  i32_shr_u: 0x76,

  i64_add: 0x7c,
  i64_sub: 0x7d,
  i64_mul: 0x7e,
  i64_div_s: 0x7f,
  i64_rem_s: 0x81,
  i64_and: 0x83,
  i64_or: 0x84,
  i64_xor: 0x85,
  i64_shl: 0x86,
  i64_shr_s: 0x87,
  i64_shr_u: 0x88,

  f32_neg: 0x8c,
  f32_add: 0x92,
  f32_sub: 0x93,
  f32_mul: 0x94,
  f32_div: 0x95,

  f64_neg: 0x9a,
  f64_add: 0xa0,
  f64_sub: 0xa1,
  f64_mul: 0xa2,
  f64_div: 0xa3,

  i32_wrap_i64: 0xa7,
  i32_trunc_f32_s: 0xa8,
  i32_trunc_f64_s: 0xaa,
  i64_extend_i32_s: 0xac,
  i64_trunc_f32_s: 0xae,
  i64_trunc_f64_s: 0xb0,
  f32_convert_i32_s: 0xb2,
  f32_convert_i64_s: 0xb4,
  f32_demote_f64: 0xb6,
  f64_convert_i32_s: 0xb7,
  f64_convert_i64_s: 0xb9,
  f64_promote_f32: 0xbb,
} as const

/** Saturating truncation (needed for Java's f2i semantics) — 0xFC prefix */
export const OpFC = {
  i32_trunc_sat_f32_s: 0,
  i32_trunc_sat_f64_s: 2,
  i64_trunc_sat_f32_s: 4,
  i64_trunc_sat_f64_s: 6,
} as const

export const BlockType = {
  empty: 0x40,
} as const

// ---------------------------------------------------------------------------
// Section ids
// ---------------------------------------------------------------------------

export const enum SectionId {
  Type = 1,
  Import = 2,
  Function = 3,
  Table = 4,
  Memory = 5,
  Global = 6,
  Export = 7,
  Start = 8,
  Element = 9,
  Code = 10,
  Data = 11,
}
