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

## Where it stops, and why

After connecting, the game declines to send `join`:

```
[GAME] Cannot join TCP server: no spawn room.
       RoomController must have initialized before this point.
```

That is the game's own guard, working correctly. `preloadEverything` needs a
spawn room, which comes from the REST backend on port 9090 — not running here,
so every call 404s and `RoomController` has nothing to enter.

Standing up the REST service would get past it, except for one thing.

## The last real blocker: reflective JSON

`RoomApiClient` loads rooms like this:

```java
return http.getList("/public", Room[].class);
```

That is Gson's *reflective* binding — build me an array of `Room` by
introspecting the class. It is the one part of Gson the replacement
deliberately does not do, because reflection is what made Gson unusable under
a whole-program compiler in the first place.

There are **16 such call sites**, over a small number of DTOs:

```
Room[]          room lists
ApiResponse     x2
FriendRequest   friend requests
MyDto           inventory
```

`JsonObject.class` and `JsonArray.class` appear in the same position but need
no reflection — those already work.

Two ways forward:

1. **Hand-write the readers.** A `Room` is a dozen fields; reading them from a
   `JsonObject` is a few lines each, and it is faster, smaller, and does not
   break silently when a field is renamed. Roughly an afternoon for all of
   them.
2. **Register the DTOs for TeaVM reflection.** 0.15 added a fluent API for
   exactly this — `selectClasses(withAnnotation(...)).reflectablePublicMembers()`.
   Less code, but it reintroduces reflection into the build.

(1) is the one that keeps the win.
