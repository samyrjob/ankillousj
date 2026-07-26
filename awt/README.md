# AnkillousJ AWT — 100% of Futura's drawing surface, plus events

An AWT/Swing-free `java.awt` for the browser: `Graphics2D` implemented over
Canvas2D, compiled with TeaVM. It covers **every Graphics2D call Futura makes**
— 38 methods, 1,763 call sites, verified by scanner.

```
$ node tools/scan-awt.mjs ../virtual_world_sources --shim src/main/java/awt

distinct methods 38   (38 implemented, 0 to do)
call sites       1763   (1763 covered)

coverage  ████████████████████████████████  100.0%
```

## See it

```bash
npx serve web        # then open the URL — file:// will not work
```

`RoomInfoCard` and `GroupIcon`, both taken from the game, both drawing
themselves in a canvas — and now responding to input:

- **hover the gear** — it brightens
- **click the gear** — `handleClick` returns true
- **scroll** — resizes the icon
- **click the canvas, then Space** — toggles the card

The hit-testing is `RoomInfoCard.handleMouseMove` and `handleClick`, copied
verbatim from the desktop build. They have no idea they are in a browser.

## Events

`awt.Component` is the bridge: a panel extends it, registers the same
listeners it always did, and overrides `paint(Graphics2D)`.

Implemented: `MouseListener` `MouseMotionListener` `MouseWheelListener`
`KeyListener` `ComponentListener` `FocusListener` and their adapters, plus
`MouseEvent` `MouseWheelEvent` `KeyEvent` `ActionEvent` `ComponentEvent`
`FocusEvent` `WindowEvent` and `Point`.

Three things that are easy to get wrong and are handled here:

- **Coordinates.** AWT gives component-local pixels; the browser gives
  viewport pixels, and the canvas may be scaled by CSS *and* by
  `devicePixelRatio`. Both are undone via `getBoundingClientRect`, so clicks
  land correctly even when the canvas is stretched. There is a test for it.
- **Repaint.** `repaint()` sets a dirty flag that the next
  `requestAnimationFrame` consumes, so a burst of calls collapses into one
  draw — the coalescing Swing does on the EDT.
- **Callbacks.** TeaVM will not marshal a plain `Runnable` into JS. Callbacks
  into `requestAnimationFrame` have to be a `@JSFunctor` interface, or you get
  `TypeError: var$1 is not a function` at runtime.

```bash
cd render && npm install && node events.test.mjs
```

Nine assertions, driven through a DOM stub, checking that each event reaches
the game's own code and changes the pixels it should.

### A bug those tests caught

`Graphics2D.create()` issues `ctx.save()`; the original `dispose()` only
restored when a clip was outstanding. Nothing looked wrong in a single frame.
Over an animation loop the saves piled up, so `IconBase`'s `translate`/`scale`
never unwound and the whole scene drifted — invisible in a static render,
obvious the moment there was a second frame. `dispose()` now tracks whether it
owes a restore.

## Fidelity

Every component is rendered twice — once on real `java.awt` headless into a
`BufferedImage`, once through TeaVM into Canvas2D — and compared pixel by pixel.

| Region | Pixel-identical | Within 16/255 | PSNR |
|---|---|---|---|
| `GroupIcon` — pure vector (`Area`, `Path2D`, `Ellipse2D`) | **88.0%** | 96.3% | **29.1 dB** |
| `RoomInfoCard` — text-heavy | 28.0% | 81.2% | 15.1 dB |
| Whole frame | 70.2% | 91.6% | 20.0 dB |

The geometry is essentially exact. The entire remaining gap is font
rasterization — two different text engines will never agree, and bitmap fonts
would close it if that ever matters.

## `Area` without boolean geometry

Canvas2D has no path booleans. `Area` gets them from the nonzero winding rule
instead:

- `add(s)` — append `s` with its normal winding, so regions merge
- `subtract(s)` — append `s` **reversed**, so the region becomes a hole

Reversal lives in `PathSink.Recording.replayReversed`, which walks each subpath
backwards and swaps Bézier control points. Filling under nonzero then gives the
right answer with no geometry computation at all.

