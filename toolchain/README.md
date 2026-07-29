# AnkillousJ toolchain

Compiles a Java desktop application for the browser. One command.

```powershell
.\build.ps1 -Source C:\path\to\your\src
```

```bash
./build.sh /path/to/your/src
```

`-Source` is the directory holding your packages — the one containing `main/`,
`view/`, `model/` and so on. **It is never modified**; everything happens in a
working copy under `build/work/`.

What comes out is `build/web/`: the compiled JavaScript and an `index.html`
that runs it.

```
Serve it:  npx serve build\web
```

Needs a JDK 17 or newer, Maven, and a network connection the first time so
Maven can fetch TeaVM.

## What the build does

```
1. copy your sources into work/            untouched original
2. rewrite JDK imports                     tools/port-imports.sh
3. add the AnkillousJ runtime              runtime/
4. overlay replacements                    overlay/
5. add stand-ins for absent libraries      thirdparty/
6. compile with TeaVM
```

Steps 4 and 5 are where the honesty lives. Some things genuinely have no
browser equivalent, and the overlay is the explicit list of them rather than a
pile of silent failures.

## The four directories

### `runtime/` — what AnkillousJ provides

| package | replaces |
|---|---|
| `awt` | `java.awt` over Canvas2D — `Graphics2D`, `Component`, events, `geom`, `image` |
| `swing` | `SwingUtilities`, `JOptionPane`, `Timer`, `UIManager`, `ImageIcon` |
| `concurrent` | `Executors`, `ExecutorService`, `CompletableFuture`, `Future` |
| `net` | `java.net.Socket` over WebSocket, with suspending reads |
| `nethttp` | `HttpClient`, `WebSocket`, `HttpRequest`, `HttpResponse` |
| `json` | a reflection-free replacement for Gson |
| `imageio` | `ImageIO`, async under a synchronous API |
| `sound` | `Clip`, `AudioSystem`, `FloatControl` over HTML audio |
| `security` | Ed25519 verification, implemented rather than shimmed |
| `time` | `Duration`, `Instant`, `Clock`, `LocalDateTime` |
| `ankillousj` | `Resources`, `Platform`, the substitution policy |

None of it is on your classpath at edit time. The rewrite in step 2 points your
imports at it.

### `overlay/` — files that cannot port

These **replace** files of the same path in your source. If your code changes,
these need the same change made.

| file | why |
|---|---|
| `main/Main.java` | builds a JFrame; `BrowserMain` is the entry point instead |
| `main/BrowserMain.java` | the browser entry point — **edit this one** |
| `main/GameWindow.java` | a window; the page is the window |
| `main/FullscreenToggle.java` | the Fullscreen API, not a JFrame flag |
| `view/room/StyledDialog.java` | HTML dialogs |
| `view/room/RoomCreationDialog.java` | an HTML form |
| `view/room/RoomSettingsDialog.java` | no-op pending an HTML version |
| `view/overlay/FrozenOverlay.java` | an HTML curtain |
| `view/chat/FocusCoordinator.java` | one canvas, so focus is trivial |
| `ui/LoadingDialog.java` | an HTML progress overlay |

Anything else still importing `javax.swing` is **reported by the build** rather
than crashing it:

```
   These still use javax.swing and have no replacement in overlay/:
     view/catalog/CatalogPanel.java
   Add a replacement under overlay/ mirroring the same path.
```

### `thirdparty/` — libraries with no browser form

Compile-time stand-ins for `javazoom` (MP3) and JavaFX Media. The browser
decodes MP3 natively, so `sound.Clip` covers what these did; the stubs exist
only so the imports resolve.

### `config/` — your glue

`GameJsonReaders.java` — the explicit JSON readers that replace Gson's
reflective binding. **This is yours to extend** as your DTOs change.

## What the rewrite does automatically

The one worth knowing about:

```java
public class GamePanel extends JPanel implements Runnable {
    public void paintComponent(Graphics g) { super.paintComponent(g); ... }
```

becomes

```java
public class GamePanel extends awt.Component implements Runnable {
    public void paint(Graphics g) { /* super.paintComponent removed */ ... }
```

That one declaration matters more than it looks. While the panel is a Swing
component, every class that touches it receives `java.awt` types — on Futura it
accounted for **twenty-one compile errors on its own**.

Only classes that both extend `JPanel` *and* override `paintComponent` are
rewritten. A `JPanel` used as a container has no canvas equivalent, so it is
left alone and shows up in the report instead.

Also handled: `java.awt.*` and `javax.swing.*` wildcards, `com.google.gson`,
`getResourceAsStream` becoming an HTTP fetch, and `System.exit` becoming
`Platform.exit` — a page cannot exit, and every call site is a fatal-error path
that wants different behaviour anyway.

## Assets

Not copied — they are yours to place. Then, in `BrowserMain`:

```java
Resources.setBase("assets");
ImageIO.setResourceBase("assets");
```

Classpath paths keep their shape: `/res/tile/grass00.png` becomes
`assets/res/tile/grass00.png`.

## Networking

A browser cannot open a TCP socket. If your protocol runs over `ServerSocket`,
run the gateway in `../gateway` and point the client at it — one line, in
`BrowserMain`:

```java
Socket.setUrlMapper((host, port) -> "ws://" + host + ":5556");
```

Your server is not modified and does not learn anything changed.

## When it fails

```
BUILD FAILED — see build/build.log
```

Two failure modes, and they want different responses:

**`error:`** — a source problem. Usually an import the rewrite missed, or a file
needing an overlay replacement. Fixable here.

**`was not found`** — TeaVM cannot link a JDK class. Its class library is not
complete. Either the class needs a stand-in, or the code path reaching it needs
changing. `java.sql.Date` arriving through a library you never call is the
classic case.

Note that `javac` caps its error display at 100 and mentions it in a footer
that is easy to miss. The pom passes `-Xmaxerrs` so the count in the log is
real.

## Verified

Run against a pristine copy of Futura's 132 source files:

```
1. copied 132 source files
2. rewriting JDK imports
   86 file(s), 341 line(s)
3. added the AnkillousJ runtime
   10 file(s) replaced
4. added third-party stand-ins
5. compiling with TeaVM

BUILD SUCCESS
  build/web/futura.js  (3.3M)
```

and the output boots, renders, and reaches the network.
