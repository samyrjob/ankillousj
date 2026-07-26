/**
 * JVM bytecode decoder.
 * Spec: JVMS §6 — https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-6.html
 */

export interface Insn {
  /** Byte offset within the Code array */
  pc: number
  opcode: number
  name: string
  /** Decoded operands, opcode-specific */
  operands: number[]
  /** Absolute branch targets (already resolved from relative offsets) */
  targets: number[]
  /** Total encoded length in bytes */
  length: number
}

// Opcode name table (index = opcode byte)
export const OPCODE_NAMES: Record<number, string> = {
  0x00: 'nop', 0x01: 'aconst_null',
  0x02: 'iconst_m1', 0x03: 'iconst_0', 0x04: 'iconst_1', 0x05: 'iconst_2',
  0x06: 'iconst_3', 0x07: 'iconst_4', 0x08: 'iconst_5',
  0x09: 'lconst_0', 0x0a: 'lconst_1',
  0x0b: 'fconst_0', 0x0c: 'fconst_1', 0x0d: 'fconst_2',
  0x0e: 'dconst_0', 0x0f: 'dconst_1',
  0x10: 'bipush', 0x11: 'sipush',
  0x12: 'ldc', 0x13: 'ldc_w', 0x14: 'ldc2_w',
  0x15: 'iload', 0x16: 'lload', 0x17: 'fload', 0x18: 'dload', 0x19: 'aload',
  0x1a: 'iload_0', 0x1b: 'iload_1', 0x1c: 'iload_2', 0x1d: 'iload_3',
  0x1e: 'lload_0', 0x1f: 'lload_1', 0x20: 'lload_2', 0x21: 'lload_3',
  0x22: 'fload_0', 0x23: 'fload_1', 0x24: 'fload_2', 0x25: 'fload_3',
  0x26: 'dload_0', 0x27: 'dload_1', 0x28: 'dload_2', 0x29: 'dload_3',
  0x2a: 'aload_0', 0x2b: 'aload_1', 0x2c: 'aload_2', 0x2d: 'aload_3',
  0x2e: 'iaload', 0x2f: 'laload', 0x30: 'faload', 0x31: 'daload',
  0x32: 'aaload', 0x33: 'baload', 0x34: 'caload', 0x35: 'saload',
  0x36: 'istore', 0x37: 'lstore', 0x38: 'fstore', 0x39: 'dstore', 0x3a: 'astore',
  0x3b: 'istore_0', 0x3c: 'istore_1', 0x3d: 'istore_2', 0x3e: 'istore_3',
  0x3f: 'lstore_0', 0x40: 'lstore_1', 0x41: 'lstore_2', 0x42: 'lstore_3',
  0x43: 'fstore_0', 0x44: 'fstore_1', 0x45: 'fstore_2', 0x46: 'fstore_3',
  0x47: 'dstore_0', 0x48: 'dstore_1', 0x49: 'dstore_2', 0x4a: 'dstore_3',
  0x4b: 'astore_0', 0x4c: 'astore_1', 0x4d: 'astore_2', 0x4e: 'astore_3',
  0x4f: 'iastore', 0x50: 'lastore', 0x51: 'fastore', 0x52: 'dastore',
  0x53: 'aastore', 0x54: 'bastore', 0x55: 'castore', 0x56: 'sastore',
  0x57: 'pop', 0x58: 'pop2',
  0x59: 'dup', 0x5a: 'dup_x1', 0x5b: 'dup_x2',
  0x5c: 'dup2', 0x5d: 'dup2_x1', 0x5e: 'dup2_x2',
  0x5f: 'swap',
  0x60: 'iadd', 0x61: 'ladd', 0x62: 'fadd', 0x63: 'dadd',
  0x64: 'isub', 0x65: 'lsub', 0x66: 'fsub', 0x67: 'dsub',
  0x68: 'imul', 0x69: 'lmul', 0x6a: 'fmul', 0x6b: 'dmul',
  0x6c: 'idiv', 0x6d: 'ldiv', 0x6e: 'fdiv', 0x6f: 'ddiv',
  0x70: 'irem', 0x71: 'lrem', 0x72: 'frem', 0x73: 'drem',
  0x74: 'ineg', 0x75: 'lneg', 0x76: 'fneg', 0x77: 'dneg',
  0x78: 'ishl', 0x79: 'lshl', 0x7a: 'ishr', 0x7b: 'lshr',
  0x7c: 'iushr', 0x7d: 'lushr',
  0x7e: 'iand', 0x7f: 'land', 0x80: 'ior', 0x81: 'lor',
  0x82: 'ixor', 0x83: 'lxor',
  0x84: 'iinc',
  0x85: 'i2l', 0x86: 'i2f', 0x87: 'i2d',
  0x88: 'l2i', 0x89: 'l2f', 0x8a: 'l2d',
  0x8b: 'f2i', 0x8c: 'f2l', 0x8d: 'f2d',
  0x8e: 'd2i', 0x8f: 'd2l', 0x90: 'd2f',
  0x91: 'i2b', 0x92: 'i2c', 0x93: 'i2s',
  0x94: 'lcmp', 0x95: 'fcmpl', 0x96: 'fcmpg', 0x97: 'dcmpl', 0x98: 'dcmpg',
  0x99: 'ifeq', 0x9a: 'ifne', 0x9b: 'iflt', 0x9c: 'ifge', 0x9d: 'ifgt', 0x9e: 'ifle',
  0x9f: 'if_icmpeq', 0xa0: 'if_icmpne', 0xa1: 'if_icmplt',
  0xa2: 'if_icmpge', 0xa3: 'if_icmpgt', 0xa4: 'if_icmple',
  0xa5: 'if_acmpeq', 0xa6: 'if_acmpne',
  0xa7: 'goto', 0xa8: 'jsr', 0xa9: 'ret',
  0xaa: 'tableswitch', 0xab: 'lookupswitch',
  0xac: 'ireturn', 0xad: 'lreturn', 0xae: 'freturn', 0xaf: 'dreturn',
  0xb0: 'areturn', 0xb1: 'return',
  0xb2: 'getstatic', 0xb3: 'putstatic', 0xb4: 'getfield', 0xb5: 'putfield',
  0xb6: 'invokevirtual', 0xb7: 'invokespecial', 0xb8: 'invokestatic',
  0xb9: 'invokeinterface', 0xba: 'invokedynamic',
  0xbb: 'new', 0xbc: 'newarray', 0xbd: 'anewarray',
  0xbe: 'arraylength', 0xbf: 'athrow',
  0xc0: 'checkcast', 0xc1: 'instanceof',
  0xc2: 'monitorenter', 0xc3: 'monitorexit',
  0xc4: 'wide', 0xc5: 'multianewarray',
  0xc6: 'ifnull', 0xc7: 'ifnonnull',
  0xc8: 'goto_w', 0xc9: 'jsr_w',
}