Stroking is the interesting part. AWT dissolves the seam where two merged
shapes meet; a naive stroke of the combined path draws it. So I built a
complement-clip that masks anything falling inside the union — and then
measured it against real AWT:

| Strategy | PSNR | Within 16/255 |
|---|---|---|
| **Stroke the combined path** | **29.1 dB** | **96.3%** |
| Clip to complement of union | 16.6 dB | 87.3% |
| Clip to complement, 2× width | 15.5 dB | 69.7% |

The clever one lost. Clipping removes the seam but shoves the whole outline
outside the true contour, and that distortion costs more than the seam. In the
`outlineFill` idiom the codebase uses — stroke thick, fill, stroke thin — the
fill paints over the thick seam and only a hairline survives.

Exact parity needs a real polygon clipper (Vatti or Martinez). It is bounded
work, and now measurably low priority.

## Can the imports stay as `java.awt`?

Almost. TeaVM 0.15.0 added a `SubstitutionPolicy` extension point built for
exactly this — mapping a JDK class onto a web-friendly implementation. A policy
registered through `META-INF/services`:

```java
public class AwtSubstitution implements SubstitutionPolicy {
    public void contribute(SubstitutionSink sink) {
        sink.substitutePackage("java.awt", "awt");
        sink.substitutePackage("java.awt.geom", "awt.geom");
        sink.substitutePackage("java.awt.image", "awt.image");
        sink.substitutePackage("java.awt.event", "awt.event");
    }
}
```

**This works.** A panel written entirely against `java.awt` — extending
`java.awt.Component`, overriding `paint(Graphics)`, casting to `Graphics2D`,
registering `MouseAdapter`s — compiled and ran with no import rewriting at all.
`Graphics2D`, `Component`, all of `geom`, `image` and `event` substituted
cleanly.

Two things learned the hard way:

- The substitute is registered **as the original name**. A class that
  references `awt.Component` directly is referencing something else entirely,
  so the bootstrap cannot take an `awt.Component` parameter. That is why
  `Component` claims the page's canvas in its own constructor instead:
  `new MyPanel()` is the entire bootstrap, and no AnkillousJ type appears in
  game source.

- **Three classes cannot be substituted.** TeaVM's own classlib ships
  `java.awt.Color`, `java.awt.Point` and `java.awt.Dimension`, and the classlib
  wins:

  ```
  [ERROR] Method java.awt.Color.brighter()Ljava/awt/Color; was not found
  ```

  Its `Color` has the constructors and `getRed`/`getGreen`/`getBlue`/
  `getAlpha`, but no `brighter()` or `darker()`. In Futura that is three call
  sites — one `brighter()`, two `darker()`. For a general-purpose tool it
  matters more.

  The fix is upstream and small: add `brighter()` and `darker()` to
  `org.teavm.classlib.java.awt.TColor`. TeaVM is Apache 2.0, and that is a
  fifteen-line patch.

Until then this repo ships the import rewrite below, which is mechanical and
reversible. The substitution route is the better long-term answer and is
roughly one upstream PR away from being complete.

## Beyond AWT: concurrency

The browser has one thread and an event loop. That is the whole design
constraint, and these shims are shaped by it.

| Package | Covers | Futura call sites |
|---|---|---|
| `swing` | `SwingUtilities.invokeLater` / `invokeAndWait` / `isEventDispatchThread` | 101 |
| `concurrent` | `Executors`, `ExecutorService`, `ScheduledExecutorService`, `Future`, `ScheduledFuture`, `CompletableFuture` | 41 |

`TimeUnit` and `ConcurrentHashMap` are left alone — TeaVM already ships them.

**What maps cleanly.** `invokeLater` is `setTimeout(0)`; Swing's event dispatch
thread and the browser's task queue are the same idea. `schedule` is
`setTimeout`, `scheduleAtFixedRate` is `setInterval`, and cancelling clears the
timer. The callback half of `CompletableFuture` — `thenApply`, `whenComplete`,
`exceptionally` — is exactly how the browser wants to be programmed.

