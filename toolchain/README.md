# AnkillousJ toolchain

Compiles a Java desktop application for the browser. One command.

```powershell
.\build.ps1 -Source C:\path\to\your\src
```

```bash
./build.sh /path/to/your/src
```

`-Source` is the directory holding your packages — the one containing `main/`,
`view/`, `model/` and so on. A program made of several modules gives them all
(`-Source C:\a\src, C:\b\src`, or `a/src,b/src` for `build.sh`). **Nothing given
is ever modified**; everything happens in a working copy under `build/work/`.

What comes out is `build/web/`: the compiled JavaScript, an `index.html` that
runs it, and `assets/` (your resources).

```
Try it:  node serve.mjs          then open http://localhost:8080/
```

Needs a JDK 17 or newer, and a network connection the first time (TeaVM, and
Maven itself when it is not installed, are downloaded once). On Windows the
`.ps1` scripts hand over to the `.sh` ones through Git's bash, so Git for
Windows is needed too: one implementation, the same on every system.

## Futura

```powershell
.\build-futura.ps1 -Futura C:\path\to\Futura              # dev: local backend and game server
.\build-futura.ps1 -Futura C:\path\to\Futura -Env prod -Version 1.0.51
```

Gathers the game's two modules (client, shared) and writes the two classes its
release build stamps — `config.BuildEnv` (dev or prod addresses) and
`main.GameVersion` — then builds.

To play the dev build in a tab: the dev backend and game server running, the
gateway in front of the game server (`../gateway`), and `node serve.mjs`. The
page signs in with the site's own account (see *The page* below).

## What the build does

```
1. copy your sources into work/            untouched originals
2. rewrite JDK imports                     ../awt/tools/port-imports.sh
3. add the AnkillousJ runtime              runtime/
4. overlay replacements                    overlay/
5. add stand-ins for absent libraries      thirdparty/
6. apply patches                           patches/
7. compile with TeaVM
8. copy the resources to web/assets
```

Steps 4 to 6 are where the honesty lives. Some things genuinely have no
browser equivalent, and these folders are the explicit list of them rather
than a pile of silent failures.

Between steps 6 and 7 the working copy is read twice, for what compiles and
fails later, in the tab: its format strings (`format-port.pl`, see *Format
strings*) and what it reads and writes as JSON (`json-check.pl`, see
`config/`).

`ANKILLOUSJ_PREPARE_ONLY=1 ./build.sh …` stops after these: the working copy
is ready to look at, or to compile by hand.

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
changes to it would never reach the build. Futura's package `sound` has the
name of the runtime's: that is how three of the game's own files sat in
`runtime/` for months.

### `overlay/` — files that cannot port

These **replace** files of the same path in your source. If your code changes,
these need the same change made.

| file | why |
|---|---|
| `main/Main.java` | builds a JFrame; `BrowserMain` is the entry point instead |
| `main/BrowserMain.java` | the browser entry point: the desktop `Main`'s steps, with the session coming from the page |
| `main/OfflineProbe.java` | what the offline start can show of a backend's public pictures (see *The page*) |
| `main/GameWindow.java` | the window is the page; the chat bar is an HTML input with the desktop class's own logic |
| `main/FullscreenToggle.java` | the Fullscreen API, not a JFrame flag |
| `view/overlay/FrozenOverlay.java` | an HTML curtain |
| `view/chat/FocusCoordinator.java` | one canvas, so focus is trivial |
| `ui/LoadingDialog.java` | an HTML progress overlay |
| `ui/agents/DocumentDropTarget.java` | a file dropped from the desktop; not wired in a page yet, so it does nothing |
| `sound/RadioPlayer.java` | the radio. The desktop plays a station with JLayer (MP3) and JavaFX (HLS); here one audio element plays both, as browsers do by themselves |

Anything else still importing `javax.swing` is **reported by the build** rather
than crashing it.

### `patches/` — a few lines of one file

A unified diff against the **ported** source, for when a file needs three
lines changed and replacing it whole would mean keeping a copy of it up to
date. A patch that no longer applies stops the build and says so: the source
moved on, and the patch is to be brought up to its new text.

