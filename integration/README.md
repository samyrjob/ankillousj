# Integration: the game running in a browser

Everything else in this repo is tested against stubs. This is the actual Futura
source, ported, compiled by TeaVM, and booted.

## Where it stands

| stage | result |
|---|---|
| Baseline on a real JDK | 0 errors, 216 classes |
| javac, ported, against the shims | **0 errors** — was 298 |
| **TeaVM** | **BUILD SUCCESS — 2.8 MB of futura.js** |
| Boot | **the game's own code runs** |

Booted headlessly, the compiled output prints Futura's own log lines:

```
[RENDERER] Look 1 not in cache! Sprites will be null until downloaded.
[ROOM API] Client initialized
[ROOM CTRL] Controller created
[FRIEND CTRL] Loading data from backend API...
```

That is `RoomController`, `FriendController` and the sprite renderer executing
as JavaScript. It then fails in `GamePanel.paint` on a renderer that is null
because its assets never arrived — the harness serves no files and blocks the
network. Expected, and the next thing to wire up.

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

## Next

1. **Serve the assets.** `Resources.setBase(...)` and `ImageIO.setResourceBase(...)`,
   then `preload` before the first frame. That is what the null renderer is
   waiting for.
2. **Point the client at the gateway** so the protocol connects.
3. **The ten Swing files** as HTML overlays.