**What does not, and how it is handled.** Nothing can block. `Future.get()` and
`CompletableFuture.join()` would have to suspend the very loop that produces
the result, so waiting would deadlock rather than delay.

- Work submitted to an executor runs **inline and immediately**, so the Future
  it hands back is already complete. `submit(...).get()` keeps working, which
  is what most code does. What you lose is parallelism — interleaved, not
  simultaneous. Real parallelism needs Web Workers.
- `join()` on an incomplete future **throws** rather than hanging the page. A
  loud failure at the call site beats a frozen tab.
- `invokeAndWait` runs inline, which is also what Swing does when you are
  already on the EDT.

```bash
cd render && node concurrency.test.mjs     # 23 assertions
```

The tests check both halves of the contract: that work is deferred *and* that
it actually arrives, including FIFO ordering across queued tasks and that a
repeating timer really repeats before it is cancelled.

## Beyond AWT: networking and time

| Package | Covers | Futura uses |
|---|---|---|
| `nethttp` | `HttpClient`, `WebSocket`, `WebSocket.Builder`, `WebSocket.Listener` | 72 |
| `time` | `Duration`, `Instant`, `Clock` | 17 |

Plain HTTP is not shimmed — TeaVM already ships `java.net.HttpURLConnection`,
which is what the client code uses for REST.

### WebSocket: headers do not work, and that is not fixable here

The browser issues the WebSocket handshake itself and exposes no way to set
request headers. `Builder.header(name, value)` therefore appends the value to
the URL as a query parameter:

```
wss://host/socket            ->  wss://host/socket?X-Game-Version=1.4.2
```

**The server has to read it from there.** A server that authenticates on a
header will refuse the connection until it also checks the query string. This
is surfaced loudly rather than dropped silently, because a silently discarded
auth header is an afternoon of debugging.

### Other differences

- **Message framing.** The JDK hands you fragments and expects `request(n)` to
  pull more; the browser reassembles frames and delivers whole messages. So
  `onText` always arrives with `last = true`, and `request(n)` is a no-op —
  there is no flow control to exert.
- **Sending before open.** The browser throws if you `send()` while still
  CONNECTING. Messages sent before the socket opens are queued and flushed on
  open, so `buildAsync(...).thenAccept(ws -> ws.sendText(...))` behaves.
- **Error detail.** `onError` gets a generic exception. The browser withholds
  the reason deliberately, to avoid leaking cross-origin information — there is
  nothing more to report.
- **`connectTimeout`** is accepted and ignored; the browser owns the connection.

```bash
cd render && node websocket.test.mjs    # 35 assertions
```

The test drives a stub browser socket through the whole path — `HttpClient` ->
`Builder` -> socket -> `Listener` — including a stub that *throws* on send
before open, so the queueing is actually load-bearing rather than incidental.

## Beyond AWT: images

`imageio.ImageIO` covers the 32 `ImageIO.read` sites — but this is the shim
with the sharpest behavioural edge, so read this before using it.

**`ImageIO.read` is synchronous. Browsers decode asynchronously.** There is no
way to wait: suspending would freeze the event loop that finishes the decode.

`read(String url)` therefore returns immediately with an image whose pixels
arrive later. Drawing it early is harmless — the canvas ignores an incomplete
image — and it appears on the next repaint. At 60fps that is a frame or two of
nothing.

**The catch is dimensions.** `getWidth()` and `getHeight()` report 0 until the
image loads, so anything that scales or centres by them will be wrong on the
first frames. Where that matters:

```java
ImageIO.setResourceBase("assets");          // /res/x.png -> assets/res/x.png
ImageIO.preload("/res/tile/wall.png", "/res/icons/chat.png")
       .thenRun(() -> startRendering());
```

A failed image still settles, so one broken asset cannot hang startup. There is
a test for exactly that.

**Resource streams cannot work.** `ImageIO.read(getClass().getResourceAsStream(path))`
implies a classpath and a synchronous file read, and the browser has neither.
That overload throws with a message naming the fix rather than returning null:

