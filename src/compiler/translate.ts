/**
 * JVM bytecode -> WebAssembly translator.
 *
 * P0 scope: static methods, primitive types (int/long/float/double),
 * arithmetic, locals, conditionals, loops, switches, static calls.
 *
 * Control flow strategy: a `br_table` dispatch loop. This handles arbitrary
 * (including irreducible) CFGs correctly at the cost of some performance.
 * Replacing it with a Stackifier/Relooper is a P1 optimisation, not a
 * correctness fix.
 */

import {
  ClassFile, MethodInfo, CodeAttribute, ConstantPool, CpTag,
  parseMethodDescriptor, JType, ACC,
} from '../classfile/parser.js'
import { Insn, decode, RETURN_OPS, UNCONDITIONAL_JUMP } from '../classfile/bytecode.js'
import { ByteWriter, Op, OpFC, ValType, BlockType } from '../wasm/encoder.js'
import { FuncType } from '../wasm/module.js'

export class UnsupportedError extends Error {
  constructor(msg: string) {
    super(msg)
    this.name = 'UnsupportedError'
  }
}

// ---------------------------------------------------------------------------
// Type mapping
// ---------------------------------------------------------------------------

/** JVM computational type, as it lives on the operand stack */
type CT = ValType.i32 | ValType.i64 | ValType.f32 | ValType.f64

function jtypeToVal(t: JType): CT {
  if (typeof t === 'string') {
    switch (t) {
      case 'I': case 'Z': case 'B': case 'C': case 'S': return ValType.i32
      case 'J': return ValType.i64
      case 'F': return ValType.f32
      case 'D': return ValType.f64
      case 'V': throw new Error('void is not a value type')
    }
  }
  throw new UnsupportedError('reference types are not supported in P0')
}

function slotWidth(t: JType): number {
  return t === 'J' || t === 'D' ? 2 : 1
}

// ---------------------------------------------------------------------------
// Basic blocks
// ---------------------------------------------------------------------------

interface BasicBlock {
  index: number
  startPc: number
  insns: Insn[]
  /** Stack types on entry (computed by abstract interpretation) */
  entryStack: CT[]
}

function findLeaders(insns: Insn[], code: CodeAttribute): Set<number> {
  const leaders = new Set<number>([0])
  for (const ins of insns) {
    for (const t of ins.targets) leaders.add(t)
    const isBranch = ins.targets.length > 0
    const isReturn = RETURN_OPS.has(ins.opcode)
    const isThrow = ins.opcode === 0xbf
    if (isBranch || isReturn || isThrow) {
      const next = ins.pc + ins.length
      if (next < code.code.length) leaders.add(next)
    }
  }
  for (const e of code.exceptionTable) leaders.add(e.handlerPc)
  return leaders
}

function buildBlocks(insns: Insn[], code: CodeAttribute): BasicBlock[] {
  const leaders = findLeaders(insns, code)
  const blocks: BasicBlock[] = []
  let cur: Insn[] = []
  let curStart = 0

  for (const ins of insns) {
    if (leaders.has(ins.pc) && cur.length > 0) {
      blocks.push({ index: blocks.length, startPc: curStart, insns: cur, entryStack: [] })
      cur = []
      curStart = ins.pc
    }
    if (cur.length === 0) curStart = ins.pc
    cur.push(ins)
  }
  if (cur.length > 0) {
    blocks.push({ index: blocks.length, startPc: curStart, insns: cur, entryStack: [] })
  }
  return blocks
}

// ---------------------------------------------------------------------------
// Local variable allocation
// ---------------------------------------------------------------------------

class LocalAllocator {
  /** key = `${jvmSlot}:${valType}` -> wasm local index */
  private map = new Map<string, number>()
  /** declared locals beyond the params */
  readonly extra: ValType[] = []
  private nextIndex: number

  constructor(paramCount: number) {
    this.nextIndex = paramCount
  }

  seedParam(jvmSlot: number, t: ValType, wasmIndex: number): void {
    this.map.set(`${jvmSlot}:${t}`, wasmIndex)
  }

  get(jvmSlot: number, t: ValType): number {
    const k = `${jvmSlot}:${t}`
    let idx = this.map.get(k)
    if (idx === undefined) {
      idx = this.nextIndex++
      this.map.set(k, idx)
      this.extra.push(t)
    }
    return idx
  }

