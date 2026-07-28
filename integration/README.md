# Integration: compiling the real client

Everything else in this repo is tested against stubs. This is the actual Futura
source, ported and put through both compilers.

## Where it stands

| stage | result |
|---|---|
| Baseline on a real JDK | 0 errors, 216 classes |
| javac, ported, against the shims | **0 errors** — was 298 |
| **TeaVM link** | **3 missing classes, all inside Gson** |

242 source files compile. The link stops on three classes TeaVM's class
library does not ship, none of which the game references directly:

```
java.sql.Date
java.util.concurrent.atomic.AtomicIntegerArray
java.util.concurrent.atomic.AtomicLongArray
```

All three are reached through Gson's `TypeAdapters`, whose static initialiser
registers adapters for them. TeaVM does whole-program analysis, follows that
initialiser, and cannot resolve them. There is no "tolerate missing classes"
option — the plugin has no such parameter.

## Both were solved

**`java.sql.Date` — done, in this repo.** `teavm/src/` holds a
`SubstitutionPolicy` that redirects Gson's `SqlTypesSupport` to one reporting
no SQL support. That is a configuration Gson already handles — it is what
happens on a JRE assembled without the `java.sql` module, and every path guards
on `SUPPORTS_SQL_TYPES` before touching a factory. One class, no fork, and the
error is gone.

Placing a replacement class in Gson's own package does *not* work: the copy in
the jar wins on the classpath. The 0.15 `SubstitutionPolicy` is the mechanism
built for this.

**The two atomic arrays — patched upstream.** See
`../teavm-atomic-array-patch/`. `AtomicIntegerArray` and `AtomicLongArray`,
written in `TAtomicInteger`'s style, verified at 84,043 comparisons against the
reference with no mismatches, with tests and an issue draft.

Applying that patch is expected to take the link error count to zero.

## The two phases are completely different

javac checks that every symbol resolves in the sources you hand it. TeaVM
checks that every symbol reachable from `main` resolves *across the whole
program*, including inside your dependencies. Passing the first says nothing
about the second — the last three errors live in a library, not in any file
this project touches.

Worth knowing before assuming a green javac means a working build.

## What the run turned up

**javac caps its error display at 100** and mentions it in a footer that is
easy to miss. The first honest total was 298, not 100. Pass `-Xmaxerrs`.

**Rewriting imports is not enough.** The first port rewrote
`import java.awt.Color` but left `java.awt.Color` where it appeared fully
qualified, producing ten instances of:

```
incompatible types: Color cannot be converted to Color
```

**Wildcards defeat class-level mapping, repeatedly.** `import
java.util.concurrent.*` left `CompletionStage` resolving to the JDK's.
`import java.net.*` did the same for `Socket` — and that one survived javac
entirely, only surfacing as a TeaVM link error. The port script now inserts an
explicit import ahead of the wildcard for every shimmed class the file uses.

**One line accounted for twenty-one errors:**

```java
public class GamePanel extends JPanel implements Runnable {
```

Because `GamePanel` was a Swing component, everything touching it received
`java.awt` types — `setCursor`, `getGraphics`, `addMouseListener`, and every
dialog call taking it as a `Component`. Its real Swing surface across 819 lines
is nine `repaint`, two `paintComponent`, and a handful of setters, so
`awt.Component` grew that surface and the declaration became
`extends awt.Component`. Errors: 21 -> 7.

**Checked exceptions have to match the JDK exactly.** A shim method that does
not declare `throws IOException` makes an existing `catch (IOException)`
unreachable, which is a compile error rather than a warning. `AudioSystem`,
`Clip`, `KeyFactory` and `Signature` all needed their JDK signatures restored.

**Classpath resources needed a real answer, not a refusal.**
`getClass().getResourceAsStream(path)` appears throughout — map files, sprites,
sounds. The first shim threw and told the caller to migrate. That was the wrong
call: `ankillousj.Resources` now fetches the bytes over HTTP and returns a
stream over them, so every `BufferedReader` and `ImageIO.read` above it keeps
working untouched. It blocks, which is fine for a handful of startup files and
is why `Resources.preload` exists.

## New shims this run produced

`Toolkit`, `AWTEvent`, `AWTEventListener`, `Dimension`, `Polygon`, `Cursor`,
`AffineTransform`, `KeyboardFocusManager`, `TextAttribute`, `Icon`,
`ImageIcon`, `JOptionPane`, `UIManager`, `Timer`, `ThreadFactory`,
`LocalDateTime`, `HttpRequest`, `HttpResponse`, `Resources`, plus
`Color`'s constants and packed constructors, `BufferedImage.getRGB`,
`Component`'s container surface, and `HttpClient.send`.

None appeared in a call-site scan. Every one stops a build.

## Reproducing it

`teavm/pom.xml` and `teavm/BrowserMain.java` are the exact configuration used.
The source drop is missing `config.BuildEnv` and `main.GameVersion`, both
stamped by the release build, and needs compile-time stand-ins for `javazoom`
and JavaFX Media.

The ten Swing files are replaced by API-preserving no-op stubs generated from
the baseline `.class` files, so callers link and a dialog simply does not
appear. Rebuilding them as HTML overlays is the outstanding work.
