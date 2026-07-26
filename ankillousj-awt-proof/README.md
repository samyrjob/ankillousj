# Proof: RoomInfoCard.java running in a browser

The question was whether Futura's Swing rendering can reach a browser tab
without a rewrite. This answers it with your own code.

## Open it

```
web/index.html
```

Serve the folder (`npx serve web`, or `python -m http.server` inside it) and
open it. `file://` will not work — the browser blocks the script load.

You should see the Deep Indigo & Gold room card: gradient body, metallic gold
border, the faint FUTURA watermark, the vector gear, the crown, the user glyph,
and truncated text — drawn by your Java, in a canvas, with no plugin.

## What was actually done

`RoomInfoCard.java` was taken from `client/view/room/` and **169 lines across
ten methods were copied verbatim**:

| Method | Lines |
|---|---|
| `draw` | 26 |
| `drawBackgroundAndBorder` | 16 |
| `drawWatermark` | 23 |
| `drawRoomName` | 6 |
| `drawGearIcon` | 43 |
| `drawOwnerLine` | 16 |
| `drawPlayerCount` | 13 |
| `truncateToWidth` | 16 |
| `handleMouseMove` | 3 |
| `handleClick` | 7 |

Exactly two edits were needed, both marked `PORT NOTE` in the source:

1. `handleClick` no longer opens the settings dialog — that path is Swing
   (`JOptionPane` / `StyledDialog`) and is out of scope for a canvas proof.
2. `bottomAnchorY` reads `gp.getHeight()` instead of walking to the toolbar
   HUD, which is not part of this slice.

Nothing in the drawing code was touched.

## The pipeline

```
RoomInfoCard.java
      │  javac
      ▼
  .class files
      │  TeaVM 0.14.1
      ▼
   proof.js  (464 KB, unminified, with debug info)
      │
      ▼
awt.Graphics2D  ──►  CanvasRenderingContext2D
```

`awt/Graphics2D.java` is the whole AWT backend — about 250 lines. It holds a
shadow copy of the AWT state (colour, paint, font, stroke, composite, clip)
and pushes each change to the canvas context.

## Results

Running the compiled output headlessly against a real Canvas2D:

```
253 Canvas2D operations issued by the Java code
  lineTo 49   beginPath 41   moveTo 34   stroke 34
  quadraticCurveTo 16   fillStyle 12   strokeStyle 12
  ellipse 7   font 6   fill 6   closePath 5
  createLinearGradient 4   lineWidth 4   lineCap 4   lineJoin 4
  fillText 4   globalAlpha 3   fillRect 2   measureText 2
  textBaseline 1   save 1   clip 1   restore 1
```

The same `RoomInfoCard` was then rendered on **real `java.awt`** headless into
a `BufferedImage`, and the two images compared over the card region:

| Metric | Value |
|---|---|
| Pixel-identical | 28.0% |
| Within 16/255 per channel | **81.2%** |
| Mean absolute error | 15.6 / 255 |
| PSNR | 15.1 dB |

See `images/diff.png` — top is AWT, middle is Canvas, bottom is the difference
amplified 6×. Every disagreement is text rasterization and antialiasing. The
geometry — border radius, gradient stops, gear teeth angles, crown polygon,
glyph placement — lines up. Two entirely different rasterizers will never be
pixel-identical; bitmap fonts would close most of the remaining gap if you ever
need it.

## The one real obstacle, and it is small

TeaVM reserves the `java.*` namespace for its own class library and refuses to
load application classes from it:

```
[ERROR] Class java.awt.Graphics2D was not found
```

So the shim lives in package `awt` rather than `java.awt`, and the game's
imports need rewriting:

```
import java.awt.*;              ->  import awt.*;
import java.awt.geom.X;         ->  import awt.geom.X;
```

That is one `sed` across the tree. Three cleaner options exist for later:

- TeaVM 0.15.0 added a `SubstitutionPolicy` extension point built for exactly
  this — mapping a class to a web-friendly implementation.
- Fork `teavm-classlib` and add `java.awt` to it.
- Keep the rewrite. It is mechanical and reversible.

(For reference: `javac` itself also blocks `java.awt` because `java.desktop`
owns the package. `--limit-modules java.base` gets past that, and is left in
the git history in case the `java.awt` route is revisited.)

## Build it yourself

```bash
mvn process-classes         # produces target/js/proof.js
cd render && npm install && node run.mjs    # headless render + op trace
```

The headless runner uses `@napi-rs/canvas`. The browser and Node paths run the
*same* compiled JavaScript — the only difference is where
`globalThis.__ankCtx` comes from.

## What this means for Futura

Your codebase makes **1,622 Graphics2D calls across 33 distinct methods**. This
proof implements 23 of those methods and rendered your most decorated HUD
component. The remaining ten are `drawImage`, `fill`/`draw` on `Path2D`,
`create`/`dispose`, `shear`, `drawArc`, `clipRect`, `drawPolyline` and the
rendering-hint no-ops — all in the same shape as what is already here.

The AWT-to-canvas layer is not the hard part. It is roughly a week of work for
full coverage of what your game actually calls.

The hard parts are elsewhere: 223 lambdas, Gson's reflection, 42 threads,
`BufferedImage`/`ImageIO`, and three separate audio APIs. TeaVM already handles
the first three. That is the argument for building on it rather than beneath it.
