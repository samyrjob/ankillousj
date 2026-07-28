# AnkillousJ

Java in the browser. Free software, no commercial licence, ever.

Two projects:

| | |
|---|---|
| [`compiler/`](compiler) | Java bytecode → WebAssembly, written from scratch. 147/147 in-scope opcodes, 97 tests. |
| [`awt/`](awt) | `java.awt` over Canvas2D, on TeaVM. 100% of Futura's drawing surface, plus events, concurrency, networking, images, sound and crypto. |
| [`gateway/`](gateway) | WebSocket-to-TCP bridge, so a browser reaches an unmodified `ServerSocket` game server. |
| [`integration/`](integration) | The real client, ported and compiled. javac: 0 errors. |
| [`teavm-color-patch/`](teavm-color-patch) | Upstream patch: `Color.brighter()` / `darker()`. |
| [`teavm-atomic-array-patch/`](teavm-atomic-array-patch) | Upstream patch: `AtomicIntegerArray` / `AtomicLongArray`. |

## Which one matters

`awt/` is the one to build on.

Futura imports 92 JDK types. TeaVM 0.14.1 already covers 44 of them, including
everything that looked hardest: `LambdaMetafactory` and `MethodHandles` for the
270 lambdas and method references, the full `java.lang.reflect` Gson needs,
`Thread` and `ConcurrentHashMap` and the atomics, and 1,502 class-library
classes across `java.util`, `java.io`, `java.nio`, `java.text` and streams.

Of the 152 import sites TeaVM does *not* cover, **112 were AWT/Swing**. That is
what `awt/` is. What is left after it:

```
Executors / CompletableFuture     16 sites   thin wrappers over the event loop
java.net.http + java.time          8 sites   fetch / WebSocket via JSO
java.security (JWT verify)         8 sites   WebCrypto, or move it server-side
javax.imageio                      7 sites   browser-native decode
javax.sound                        1 site    Web Audio
```

Forty import sites, plus the six Swing files (four dialogs and window setup,
about 2,000 lines) that want rebuilding as HTML rather than emulating.

`compiler/` is a complete, tested bytecode→Wasm front end. It is how the
bytecode and Wasm models got learned, and it stands as a clean reference. But
carrying it to the point it could run Futura means rebuilding TeaVM's decade,
and TeaVM is Apache 2.0.

## Quick start

```bash
# see the game's own code render and respond in a browser
cd awt && npx serve web

# the compiler's test suite
cd compiler && npm install && npm run check
```

## Licence

GPLv3 with the Classpath Exception. The compiler and runtime stay free
forever; anything you build with them is yours to licence however you want.

Clean-room throughout — written against the JVM Specification (JVMS SE 21) and
the WebAssembly Core Specification. No CheerpJ source or output was read.
