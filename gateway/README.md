# AnkillousJ Gateway

Lets a browser client reach a plain TCP game server. **The server is not
modified and does not know this exists.**

```
browser  --WebSocket-->  gateway  --TCP-->  GameServer (unchanged, port 5555)
```

## Why

A browser cannot open a TCP socket. That is not a missing library — the
capability does not exist, on purpose. Futura's protocol runs over
`ServerSocket` on port 5555, so no amount of client-side compilation reaches
it.

The usual answer is "rewrite the server to speak WebSocket". This is the other
answer: leave the server exactly as it is and translate in front of it.

The protocol is line-based text, so the mapping is exact — one WebSocket text
message is one line, one line is one message. Nothing to invent, no state to
keep.

## Run it

```bash
javac -d out src/main/java/ankillousj/gateway/AnkillousGateway.java
java -cp out ankillousj.gateway.AnkillousGateway --listen 5556 --target localhost:5555
```

Then point the browser client at `ws://localhost:5556` instead of `:5555`.
`GameServer` keeps running untouched on 5555.

No dependencies. The RFC 6455 handshake and framing are implemented here; the
only JDK crypto used is the SHA-1 the handshake mandates.

## Headers come back

A browser cannot set WebSocket handshake headers, so the client shim moves them
into the query string. The gateway reads them back out — from the query string
*and* from `Sec-WebSocket-Protocol`, whichever the client used.

A value the desktop client sent as `X-Game-Version` is available here under
that same name. The round trip closes at the gateway rather than in your
server.

## Tests

```bash
javac -d out src/main/java/ankillousj/gateway/AnkillousGateway.java
javac -cp out -d out test/GatewayTest.java
java -cp out GatewayTest
```

Ten assertions, nothing mocked in between: a real line-based TCP server standing
in for `GameServer`, the real gateway, and a raw WebSocket client that masks its
frames the way a browser must.

It covers the handshake and the `Sec-WebSocket-Accept` computation, message
order in both directions, payloads over 125 bytes (which change the length
encoding), and UTF-8.

**The UTF-8 case caught a real bug.** The downstream pump was building each
line character by character from `InputStream.read()`, which returns bytes —
so any multi-byte sequence was mangled and accented chat would have arrived
corrupted. It now accumulates bytes and decodes at the newline.
