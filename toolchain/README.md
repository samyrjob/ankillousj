# AnkillousJ toolchain

Compiles a Java desktop application for the browser. One command.

```powershell
.\build.ps1 -Project C:\path\to\your\project -Source C:\path\to\your\src
```

```bash
./build.sh --project /path/to/your/project /path/to/your/src
```

`-Source` is the directory holding your packages — the one containing `main/`,
`view/`, `model/` and so on. A program made of several modules gives them all
(`-Source C:\a\src, C:\b\src`, or `a/src,b/src` for `build.sh`). **Nothing given
is ever modified**; everything happens in a working copy under `build/work/`.

`-Project` is your application's *AnkillousJ project*: the folder, in your own
repository, that holds what your program needs to run in a browser (see
*Projects*). It is required: the toolchain holds no file of any application.

What comes out is `build/web/`: the compiled JavaScript, your project's page
that runs it, and `assets/` (your resources).

```
Try it:  node serve.mjs          then open http://localhost:8080/
```

Needs a JDK 17 or newer, and a network connection the first time (TeaVM, and
Maven itself when it is not installed, are downloaded once). On Windows the
`.ps1` scripts hand over to the `.sh` ones through Git's bash, so Git for
Windows is needed too: one implementation, the same on every system.

## Futura

Futura, the first application built with AnkillousJ, keeps its project in the
Futura repository, `Virtual_World/web`: its browser versions of a few game
classes, its patches, its JSON readers, its page (sign-in, the site that frames
it) and its build script. Its README says how Futura's web version is built
and run.

## What the build does

```
1. copy your sources into work/            untouched originals
2. rewrite JDK imports                     ../awt/tools/port-imports.sh
3. add the AnkillousJ runtime              runtime/
4. overlay replacements                    the project's overlay/
5. add stand-ins for absent libraries      the project's thirdparty/
6. apply patches                           the project's patches/
7. compile with TeaVM
8. copy the resources to web/assets, the project's page/ to web/
```

Steps 4 to 6 are where the honesty lives. Some things genuinely have no
browser equivalent, and these folders are the explicit list of them rather
than a pile of silent failures.

Between steps 6 and 7 the working copy is read twice, for what compiles and
fails later, in the tab: its format strings (`format-port.pl`, see *Format
strings*) and what it reads and writes as JSON (`json-check.pl`, see
*JSON readers* below).

`ANKILLOUSJ_PREPARE_ONLY=1 ./build.sh …` stops after these: the working copy
is ready to look at, or to compile by hand.

## Projects

An application keeps its browser adaptation in its own folder, an *AnkillousJ
project*, in its own repository, beside its code: what it needs to run in a
browser changes with its features, in the same commits. The toolchain holds no
file of any application.

```
<project>/
  ankillousj.conf     required: main=<main class>, js=<JS file name>
  overlay/            files that replace or add program files
  patches/            a few lines of one file, applied exactly
  thirdparty/         compile-time stand-ins
  json-not-read.txt   what the JSON check leaves alone
  page/               copied as it is into web/: index.html, anything it loads
```