const BRANCH_U2 = new Set([
  0x99, 0x9a, 0x9b, 0x9c, 0x9d, 0x9e,
  0x9f, 0xa0, 0xa1, 0xa2, 0xa3, 0xa4,
  0xa5, 0xa6, 0xa7, 0xa8, 0xc6, 0xc7,
])

export const RETURN_OPS = new Set([0xac, 0xad, 0xae, 0xaf, 0xb0, 0xb1])
export const UNCONDITIONAL_JUMP = new Set([0xa7, 0xc8])

export function decode(code: Uint8Array): Insn[] {
  const dv = new DataView(code.buffer, code.byteOffset, code.byteLength)
  const out: Insn[] = []
  let pc = 0

  while (pc < code.length) {
    const start = pc
    const opcode = code[pc++]
    const name = OPCODE_NAMES[opcode] ?? `unknown_0x${opcode.toString(16)}`
    const operands: number[] = []
    const targets: number[] = []

    switch (opcode) {
      // no operands
      default:
        break

      // u1 operand
      case 0x10: // bipush
        operands.push(dv.getInt8(pc)); pc += 1; break
      case 0x12: // ldc
        operands.push(dv.getUint8(pc)); pc += 1; break
      case 0x15: case 0x16: case 0x17: case 0x18: case 0x19: // *load
      case 0x36: case 0x37: case 0x38: case 0x39: case 0x3a: // *store
      case 0xa9: // ret
        operands.push(dv.getUint8(pc)); pc += 1; break
      case 0xbc: // newarray
        operands.push(dv.getUint8(pc)); pc += 1; break

      // u2 operand
      case 0x11: // sipush
        operands.push(dv.getInt16(pc)); pc += 2; break
      case 0x13: case 0x14: // ldc_w, ldc2_w
      case 0xb2: case 0xb3: case 0xb4: case 0xb5: // field access
      case 0xb6: case 0xb7: case 0xb8: // invoke virtual/special/static
      case 0xbb: case 0xbd: // new, anewarray
      case 0xc0: case 0xc1: // checkcast, instanceof
        operands.push(dv.getUint16(pc)); pc += 2; break

      // iinc: u1 index, i1 const
      case 0x84:
        operands.push(dv.getUint8(pc), dv.getInt8(pc + 1)); pc += 2; break

      // invokeinterface: u2 index, u1 count, u1 zero
      case 0xb9:
        operands.push(dv.getUint16(pc), dv.getUint8(pc + 2)); pc += 4; break

      // invokedynamic: u2 index, u2 zero
      case 0xba:
        operands.push(dv.getUint16(pc)); pc += 4; break

      // multianewarray: u2 index, u1 dims
      case 0xc5:
        operands.push(dv.getUint16(pc), dv.getUint8(pc + 2)); pc += 3; break

      // wide
      case 0xc4: {
        const wop = dv.getUint8(pc); pc += 1
        const idx = dv.getUint16(pc); pc += 2
        operands.push(wop, idx)
        if (wop === 0x84) { operands.push(dv.getInt16(pc)); pc += 2 }
        break
      }

      // tableswitch
      case 0xaa: {
        while ((pc - 0) % 4 !== 0) pc++ // pad to 4-byte boundary from code start
        const def = dv.getInt32(pc); pc += 4
        const low = dv.getInt32(pc); pc += 4
        const high = dv.getInt32(pc); pc += 4
        operands.push(low, high)
        targets.push(start + def)
        for (let i = low; i <= high; i++) {
          targets.push(start + dv.getInt32(pc)); pc += 4
        }
        break
      }

      // lookupswitch
      case 0xab: {
        while ((pc - 0) % 4 !== 0) pc++
        const def = dv.getInt32(pc); pc += 4
        const npairs = dv.getInt32(pc); pc += 4
        targets.push(start + def)
        for (let i = 0; i < npairs; i++) {
          operands.push(dv.getInt32(pc)); pc += 4
          targets.push(start + dv.getInt32(pc)); pc += 4
        }
        break
      }

      // goto_w / jsr_w
      case 0xc8: case 0xc9:
        targets.push(start + dv.getInt32(pc)); pc += 4; break
    }

    // Branch instructions with i2 relative offset
    if (BRANCH_U2.has(opcode)) {
      targets.push(start + dv.getInt16(pc))
      pc += 2
    }

    out.push({ pc: start, opcode, name, operands, targets, length: pc - start })
  }

  return out
}
