# Integration: compiling the real client

Everything else in this repo is tested against stubs. This is the moment of
truth — the actual Futura source, run through `port-imports`, compiled against
the shims.

## Where it stands

| | |
|---|---|
| Baseline: client compiles on a real JDK | **0 errors**, 216 classes |
| After porting, compiled against the shims | **100 errors** |
| ...of those, in Swing files (always out of scope) | **60** |
| ...**genuinely remaining** | **40** |

Down from 100 real errors when this was first attempted. Every fix came from
running the compile, not from guessing.

## Reproducing it

The client needs three things the source drop does not contain: Gson, and
compile-time stand-ins for `javazoom` (the MP3 decoder) and JavaFX Media. Two
classes are also referenced but absent — `config.BuildEnv` and
`main.GameVersion`, both stamped by the release build.

```bash
# baseline — does it compile at all?
javac -encoding UTF-8 -cp gson.jar -d out $(find src stubs -name '*.java')

# port it
./tools/port-imports.sh src --apply       # 82 files, ~300 lines

# compile against the shims
javac -encoding UTF-8 -cp gson.jar:teavm-jso.jar:teavm-interop.jar -d out2 \
  $(find src stubs -name '*.java') \
  $(find ../awt/src/main/java/{awt,concurrent,swing,nethttp,time,imageio,sound,security,net} -name '*.java')
```

`remaining-errors.txt` is the current output.

## What the numbers taught

**Rewriting imports is not enough.** The first port rewrote `import
java.awt.Color` but left `java.awt.Color` where it appeared fully qualified in
the body. Those are different types, and javac says so in the least helpful
way available:

```
incompatible types: Color cannot be converted to Color
```

Ten of them. The port script now rewrites qualified references too.

**The shims had real holes, and only the compile found them.** `Toolkit` and
`AWTEventListener` — Swing's way of watching every event regardless of focus,
which `ActivityTracker` uses for idle detection. `Color.RED` and the other
thirteen constants. `Color(int)` for packed RGB. `Dimension`. `Polygon`.
`Cursor`. `AffineTransform`. `Font.deriveFont`. `Rectangle`'s copy constructor.
`Executors`' `ThreadFactory` overloads. `Clip.addLineListener`. None of these
appeared in a call-site scan; all of them stop a build.

**60 of the 100 are the Swing files.** Ten of them: four dialogs, window setup,
fullscreen toggle, focus coordination, the loading dialog. They were always
going to need rebuilding as HTML rather than emulating, and the port script
deliberately leaves `javax.swing` unmapped so they fail loudly rather than
appearing to work.

## The remaining 40

Spread across seventeen files, nothing over seven in one place:

```
7  InputHandler          listener types crossing the AWT boundary
6  GameJwtValidator      java.time and exception types
6  RoomWebSocketClient   CompletableFuture and Listener signatures
3  Furniture             image loading
2  each × 12 files       assorted
```

Every one is a shim gap or a namespace mismatch, not a design problem. This is
a list to work through, not a wall.