| patch | why |
|---|---|
| `main/GamePanel.java.patch` | the game loop spins without ever pausing. A desktop thread may; in a page it freezes everything. The loop hands the page back until its next frame (`Platform.nextFrame`), and a tab that was hidden does not replay the frames it missed. |
| `service/api/HttpClient.java.patch` | opens `ApiResponse` (a private class) to its reader in `config/` |
| `model/room/FloorPlanResult.java.patch`, `model/room/RoomLayout.java.patch` | open their private fields to their readers in `config/` |
| `model/room/Room.java.patch` | opens the fields the game has no setter for (the room's shape, its door, who may come in) to the room's reader |
| `service/friend/FriendApiService.java.patch` | opens `SendRequestBody` (a private class) to its writer in `config/` |

A patch applies exactly or not at all (`--fuzz=0`): one that would only half
fit is a change nobody has looked at.

### `thirdparty/` — libraries with no browser form

Compile-time stand-ins for a library your program imports and a browser has no
form of: classes with the same names that do nothing, so that the imports
resolve.

Empty today, and better so. A stand-in is silence where the library was:
Futura's radio, written on JLayer and JavaFX, compiled against two of them
and played nothing in a tab. It also asked the browser to download a stream
that never ends. A replacement in `overlay/` does the job instead
(`sound/RadioPlayer.java`).

### `config/` — your glue

`GameJsonReaders.java` — the explicit JSON readers and writers that replace
Gson's reflective binding. **This is yours to extend** as your DTOs change.

A type read with `fromJson(…, Some.class)` and not registered would fail in
the tab, where the game reaches that call: Futura's room settings all answered
"Failed to update…" for want of one reader. Quieter and worse, a field its
reader does not name stays empty and nothing says so: every room with stairs
was drawn flat, because the room's reader was older than `heightmap`.

So the build checks all of it before compiling (`json-check.pl`), and stops,
naming what is missing:

- a type the program reads with no reader (a call that ends with a class
  literal: `fromJson(text, Room.class)`, `getList(path, Room[].class)`);
- a type it writes with no writer (`toJson(new Something(…))`);
- a field a reader does not read: every field Gson would fill (not static,
  not transient) must be named by the reader.

`json-not-read.txt` names what is left out on purpose: a type read only by
code nothing calls, a field (`Type.field`).

A type that keeps its fields private cannot be filled from here. A patch in
`patches/` opens it in the working copy (`private` to `public`, nothing more)
and its reader stays here with the others.

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

## Following the game

The web version is made from the game's own sources, so it is only ever as
new as its last build. `--if-changed` is for a build that starts by itself,
each time the game is built:

    ./build-futura.sh --if-changed <Futura folder> dev

(`-IfChanged` on `build-futura.ps1`.) It differs from a plain build in three
ways:

- **Nothing changed, nothing built.** The build keeps a fingerprint of what it
  was made from (`web/.built-from`): the game's sources and resources, this
  toolchain (runtime, overlay, patches, config, the build scripts) and what is
  stamped in (dev or prod, the version). The same fingerprint again: it says
  so and stops, in a few seconds.
- **Never two at once.** A build under way holds `build/.building`. A second
  one started meanwhile stops at once: the first takes its changes too.
- **It ends on the game as it is now.** When the game changed while it was
  compiling, it builds again, three times at most.

A build that fails changes nothing in `web/`: the last good version stays in
place, because `build.sh` writes `web/` last.

Futura starts it from its dev panel, after the client jar is built
(`Futura_Devops/web-version.ps1`): in its own window, at low priority.

## Esc in fullscreen

A browser keeps Esc for itself in fullscreen: it leaves, and the page is never
told. Futura takes Esc to get out of a car, so the first Esc left fullscreen
and the car drove on.

Where the browser has the Keyboard Lock API (Chrome, Edge), the runtime asks
for Esc while the page is in fullscreen (`awt/Component`): a press reaches the
program like any other key, and the program says whether that leaves
fullscreen, exactly as on a desktop. Futura's rule is in the game, one class
for both (`main/FullscreenEscape`): Esc in a car or on a boat gets you out of
it; Esc with neither leaves fullscreen.

Two things stay the browser's. Holding Esc always leaves: nothing here can
take that away. And an Esc pressed anywhere but on the canvas (a text field)
never reaches the program, so the runtime leaves fullscreen for it.

A browser without the API (Firefox, Safari) is as before: Esc leaves at once.

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

`index.html` is the window. For Futura it is also the way in: with no session
it signs the player in with the site's own account and asks for a game session
exactly as the launcher does — nothing on the server changes:

```
POST /api/users/login                 (only when the site is not signed in already)
POST /api/sso/generate-launcher
POST /api/launcher/auth/handshake
POST /api/launcher/auth/exchange      -> the game token
```

The tokens stay in the page's memory. A page that already holds a session
gives it before the game starts (`globalThis.__futuraSession = { jwt, refresh }`)
or in the address (`#jwt=…&refresh=…`, erased as soon as it is read).
`#offline` starts the game alone, with no session and no server: to look at
what a build draws. It can also show a backend's public pictures coming
through the build, with nobody signed in:

```
http://localhost:8080/#offline&parts=http://localhost:9090/parts&picture=assets/8864.png
```

composes an avatar from those parts and reads that item picture the way a
room reads its furniture. Every offline start also checks the runtime's pixel
reading, the game's JSON readers and writers and what the formatter prints
(thousands, decimals, padding, and whether it has learned `%n`), and says
what the rooms it read hold (how many with a shape, a door, a sea). The
console says what came of each (`overlay/main/OfflineProbe.java`).
`&token=anything` sends two of the
game's requests with that token: the backend's log then shows whether a token
leaves the tab (it names the token it rejects, with the path).

`config.js` (optional, beside the page) names the servers when the defaults do
not fit — a local page uses the local backend and gateway, any other the
public ones:

```js
window.FUTURA_API = 'https://api.example.com'
window.FUTURA_GATEWAY = 'wss://play.example.com/game'
```

The backend must accept the page's origin (CORS). `serve.mjs` serves on port
8080 because that is the local origin Futura's backend already accepts.

## Networking

A browser cannot open a TCP socket. If your protocol runs over `ServerSocket`,
run the gateway in `../gateway` and the client's connection goes through it —
`BrowserMain` sends the game's address to `ws://<host>:5556` unless the page
names another gateway.

Your server is not modified and does not learn anything changed.

## When it fails

```
BUILD FAILED — see build/build.log
```

Three failure modes, and they want different responses:

**`error:`** — a source problem. Usually an import the rewrite missed, a method
the runtime does not have yet, or a file needing an overlay replacement.
Fixable here. Every error is listed: the build file lifts `javac`'s limit of a
hundred.

**`was not found`** — TeaVM cannot link a JDK class or method. Its class
library is not complete. A missing *class* gets a stand-in through the
substitution policy (`runtime/…/ankillousj/AtomicSubstitution.java`); a missing
*method* of a class TeaVM does have cannot be substituted, so the call is moved
by the port (`port-imports.sh`, as for `newKeySet`).

**`NO JSON READER`** / **`NO JSON WRITER`** / **`A JSON READER does not read
every field`** — the program reads or writes something as JSON and nothing
says how. Add it to `config/GameJsonReaders.java`.

**`A PATCH DOES NOT APPLY`** — the lines a patch changes have moved on. Bring
the patch up to the new text.

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
