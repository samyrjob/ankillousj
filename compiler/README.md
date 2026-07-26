# AnkillousJ

Java bytecode → WebAssembly compiler. Free software, no commercial license, ever.

**Status: P0 — working proof of pipeline.** Compiles static methods over primitive
types to a standalone `.wasm` module that runs in Node and in every browser.

```
$ ankillousj Kernel.class
class    Kernel
output   Kernel.wasm (1335 bytes)
compiled 14 method(s)
  ✓ add(II)I
  ✓ fib(I)I
  ✓ gcd(II)I
  ✓ factorial(I)J
  ...
```

## Why

CheerpJ is the only real Java-in-the-browser runtime, and it is commercially
licensed. AnkillousJ exists to be the free one. GPLv3 with the Classpath
Exception: the compiler and runtime stay free forever, but anything you *build*
with it is yours to license however you want.

## Design notes

**Targets WebAssembly GC from day one.** The pre-GC generation of Java-to-Wasm
compilers had to ship their own garbage collector and maintain a shadow stack,
because Wasm gave them no way to scan the real one. That cost them roughly 5×
binary size against plain JavaScript. Starting on Wasm GC deletes that entire
layer before it is written.

**Control flow uses a `br_table` dispatch loop.** Each JVM basic block becomes a
case in a dispatch table; the block index lives in a `$pc` local. This handles
*arbitrary* control flow, including the irreducible graphs that a Relooper
cannot structure, and it was ~150 lines instead of ~600. It is slower than
structured output. Replacing it with a Stackifier is a performance task for P1,
not a correctness fix.

Conditional branches compute their successor with `select` rather than
`if`/`else`. Wrapping the `br` in an `if` shifts the label depth by one and
sends control to the wrong block — a bug worth knowing about if you touch
`emitTerminator`.

**Operand stack across block edges.** JVM basic blocks can be entered with a
non-empty operand stack (any ternary expression does this). Wasm blocks cannot.
Abstract interpretation computes the stack *type signature* at every block
entry, and the translator spills to typed locals at each edge and reloads on
entry.

**Local slot typing.** JVM locals are untyped slots that get reused for
different types; Wasm locals are typed. Every `(slot, type)` pair gets its own
Wasm local. Parameters are seeded to indices `0..n-1` so they line up with the
function signature.

## Layout

```
src/
  classfile/
    parser.ts      constant pool, methods, Code attribute, descriptors
    bytecode.ts    opcode table and instruction decoder
  wasm/
    encoder.ts     LEB128, opcodes, value types
    module.ts      section assembly -> .wasm binary
  compiler/
    translate.ts   bytecode -> Wasm, the core
    compile.ts     driver: class file -> module
  cli.ts
test/
  java/Kernel.java  fixture
  run.ts            differential test against reference values
```

## Build

```bash
npm install
npm run build
javac -d test/java test/java/Kernel.java
npm test
```

## What works

**147 of 147 in-scope JVM opcodes.** Verified by `test/audit.ts`, which
enumerates the JVMS SE 21 opcode set, classifies each one by phase, and fails
the build if anything inside P0's declared scope is unimplemented.

Static methods. `int` / `long` / `float` / `double`. Full arithmetic, bitwise
ops, shifts with Java's masking semantics, all numeric conversions including
the narrowing casts. `lcmp` / `fcmpl` / `fcmpg` / `dcmpl` / `dcmpg` with
correct NaN behaviour. The complete `dup` family (`dup_x1`, `dup_x2`, `dup2`,
`dup2_x1`, `dup2_x2`) and `swap`. `wide`-prefixed loads, stores and `iinc` for
methods with more than 255 locals. Conditionals, loops, `tableswitch`,
`lookupswitch`, recursion, and static calls within a class.

## Testing

Three layers:

```bash
npm run audit   # opcode coverage vs JVMS SE 21 — fails on any in-scope gap
npm test        # 26 unit tests against known values
npm run diff    # 71 cases with the real JVM as the oracle
```

The differential runner generates a Java harness, runs it on the JVM, compiles
the same class to Wasm, and compares outputs. No hand-written expected values,
so the tests cannot be wrong in the same direction as the compiler.

It has already earned its keep: it caught `dup2` being emitted by javac for
`a = b = x * 2L`, which the unit tests never exercised.

## What does not

The honest list:

- **No objects.** No `new`, no fields, no virtual dispatch, no interfaces.
- **No arrays.**
- **No strings.** `ldc` of a `String` constant is rejected.
- **No exceptions.** Methods with a non-empty exception table are skipped.
- **No cross-class calls.** One class file in, one module out.
- **`frem` / `drem`** need a runtime helper and are rejected rather than
  silently producing wrong answers.
- **Division semantics diverge.** Java throws `ArithmeticException` on integer
  divide-by-zero and defines `Integer.MIN_VALUE / -1` as `Integer.MIN_VALUE`.
  Wasm's `i32.div_s` traps in both cases. Correct behaviour needs guard code.
- **No threads, no reflection, no `invokedynamic`.** No lambdas or method
  references, which desugar to `invokedynamic`.

Methods that cannot be compiled are replaced with a trapping stub of the right
signature, so function indices stay stable and the rest of the class still
works.

## Roadmap

| Phase | Scope |
|---|---|
| **P0** | ✅ Class parsing, primitives, control flow, static calls — 147/147 opcodes |
| **P1** | Objects via Wasm GC structs, vtables, interfaces, arrays, exceptions |
| **P2** | Minimal runtime: `Object`, `String`, `Class`, `Throwable`, static init |
| **P3** | Class library subset. Written from scratch or sourced Apache-licensed |
| **P4** | **AWT/Swing → Canvas2D.** The part nobody else has done |
| **P5** | Virtual FS over IndexedDB, sockets over WebSocket, threads |

P4 is the actual goal. Everything before it is scaffolding.

## Legal

GPLv3 with the Classpath Exception.

Clean-room implementation. Written against the JVM Specification (JVMS SE 21)
and the WebAssembly Core Specification. No CheerpJ source or output was read.

Do not copy OpenJDK class library source into this repository — it is
GPLv2+CE, which does not combine with GPLv3 the way you would hope. Write
replacements, or source from Apache-2.0 licensed projects.

## Prior art worth reading

- **TeaVM** (Apache 2.0) — mature, has a Wasm GC backend. Read it to learn the
  mapping. No Swing.
- **Bytecoder** (Apache 2.0) — smaller, easier to follow end to end.
- **Doppio** (MIT) — a JVM in JavaScript. Proof the whole idea works.
