/**
 * Java class file parser.
 * Spec: JVMS §4 — https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html
 */

class Reader {
  private p = 0
  constructor(private readonly d: DataView) {}

  get pos(): number { return this.p }
  set pos(v: number) { this.p = v }
  get remaining(): number { return this.d.byteLength - this.p }

  u1(): number { return this.d.getUint8(this.p++) }
  u2(): number { const v = this.d.getUint16(this.p); this.p += 2; return v }
  u4(): number { const v = this.d.getUint32(this.p); this.p += 4; return v }
  i4(): number { const v = this.d.getInt32(this.p); this.p += 4; return v }
  i8(): bigint { const v = this.d.getBigInt64(this.p); this.p += 8; return v }
  f4(): number { const v = this.d.getFloat32(this.p); this.p += 4; return v }
  f8(): number { const v = this.d.getFloat64(this.p); this.p += 8; return v }

  bytes(n: number): Uint8Array {
    const v = new Uint8Array(this.d.buffer, this.d.byteOffset + this.p, n)
    this.p += n
    return new Uint8Array(v) // copy
  }
}

// ---------------------------------------------------------------------------
// Constant pool
// ---------------------------------------------------------------------------

export const enum CpTag {
  Utf8 = 1,
  Integer = 3,
  Float = 4,
  Long = 5,
  Double = 6,
  Class = 7,
  String = 8,
  Fieldref = 9,
  Methodref = 10,
  InterfaceMethodref = 11,
  NameAndType = 12,
  MethodHandle = 15,
  MethodType = 16,
  Dynamic = 17,
  InvokeDynamic = 18,
  Module = 19,
  Package = 20,
}

export type CpEntry =
  | { tag: CpTag.Utf8; value: string }
  | { tag: CpTag.Integer; value: number }
  | { tag: CpTag.Float; value: number }
  | { tag: CpTag.Long; value: bigint }
  | { tag: CpTag.Double; value: number }
  | { tag: CpTag.Class; nameIndex: number }
  | { tag: CpTag.String; stringIndex: number }
  | { tag: CpTag.Fieldref | CpTag.Methodref | CpTag.InterfaceMethodref; classIndex: number; nameAndTypeIndex: number }
  | { tag: CpTag.NameAndType; nameIndex: number; descriptorIndex: number }
  | { tag: CpTag.MethodHandle; referenceKind: number; referenceIndex: number }
  | { tag: CpTag.MethodType; descriptorIndex: number }
  | { tag: CpTag.Dynamic | CpTag.InvokeDynamic; bootstrapMethodAttrIndex: number; nameAndTypeIndex: number }
  | { tag: CpTag.Module | CpTag.Package; nameIndex: number }
  | { tag: 0 } // unusable slot after long/double

/** Modified UTF-8 decoder (JVMS §4.4.7) */
function decodeModifiedUtf8(b: Uint8Array): string {
  let s = ''
  let i = 0
  while (i < b.length) {
    const x = b[i++]
    if (x < 0x80) {
      s += String.fromCharCode(x)
    } else if ((x & 0xe0) === 0xc0) {
      const y = b[i++]
      s += String.fromCharCode(((x & 0x1f) << 6) | (y & 0x3f))
    } else if ((x & 0xf0) === 0xe0) {
      const y = b[i++], z = b[i++]
      s += String.fromCharCode(((x & 0x0f) << 12) | ((y & 0x3f) << 6) | (z & 0x3f))
    } else {
      throw new Error(`bad modified-UTF8 byte 0x${x.toString(16)}`)
    }
  }
  return s
}

export class ConstantPool {
  constructor(readonly entries: CpEntry[]) {}

  at(i: number): CpEntry {
    const e = this.entries[i]
    if (!e) throw new Error(`constant pool index ${i} out of range`)
    return e
  }

  utf8(i: number): string {
    const e = this.at(i)
    if (e.tag !== CpTag.Utf8) throw new Error(`cp[${i}] is not Utf8 (tag ${e.tag})`)
    return e.value
  }

  className(i: number): string {
    const e = this.at(i)
    if (e.tag !== CpTag.Class) throw new Error(`cp[${i}] is not Class`)
    return this.utf8(e.nameIndex)
  }

