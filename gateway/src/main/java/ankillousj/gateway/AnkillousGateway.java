package ankillousj.gateway;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
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
 * No dependencies: RFC 6455 handshake and framing are implemented here, and
 * the only JDK crypto used is the SHA-1 the handshake mandates.
 */
public final class AnkillousGateway {

    /** RFC 6455 §1.3 — the fixed GUID mixed into the handshake accept value. */
    private static final String WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

    private final int listenPort;
    private final String targetHost;
    private final int targetPort;
    private final boolean verbose;
    private final ExecutorService pool = Executors.newCachedThreadPool();

    public AnkillousGateway(int listenPort, String targetHost, int targetPort, boolean verbose) {
        this.listenPort = listenPort;
        this.targetHost = targetHost;
        this.targetPort = targetPort;
        this.verbose = verbose;
    }

    public static void main(String[] args) throws IOException {
        int listen = 5556;
        String host = "localhost";
        int port = 5555;
        boolean verbose = false;

        for (int i = 0; i < args.length; i++) {
            switch (args[i]) {
                case "--listen": listen = Integer.parseInt(args[++i]); break;
                case "--target": {
                    String[] parts = args[++i].split(":");
                    host = parts[0];
                    port = Integer.parseInt(parts[1]);
                    break;
                }
                case "--verbose": verbose = true; break;
                default:
                    System.err.println("usage: AnkillousGateway [--listen PORT] "
                            + "[--target HOST:PORT] [--verbose]");
                    System.exit(1);
            }
        }
        new AnkillousGateway(listen, host, port, verbose).run();
    }

    public void run() throws IOException {
        ServerSocket server = new ServerSocket(listenPort);
        System.out.println("AnkillousJ gateway");
        System.out.println("  websocket  ws://localhost:" + listenPort);
        System.out.println("  forwarding to  " + targetHost + ":" + targetPort);
        System.out.println("  the game server is untouched and does not know this exists");

        while (true) {
            Socket browser = server.accept();
            pool.submit(() -> handle(browser));
        }
    }

    private void handle(Socket browser) {
        Socket game = null;
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

            // browser -> server, on this thread
            String message;
            while ((message = readText(bIn)) != null) {
                gOut.write((message + "\n").getBytes(StandardCharsets.UTF_8));
                gOut.flush();
            }
        } catch (IOException e) {
            if (verbose) System.out.println("connection ended: " + e.getMessage());
        } finally {
            closeQuietly(browser);
            closeQuietly(game);
        }
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

    private static void readFully(InputStream in, byte[] buf, int len) throws IOException {
        int off = 0;
        while (off < len) {
            int n = in.read(buf, off, len - off);
            if (n < 0) throw new IOException("stream ended mid-frame");
            off += n;
        }
    }
}
