# The full loop

```
compiled game (JavaScript)
    │  net.Socket
    ▼
real WebSocket
    │
    ▼
AnkillousJ gateway  (real, ../gateway)
    │  TCP
    ▼
protocol server     (ProtocolStub.java, or your GameServer)
```

Nothing between the client and the server is stubbed. The only stub is the
DOM, because Node has no browser.

## Run it

Three terminals, or three background jobs:

```bash
# 1. a server speaking Futura's protocol
javac -d out ProtocolStub.java
java -cp out ProtocolStub 5555

# 2. the gateway
cd ../gateway
javac -d out src/main/java/ankillousj/gateway/AnkillousGateway.java
java -cp out ankillousj.gateway.AnkillousGateway --listen 5556 --target localhost:5555 --verbose

# 3. the compiled client
cd ../awt/render
node futura.loop.mjs
```

## What it proves

The gateway, checked on its own with a plain WebSocket client:

```
OPEN
RECV playerJoined TestUser 5 5 down 1 MALE
RECV playerJoined Guest 8 6 left 1 FEMALE
RECV adminMessage Welcome to the AnkillousJ protocol stub
```

`join` travelled WebSocket -> gateway -> TCP, and three protocol lines came
back the other way.

And the compiled game, through the same path:

```
Connected to server successfully
```

That is `NetworkManager` — unmodified, the same file the desktop build uses —
opening what it believes is a TCP socket and finding a server on the other
end. `BrowserMain` redirects it with one line, and the game never learns:

```java
Socket.setUrlMapper((host, port) -> "ws://" + host + ":" + GATEWAY_PORT);
```

## The join goes through

With the REST endpoints answered as well, the client completes its startup and
joins:

```
[ROOM CACHE] Loaded 1 rooms
Connected to server successfully
Sent join message: join  MALE 1 0 0 DIAGONALE_DOWN lobby
Connected to multiplayer server (spawn=lobby)
```

and the server sees it, answers, and gets a movement back:

```
recv: join  MALE 1 0 0 DIAGONALE_DOWN lobby
send: playerJoined  5 5 down 1 MALE
send: playerJoined Guest 8 6 left 1 FEMALE
send: adminMessage Welcome to the AnkillousJ protocol stub
recv: move 0 0 DIAGONALE_DOWN false
send: playerMoved Guest 0 0 DIAGONALE_DOWN false
```

`server-transcript.txt` is that exchange as captured. `frame.png` is what the
client was drawing while it happened — 2,260 distinct colours.

## Reflective JSON, solved without reflection

The last blocker was Gson's reflective binding:

```java
return http.getList("/public", Room[].class);
```

Sixteen call sites asked a library to build objects by introspecting classes.
That is precisely what makes Gson unusable under a whole-program compiler.

The fix is a reader registry — `json.JsonReaders`. A reader is a lambda from
`JsonObject` to the type, registered once:

```java
JsonReaders.register(Room.class, e -> {
    JsonObject o = e.getAsJsonObject();
    Room r = new Room(str(o, "roomId", ""), str(o, "roomName", "Room"), ...);
    r.setMaxPlayers(num(o, "maxPlayers", 50));
    return r;
});
```

`Gson.fromJson` consults it, and the array form maps the element reader across
the array — so `Room[].class` works with one registration. **No service code
changed.** `GameJsonReaders.java` here is the whole set for this game.

Writing readers is more typing than an annotation. In exchange: the compiler
sees exactly what is reachable, a renamed field is a compile error rather than
a silent null at runtime, and nothing ships a reflection engine.

Serialisation needed less. `Map`, `Iterable` and arrays describe their own
structure, so `toJson` handles them directly — which covers the
`Map.of("username", name)` request-body idiom outright, with no registration.

One reader is registered from the class's own static initialiser rather than
centrally, because its fields are package-private. That is arguably the better
pattern: the reader lives beside the thing it reads.