  /** Resolve a Methodref/Fieldref into (owner, name, descriptor) */
  memberRef(i: number): { owner: string; name: string; desc: string } {
    const e = this.at(i)
    if (e.tag !== CpTag.Methodref && e.tag !== CpTag.Fieldref && e.tag !== CpTag.InterfaceMethodref) {
      throw new Error(`cp[${i}] is not a member ref (tag ${e.tag})`)
    }
    const nat = this.at(e.nameAndTypeIndex)
    if (nat.tag !== CpTag.NameAndType) throw new Error('bad NameAndType')
    return {
      owner: this.className(e.classIndex),
      name: this.utf8(nat.nameIndex),
      desc: this.utf8(nat.descriptorIndex),
    }
  }
}

// ---------------------------------------------------------------------------
// Structures
// ---------------------------------------------------------------------------

export interface AttributeInfo {
  name: string
  data: Uint8Array
}

export interface CodeAttribute {
  maxStack: number
  maxLocals: number
  code: Uint8Array
  exceptionTable: Array<{ startPc: number; endPc: number; handlerPc: number; catchType: number }>
}

export interface MethodInfo {
  accessFlags: number
  name: string
  descriptor: string
  attributes: AttributeInfo[]
  code?: CodeAttribute
}

export interface FieldInfo {
  accessFlags: number
  name: string
  descriptor: string
  attributes: AttributeInfo[]
}

export interface ClassFile {
  minor: number
  major: number
  cp: ConstantPool
  accessFlags: number
  thisClass: string
  superClass: string | null
  interfaces: string[]
  fields: FieldInfo[]
  methods: MethodInfo[]
  attributes: AttributeInfo[]
}

export const ACC = {
  PUBLIC: 0x0001,
  PRIVATE: 0x0002,
  PROTECTED: 0x0004,
  STATIC: 0x0008,
  FINAL: 0x0010,
  SYNCHRONIZED: 0x0020,
  NATIVE: 0x0100,
  ABSTRACT: 0x0400,
} as const

// ---------------------------------------------------------------------------

function parseConstantPool(r: Reader): ConstantPool {
  const count = r.u2()
  const entries: CpEntry[] = new Array(count)
  entries[0] = { tag: 0 }

  for (let i = 1; i < count; i++) {
    const tag = r.u1() as CpTag
    switch (tag) {
      case CpTag.Utf8: {
        const len = r.u2()
        entries[i] = { tag, value: decodeModifiedUtf8(r.bytes(len)) }
        break
      }
      case CpTag.Integer:
        entries[i] = { tag, value: r.i4() }
        break
      case CpTag.Float:
        entries[i] = { tag, value: r.f4() }
        break
      case CpTag.Long:
        entries[i] = { tag, value: r.i8() }
        entries[++i] = { tag: 0 } // long occupies two slots
        break
      case CpTag.Double:
        entries[i] = { tag, value: r.f8() }
        entries[++i] = { tag: 0 }
        break
      case CpTag.Class:
      case CpTag.Module:
      case CpTag.Package:
        entries[i] = { tag, nameIndex: r.u2() } as CpEntry
        break
      case CpTag.String:
        entries[i] = { tag, stringIndex: r.u2() }
        break
      case CpTag.Fieldref:
      case CpTag.Methodref:
      case CpTag.InterfaceMethodref:
        entries[i] = { tag, classIndex: r.u2(), nameAndTypeIndex: r.u2() }
        break
      case CpTag.NameAndType:
        entries[i] = { tag, nameIndex: r.u2(), descriptorIndex: r.u2() }
        break
      case CpTag.MethodHandle:
        entries[i] = { tag, referenceKind: r.u1(), referenceIndex: r.u2() }
        break
      case CpTag.MethodType:
        entries[i] = { tag, descriptorIndex: r.u2() }
        break
      case CpTag.Dynamic:
      case CpTag.InvokeDynamic:
        entries[i] = { tag, bootstrapMethodAttrIndex: r.u2(), nameAndTypeIndex: r.u2() }
        break
      default:
        throw new Error(`unknown constant pool tag ${tag} at index ${i}`)
    }
  }
  return new ConstantPool(entries)
}

