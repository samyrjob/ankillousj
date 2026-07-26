# AnkillousJ AWT — 100% of Futura's drawing surface

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
themselves in a canvas.

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