  /** Allocate an anonymous scratch local */
  scratch(t: ValType): number {
    const idx = this.nextIndex++
    this.extra.push(t)
    return idx
  }
}

// ---------------------------------------------------------------------------
// Abstract stack interpretation (types only)
// ---------------------------------------------------------------------------

/** Returns the stack after executing `ins`, given the stack before. */
function stackEffect(ins: Insn, before: CT[], cp: ConstantPool): CT[] {
  const s = [...before]
  const pop = (n = 1): CT[] => {
    if (s.length < n) throw new Error(`stack underflow at pc=${ins.pc} (${ins.name})`)
    return s.splice(s.length - n, n)
  }
  const push = (...t: CT[]) => s.push(...t)
  const I = ValType.i32, L = ValType.i64, F = ValType.f32, D = ValType.f64

  switch (ins.opcode) {
    case 0x00: break // nop
    // constants
    case 0x02: case 0x03: case 0x04: case 0x05: case 0x06: case 0x07: case 0x08:
    case 0x10: case 0x11: push(I); break
    case 0x09: case 0x0a: push(L); break
    case 0x0b: case 0x0c: case 0x0d: push(F); break
    case 0x0e: case 0x0f: push(D); break
    case 0x12: case 0x13: { // ldc / ldc_w
      const e = cp.at(ins.operands[0])
      if (e.tag === CpTag.Integer) push(I)
      else if (e.tag === CpTag.Float) push(F)
      else throw new UnsupportedError(`ldc of constant tag ${e.tag} (strings/classes not in P0)`)
      break
    }
    case 0x14: { // ldc2_w
      const e = cp.at(ins.operands[0])
      if (e.tag === CpTag.Long) push(L)
      else if (e.tag === CpTag.Double) push(D)
      else throw new Error('ldc2_w of non long/double')
      break
    }
    // loads
    case 0x15: case 0x1a: case 0x1b: case 0x1c: case 0x1d: push(I); break
    case 0x16: case 0x1e: case 0x1f: case 0x20: case 0x21: push(L); break
    case 0x17: case 0x22: case 0x23: case 0x24: case 0x25: push(F); break
    case 0x18: case 0x26: case 0x27: case 0x28: case 0x29: push(D); break
    // stores
    case 0x36: case 0x3b: case 0x3c: case 0x3d: case 0x3e:
    case 0x37: case 0x3f: case 0x40: case 0x41: case 0x42:
    case 0x38: case 0x43: case 0x44: case 0x45: case 0x46:
    case 0x39: case 0x47: case 0x48: case 0x49: case 0x4a:
      pop(); break
    // stack manipulation
    case 0x57: pop(); break // pop
    case 0x58: { // pop2
      const t = s[s.length - 1]
      if (t === L || t === D) pop()
      else pop(2)
      break
    }
    case 0x59: { const [t] = pop(); push(t, t); break } // dup
    case 0x5f: { const [a, b] = pop(2); push(b, a); break } // swap
    // arithmetic (binary, same type in/out)
    case 0x60: case 0x64: case 0x68: case 0x6c: case 0x70:
    case 0x7e: case 0x80: case 0x82:
      pop(2); push(I); break
    case 0x61: case 0x65: case 0x69: case 0x6d: case 0x71:
    case 0x7f: case 0x81: case 0x83:
      pop(2); push(L); break
    case 0x62: case 0x66: case 0x6a: case 0x6e: case 0x72:
      pop(2); push(F); break
    case 0x63: case 0x67: case 0x6b: case 0x6f: case 0x73:
      pop(2); push(D); break
    // shifts: long shifts take (long, int)
    case 0x78: case 0x7a: case 0x7c: pop(2); push(I); break
    case 0x79: case 0x7b: case 0x7d: pop(2); push(L); break
    // negate
    case 0x74: pop(); push(I); break
    case 0x75: pop(); push(L); break
    case 0x76: pop(); push(F); break
    case 0x77: pop(); push(D); break
    // iinc: no stack effect
    case 0x84: break
    // conversions
    case 0x85: pop(); push(L); break // i2l
    case 0x86: pop(); push(F); break // i2f
    case 0x87: pop(); push(D); break // i2d
    case 0x88: pop(); push(I); break // l2i
    case 0x89: pop(); push(F); break // l2f
    case 0x8a: pop(); push(D); break // l2d
    case 0x8b: pop(); push(I); break // f2i
    case 0x8c: pop(); push(L); break // f2l
    case 0x8d: pop(); push(D); break // f2d
    case 0x8e: pop(); push(I); break // d2i
    case 0x8f: pop(); push(L); break // d2l
    case 0x90: pop(); push(F); break // d2f
    case 0x91: case 0x92: case 0x93: pop(); push(I); break // i2b/c/s
    // comparisons producing int
    case 0x94: case 0x95: case 0x96: case 0x97: case 0x98:
      pop(2); push(I); break
    // branches
    case 0x99: case 0x9a: case 0x9b: case 0x9c: case 0x9d: case 0x9e:
      pop(); break
    case 0x9f: case 0xa0: case 0xa1: case 0xa2: case 0xa3: case 0xa4:
      pop(2); break
    case 0xa7: case 0xc8: break // goto
    case 0xaa: case 0xab: pop(); break // switches
    // returns
    case 0xac: case 0xad: case 0xae: case 0xaf: pop(); break
    case 0xb1: break
    // invokestatic
    case 0xb8: {
      const ref = cp.memberRef(ins.operands[0])
      const { params, ret } = parseMethodDescriptor(ref.desc)
      pop(params.length)
      if (ret !== 'V') push(jtypeToVal(ret))
      break
    }
    default:
      throw new UnsupportedError(`opcode ${ins.name} (0x${ins.opcode.toString(16)}) not supported in P0`)
  }
  return s
}

