/**
 * Coverage audit: which JVMS opcodes fall inside P0's declared scope
 * (static methods, primitive types) and which of those do we actually emit?
 *
 * Source of truth for the opcode list: JVMS SE 21 §6.5 / §7.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const translateSrc = readFileSync(join(here, '..', 'src', 'compiler', 'translate.ts'), 'utf8')
const decoderSrc = readFileSync(join(here, '..', 'src', 'classfile', 'bytecode.ts'), 'utf8')

/** opcode -> [mnemonic, category] */
const OPCODES: Record<number, [string, string]> = {
  0x00: ['nop', 'prim'],
  0x01: ['aconst_null', 'ref'],
  0x02: ['iconst_m1', 'prim'], 0x03: ['iconst_0', 'prim'], 0x04: ['iconst_1', 'prim'],
  0x05: ['iconst_2', 'prim'], 0x06: ['iconst_3', 'prim'], 0x07: ['iconst_4', 'prim'],
  0x08: ['iconst_5', 'prim'],
  0x09: ['lconst_0', 'prim'], 0x0a: ['lconst_1', 'prim'],
  0x0b: ['fconst_0', 'prim'], 0x0c: ['fconst_1', 'prim'], 0x0d: ['fconst_2', 'prim'],
  0x0e: ['dconst_0', 'prim'], 0x0f: ['dconst_1', 'prim'],
  0x10: ['bipush', 'prim'], 0x11: ['sipush', 'prim'],
  0x12: ['ldc', 'prim*'], 0x13: ['ldc_w', 'prim*'], 0x14: ['ldc2_w', 'prim'],
  0x15: ['iload', 'prim'], 0x16: ['lload', 'prim'], 0x17: ['fload', 'prim'],
  0x18: ['dload', 'prim'], 0x19: ['aload', 'ref'],
  0x1a: ['iload_0', 'prim'], 0x1b: ['iload_1', 'prim'], 0x1c: ['iload_2', 'prim'], 0x1d: ['iload_3', 'prim'],
  0x1e: ['lload_0', 'prim'], 0x1f: ['lload_1', 'prim'], 0x20: ['lload_2', 'prim'], 0x21: ['lload_3', 'prim'],
  0x22: ['fload_0', 'prim'], 0x23: ['fload_1', 'prim'], 0x24: ['fload_2', 'prim'], 0x25: ['fload_3', 'prim'],
  0x26: ['dload_0', 'prim'], 0x27: ['dload_1', 'prim'], 0x28: ['dload_2', 'prim'], 0x29: ['dload_3', 'prim'],
  0x2a: ['aload_0', 'ref'], 0x2b: ['aload_1', 'ref'], 0x2c: ['aload_2', 'ref'], 0x2d: ['aload_3', 'ref'],
  0x2e: ['iaload', 'array'], 0x2f: ['laload', 'array'], 0x30: ['faload', 'array'],
  0x31: ['daload', 'array'], 0x32: ['aaload', 'array'], 0x33: ['baload', 'array'],
  0x34: ['caload', 'array'], 0x35: ['saload', 'array'],
  0x36: ['istore', 'prim'], 0x37: ['lstore', 'prim'], 0x38: ['fstore', 'prim'],
  0x39: ['dstore', 'prim'], 0x3a: ['astore', 'ref'],
  0x3b: ['istore_0', 'prim'], 0x3c: ['istore_1', 'prim'], 0x3d: ['istore_2', 'prim'], 0x3e: ['istore_3', 'prim'],
  0x3f: ['lstore_0', 'prim'], 0x40: ['lstore_1', 'prim'], 0x41: ['lstore_2', 'prim'], 0x42: ['lstore_3', 'prim'],
  0x43: ['fstore_0', 'prim'], 0x44: ['fstore_1', 'prim'], 0x45: ['fstore_2', 'prim'], 0x46: ['fstore_3', 'prim'],
  0x47: ['dstore_0', 'prim'], 0x48: ['dstore_1', 'prim'], 0x49: ['dstore_2', 'prim'], 0x4a: ['dstore_3', 'prim'],
  0x4b: ['astore_0', 'ref'], 0x4c: ['astore_1', 'ref'], 0x4d: ['astore_2', 'ref'], 0x4e: ['astore_3', 'ref'],
  0x4f: ['iastore', 'array'], 0x50: ['lastore', 'array'], 0x51: ['fastore', 'array'],
  0x52: ['dastore', 'array'], 0x53: ['aastore', 'array'], 0x54: ['bastore', 'array'],
  0x55: ['castore', 'array'], 0x56: ['sastore', 'array'],
  0x57: ['pop', 'prim'], 0x58: ['pop2', 'prim'],
  0x59: ['dup', 'prim'], 0x5a: ['dup_x1', 'prim'], 0x5b: ['dup_x2', 'prim'],
  0x5c: ['dup2', 'prim'], 0x5d: ['dup2_x1', 'prim'], 0x5e: ['dup2_x2', 'prim'],
  0x5f: ['swap', 'prim'],
  0x60: ['iadd', 'prim'], 0x61: ['ladd', 'prim'], 0x62: ['fadd', 'prim'], 0x63: ['dadd', 'prim'],
  0x64: ['isub', 'prim'], 0x65: ['lsub', 'prim'], 0x66: ['fsub', 'prim'], 0x67: ['dsub', 'prim'],
  0x68: ['imul', 'prim'], 0x69: ['lmul', 'prim'], 0x6a: ['fmul', 'prim'], 0x6b: ['dmul', 'prim'],
  0x6c: ['idiv', 'prim'], 0x6d: ['ldiv', 'prim'], 0x6e: ['fdiv', 'prim'], 0x6f: ['ddiv', 'prim'],
  0x70: ['irem', 'prim'], 0x71: ['lrem', 'prim'], 0x72: ['frem', 'prim'], 0x73: ['drem', 'prim'],
  0x74: ['ineg', 'prim'], 0x75: ['lneg', 'prim'], 0x76: ['fneg', 'prim'], 0x77: ['dneg', 'prim'],
  0x78: ['ishl', 'prim'], 0x79: ['lshl', 'prim'], 0x7a: ['ishr', 'prim'], 0x7b: ['lshr', 'prim'],
  0x7c: ['iushr', 'prim'], 0x7d: ['lushr', 'prim'],
  0x7e: ['iand', 'prim'], 0x7f: ['land', 'prim'], 0x80: ['ior', 'prim'], 0x81: ['lor', 'prim'],
  0x82: ['ixor', 'prim'], 0x83: ['lxor', 'prim'],
  0x84: ['iinc', 'prim'],
  0x85: ['i2l', 'prim'], 0x86: ['i2f', 'prim'], 0x87: ['i2d', 'prim'],
  0x88: ['l2i', 'prim'], 0x89: ['l2f', 'prim'], 0x8a: ['l2d', 'prim'],
  0x8b: ['f2i', 'prim'], 0x8c: ['f2l', 'prim'], 0x8d: ['f2d', 'prim'],
  0x8e: ['d2i', 'prim'], 0x8f: ['d2l', 'prim'], 0x90: ['d2f', 'prim'],
  0x91: ['i2b', 'prim'], 0x92: ['i2c', 'prim'], 0x93: ['i2s', 'prim'],
  0x94: ['lcmp', 'prim'], 0x95: ['fcmpl', 'prim'], 0x96: ['fcmpg', 'prim'],
  0x97: ['dcmpl', 'prim'], 0x98: ['dcmpg', 'prim'],
  0x99: ['ifeq', 'prim'], 0x9a: ['ifne', 'prim'], 0x9b: ['iflt', 'prim'],
  0x9c: ['ifge', 'prim'], 0x9d: ['ifgt', 'prim'], 0x9e: ['ifle', 'prim'],
  0x9f: ['if_icmpeq', 'prim'], 0xa0: ['if_icmpne', 'prim'], 0xa1: ['if_icmplt', 'prim'],
  0xa2: ['if_icmpge', 'prim'], 0xa3: ['if_icmpgt', 'prim'], 0xa4: ['if_icmple', 'prim'],
  0xa5: ['if_acmpeq', 'ref'], 0xa6: ['if_acmpne', 'ref'],
  0xa7: ['goto', 'prim'], 0xa8: ['jsr', 'legacy'], 0xa9: ['ret', 'legacy'],
  0xaa: ['tableswitch', 'prim'], 0xab: ['lookupswitch', 'prim'],
  0xac: ['ireturn', 'prim'], 0xad: ['lreturn', 'prim'], 0xae: ['freturn', 'prim'],
  0xaf: ['dreturn', 'prim'], 0xb0: ['areturn', 'ref'], 0xb1: ['return', 'prim'],
  0xb2: ['getstatic', 'field'], 0xb3: ['putstatic', 'field'],
  0xb4: ['getfield', 'field'], 0xb5: ['putfield', 'field'],
  0xb6: ['invokevirtual', 'oop'], 0xb7: ['invokespecial', 'oop'],
  0xb8: ['invokestatic', 'prim'], 0xb9: ['invokeinterface', 'oop'],
  0xba: ['invokedynamic', 'oop'],
  0xbb: ['new', 'oop'], 0xbc: ['newarray', 'array'], 0xbd: ['anewarray', 'array'],
  0xbe: ['arraylength', 'array'], 0xbf: ['athrow', 'exc'],
  0xc0: ['checkcast', 'oop'], 0xc1: ['instanceof', 'oop'],
  0xc2: ['monitorenter', 'thread'], 0xc3: ['monitorexit', 'thread'],
  0xc4: ['wide', 'prim'], 0xc5: ['multianewarray', 'array'],
  0xc6: ['ifnull', 'ref'], 0xc7: ['ifnonnull', 'ref'],
  0xc8: ['goto_w', 'prim'], 0xc9: ['jsr_w', 'legacy'],
}

