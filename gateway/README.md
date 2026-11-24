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

| Option | Default | What it does |
|---|---|---|
| `--bind HOST` | every interface | The address to listen on. |
| `--listen PORT` | `5556` | The WebSocket port. |
| `--target HOST:PORT` | `localhost:5555` | The TCP server to forward to. |
| `--ping SECONDS` | `30` | Sends each browser a WebSocket ping this often. `0` turns it off. |
| `--verbose` | off | One line per connection. |

## Build the jar

```bash
bash build-gateway.sh            # makes dist/ankillous-gateway.jar
bash build-gateway.sh /some/dir  # makes /some/dir/ankillous-gateway.jar
```

Only the JDK is needed (`javac` and `jar`, 17 or later). The classes are
compiled with `--release 17`, so the jar runs on any Java 17+ machine, whatever
JDK built it. It has a `Main-Class`, so it runs as it is:

```bash
java -jar dist/ankillous-gateway.jar --listen 5556 --target localhost:5555
```

## Behind nginx and Cloudflare

In production the browser does not reach the gateway directly. It opens
`wss://` to a TLS proxy, such as nginx with Cloudflare in front, and the proxy
forwards to the gateway on the same machine, on whatever path you give it (for
example `/gateway`). The handshake accepts any path, so nothing needs to match.

```bash
java -jar ankillous-gateway.jar --bind 127.0.0.1 --listen 5556 --target 127.0.0.1:5555 --ping 30
```

- **`--bind 127.0.0.1`.** By default the gateway listens on every interface,
  which on a public server would put the plain, unencrypted `ws://` port on the
  internet beside the proxy. Bound to loopback, only the proxy on the same
  machine can reach it. Locally, leave it out and nothing changes.
- **`--ping 30`.** Proxies close a WebSocket that carries nothing for a while:
  Cloudflare after about 100 seconds, nginx after 60 by default
  (`proxy_read_timeout`). A connection where nothing happens is silent that long
  easily, and the player is dropped for no reason. Every 30 seconds the gateway
  sends each browser an empty ping frame; the browser answers with a pong on its
  own, so both directions carry traffic. Pings are written under the same lock
  as text messages, so they never cut into one. One thread schedules them for
  every connection, and a closed connection is dropped from it.

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

Nineteen assertions, nothing mocked in between: a real line-based TCP server
standing in for `GameServer`, the real gateway, and a raw WebSocket client that
masks its frames the way a browser must.

It covers the handshake and the `Sec-WebSocket-Accept` computation, message
order in both directions, payloads over 125 bytes (which change the length
encoding), and UTF-8. A second gateway, bound to `127.0.0.1` with `--ping 1`,
checks that a `/gateway` path is accepted and that a quiet browser is sent a
ping frame. The command line is checked too: the defaults, the production line,
`--ping 0`, and the mistakes it must refuse.

**The UTF-8 case caught a real bug.** The downstream pump was building each
line character by character from `InputStream.read()`, which returns bytes —
so any multi-byte sequence was mangled and accented chat would have arrived
corrupted. It now accumulates bytes and decodes at the newline.