/** Propagate stack types across the CFG so we know what to spill at edges. */
function computeEntryStacks(blocks: BasicBlock[], cp: ConstantPool): void {
  const byPc = new Map<number, BasicBlock>()
  for (const b of blocks) byPc.set(b.startPc, b)

  const visited = new Set<number>()
  const work: Array<{ block: BasicBlock; stack: CT[] }> = [{ block: blocks[0], stack: [] }]

  while (work.length > 0) {
    const { block, stack } = work.pop()!
    if (visited.has(block.index)) {
      if (block.entryStack.length !== stack.length) {
        throw new UnsupportedError(
          `inconsistent stack depth entering block ${block.index} ` +
          `(${block.entryStack.length} vs ${stack.length})`,
        )
      }
      continue
    }
    visited.add(block.index)
    block.entryStack = stack

    let cur = stack
    for (const ins of block.insns) {
      cur = stackEffect(ins, cur, cp)
    }

    const last = block.insns[block.insns.length - 1]
    const succs: number[] = []
    if (!RETURN_OPS.has(last.opcode)) {
      for (const t of last.targets) succs.push(t)
      if (!UNCONDITIONAL_JUMP.has(last.opcode) && last.opcode !== 0xaa && last.opcode !== 0xab) {
        const fall = last.pc + last.length
        if (byPc.has(fall)) succs.push(fall)
      }
    }
    for (const pc of succs) {
      const b = byPc.get(pc)
      if (!b) throw new Error(`branch target ${pc} is not a block leader`)
      work.push({ block: b, stack: [...cur] })
    }
  }

  for (const b of blocks) {
    if (!visited.has(b.index)) b.entryStack = [] // unreachable; emit unreachable
  }
}

// ---------------------------------------------------------------------------
// Translation
// ---------------------------------------------------------------------------

export interface TranslatedFunc {
  name: string
  type: FuncType
  locals: ValType[]
  body: Uint8Array
}

