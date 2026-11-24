package ankillousj.gateway;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Bridges browser WebSocket connections to a plain TCP server.
 *
 * <h2>Why this exists</h2>
 *
 * A browser cannot open a TCP socket. That is not a gap in any library — the
 * capability does not exist, deliberately. A game whose protocol runs over
 * {@code ServerSocket} therefore cannot be reached from a browser at all,
 * however the client is compiled.
 *
 * <p>The usual advice at this point is "rewrite the server to speak
 * WebSocket". This is the alternative: leave the server exactly as it is and
 * put a translator in front of it. The server keeps accepting TCP on its own
 * port and never learns that anything changed.
 *
 * <h2>What it does</h2>
 *
 * <pre>
 *   browser  --WebSocket-->  gateway  --TCP-->  GameServer (unmodified)
 * </pre>
 *
 * The protocol here is line-based text, so the mapping is exact: one WebSocket
 * text message becomes one line, and one line becomes one message. No framing
 * to invent and no state to keep.
 *
 * <h2>Headers</h2>
 *
 * A browser cannot set handshake headers either. The client shim moves them to
 * the query string, and this reads them back out — so a value the desktop
 * client sent as {@code X-Game-Version} arrives at the server as
 * {@code X-Game-Version} again. The round trip is closed here rather than in
 * the server.
 *
 * <h2>Running it</h2>
 *
 * <pre>
 *   java ankillousj.gateway.AnkillousGateway --listen 5556 --target localhost:5555
 * </pre>
 *
 * <ul>
 *   <li>{@code --bind HOST} — the address to listen on. Default: every
 *       interface.</li>
 *   <li>{@code --listen PORT} — the WebSocket port. Default 5556.</li>
 *   <li>{@code --target HOST:PORT} — the TCP server. Default
 *       {@code localhost:5555}.</li>
 *   <li>{@code --ping SECONDS} — how often each browser is sent a WebSocket
 *       ping. Default 30; 0 turns it off.</li>
 *   <li>{@code --verbose} — one line per connection.</li>
 * </ul>
 *
 * <h2>Behind a proxy</h2>
 *
 * In production the browser speaks {@code wss://} to a TLS proxy (nginx, often
 * with a CDN such as Cloudflare in front), and the proxy forwards to the
 * gateway on the same machine:
 *
 * <pre>
 *   java -jar ankillous-gateway.jar --bind 127.0.0.1 --listen 5556 --target 127.0.0.1:5555 --ping 30
 * </pre>
 *
 * {@code --bind 127.0.0.1} is what keeps the plain, unencrypted {@code ws://}
 * port off the internet: only the proxy, on the same machine, can reach it.
 * The ping is there because proxies close a WebSocket that carries nothing for
 * a while — Cloudflare after about 100 seconds, nginx after 60 by default — and
 * a connection where nothing happens can easily be silent that long. A
 * ping frame is traffic, and the browser answers it with a pong on its own, so
 * both directions stay awake. The proxy may forward any path (such as
 * {@code /gateway}); the handshake accepts every path.
 *
 * <p>No dependencies: RFC 6455 handshake and framing are implemented here, and
 * the only JDK crypto used is the SHA-1 the handshake mandates.
 */
public final class AnkillousGateway {

    /** RFC 6455 §1.3 — the fixed GUID mixed into the handshake accept value. */
    private static final String WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

    /** Under Cloudflare's ~100 s and nginx's default 60 s idle limits, with room to spare. */
    public static final int DEFAULT_PING_SECONDS = 30;

    /** What {@code new ServerSocket(port)} used: only the address is new. */
    private static final int BACKLOG = 50;

    static final String USAGE =
              "usage: AnkillousGateway [--bind HOST] [--listen PORT] [--target HOST:PORT]"
            + " [--ping SECONDS] [--verbose]\n"
            + "  --bind HOST         address to listen on (default: every interface)\n"
            + "  --listen PORT       WebSocket port (default 5556)\n"
            + "  --target HOST:PORT  the TCP server (default localhost:5555)\n"
            + "  --ping SECONDS      ping each browser this often, 0 = off (default "
            + DEFAULT_PING_SECONDS + ")\n"
            + "  --verbose           one line per connection";

    /** null listens on every interface, as the gateway always did. */
    private final String bindHost;
    private final int listenPort;
    private final String targetHost;
    private final int targetPort;
    private final int pingSeconds;
    private final boolean verbose;
    private final ExecutorService pool = Executors.newCachedThreadPool();
    /** One thread pings every connection; null when pings are off. */
    private final ScheduledThreadPoolExecutor pinger;

    /** Every interface, and pings every {@value #DEFAULT_PING_SECONDS} s — the command line's defaults. */
    public AnkillousGateway(int listenPort, String targetHost, int targetPort, boolean verbose) {
        this(null, listenPort, targetHost, targetPort, DEFAULT_PING_SECONDS, verbose);
    }

    /**
     * @param bindHost    the address to listen on, or null for every interface
     * @param pingSeconds how often each browser is pinged; 0 never pings
     */
    public AnkillousGateway(String bindHost, int listenPort, String targetHost, int targetPort,
                            int pingSeconds, boolean verbose) {
        if (pingSeconds < 0) {
            throw new IllegalArgumentException("pingSeconds is 0 (off) or more, not " + pingSeconds);
        }
        this.bindHost = bindHost;
        this.listenPort = listenPort;
        this.targetHost = targetHost;
        this.targetPort = targetPort;
        this.pingSeconds = pingSeconds;
        this.verbose = verbose;
        if (pingSeconds > 0) {
            ScheduledThreadPoolExecutor s = new ScheduledThreadPoolExecutor(1, r -> {
                Thread t = new Thread(r, "gateway-ping");
                t.setDaemon(true);
                return t;
            });
            // A closed connection's task leaves the queue at once, instead of
            // sitting there until its next turn comes round.
            s.setRemoveOnCancelPolicy(true);
            this.pinger = s;
        } else {
            this.pinger = null;
        }
    }

    public static void main(String[] args) throws IOException {
        Options o;
        try {
            o = Options.parse(args);
        } catch (IllegalArgumentException e) {
            System.err.println(e.getMessage());
            System.err.println(USAGE);
            System.exit(1);
            return;
        }
        new AnkillousGateway(o.bindHost, o.listenPort, o.targetHost, o.targetPort,
                o.pingSeconds, o.verbose).run();
    }

    /**
     * What the command line asked for. Parsed apart from {@link AnkillousGateway#main} so it
     * can be checked without opening a socket.
     */
    public static final class Options {
        /** null = every interface. */
        public String bindHost = null;
        public int listenPort = 5556;
        public String targetHost = "localhost";
        public int targetPort = 5555;
        public int pingSeconds = DEFAULT_PING_SECONDS;
        public boolean verbose = false;

        private Options() { }

        /** @throws IllegalArgumentException saying what is wrong with the command line */
        public static Options parse(String[] args) {
            Options o = new Options();
            for (int i = 0; i < args.length; i++) {
                String opt = args[i];
                switch (opt) {
                    case "--bind": o.bindHost = value(args, ++i, opt); break;
                    case "--listen": o.listenPort = port(value(args, ++i, opt), opt); break;
                    case "--target": {
                        String t = value(args, ++i, opt);
                        // the last colon, so an IPv6 literal such as [::1]:5555 still splits right
                        int colon = t.lastIndexOf(':');
                        if (colon <= 0) {
                            throw new IllegalArgumentException("--target is HOST:PORT, not " + t);
                        }
                        o.targetHost = t.substring(0, colon);
                        o.targetPort = port(t.substring(colon + 1), opt);
                        break;
                    }
                    case "--ping": {
                        int s = number(value(args, ++i, opt), opt);
                        if (s < 0) {
                            throw new IllegalArgumentException("--ping is 0 (off) or more seconds, not " + s);
                        }
                        o.pingSeconds = s;
                        break;
                    }
                    case "--verbose": o.verbose = true; break;
                    default: throw new IllegalArgumentException("unknown option: " + opt);
                }
            }
            return o;
        }

        private static String value(String[] args, int i, String opt) {
            if (i >= args.length || args[i].isEmpty()) {
                throw new IllegalArgumentException(opt + " needs a value");
            }
            return args[i];
        }

        private static int number(String v, String opt) {
            try {
                return Integer.parseInt(v);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException(opt + " takes a whole number, not " + v);
            }
        }

        private static int port(String v, String opt) {
            int p = number(v, opt);
            if (p < 1 || p > 65535) {
                throw new IllegalArgumentException(opt + ": " + p + " is not a port (1-65535)");
            }
            return p;
        }
    }

    public void run() throws IOException {
        // InetAddress.getByName(null) would mean loopback, not "every
        // interface" — so with no --bind, null goes to ServerSocket untouched.
        InetAddress address = bindHost == null ? null : InetAddress.getByName(bindHost);
        ServerSocket server = new ServerSocket(listenPort, BACKLOG, address);
        System.out.println("AnkillousJ gateway");
        System.out.println("  websocket  ws://" + (bindHost == null ? "localhost" : bindHost) + ":" + listenPort
                + (bindHost == null ? "   (every interface)" : "   (this address only)"));
        System.out.println("  forwarding to  " + targetHost + ":" + targetPort);
        System.out.println("  ping  " + (pingSeconds > 0 ? "every " + pingSeconds + " s" : "off"));
        System.out.println("  the game server is untouched and does not know this exists");

        while (true) {
            Socket browser = server.accept();
            pool.submit(() -> handle(browser));
        }
    }

    private void handle(Socket browser) {
        Socket game = null;
        ScheduledFuture<?> pings = null;
        try {
            browser.setTcpNoDelay(true);
            InputStream bIn = browser.getInputStream();
            OutputStream bOut = browser.getOutputStream();

            Handshake hs = Handshake.read(bIn);
            if (hs == null) {
                browser.close();
                return;
            }
            bOut.write(hs.response().getBytes(StandardCharsets.UTF_8));
            bOut.flush();

            game = new Socket(targetHost, targetPort);
            game.setTcpNoDelay(true);
            OutputStream gOut = game.getOutputStream();
            InputStream gIn = game.getInputStream();

            if (verbose) {
                System.out.println("connected " + browser.getRemoteSocketAddress()
                        + (hs.query.isEmpty() ? "" : "  headers=" + hs.query));
            }

            // server -> browser, on its own thread
            final Socket g = game;
            Thread pump = new Thread(() -> {
                try {
                    // Accumulate BYTES and decode at the newline. Building a
                    // String byte-by-byte would mangle any multi-byte UTF-8 —
                    // accented chat would arrive corrupted.
                    ByteArrayOutputStream line = new ByteArrayOutputStream();
                    int c;
                    while ((c = gIn.read()) != -1) {
                        if (c == '\n') {
                            sendText(bOut, new String(line.toByteArray(), StandardCharsets.UTF_8));
                            line.reset();
                        } else if (c != '\r') {
                            line.write(c);
                        }
                    }
                } catch (IOException ignored) {
                    // the far end went away; the close below tidies up
                } finally {
                    closeQuietly(browser);
                    closeQuietly(g);
                }
            }, "gateway-downstream");
            pump.setDaemon(true);
            pump.start();

            // keep-alive, so a proxy in between does not close a quiet connection
            if (pinger != null) {
                pings = pinger.scheduleAtFixedRate(keepAlive(bOut, browser, g),
                        pingSeconds, pingSeconds, TimeUnit.SECONDS);
            }

            // browser -> server, on this thread
            String message;
            while ((message = readText(bIn)) != null) {
                gOut.write((message + "\n").getBytes(StandardCharsets.UTF_8));
                gOut.flush();
            }
        } catch (IOException e) {
            if (verbose) System.out.println("connection ended: " + e.getMessage());
        } finally {
            if (pings != null) pings.cancel(false);
            closeQuietly(browser);
            closeQuietly(game);
        }
    }

    /**
     * One connection's ping task. The scheduler thread is shared by every
     * connection, so it never writes itself: a browser that stopped reading
     * would block that write, and every other connection's ping would wait
     * behind it. The write goes to the pool instead, and a connection whose
     * last ping is still waiting is not sent a second one.
     */
    private Runnable keepAlive(OutputStream bOut, Socket browser, Socket game) {
        AtomicBoolean waiting = new AtomicBoolean();
        return () -> {
            if (!waiting.compareAndSet(false, true)) return;
            pool.execute(() -> {
                try {
                    sendPing(bOut);
                } catch (IOException e) {
                    // As with a failed text write: the connection is over. Closing
                    // the browser socket ends handle(), which cancels this task.
                    closeQuietly(browser);
                    closeQuietly(game);
                } finally {
                    waiting.set(false);
                }
            });
        };
    }

    private static void closeQuietly(Socket s) {
        if (s != null) {
            try {
                s.close();
            } catch (IOException ignored) {
                // nothing useful to do
            }
        }
    }

    // ── RFC 6455 handshake ────────────────────────────────────────────

    static final class Handshake {
        String key;
        String path = "/";
        /** Values the client could not send as headers, recovered from the query. */
        final Map<String, String> query = new HashMap<>();

        static Handshake read(InputStream in) throws IOException {
            Handshake hs = new Handshake();
            List<String> lines = new ArrayList<>();
            StringBuilder cur = new StringBuilder();
            int c;
            while ((c = in.read()) != -1) {
                if (c == '\n') {
                    String line = cur.toString().trim();
                    if (line.isEmpty()) break;    // blank line ends the headers
                    lines.add(line);
                    cur.setLength(0);
                } else if (c != '\r') {
                    cur.append((char) c);
                }
            }
            if (lines.isEmpty()) return null;

            // Every path is accepted and none is checked: a proxy forwards its
            // own location (/gateway, say), and the path means nothing here.
            String[] request = lines.get(0).split(" ");
            if (request.length >= 2) {
                String target = request[1];
                int q = target.indexOf('?');
                if (q >= 0) {
                    hs.path = target.substring(0, q);
                    parseQuery(target.substring(q + 1), hs.query);
                } else {
                    hs.path = target;
                }
            }
            for (String line : lines) {
                int colon = line.indexOf(':');
                if (colon < 0) continue;
                String name = line.substring(0, colon).trim();
                String value = line.substring(colon + 1).trim();
                if ("Sec-WebSocket-Key".equalsIgnoreCase(name)) hs.key = value;
                // A subprotocol may also carry header values, as "Name.value"
                if ("Sec-WebSocket-Protocol".equalsIgnoreCase(name)) {
                    for (String p : value.split(",")) {
                        int dot = p.trim().indexOf('.');
                        if (dot > 0) {
                            hs.query.put(p.trim().substring(0, dot), p.trim().substring(dot + 1));
                        }
                    }
                }
            }
            return hs.key == null ? null : hs;
        }

        static void parseQuery(String q, Map<String, String> out) {
            for (String pair : q.split("&")) {
                int eq = pair.indexOf('=');
                if (eq > 0) {
                    out.put(urlDecode(pair.substring(0, eq)), urlDecode(pair.substring(eq + 1)));
                }
            }
        }

        static String urlDecode(String s) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < s.length(); i++) {
                char ch = s.charAt(i);
                if (ch == '%' && i + 2 < s.length()) {
                    sb.append((char) Integer.parseInt(s.substring(i + 1, i + 3), 16));
                    i += 2;
                } else if (ch == '+') {
                    sb.append(' ');
                } else {
                    sb.append(ch);
                }
            }
            return sb.toString();
        }

        String response() {
            try {
                MessageDigest sha1 = MessageDigest.getInstance("SHA-1");
                byte[] digest = sha1.digest((key + WS_GUID).getBytes(StandardCharsets.UTF_8));
                String accept = Base64.getEncoder().encodeToString(digest);
                return "HTTP/1.1 101 Switching Protocols\r\n"
                     + "Upgrade: websocket\r\n"
                     + "Connection: Upgrade\r\n"
                     + "Sec-WebSocket-Accept: " + accept + "\r\n\r\n";
            } catch (Exception e) {
                throw new IllegalStateException("SHA-1 is required by RFC 6455", e);
            }
        }
    }

    // ── RFC 6455 framing ──────────────────────────────────────────────

    /** @return the next text message, or null when the peer closes */
    public static String readText(InputStream in) throws IOException {
        ByteArrayOutputStream message = new ByteArrayOutputStream();

        while (true) {
            int b0 = in.read();
            if (b0 == -1) return null;
            int b1 = in.read();
            if (b1 == -1) return null;

            boolean fin = (b0 & 0x80) != 0;
            int opcode = b0 & 0x0f;
            boolean masked = (b1 & 0x80) != 0;
            long len = b1 & 0x7f;

            if (len == 126) {
                len = ((long) in.read() << 8) | in.read();
            } else if (len == 127) {
                len = 0;
                for (int i = 0; i < 8; i++) len = (len << 8) | in.read();
            }

            byte[] mask = new byte[4];
            if (masked) readFully(in, mask, 4);

            byte[] payload = new byte[(int) len];
            readFully(in, payload, (int) len);
            if (masked) {
                for (int i = 0; i < payload.length; i++) payload[i] ^= mask[i & 3];
            }

            if (opcode == 0x8) return null;             // close
            if (opcode == 0x9) continue;                // ping — pong is optional here
            if (opcode == 0xA) continue;                // pong

            message.write(payload);
            if (fin) return message.toString("UTF-8");
            // else: continuation frame, keep accumulating
        }
    }

    public static void sendText(OutputStream out, String text) throws IOException {
        byte[] payload = text.getBytes(StandardCharsets.UTF_8);
        synchronized (out) {
            out.write(0x81);                             // FIN + text
            if (payload.length < 126) {
                out.write(payload.length);
            } else if (payload.length < 65536) {
                out.write(126);
                out.write((payload.length >> 8) & 0xff);
                out.write(payload.length & 0xff);
            } else {
                out.write(127);
                for (int i = 7; i >= 0; i--) out.write((int) ((long) payload.length >> (8 * i)) & 0xff);
            }
            // A server must not mask (RFC 6455 §5.1)
            out.write(payload);
            out.flush();
        }
    }

    /**
     * A ping with no payload. The browser answers with a pong by itself (RFC
     * 6455 §5.5.2), which {@link #readText} skips; what matters is only that
     * bytes cross every proxy in between. Same lock as {@link #sendText}, so a
     * ping never lands inside a text frame.
     */
    public static void sendPing(OutputStream out) throws IOException {
        synchronized (out) {
            out.write(0x89);                             // FIN + ping
            out.write(0);                                // unmasked, no payload
            out.flush();
        }
    }

    private static void readFully(InputStream in, byte[] buf, int len) throws IOException {
        int off = 0;
        while (off < len) {
            int n = in.read(buf, off, len - off);
            if (n < 0) throw new IOException("stream ended mid-frame");
            off += n;
        }
    }
}