const hex = (n: number) => '0x' + n.toString(16).padStart(2, '0')

/** Does translate.ts have a `case 0xNN:` for this opcode? */
function emitted(op: number): boolean {
  const patterns = [
    new RegExp(`case 0x${op.toString(16).padStart(2, '0')}:`, 'i'),
    new RegExp(`case ${op}:`),
  ]
  return patterns.some((p) => p.test(translateSrc))
}

function decoded(op: number): boolean {
  const h = op.toString(16).padStart(2, '0')
  return new RegExp(`0x${h}:`, 'i').test(decoderSrc)
}

const inScope = Object.entries(OPCODES).filter(([, [, cat]]) => cat === 'prim')
const partial = Object.entries(OPCODES).filter(([, [, cat]]) => cat === 'prim*')
const outOfScope = Object.entries(OPCODES).filter(
  ([, [, cat]]) => cat !== 'prim' && cat !== 'prim*',
)

const missing: string[] = []
const present: string[] = []

for (const [k, [name]] of inScope) {
  const op = Number(k)
  if (emitted(op)) present.push(name)
  else missing.push(`${name} (${hex(op)})`)
}

const notDecoded: string[] = []
for (const [k, [name]] of [...inScope, ...partial]) {
  const op = Number(k)
  if (!decoded(op)) notDecoded.push(`${name} (${hex(op)})`)
}