export function translateMethod(
  cf: ClassFile,
  m: MethodInfo,
  funcIndexOf: (name: string) => number = () => {
    throw new UnsupportedError('static calls require a function index resolver')
  },
): TranslatedFunc {
  if (!(m.accessFlags & ACC.STATIC)) {
    throw new UnsupportedError(`instance method ${m.name} — P0 handles static methods only`)
  }
  if (!m.code) throw new UnsupportedError(`method ${m.name} has no Code attribute`)
  if (m.code.exceptionTable.length > 0) {
    throw new UnsupportedError(`method ${m.name} uses try/catch — not in P0`)
  }

  const cp = cf.cp
  const { params, ret } = parseMethodDescriptor(m.descriptor)
  const paramTypes = params.map(jtypeToVal)
  const results: ValType[] = ret === 'V' ? [] : [jtypeToVal(ret)]
  const type: FuncType = { params: paramTypes, results }

  const locals = new LocalAllocator(paramTypes.length)
  // JVM slots for params: long/double occupy two
  {
    let slot = 0
    params.forEach((p, i) => {
      locals.seedParam(slot, jtypeToVal(p), i)
      slot += slotWidth(p)
    })
  }

  const insns = decode(m.code.code)
  const blocks = buildBlocks(insns, m.code)
  computeEntryStacks(blocks, cp)

  // Spill slots: one local per (stack depth, type)
  const spillMap = new Map<string, number>()
  const spillLocal = (depth: number, t: CT): number => {
    const k = `${depth}:${t}`
    let idx = spillMap.get(k)
    if (idx === undefined) {
      idx = locals.scratch(t)
      spillMap.set(k, idx)
    }
    return idx
  }

  const ctx: Ctx = { cf, cp, locals, spillLocal, blocks, method: m, funcIndexOf }

  // Fast path: single block, no branching -> emit straight-line code
  if (blocks.length === 1) {
    const w = new ByteWriter()
    emitBlockBody(w, blocks[0], ctx, null)
    // implicit return for void methods
    if (results.length === 0) w.u8(Op.return)
    else w.u8(Op.unreachable)
    return { name: mangle(cf.thisClass, m), type, locals: locals.extra, body: w.toBytes() }
  }

  // General path: br_table dispatch loop
  const pcLocal = locals.scratch(ValType.i32)
  const n = blocks.length
  const w = new ByteWriter()

  // pc = 0
  w.u8(Op.i32_const).i32(0)
  w.u8(Op.local_set).u32(pcLocal)

  w.u8(Op.block).u8(BlockType.empty) // $exit
  w.u8(Op.loop).u8(BlockType.empty) // $loop
  for (let i = n - 1; i >= 0; i--) w.u8(Op.block).u8(BlockType.empty)

  // dispatch
  w.u8(Op.local_get).u32(pcLocal)
  w.u8(Op.br_table).u32(n)
  for (let i = 0; i < n; i++) w.u32(i)
  w.u32(n - 1) // default

  for (let k = 0; k < n; k++) {
    w.u8(Op.end) // close block $B_k
    const depthToLoop = n - 1 - k
    emitBlockBody(w, blocks[k], ctx, { pcLocal, depthToLoop })
  }

  w.u8(Op.end) // close loop
  w.u8(Op.end) // close $exit
  w.u8(Op.unreachable)

  return { name: mangle(cf.thisClass, m), type, locals: locals.extra, body: w.toBytes() }
}

interface Ctx {
  cf: ClassFile
  cp: ConstantPool
  locals: LocalAllocator
  spillLocal: (depth: number, t: CT) => number
  blocks: BasicBlock[]
  method: MethodInfo
  /** Resolves a mangled method name to its WASM function index */
  funcIndexOf: (name: string) => number
}

interface LoopCtx {
  pcLocal: number
  depthToLoop: number
}

