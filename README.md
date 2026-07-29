# AnkillousJ

Java desktop applications, compiled for the browser. Free software, no
commercial licence, ever.

```powershell
cd toolchain
.\build.ps1 -Source C:\path\to\your\src
npx serve build\web
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

Verified on a 33,000-line isometric multiplayer game. It compiles, renders,
handles input, and reaches its server — with the server unmodified.

## What it cannot do, stated plainly

Three things have no browser equivalent, and no shim can invent one:

- **WebSocket handshake headers.** The browser builds the handshake itself. Your
  values move to the query string; the gateway hands them back under their
  original names.
- **Blocking dialogs.** `JOptionPane` stops the calling thread. Suspending in a
  browser freezes the event loop the dialog needs in order to be dismissed —
  that is a deadlock, not a delay. The prompts take callbacks instead.
- **Synchronous image decode.** `ImageIO.read` returns immediately and the
  pixels arrive later. `preload()` exists for when that matters.

Everything else is either implemented or reported.

## Licence

GPLv3 with the Classpath Exception. The compiler and runtime stay free forever;
anything you build with them is yours to licence however you want.

Clean-room throughout — written against the JVM Specification, the WebAssembly
Core Specification, and RFCs 6455 and 8032. No CheerpJ source or output was
read.
