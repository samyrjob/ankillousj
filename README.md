# AnkillousJ

Java desktop applications, compiled for the browser. Free software, no
commercial licence, ever.

```powershell
cd toolchain
.\build.ps1 -Project C:\path\to\your\project -Source C:\path\to\your\src
node serve.mjs
```

One command from a Swing/AWT source tree to a running browser build.

| | |
|---|---|
| [`toolchain/`](toolchain) | **The build.** Point it at your sources. |
| [`awt/`](awt) | The runtime: `java.awt` over Canvas2D, plus concurrency, networking, images, sound, crypto, JSON. 144 tests. |
| [`gateway/`](gateway) | WebSocket-to-TCP bridge, so a browser reaches an unmodified `ServerSocket` server. |
| [`loop/`](loop) | End-to-end: compiled client joining a real server through the gateway. |
| [`integration/`](integration) | The record of porting a real 33k-line game, and what it cost. |
| [`compiler/`](compiler) | A bytecode-to-Wasm front end, written from scratch. Reference, not the path. |
| [`teavm-color-patch/`](teavm-color-patch) | Upstream patch: `Color.brighter()` / `darker()`. |
| [`teavm-atomic-array-patch/`](teavm-atomic-array-patch) | Upstream patch: `AtomicIntegerArray` / `AtomicLongArray`. |

## What it does

Compiles with [TeaVM](https://teavm.org) and supplies what TeaVM does not: the
whole AWT surface over Canvas2D, and replacements for the JDK corners a browser
cannot reach.

Verified on an isometric multiplayer game: 33,000 lines in July 2026, 70,000
in November. It compiles, starts in Chrome, runs its loop and draws — with the
server unmodified.

## What it cannot do, stated plainly

Three things have no browser equivalent, and no shim can invent one:

- **WebSocket handshake headers.** The browser builds the handshake itself. Your
  values move to the query string; the gateway hands them back under their
  original names.
- **Blocking dialogs.** `JOptionPane` stops the calling thread. Suspending in a
  browser freezes the event loop the dialog needs in order to be dismissed —
  that is a deadlock, not a delay. The prompts take callbacks instead.
- **A thread that never pauses.** A desktop thread may spin: the others run
  beside it. A page has one thread of execution, and a loop that never waits
  freezes it. Such a loop is given one line (`Platform.nextFrame()`), by a
  patch the build applies, kept in the application's own project; see
  `toolchain/README.md`, *Projects*.

One thing that used to be on this list is not any more: `ImageIO.read` returns
a decoded picture when a program thread calls it (TeaVM suspends the thread
while the browser decodes). Only code the browser itself calls — a paint, an
event — gets a picture whose pixels follow.

Everything else is either implemented or reported.

## Licence

GPLv3 with the Classpath Exception. The compiler and runtime stay free forever;
anything you build with them is yours to licence however you want.

Clean-room throughout — written against the JVM Specification, the WebAssembly
Core Specification, and RFCs 6455 and 8032. No CheerpJ source or output was
read.
