# Integration: the game running in a browser

Everything else in this repo is tested against stubs. This is the actual Futura
source, ported, compiled by TeaVM, and booted.

## Where it stands

| stage | result |
|---|---|
| Baseline on a real JDK | 0 errors, 216 classes |
| javac, ported, against the shims | **0 errors** — was 298 |
| **TeaVM** | **BUILD SUCCESS — 2.8 MB of futura.js** |
| Boot | **constructor completes, `GamePanel live: 1280x720`** |
| **First frame** | **11,302 canvas operations, 2,263 colours** |

`first-frame.png` is what it draws. A colour census of the quadrants:

```
top-left      UI chrome     (198,199,208), (168,170,182)
top-right     UI chrome + floor tiles
bottom-left   floor tiles   (115,74,35)
bottom-right  HUD cards     (32,37,63), (24,28,52)  <- Theme.CARD_GRAD_*
```

Grey panels, brown floor tiles, and the Deep Indigo HUD colours from
`view.shared.Theme`. That is the isometric renderer, the tile manager and the
HUD, all executing as JavaScript.

The art is stand-in — the real assets are not in the source drop, so
`render/genassets.mjs` produces coloured tiles and glyphs at the paths the game
asks for. Swapping in the real files changes the pixels and nothing else.

## Gson had to go

Gson was the last blocker, and not a small one. It is reflection-driven by
design, and a whole-program compiler follows all of it:

```
java.io.ObjectInputStream        <- UnsafeAllocator
java.io.ObjectStreamClass        <- UnsafeAllocator
java.net.InetAddress             <- TypeAdapters
java.util.concurrent.ConcurrentNavigableMap  <- ConstructorConstructor
java.sql.Date                    <- SqlTypesSupport
java.util.concurrent.atomic.AtomicIntegerArray  <- TypeAdapters
java.util.concurrent.atomic.AtomicLongArray     <- TypeAdapters
```

None of these are referenced by the application. They arrive because Gson
registers adapters for every type it might ever be asked about, and holds them
in static fields.

Substituting them one at a time was whack-a-mole — each fix revealed the next.
So the usage was measured instead:

| | uses |
|---|---|
| Tree model (`JsonObject`, `JsonParser`, `JsonArray`, `JsonElement`) | **80** |
| Reflective binding (`fromJson` to a class) | ~8 |

The tree model dominates, and it needs no reflection at all. `awt/src/main/java/json`
is a drop-in replacement for it: `JsonElement`, `JsonObject`, `JsonArray`,
`JsonPrimitive`, `JsonNull`, `JsonParser`, `Gson`, `GsonBuilder` — same API,
recursive-descent parser, no dependencies.

The reflective overloads throw with a message naming the alternative, rather
than silently doing nothing.

**Verified against Gson itself: 442 comparisons, 0 mismatches.** Every document
is parsed by both, *re-serialised by both*, and the results compared — a parser
that quietly dropped a field would pass a "does it parse" test but not this
one. The harness is in `../awt/verification/json/`.

It caught one real difference. Gson preserves a number's source text, so
`1.2e3` serialises back as `1.2e3`; parsing to a double and reformatting gives
`1200.0`. Same value, different document. The parser keeps the literal.

## The atomic arrays, applied locally

`teavm-atomic-array-patch/` proposes `AtomicIntegerArray` and `AtomicLongArray`
upstream. Until that lands, `teavm/src/ankillousj/` applies the same code
through a `SubstitutionPolicy`.

Note that substitution only works where TeaVM has nothing at the target name.
It worked for `Graphics2D` and for the atomic arrays; it did **not** work for
`java.awt.Color`, because the classlib already ships a `TColor` that wins.

## What the run turned up

**javac caps its error display at 100** and says so in a footer that is easy to
miss. The first honest total was 298. Pass `-Xmaxerrs`.

**Rewriting imports is not enough.** The first port rewrote
`import java.awt.Color` but left `java.awt.Color` where it appeared fully
qualified, producing ten instances of:

```
incompatible types: Color cannot be converted to Color
```

**Wildcards defeated the mapping twice.** `import java.util.concurrent.*` left
`CompletionStage` resolving to the JDK's. `import java.net.*` did the same for
`Socket` — and that one got past javac entirely, surfacing only as a TeaVM link
error. The port script now inserts an explicit import ahead of the wildcard.

**One line accounted for twenty-one errors:**

```java
public class GamePanel extends JPanel implements Runnable {
```

Everything touching it received `java.awt` types. Its real Swing surface across
819 lines is nine `repaint`, two `paintComponent` and a handful of setters, so
`awt.Component` grew that surface and the declaration became
`extends awt.Component`. Errors: 21 -> 7.

**Checked exceptions must match the JDK exactly.** A shim that does not declare
`throws IOException` makes an existing `catch (IOException)` unreachable, which
is an error rather than a warning. `AudioSystem`, `Clip`, `KeyFactory` and
`Signature` all needed their real signatures.

**Classpath resources needed an answer, not a refusal.** The first shim made
`getResourceAsStream` throw and told the caller to migrate a dozen sites. That
was the wrong call: `ankillousj.Resources` now fetches over HTTP and returns a
stream, so every `BufferedReader` and `ImageIO.read` above it works untouched.

## Reproducing it

`teavm/pom.xml` and `teavm/BrowserMain.java` are the exact configuration.
`teavm/src/` holds the substitution policy and its service registration.

The source drop is missing `config.BuildEnv` and `main.GameVersion`, both
stamped by the release build, and needs compile-time stand-ins for `javazoom`
and JavaFX Media.

The ten Swing files are replaced by API-preserving no-op stubs generated from
the baseline `.class` files, so callers link and a dialog simply does not
appear.

```bash
cd ../awt/render && node futura.smoke.mjs
```

boots the compiled output headlessly and prints what happens.

## Three bugs the boot found

**The render loop started inside the constructor.** `awt.Component` claimed the
canvas and began painting in its own constructor — but `super()` runs before a
subclass's field initialisers, so the first frame arrived while `GamePanel` was
still building and `gameRenderer` was null. The loop now starts on a deferred
tick, after the whole constructor chain completes. Which is also when Swing
would first paint.

**An exception inside requestAnimationFrame kills the loop silently.** The page
just stops updating, with nothing in the console. `Component.frame` now catches,
reports once, and keeps going — so a bad frame is debuggable instead of fatal.

**`ImageIO.read(InputStream)` refused to work.** The first shim threw and told
the caller to migrate a dozen call sites. That was wrong: by the time the stream
exists the bytes are already in memory, so it drains them and decodes through a
blob URL. Zero call sites changed.

## Assets

`BrowserMain` does the whole setup in two lines:

```java
Resources.setBase("assets");
ImageIO.setResourceBase("assets");
```

Classpath paths keep their shape — `/res/tile/grass00.png` is simply prefixed.
`render/futura.assets.mjs` boots the game and records every path it asks for,
which is how the manifest below was produced:

```
/res/maps/map01.txt
/res/tile/wooden_floor_tile.png
/res/tile/grass00.png
/res/icons/chat_icon.png, chat_badge.png, app_icon.png
/res/object/GoldenCred.png
/res/looks/<id>/sprite-<dir>[-mov-N].png     (18 per look)
```

## Next

1. **Point the client at the gateway** so the protocol connects. The socket
   layer is done and tested; it needs the URL and a running gateway.
2. **Drop in the real art** at the paths above.
3. **The ten Swing files** as HTML overlays — the last of the port.
