import ankillousj.gateway.AnkillousGateway;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

/**
 * End-to-end: a fake line-based TCP server standing in for GameServer, the
 * gateway in front of it, and a raw WebSocket client standing in for the
 * browser. Nothing is mocked in between.
 */
public class GatewayTest {

    static int pass = 0, fail = 0;
    static void check(String n, boolean ok) {
        System.out.println((ok ? "  PASS " : "  FAIL ") + n);
        if (ok) pass++; else fail++;
    }

    static final List<String> serverSaw = new ArrayList<>();

    public static void main(String[] a) throws Exception {
        // --- a stand-in for GameServer: reads lines, echoes with a prefix ---
        ServerSocket game = new ServerSocket(0);
        int gamePort = game.getLocalPort();
        new Thread(() -> {
            try {
                Socket s = game.accept();
                BufferedReader in = new BufferedReader(new InputStreamReader(s.getInputStream(), StandardCharsets.UTF_8));
                PrintWriter out = new PrintWriter(new OutputStreamWriter(s.getOutputStream(), StandardCharsets.UTF_8), true);
                out.println("welcome");
                String line;
                while ((line = in.readLine()) != null) {
                    synchronized (serverSaw) { serverSaw.add(line); }
                    out.println("echo:" + line);
                }
            } catch (IOException ignored) { }
        }, "fake-game-server").start();

        // --- the gateway ---
        int gwPort = freePort();
        AnkillousGateway gw = new AnkillousGateway(gwPort, "localhost", gamePort, false);
        new Thread(() -> { try { gw.run(); } catch (IOException ignored) { } }, "gateway").start();
        Thread.sleep(300);

        // --- a browser-shaped WebSocket client ---
        Socket ws = new Socket("localhost", gwPort);
        OutputStream out = ws.getOutputStream();
        InputStream in = ws.getInputStream();

        String key = Base64.getEncoder().encodeToString("0123456789abcdef".getBytes());
        upgrade(out, "/game?X-Game-Version=1.4.2", key);

        String resp = readHeaders(in);
        check("handshake returns 101", resp.startsWith("HTTP/1.1 101"));

        MessageDigest sha1 = MessageDigest.getInstance("SHA-1");
        String expect = Base64.getEncoder().encodeToString(
            sha1.digest((key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").getBytes(StandardCharsets.UTF_8)));
        check("Sec-WebSocket-Accept is correct", resp.contains(expect));

        check("server greeting reached the browser", "welcome".equals(AnkillousGateway.readText(in)));

        // browser -> server, masked as a real client must
        sendMasked(out, "join Player7");
        sendMasked(out, "move 3 4 down true");
        Thread.sleep(300);

        synchronized (serverSaw) {
            check("first line arrived intact", serverSaw.contains("join Player7"));
            check("second line arrived intact", serverSaw.contains("move 3 4 down true"));
            check("lines arrived in order",
                serverSaw.indexOf("join Player7") < serverSaw.indexOf("move 3 4 down true"));
        }

        check("echo came back", "echo:join Player7".equals(AnkillousGateway.readText(in)));
        check("second echo came back", "echo:move 3 4 down true".equals(AnkillousGateway.readText(in)));

        // a payload over 125 bytes uses the extended length encoding
        StringBuilder big = new StringBuilder("chat ");
        for (int i = 0; i < 300; i++) big.append('x');
        sendMasked(out, big.toString());
        Thread.sleep(250);
        check("long message survives extended framing",
            ("echo:" + big).equals(AnkillousGateway.readText(in)));

        // unicode must survive the round trip
        sendMasked(out, "chat caf\u00e9 \u2014 \u4f60\u597d");
        Thread.sleep(250);
        check("utf-8 round-trips",
            "echo:chat caf\u00e9 \u2014 \u4f60\u597d".equals(AnkillousGateway.readText(in)));

        ws.close();

        // --- the keep-alive, behind a proxy: --bind 127.0.0.1, path /gateway, --ping 1 ---
        // A TCP server that accepts nothing and says nothing: the connection
        // still opens (the backlog takes it), and no text frame can arrive,
        // so the first thing the browser gets has to be the ping.
        ServerSocket silent = new ServerSocket(0);
        int pgPort = freePort();
        AnkillousGateway pinging = new AnkillousGateway("127.0.0.1", pgPort,
                "localhost", silent.getLocalPort(), 1, false);
        new Thread(() -> { try { pinging.run(); } catch (IOException ignored) { } }, "gateway-ping-test").start();
        Thread.sleep(300);

        Socket idle = new Socket("127.0.0.1", pgPort);
        idle.setSoTimeout(5000);
        upgrade(idle.getOutputStream(), "/gateway", key);
        InputStream idleIn = idle.getInputStream();
        check("handshake accepts the path a proxy forwards (/gateway)",
            readHeaders(idleIn).startsWith("HTTP/1.1 101"));
        boolean pinged;
        try {
            pinged = idleIn.read() == 0x89 && idleIn.read() == 0x00;
        } catch (SocketTimeoutException e) {
            pinged = false;
        }
        check("a quiet browser is sent a ping frame (0x89, unmasked, empty)", pinged);
        idle.close();

        // --- the command line ---
        AnkillousGateway.Options d = AnkillousGateway.Options.parse(new String[0]);
        check("defaults: every interface, 5556 -> localhost:5555, ping 30",
            d.bindHost == null && d.listenPort == 5556 && "localhost".equals(d.targetHost)
                && d.targetPort == 5555 && d.pingSeconds == 30 && !d.verbose);

        AnkillousGateway.Options p = AnkillousGateway.Options.parse(new String[] {
            "--bind", "127.0.0.1", "--listen", "5556", "--target", "127.0.0.1:5555", "--ping", "30" });
        check("the production command line parses",
            "127.0.0.1".equals(p.bindHost) && p.listenPort == 5556
                && "127.0.0.1".equals(p.targetHost) && p.targetPort == 5555 && p.pingSeconds == 30);

        check("--ping 0 turns the keep-alive off",
            AnkillousGateway.Options.parse(new String[] { "--ping", "0" }).pingSeconds == 0);
        check("a negative --ping is refused", refused("--ping", "-1"));
        check("an option without its value is refused", refused("--bind"));
        check("--target without a port is refused", refused("--target", "localhost"));
        check("an unknown option is refused", refused("--port", "5556"));

        System.out.println("\n" + pass + " passed, " + fail + " failed");
        System.exit(fail == 0 ? 0 : 1);
    }

    static boolean refused(String... args) {
        try {
            AnkillousGateway.Options.parse(args);
            return false;
        } catch (IllegalArgumentException e) {
            return true;
        }
    }

    static int freePort() throws IOException {
        try (ServerSocket probe = new ServerSocket(0)) {
            return probe.getLocalPort();
        }
    }

    /** The upgrade request a browser sends, to whatever path it was given. */
    static void upgrade(OutputStream out, String target, String key) throws IOException {
        out.write(("GET " + target + " HTTP/1.1\r\n"
                 + "Host: localhost\r\n"
                 + "Upgrade: websocket\r\n"
                 + "Connection: Upgrade\r\n"
                 + "Sec-WebSocket-Key: " + key + "\r\n"
                 + "Sec-WebSocket-Version: 13\r\n\r\n").getBytes());
        out.flush();
    }

    static String readHeaders(InputStream in) throws IOException {
        StringBuilder sb = new StringBuilder();
        int c; int nl = 0;
        while ((c = in.read()) != -1) {
            sb.append((char) c);
            if (c == '\n') { if (++nl == 2) break; } else if (c != '\r') nl = 0;
        }
        return sb.toString();
    }

    /** Clients must mask their frames (RFC 6455 §5.3). */
    static void sendMasked(OutputStream out, String text) throws IOException {
        byte[] p = text.getBytes(StandardCharsets.UTF_8);
        out.write(0x81);
        if (p.length < 126) out.write(0x80 | p.length);
        else { out.write(0x80 | 126); out.write((p.length >> 8) & 0xff); out.write(p.length & 0xff); }
        byte[] mask = { 0x12, 0x34, 0x56, 0x78 };
        out.write(mask);
        byte[] masked = new byte[p.length];
        for (int i = 0; i < p.length; i++) masked[i] = (byte) (p[i] ^ mask[i & 3]);
        out.write(masked);
        out.flush();
    }
}