```
ImageIO.read(InputStream) cannot work in a browser: there is no classpath and
no synchronous file read. Use ImageIO.read(String url) with the asset served
over HTTP, and ImageIO.setResourceBase(...) to keep existing paths.
```

In Futura that is roughly twelve call sites to change. `setResourceBase` means
the paths themselves can stay as they are.

```bash
cd render
node events.test.mjs        #  9   DOM events reaching game code
node concurrency.test.mjs   # 23   executors, futures, SwingUtilities
node websocket.test.mjs     # 14   the socket path end to end
node image.test.mjs         # 12   decoding gap and post-load state
node soundcrypto.test.mjs   # 26   audio, dB conversion, JWT claims
```

All five share `dom-stub.mjs`. They did not, at first — each grew its own copy,
and the moment `ImageIO` needed a stubbed `Image` the other three broke at once.
Adding audio broke them again the same way, for the same reason, until the
`Audio` stub went into the shared file where it belonged. A new shim needing a
new browser API should only ever touch `dom-stub.mjs`.

## Beyond AWT: sound

`sound.Clip` over an HTML audio element, covering the 110 `Clip` references in
`Sound.java` and `RadioPlayer.java`.

**Autoplay is blocked** until the user has interacted with the page. `start()`
does nothing before then — the browser rejects the play promise, which the
shim swallows so it does not litter the console. Trigger the first sound from a
click or key press. No shim can work around this; it is deliberate policy.

**`MASTER_GAIN` is decibels; HTML volume is linear 0..1.** Passing a decibel
value straight through would mute everything, so the conversion happens in
`FloatControl`: `amplitude = 10^(dB/20)`, with -80 dB treated as silence. It is
exposed as `FloatControl.dbToLinear` because it is the number most worth being
able to reason about.

**Frames become seconds** at a nominal 44.1kHz. `setFramePosition(0)` — rewind,
which is the common case — is exact regardless.

Format support is the browser's, so MP3, AAC, WAV and OGG all work. That makes
the `javazoom` MP3 player redundant.

## Beyond AWT: crypto, and what cannot be done

`Signature.verify()` returns a boolean synchronously. WebCrypto's
`subtle.verify()` returns a Promise. **These cannot be bridged** — awaiting a
promise means yielding to the event loop, and a synchronous method cannot
yield. This is the shape of the platform, not a missing feature.

So `java.security.Signature` and `KeyFactory` throw, with the reason and the
alternative in the message.

**The real answer is to stop verifying on the client.** A signature check
protects the party that trusts the token, and the client already holds it. An
attacker controlling the browser can edit the token, patch out the check, or
skip it. Client-side verification stops nobody. The server has to verify, and
once it does, a second check in the browser catches nothing but accidental
corruption.

What client code usually actually wants — expiry, user id — needs no crypto:

```java
Jwt.decodePayload(token);            // claims, unverified
Jwt.numericClaim(token, "exp");
Jwt.isExpired(token, epochSeconds);
```

If a genuine client-side check is still wanted, `Signature.verifyAsync(...)`
does it properly through WebCrypto and returns a future. The cost is that the
call site becomes asynchronous. Note also that Ed25519 in WebCrypto requires a
secure context and browser support still varies.

## Tools

### `tools/scan-awt.mjs` — the backlog, on demand

```bash
node tools/scan-awt.mjs <java-src-root> --shim src/main/java/awt
node tools/scan-awt.mjs <java-src-root> --shim src/main/java/awt --json out.json
```

Inventories every `Graphics2D` / `FontMetrics` call site, diffs against what
the shim implements, and lists which files break for each missing method. Rerun
it as the game grows; it is the regression test for the port.

### `tools/port-imports.ps1` — the namespace rewrite

TeaVM reserves `java.*` for its own class library and refuses to load
application classes from it:

```
[ERROR] Class java.awt.Graphics2D was not found
```

So the shim lives in package `awt`, and the game's imports need flipping:

```powershell
.\tools\port-imports.ps1 -Root C:\path\to\src           # dry run
.\tools\port-imports.ps1 -Root C:\path\to\src -Apply    # write
.\tools\port-imports.ps1 -Root C:\path\to\src -Revert   # undo
```

On Futura's tree: **73 files**. Fully reversible. A bash version is alongside.

Longer term, TeaVM 0.15's `SubstitutionPolicy` extension point was built for
exactly this and would let the imports stay as `java.awt`.

## What is implemented

**Graphics** — the abstract base every AWT paint method receives, so the usual
`Graphics2D g2d = (Graphics2D) g;` cast is legal and dispatch works.

**Component** — `paint(Graphics)`, `repaint()`, `getWidth`/`getHeight`,
`addMouseListener` and friends, all with real AWT signatures. A no-arg
`protected` constructor means a game panel extends it exactly as it extends
`java.awt.Component`.

**Graphics2D** — `setColor` `setPaint` `setStroke` `setFont` `setComposite`
`getColor` `getPaint` `getStroke` `getFont` `getComposite` `getFontMetrics`
`drawString` `fillRect` `drawRect` `fillRoundRect` `drawRoundRect` `fillOval`
`drawOval` `drawLine` `fillPolygon` `drawPolygon` `drawPolyline` `drawArc`
`fill(Shape)` `draw(Shape)` `drawImage` ×3 `clip` `setClip` `getClip`
`clipRect` `translate` `scale` `rotate` `shear` `create` `dispose`
`setRenderingHint` `getRenderingHint`

**Types** — `Color` `Font` `FontMetrics` `Rectangle` `Shape` `Paint` `Stroke`
`BasicStroke` `Composite` `AlphaComposite` `GradientPaint` `RenderingHints`
`Window`

**geom** — `PathSink` (+ `Recording` with reversal) `Path2D` `Area`
`Ellipse2D` `Rectangle2D` `RoundRectangle2D` `Line2D` `Arc2D`

**image** — `BufferedImage` over an offscreen canvas; wraps either a decoded
`<img>` or a surface you draw into.

## Not implemented, and honest about it

- **Swing widgets.** `JPanel`, `JLabel`, `JButton`, `JDialog`, `JOptionPane`.
  In Futura these are concentrated in six files — four dialogs plus window
  setup, about 2,000 lines. They want rebuilding as HTML, not emulating.
- **`java.awt.event`.** Mouse and key events need wiring from DOM listeners.
  Mechanical, not done here.
- **`ImageIO`.** The browser decodes PNG and JPEG natively; this needs an async
  loader that resolves to a `BufferedImage`.
- **Real `Area` booleans.** See above — measured as low priority.
- **`AffineTransform`** as an object. The `Graphics2D` transform methods work;
  the standalone class does not exist.

## Build

```bash
mvn process-classes          # -> target/js/proof.js
cp target/js/proof.js web/
cd render && npm install && node run.mjs      # headless render + op trace
```

Rendering the AWT reference yourself:

```bash
cd oracle
javac -encoding UTF-8 -d out $(find src -name '*.java')
java -Djava.awt.headless=true -cp out demo.Oracle
```

## Where this sits

Futura imports 92 JDK types. TeaVM 0.14.1 covers 44 of them, including the
parts that looked hardest: `LambdaMetafactory` and `MethodHandles` for the 270
lambdas and method references, the full `java.lang.reflect` that Gson needs,
`Thread` and `ConcurrentHashMap` and the atomics, and 1,502 class-library
classes across `java.util`, `java.io`, `java.nio`, `java.text` and streams.

Of the 152 uncovered import sites, **112 were AWT/Swing** — this project. What
remains after it:

```
Executors / CompletableFuture     16 sites   thin wrappers over the event loop
java.net.http + java.time          8 sites   fetch / WebSocket via JSO
java.security (JWT verify)         8 sites   WebCrypto, or move it server-side
javax.imageio                      7 sites   browser-native decode
javax.sound                        1 site    Web Audio
```

Forty import sites.