function parseAttributes(r: Reader, cp: ConstantPool): AttributeInfo[] {
  const n = r.u2()
  const out: AttributeInfo[] = []
  for (let i = 0; i < n; i++) {
    const nameIndex = r.u2()
    const len = r.u4()
    out.push({ name: cp.utf8(nameIndex), data: r.bytes(len) })
  }
  return out
}

function parseCode(attr: AttributeInfo, cp: ConstantPool): CodeAttribute {
  const r = new Reader(new DataView(attr.data.buffer, attr.data.byteOffset, attr.data.byteLength))
  const maxStack = r.u2()
  const maxLocals = r.u2()
  const codeLength = r.u4()
  const code = r.bytes(codeLength)
  const etLen = r.u2()
  const exceptionTable = []
  for (let i = 0; i < etLen; i++) {
    exceptionTable.push({
      startPc: r.u2(),
      endPc: r.u2(),
      handlerPc: r.u2(),
      catchType: r.u2(),
    })
  }
  return { maxStack, maxLocals, code, exceptionTable }
}

export function parseClassFile(data: Uint8Array): ClassFile {
  const r = new Reader(new DataView(data.buffer, data.byteOffset, data.byteLength))

  const magic = r.u4()
  if (magic !== 0xcafebabe) {
    throw new Error(`not a class file: magic 0x${magic.toString(16)}`)
  }
  const minor = r.u2()
  const major = r.u2()
  const cp = parseConstantPool(r)

  const accessFlags = r.u2()
  const thisClass = cp.className(r.u2())
  const superIdx = r.u2()
  const superClass = superIdx === 0 ? null : cp.className(superIdx)

  const ifCount = r.u2()
  const interfaces: string[] = []
  for (let i = 0; i < ifCount; i++) interfaces.push(cp.className(r.u2()))

  const fieldCount = r.u2()
  const fields: FieldInfo[] = []
  for (let i = 0; i < fieldCount; i++) {
    const af = r.u2()
    const name = cp.utf8(r.u2())
    const desc = cp.utf8(r.u2())
    fields.push({ accessFlags: af, name, descriptor: desc, attributes: parseAttributes(r, cp) })
  }

  const methodCount = r.u2()
  const methods: MethodInfo[] = []
  for (let i = 0; i < methodCount; i++) {
    const af = r.u2()
    const name = cp.utf8(r.u2())
    const desc = cp.utf8(r.u2())
    const attrs = parseAttributes(r, cp)
    const codeAttr = attrs.find((a) => a.name === 'Code')
    methods.push({
      accessFlags: af,
      name,
      descriptor: desc,
      attributes: attrs,
      code: codeAttr ? parseCode(codeAttr, cp) : undefined,
    })
  }

  return {
    minor,
    major,
    cp,
    accessFlags,
    thisClass,
    superClass,
    interfaces,
    fields,
    methods,
    attributes: parseAttributes(r, cp),
  }
}

// ---------------------------------------------------------------------------
// Descriptor parsing
// ---------------------------------------------------------------------------

export type JType = 'I' | 'J' | 'F' | 'D' | 'Z' | 'B' | 'C' | 'S' | 'V' | { ref: string } | { array: JType }

export function parseMethodDescriptor(desc: string): { params: JType[]; ret: JType } {
  if (desc[0] !== '(') throw new Error(`bad method descriptor: ${desc}`)
  let i = 1
  const params: JType[] = []
  while (desc[i] !== ')') {
    const [t, ni] = parseType(desc, i)
    params.push(t)
    i = ni
  }
  i++ // skip ')'
  const [ret] = parseType(desc, i)
  return { params, ret }
}

export function parseType(desc: string, i: number): [JType, number] {
  const c = desc[i]
  switch (c) {
    case 'I': case 'J': case 'F': case 'D':
    case 'Z': case 'B': case 'C': case 'S': case 'V':
      return [c as JType, i + 1]
    case 'L': {
      const end = desc.indexOf(';', i)
      if (end < 0) throw new Error(`unterminated object type in ${desc}`)
      return [{ ref: desc.slice(i + 1, end) }, end + 1]
    }
    case '[': {
      const [inner, ni] = parseType(desc, i + 1)
      return [{ array: inner }, ni]
    }
    default:
      throw new Error(`bad type char '${c}' in descriptor ${desc}`)
  }
}