Everything but `ankillousj.conf` is optional (see *The project's folders*).
The conf is `key=value` lines; `#` starts a comment, spaces around the key and
the value do not count:

```
main=main.BrowserMain
js=app.js
```

```bash
./build.sh --project <project> <source-root>[,<source-root>...] [output-dir]
```

```powershell
.\build.ps1 -Project C:\path\to\project -Source C:\a\src, C:\b\src [-Output C:\out]
```

The main class and the JS name reach TeaVM as two properties of `pom.xml`
(`ankillousj.main`, `ankillousj.js`), written into the working copy's pom, so
`mvn` run by hand in `work/` builds the same thing. `.\play.ps1 -Web
<output-dir>\web` serves any project's build.

`./build.sh --fingerprint` prints one sha1 of the toolchain itself (`runtime/`,
the import rewrite, `build.sh`, the two checks, `pom.xml`) and nothing else. A
project that rebuilds only when something changed adds it to what it hashes:
it then knows the toolchain changed without knowing its insides.

A project pins the toolchain by tag (a file in the project that names it), and
its release build uses exactly that tag; a dev build may use a local checkout
and says when it is not the pinned one.

### Rebuilding only when something changed

A browser build is made from the program's own sources, so it is only ever as
new as its last build. A project whose build starts by itself (each time the
program is built) hashes its own inputs — its sources and resources, its
project folder, what it stamps in — together with `build.sh --fingerprint`,
keeps that hash beside its output, and builds only when the hash differs.
Futura's `build-web.sh --if-changed` does this.

A build that fails changes nothing in `web/`: the last good version stays in
place, because `build.sh` writes `web/` last.

## The folders

### `runtime/` — what AnkillousJ provides

| package | replaces |
|---|---|
| `awt` | `java.awt` over Canvas2D — `Graphics2D` (transforms, clips, composites, dashes, gradients, textures), `Component`, events, `geom`, `image`, `datatransfer` |
| `swing` | `SwingUtilities`, `JOptionPane`, `Timer`, `UIManager`, `ImageIcon` |
| `concurrent` | `Executors`, `ExecutorService` and the scheduled one, `CompletableFuture`, `Future`, `CopyOnWriteArrayList`, `KeySets`: on program threads (see *Waiting*) |
| `net` | `java.net.Socket` over WebSocket, with suspending reads |
| `nethttp` | `HttpClient`, `WebSocket`, `HttpRequest`, `HttpResponse` |
| `json` | a reflection-free replacement for Gson |
| `imageio` | `ImageIO`: a picture is decoded when `read` returns, as in the JDK |
| `sound` | `Clip`, `AudioSystem`, `FloatControl` over HTML audio |
| `security` | Ed25519 verification, implemented rather than shimmed |
| `ankillousj` | `Resources`, `Platform`, HTML overlays, and the classes TeaVM lacks (atomic arrays, `java.util.prefs` over localStorage, three `java.util.concurrent` exceptions) |

`java.time` is not here: TeaVM ships it, and the port leaves it alone.

None of it is on your classpath at edit time. The rewrite in step 2 points your
imports at it.

The runtime is added beside your sources, never over them: a runtime file with
the path of one of yours stops the build (`THE RUNTIME HIDES A FILE OF THE
PROGRAM`). It would take your file's place without a word, and your later
changes to it would never reach the build. A program with a package named like
one of the runtime's (`sound`, `json`, `net`…) is where that happens.

## The project's folders

### `overlay/` — files that cannot port

These **replace** files of the same path in your source, or add new ones (the
browser entry point, your JSON readers). If your code changes, these need the
same change made: that is why they live in your repository, beside it.

What usually goes here: the class that builds a `JFrame` (the window is the
page), a browser entry point that does the desktop `main`'s steps, and the few
classes built on Swing widgets or desktop-only libraries, rewritten over the
runtime or as HTML.

Anything else still importing `javax.swing` is **reported by the build** rather
than crashing it.

### `patches/` — a few lines of one file

A unified diff against the **ported** source (after step 2), for when a file
needs three lines changed and replacing it whole would mean keeping a copy of
it up to date. A patch that no longer applies stops the build and says so: the
source moved on, and the patch is to be brought up to its new text.

A patch applies exactly or not at all (`--fuzz=0`): one that would only half
fit is a change nobody has looked at.

Two common ones: a loop that spins without ever pausing, given
`Platform.nextFrame()` (a desktop thread may spin; in a page it freezes
everything), and a private class or field opened (`private` to `public`,
nothing more) so that its JSON reader can fill it.

### `thirdparty/` — libraries with no browser form

Compile-time stand-ins for a library your program imports and a browser has no
form of: classes with the same names that do nothing, so that the imports
resolve.

Best left empty. A stand-in is silence where the library was: Futura's radio,
written on JLayer and JavaFX, compiled against two of them and played nothing
in a tab. A replacement in `overlay/` that does the job is better.

### JSON readers, and `json-not-read.txt`

The runtime's `json` has no reflection, so the program says how each type is
read and written. Your project registers them, in a class of its overlay that
its entry point runs first: `JsonReaders.register(Type.class, …)` and
`JsonWriters.register(Type.class, …)`.

A type read with `fromJson(…, Some.class)` and not registered would fail in
the tab, where the program reaches that call. Quieter and worse, a field its
reader does not name stays empty and nothing says so.

So the build checks all of it before compiling (`json-check.pl`), and stops,
naming what is missing:

- a type the program reads with no reader (a call that ends with a class
  literal: `fromJson(text, Room.class)`, `getList(path, Room[].class)`);
- a type it writes with no writer (`toJson(new Something(…))`);
- a field a reader does not read: every field Gson would fill (not static,
  not transient) must be named by the reader.

`json-not-read.txt` names what is left out on purpose, one a line: a type read
only by code nothing calls, a field (`Type.field`).

A type that keeps its fields private cannot be filled from outside. A patch in
`patches/` opens it in the working copy (`private` to `public`, nothing more)
and its reader stays with the others.

### `page/` — the window

Copied as it is into `web/`, beside the compiled JavaScript. See *The page*.

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
accounted for **twenty-one compile errors on its own**. What the removed
`super.paintComponent` did — clear the panel to its background — the runtime
does at the start of every frame, with a graphics as fresh as Swing's.

Only classes that both extend `JPanel` *and* override `paintComponent` are
rewritten. A `JPanel` used as a container has no canvas equivalent, so it is
left alone and shows up in the report instead.

Also handled: `java.awt.*` and `javax.swing.*` wildcards, `com.google.gson`,
`getResourceAsStream` becoming an HTTP fetch, `System.exit` becoming
`Platform.exit`, and two calls TeaVM's own classes lack, which move to the
runtime: `ConcurrentHashMap.newKeySet()` and `Runtime.maxMemory()`.

## Format strings

`String.format`, `printf` and `formatted` run on TeaVM's own formatter, which
knows fewer conversions than the JDK's: `%b %c %d %f %h %o %s %x`, their
capitals and `%%`, with an argument index (`%2$s`), the flags, a width and a
precision. Not `%n`, not `%e` or `%g`, not a date (`%tY`).

A conversion it does not know compiles, and throws when the line runs. Futura's
sea printed its timing every ten seconds, from inside its drawing, with a line
ending in `%n`: from then on every frame of a room by the sea stopped there.
The sea was drawn, and nothing after it: a black room.

So the build reads every format before compiling (`format-port.pl`):

- `%n` is written as the newline it is in a browser, in the working copy;
- any other conversion the formatter does not know stops the build, with the
  file and the line;
- a format known only when the program runs (`String.format(text(key), …)`)
  cannot be read: such calls are listed, so that nobody takes them for checked.

It reads the format where the JDK takes it: the first argument, the second
after a `Locale`, the string `formatted` is called on, and what a name is
given in the same file (`String.format(SOUND, n)`). A `%` anywhere else is
left alone. `perl format-port.pl <sources> --list` names every format it
reads; `--check` writes nothing.

## Esc in fullscreen

A browser keeps Esc for itself in fullscreen: it leaves, and the page is never
told. A program that gives Esc a meaning of its own loses it there (Futura
takes Esc to get out of a car: the first Esc left fullscreen and the car drove
on).

Where the browser has the Keyboard Lock API (Chrome, Edge), the runtime asks
for Esc while the page is in fullscreen (`awt/Component`): a press reaches the
program like any other key, and the program says whether that leaves
fullscreen, exactly as on a desktop.

Two things stay the browser's. Holding Esc always leaves: nothing here can
take that away. And an Esc pressed anywhere but on the canvas (a text field)
never reaches the program, so the runtime leaves fullscreen for it.

A browser without the API (Firefox, Safari) is as before: Esc leaves at once.

In a frame, the page cannot ask for Esc: a browser gives the Keyboard Lock API
to a top-level page only. So when a site frames the page, the framing page
holds fullscreen (its own element, which also keeps its buttons on screen) and
asks for Esc, and it lends fullscreen to the program through
`globalThis.__ankFullscreen = { active(), enter(), leave() }`. With that hook
the runtime never locks the keyboard, asks the hook whether it is in
fullscreen, and leaves through it for an Esc pressed off the canvas; the
program's own fullscreen toggle should ask it too. The Esc key still reaches
the program, which has the focus in the frame.

## Waiting

A desktop program waits all the time: for a page it fetches, a picture it
reads, a result from another thread. A browser calls a page's code itself and
what it calls may not wait — but a TeaVM thread is a coroutine, and may. So
everything the program runs, it runs on threads:

| on the desktop | here |
|---|---|
| the event dispatch thread: every listener, every paint | `awt.EventQueue`: one program thread running a queue. The browser's callbacks only queue; listeners and paints run there, in order, and may wait. |
| `Executors` pools | pools of program threads, of the size asked for: a pool of four runs four tasks and queues the rest |
| `Future.get`, `CompletableFuture.join` | wait, with the JDK's own signatures |
| `javax.swing.Timer`, `SwingUtilities.invokeLater` | the event dispatch thread |
| a WebSocket listener | a thread per socket, one message after the other |

What cannot be done as on a desktop: answer the browser "I kept this key"
after a listener has run. Whether a key is the game's alone is decided at
once, by rule — all of them except chords with Ctrl or Meta, F5 and F12.

## Pictures

`ImageIO.read` returns a decoded picture, as the JDK's does: the program runs
on threads (see *Waiting*), and a thread waits for the browser's decoder
without freezing anything. Code that composes or recolours pictures pixel by
pixel right after reading them works unchanged.

Reading pixels is the other half. To a Java program a picture is memory: it
reads pixels one at a time by the million (a bounding box, a hit test), and a
canvas answers each read through a call a thousand times dearer. So a few
reads are asked of the browser as they come, and a picture read again and
again is taken into memory whole, once, and answered from there until
something draws into it; the canvas itself says so, whoever draws. The
pictures held this way are bounded together (64 MB): the oldest is let go.
Futura trims every item picture with such a scan: 20 ms for a 1024 x 1024
one, where asking the canvas pixel by pixel froze the tab.

An array a script FILLS crosses to it by reference (`@JSByRef`). TeaVM hands a
script a copy of a Java array otherwise, and what is written into a copy never
comes back: block reads were all zeros, and every avatar composed to nothing.

A picture from another site is asked for with CORS so its pixels may be read;
when that site does not allow it the picture is fetched again without, and can
then be drawn but not read. Serve your pictures with
`Access-Control-Allow-Origin` if the program reads their pixels.

## The page

A project supplies `page/index.html`, the window. It sizes a canvas, loads the
compiled JavaScript (the conf's `js=`) and calls `main([])`. The first
component the program constructs claims the page's canvas: the one in
`globalThis.__ankCanvas` if the page set it, else the first `<canvas>` of the
document. Anything the page loads besides (a stylesheet, a `config.js`, a
sign-in) goes in `page/` too.

What the runtime reads from the page, all optional:

| hook | what for |
|---|---|
| `globalThis.__ankCanvas` | the canvas to draw in, when it is not the document's first |
| `globalThis.__ankLog(message)` | where the runtime's reports go (a paint that failed, a warning); without it, the console |
| `globalThis.__ankFullscreen = { active(), enter(), leave() }` | for a page framed by another: the framing page holds fullscreen and lends it (see *Esc in fullscreen*) |

To try a build: `node serve.mjs [folder] [port]` (`build/web` and 8080 by
default; it listens on 127.0.0.1 only and caches nothing, so a rebuild shows
on the next reload), or `.\play.ps1 -Web <output-dir>\web`, which also starts
the gateway (see *Networking*). Port 8080 rather than `npx serve`'s 3000:
a backend that answers only the pages it knows (CORS) knows a port, and 8080
is the usual one to allow for local work.

## Networking

A browser cannot open a TCP socket. If your protocol runs over `ServerSocket`,
run the gateway in `../gateway` and the client's connection goes through it:
the program's browser entry point names the gateway's WebSocket address
(Futura's sends the game's address to `ws://<host>:5556` unless its page
names another gateway).

Your server is not modified and does not learn anything changed.

## When it fails

```
BUILD FAILED — see build/build.log
```

Three failure modes, and they want different responses:

**`error:`** — a source problem. Usually an import the rewrite missed, a method
the runtime does not have yet, or a file needing an overlay replacement.
Fixable here or in the project. Every error is listed: the build file lifts
`javac`'s limit of a hundred.

**`was not found`** — TeaVM cannot link a JDK class or method. Its class
library is not complete. A missing *class* gets a stand-in through the
substitution policy (`runtime/…/ankillousj/AtomicSubstitution.java`); a missing
*method* of a class TeaVM does have cannot be substituted, so the call is moved
by the port (`port-imports.sh`, as for `newKeySet`).

**`NO JSON READER`** / **`NO JSON WRITER`** / **`A JSON READER does not read
every field`** — the program reads or writes something as JSON and nothing
says how. Register its reader or writer in the project's overlay
(`JsonReaders.register`, `JsonWriters.register`), or name it in the project's
`json-not-read.txt` if it is left out on purpose.

**`A PATCH DOES NOT APPLY`** — the lines a patch changes have moved on. Bring
the project's patch up to the new text.

**`A FORMAT CONVERSION THE BROWSER BUILD DOES NOT KNOW`** — a `%e`, a date, in
a format string. It would compile and throw in the tab. Write it another way
in the program, or teach `format-port.pl` to rewrite it, as it does `%n`.

## Verified

Run against Futura as of November 2026 — 230 source files, 70,000 lines:

```
1. copied 230 source files
2. rewriting JDK imports
3. added the AnkillousJ runtime
4. added third-party stand-ins
5. compiling with TeaVM

BUILD SUCCESS
  build/web/futura.js  (8.3M)
```

and the output starts in Chrome: the game builds itself, loads its pictures
and sounds, runs its loop and draws.