console.log('='.repeat(62))
console.log('P0 COVERAGE AUDIT  —  scope: static methods, primitive types')
console.log('Reference: JVMS SE 21 §6.5 (opcode set), §7 (opcode index)')
console.log('='.repeat(62))
console.log()
console.log(`Total JVM opcodes defined:      ${Object.keys(OPCODES).length}`)
console.log(`In P0 scope (primitives):       ${inScope.length}`)
console.log(`Partially in scope (ldc):       ${partial.length}`)
console.log(`Out of scope (P1+):             ${outOfScope.length}`)
console.log()
console.log(`In-scope opcodes IMPLEMENTED:   ${present.length}/${inScope.length}`)
console.log()

if (missing.length > 0) {
  console.log('GAPS — in declared scope but NOT emitted:')
  for (const m of missing) console.log(`  ✗ ${m}`)
} else {
  console.log('No gaps: every in-scope opcode is emitted.')
}
console.log()

if (notDecoded.length > 0) {
  console.log('Not handled by the DECODER (would mis-parse the stream):')
  for (const m of notDecoded) console.log(`  ✗ ${m}`)
  console.log()
}

// Group the out-of-scope work by what phase it belongs to
const byCat = new Map<string, string[]>()
for (const [, [name, cat]] of outOfScope) {
  if (!byCat.has(cat)) byCat.set(cat, [])
  byCat.get(cat)!.push(name)
}
const phaseOf: Record<string, string> = {
  ref: 'P1 — object references',
  oop: 'P1 — objects & dispatch',
  field: 'P1 — fields',
  array: 'P1 — arrays',
  exc: 'P1 — exceptions',
  thread: 'P5 — threads',
  legacy: 'never (deprecated pre-Java 6)',
}
console.log('Deferred work, grouped:')
for (const [cat, names] of [...byCat].sort()) {
  console.log(`  ${(phaseOf[cat] ?? cat).padEnd(32)} ${names.length} opcode(s)`)
  console.log(`    ${names.join(' ')}`)
}
console.log()
console.log('='.repeat(62))
process.exit(missing.length === 0 && notDecoded.length === 0 ? 0 : 1)