export function mangle(className: string, m: MethodInfo): string {
  const cls = className.replace(/\//g, '_')
  const sig = m.descriptor.replace(/[()\[\/;]/g, '_')
  return `${cls}_${m.name}${sig}`
}

function blockIndexForPc(ctx: Ctx, pc: number): number {
  const b = ctx.blocks.find((x) => x.startPc === pc)
  if (!b) throw new Error(`no block starts at pc=${pc}`)
  return b.index
}

/** Emit the code for one basic block, including its terminator. */
function emitBlockBody(w: ByteWriter, block: BasicBlock, ctx: Ctx, loop: LoopCtx | null): void {
  const { cp, locals } = ctx

  // Reload spilled operand stack
  for (let d = 0; d < block.entryStack.length; d++) {
    w.u8(Op.local_get).u32(ctx.spillLocal(d, block.entryStack[d]))
  }

  let stack: CT[] = [...block.entryStack]

  const goto_ = (targetPc: number) => {
    if (!loop) throw new Error('branch in single-block method')
    // spill current stack
    const target = ctx.blocks.find((b) => b.startPc === targetPc)!
    for (let d = stack.length - 1; d >= 0; d--) {
      w.u8(Op.local_set).u32(ctx.spillLocal(d, stack[d]))
    }
    w.u8(Op.i32_const).i32(target.index)
    w.u8(Op.local_set).u32(loop.pcLocal)
    w.u8(Op.br).u32(loop.depthToLoop)
  }

  for (let i = 0; i < block.insns.length; i++) {
    const ins = block.insns[i]
    const isLast = i === block.insns.length - 1
    const before = stack

    if (isLast && ins.targets.length > 0 && loop) {
      emitTerminator(w, ins, ctx, loop, stack)
      stack = stackEffect(ins, before, cp)
      return
    }

    emitInsn(w, ins, ctx, stack)
    stack = stackEffect(ins, before, cp)
  }

  // Fall-through terminator
  const last = block.insns[block.insns.length - 1]
  if (RETURN_OPS.has(last.opcode)) return
  if (loop) {
    const fall = last.pc + last.length
    const nextBlock = ctx.blocks.find((b) => b.startPc === fall)
    if (nextBlock) {
      for (let d = stack.length - 1; d >= 0; d--) {
        w.u8(Op.local_set).u32(ctx.spillLocal(d, stack[d]))
      }
      w.u8(Op.i32_const).i32(nextBlock.index)
      w.u8(Op.local_set).u32(loop.pcLocal)
      w.u8(Op.br).u32(loop.depthToLoop)
    } else {
      w.u8(Op.unreachable)
    }
  }
}

/**
 * Emit a block terminator.
 *
 * Everything here computes the *next block index* as a value, stores it in
 * $pc, then does a single `br` back to the dispatch loop. Using `select`
 * rather than `if`/`else` keeps the branch depth constant — nesting an `if`
 * around the `br` would shift the label depth and silently jump to the wrong
 * place.
 */
function emitTerminator(w: ByteWriter, ins: Insn, ctx: Ctx, loop: LoopCtx, stack: CT[]): void {
  const idxOf = (pc: number) => blockIndexForPc(ctx, pc)

  const brToLoop = () => {
    w.u8(Op.local_set).u32(loop.pcLocal)
    w.u8(Op.br).u32(loop.depthToLoop)
  }
  /** Spill the operand stack, ignoring the top `drop` entries (already consumed) */
  const spillFrom = (s: CT[], drop: number) => {
    const remaining = s.slice(0, s.length - drop)
    for (let d = remaining.length - 1; d >= 0; d--) {
      w.u8(Op.local_set).u32(ctx.spillLocal(d, remaining[d]))
    }
  }

  const op = ins.opcode

  // ---- goto ----
  if (op === 0xa7 || op === 0xc8) {
    spillFrom(stack, 0)
    w.u8(Op.i32_const).i32(idxOf(ins.targets[0]))
    brToLoop()
    return
  }

  // ---- tableswitch / lookupswitch ----
  if (op === 0xaa || op === 0xab) {
    const key = ctx.locals.scratch(ValType.i32)
    w.u8(Op.local_set).u32(key)
    spillFrom(stack, 1)

    const cases: Array<[number, number]> = []
    if (op === 0xaa) {
      const [low, high] = ins.operands
      for (let v = low, k = 1; v <= high; v++, k++) cases.push([v, ins.targets[k]])
    } else {
      for (let k = 0; k < ins.operands.length; k++) {
        cases.push([ins.operands[k], ins.targets[k + 1]])
      }
    }

    // Push every candidate index, then fold with select from the last case back
    for (const [, tgt] of cases) w.u8(Op.i32_const).i32(idxOf(tgt))
    w.u8(Op.i32_const).i32(idxOf(ins.targets[0])) // default
    for (let i = cases.length - 1; i >= 0; i--) {
      w.u8(Op.local_get).u32(key)
      w.u8(Op.i32_const).i32(cases[i][0])
      w.u8(Op.i32_eq)
      w.u8(Op.select)
    }
    brToLoop()
    return
  }

  // ---- conditional branches ----
  const cmpZero: Record<number, number> = {
    0x9b: Op.i32_lt_s, 0x9c: Op.i32_ge_s, 0x9d: Op.i32_gt_s, 0x9e: Op.i32_le_s,
  }
  const cmpTwo: Record<number, number> = {
    0x9f: Op.i32_eq, 0xa0: Op.i32_ne, 0xa1: Op.i32_lt_s,
    0xa2: Op.i32_ge_s, 0xa3: Op.i32_gt_s, 0xa4: Op.i32_le_s,
  }

  let popped: number
  if (op === 0x99) { // ifeq: value == 0
    popped = 1
    w.u8(Op.i32_eqz)
  } else if (op === 0x9a) { // ifne: value != 0
    popped = 1
    w.u8(Op.i32_eqz)
    w.u8(Op.i32_eqz)
  } else if (op in cmpZero) {
    popped = 1
    w.u8(Op.i32_const).i32(0)
    w.u8(cmpZero[op])
  } else if (op in cmpTwo) {
    popped = 2
    w.u8(cmpTwo[op])
  } else {
    throw new UnsupportedError(`terminator ${ins.name} not supported in P0`)
  }

  const cond = ctx.locals.scratch(ValType.i32)
  w.u8(Op.local_set).u32(cond)
  spillFrom(stack, popped)

  // pc = cond ? branchTarget : fallThrough
  w.u8(Op.i32_const).i32(idxOf(ins.targets[0]))
  w.u8(Op.i32_const).i32(idxOf(ins.pc + ins.length))
  w.u8(Op.local_get).u32(cond)
  w.u8(Op.select)
  brToLoop()
}

function emitInsn(w: ByteWriter, ins: Insn, ctx: Ctx, stack: CT[]): void {
  const { cp, locals } = ctx
  const I = ValType.i32, L = ValType.i64, F = ValType.f32, D = ValType.f64
  const op = ins.opcode

  const loadSlot = (slot: number, t: CT) => {
    w.u8(Op.local_get).u32(locals.get(slot, t))
  }
  const storeSlot = (slot: number, t: CT) => {
    w.u8(Op.local_set).u32(locals.get(slot, t))
  }

  switch (op) {
    case 0x00: w.u8(Op.nop); return

    // ---- constants ----
    case 0x02: w.u8(Op.i32_const).i32(-1); return
    case 0x03: case 0x04: case 0x05: case 0x06: case 0x07: case 0x08:
      w.u8(Op.i32_const).i32(op - 0x03); return
    case 0x09: w.u8(Op.i64_const).i64(0n); return
    case 0x0a: w.u8(Op.i64_const).i64(1n); return
    case 0x0b: w.u8(Op.f32_const).f32(0); return
    case 0x0c: w.u8(Op.f32_const).f32(1); return
    case 0x0d: w.u8(Op.f32_const).f32(2); return
    case 0x0e: w.u8(Op.f64_const).f64(0); return
    case 0x0f: w.u8(Op.f64_const).f64(1); return
    case 0x10: case 0x11: w.u8(Op.i32_const).i32(ins.operands[0]); return

    case 0x12: case 0x13: {
      const e = cp.at(ins.operands[0])
      if (e.tag === CpTag.Integer) w.u8(Op.i32_const).i32(e.value)
      else if (e.tag === CpTag.Float) w.u8(Op.f32_const).f32(e.value)
      else throw new UnsupportedError('ldc of non-numeric constant')
      return
    }
    case 0x14: {
      const e = cp.at(ins.operands[0])
      if (e.tag === CpTag.Long) w.u8(Op.i64_const).i64(e.value)
      else if (e.tag === CpTag.Double) w.u8(Op.f64_const).f64(e.value)
      return
    }

    // ---- loads ----
    case 0x15: loadSlot(ins.operands[0], I); return
    case 0x1a: case 0x1b: case 0x1c: case 0x1d: loadSlot(op - 0x1a, I); return
    case 0x16: loadSlot(ins.operands[0], L); return
    case 0x1e: case 0x1f: case 0x20: case 0x21: loadSlot(op - 0x1e, L); return
    case 0x17: loadSlot(ins.operands[0], F); return
    case 0x22: case 0x23: case 0x24: case 0x25: loadSlot(op - 0x22, F); return
    case 0x18: loadSlot(ins.operands[0], D); return
    case 0x26: case 0x27: case 0x28: case 0x29: loadSlot(op - 0x26, D); return

    // ---- stores ----
    case 0x36: storeSlot(ins.operands[0], I); return
    case 0x3b: case 0x3c: case 0x3d: case 0x3e: storeSlot(op - 0x3b, I); return
    case 0x37: storeSlot(ins.operands[0], L); return
    case 0x3f: case 0x40: case 0x41: case 0x42: storeSlot(op - 0x3f, L); return
    case 0x38: storeSlot(ins.operands[0], F); return
    case 0x43: case 0x44: case 0x45: case 0x46: storeSlot(op - 0x43, F); return
    case 0x39: storeSlot(ins.operands[0], D); return
    case 0x47: case 0x48: case 0x49: case 0x4a: storeSlot(op - 0x47, D); return

    // ---- stack ----
    case 0x57: w.u8(Op.drop); return
    case 0x58: {
      const t = stack[stack.length - 1]
      w.u8(Op.drop)
      if (t !== L && t !== D) w.u8(Op.drop)
      return
    }
    case 0x59: { // dup
      const t = stack[stack.length - 1]
      const tmp = locals.scratch(t)
      w.u8(Op.local_tee).u32(tmp)
      w.u8(Op.local_get).u32(tmp)
      return
    }
    case 0x5f: { // swap (both category 1)
      const a = locals.scratch(stack[stack.length - 1])
      const b = locals.scratch(stack[stack.length - 2])
      w.u8(Op.local_set).u32(a)
      w.u8(Op.local_set).u32(b)
      w.u8(Op.local_get).u32(a)
      w.u8(Op.local_get).u32(b)
      return
    }

    // ---- int arithmetic ----
    case 0x60: w.u8(Op.i32_add); return
    case 0x64: w.u8(Op.i32_sub); return
    case 0x68: w.u8(Op.i32_mul); return
    case 0x6c: w.u8(Op.i32_div_s); return
    case 0x70: w.u8(Op.i32_rem_s); return
    case 0x7e: w.u8(Op.i32_and); return
    case 0x80: w.u8(Op.i32_or); return
    case 0x82: w.u8(Op.i32_xor); return
    case 0x78: w.u8(Op.i32_shl); return
    case 0x7a: w.u8(Op.i32_shr_s); return
    case 0x7c: w.u8(Op.i32_shr_u); return
    case 0x74: { // ineg = 0 - x
      const tmp = locals.scratch(I)
      w.u8(Op.local_set).u32(tmp)
      w.u8(Op.i32_const).i32(0)
      w.u8(Op.local_get).u32(tmp)
      w.u8(Op.i32_sub)
      return
    }

    // ---- long arithmetic ----
    case 0x61: w.u8(Op.i64_add); return
    case 0x65: w.u8(Op.i64_sub); return
    case 0x69: w.u8(Op.i64_mul); return
    case 0x6d: w.u8(Op.i64_div_s); return
    case 0x71: w.u8(Op.i64_rem_s); return
    case 0x7f: w.u8(Op.i64_and); return
    case 0x81: w.u8(Op.i64_or); return
    case 0x83: w.u8(Op.i64_xor); return
    case 0x79: w.u8(Op.i64_extend_i32_s).u8(Op.i64_shl); return
    case 0x7b: w.u8(Op.i64_extend_i32_s).u8(Op.i64_shr_s); return
    case 0x7d: w.u8(Op.i64_extend_i32_s).u8(Op.i64_shr_u); return
    case 0x75: {
      const tmp = locals.scratch(L)
      w.u8(Op.local_set).u32(tmp)
      w.u8(Op.i64_const).i64(0n)
      w.u8(Op.local_get).u32(tmp)
      w.u8(Op.i64_sub)
      return
    }

    // ---- float / double ----
    case 0x62: w.u8(Op.f32_add); return
    case 0x66: w.u8(Op.f32_sub); return
    case 0x6a: w.u8(Op.f32_mul); return
    case 0x6e: w.u8(Op.f32_div); return
    case 0x76: w.u8(Op.f32_neg); return
    case 0x63: w.u8(Op.f64_add); return
    case 0x67: w.u8(Op.f64_sub); return
    case 0x6b: w.u8(Op.f64_mul); return
    case 0x6f: w.u8(Op.f64_div); return
    case 0x77: w.u8(Op.f64_neg); return
    case 0x72: case 0x73:
      throw new UnsupportedError('frem/drem need a runtime helper — not in P0')

    // ---- iinc ----
    case 0x84: {
      const slot = ins.operands[0]
      const delta = ins.operands[1]
      const idx = locals.get(slot, I)
      w.u8(Op.local_get).u32(idx)
      w.u8(Op.i32_const).i32(delta)
      w.u8(Op.i32_add)
      w.u8(Op.local_set).u32(idx)
      return
    }

    // ---- conversions ----
    case 0x85: w.u8(Op.i64_extend_i32_s); return
    case 0x86: w.u8(Op.f32_convert_i32_s); return
    case 0x87: w.u8(Op.f64_convert_i32_s); return
    case 0x88: w.u8(Op.i32_wrap_i64); return
    case 0x89: w.u8(Op.f32_convert_i64_s); return
    case 0x8a: w.u8(Op.f64_convert_i64_s); return
    case 0x8d: w.u8(Op.f64_promote_f32); return
    case 0x90: w.u8(Op.f32_demote_f64); return
    // Java truncation saturates and maps NaN->0, matching trunc_sat
    case 0x8b: w.u8(0xfc).u32(OpFC.i32_trunc_sat_f32_s); return
    case 0x8c: w.u8(0xfc).u32(OpFC.i64_trunc_sat_f32_s); return
    case 0x8e: w.u8(0xfc).u32(OpFC.i32_trunc_sat_f64_s); return
    case 0x8f: w.u8(0xfc).u32(OpFC.i64_trunc_sat_f64_s); return
    case 0x91: // i2b
      w.u8(Op.i32_const).i32(24).u8(Op.i32_shl)
      w.u8(Op.i32_const).i32(24).u8(Op.i32_shr_s)
      return
    case 0x92: // i2c
      w.u8(Op.i32_const).i32(0xffff).u8(Op.i32_and)
      return
    case 0x93: // i2s
      w.u8(Op.i32_const).i32(16).u8(Op.i32_shl)
      w.u8(Op.i32_const).i32(16).u8(Op.i32_shr_s)
      return

    // ---- comparisons ----
    case 0x94: return emitCmp(w, ctx, L, 0)
    case 0x95: return emitCmp(w, ctx, F, -1)
    case 0x96: return emitCmp(w, ctx, F, 1)
    case 0x97: return emitCmp(w, ctx, D, -1)
    case 0x98: return emitCmp(w, ctx, D, 1)

    // ---- returns ----
    case 0xac: case 0xad: case 0xae: case 0xaf: case 0xb1:
      w.u8(Op.return); return

    // ---- static call ----
    case 0xb8: {
      const ref = cp.memberRef(ins.operands[0])
      if (ref.owner !== ctx.cf.thisClass) {
        throw new UnsupportedError(`cross-class call to ${ref.owner}.${ref.name} — not in P0`)
      }
      const target = ctx.cf.methods.find((mm) => mm.name === ref.name && mm.descriptor === ref.desc)
      if (!target) throw new Error(`callee ${ref.name}${ref.desc} not found in ${ref.owner}`)
      w.u8(Op.call).u32(ctx.funcIndexOf(mangle(ctx.cf.thisClass, target)))
      return
    }

    default:
      throw new UnsupportedError(`opcode ${ins.name} (0x${op.toString(16)}) not supported in P0`)
  }
}

/**
 * lcmp / fcmp / dcmp: push -1, 0, or 1.
 * `nanResult` is used when either operand is NaN (0 for lcmp, which can't NaN).
 */
function emitCmp(w: ByteWriter, ctx: Ctx, t: CT, nanResult: number): void {
  const a = ctx.locals.scratch(t)
  const b = ctx.locals.scratch(t)
  w.u8(Op.local_set).u32(b)
  w.u8(Op.local_set).u32(a)

  const gt = t === ValType.i64 ? Op.i64_gt_s : t === ValType.f32 ? Op.f32_gt : Op.f64_gt
  const lt = t === ValType.i64 ? Op.i64_lt_s : t === ValType.f32 ? Op.f32_lt : Op.f64_lt
  const ne = t === ValType.f32 ? Op.f32_ne : Op.f64_ne

  if (t === ValType.i64) {
    w.u8(Op.local_get).u32(a).u8(Op.local_get).u32(b).u8(gt)
    w.u8(Op.local_get).u32(a).u8(Op.local_get).u32(b).u8(lt)
    w.u8(Op.i32_sub)
    return
  }

  // value1 = nanResult, value2 = (gt - lt), cond = isNaN
  w.u8(Op.i32_const).i32(nanResult)
  w.u8(Op.local_get).u32(a).u8(Op.local_get).u32(b).u8(gt)
  w.u8(Op.local_get).u32(a).u8(Op.local_get).u32(b).u8(lt)
  w.u8(Op.i32_sub)
  // isNaN = (a != a) | (b != b)
  w.u8(Op.local_get).u32(a).u8(Op.local_get).u32(a).u8(ne)
  w.u8(Op.local_get).u32(b).u8(Op.local_get).u32(b).u8(ne)
  w.u8(Op.i32_or)
  w.u8(Op.select)
}


