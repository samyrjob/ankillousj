package demo;

import net.Socket;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import org.teavm.jso.JSBody;

/**
 * The game's own networking pattern, verbatim.
 *
 * This is NetworkManager.connect() and ServerMessageWatcher.run() as they are
 * written in the desktop client — Socket, BufferedReader, PrintWriter, and a
 * blocking readLine() loop on its own thread. Nothing here knows it is in a
 * browser.
 */
public final class SocketTest {

    @JSBody(params = "m", script = "if (globalThis.__ankTest) globalThis.__ankTest(m);")
    private static native void report(String m);

    private static void check(String name, boolean ok) {
        report((ok ? "PASS " : "FAIL ") + name);
    }

    private SocketTest() { }

    static final List<String> received = new ArrayList<>();

    public static void run() {
        try {
            // --- NetworkManager.connect(), unchanged ---
            Socket socket = new Socket("localhost", 5556);
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);

            check("Socket connected", socket.isConnected());
            check("streams are available", in != null && out != null);

            // --- ServerMessageWatcher.run(), unchanged, on its own thread ---
            Thread watcher = new Thread(() -> {
                try {
                    String line;
                    while ((line = in.readLine()) != null) {
                        received.add(line);
                        report("INFO  received: " + line);
                    }
                    report("INFO  stream ended cleanly");
                    check("readLine() returned null at end of stream", true);
                } catch (Exception e) {
                    check("watcher threw: " + e, false);
                }
            }, "server-message-watcher");
            watcher.start();

            // --- the game sends the way it always does ---
            out.println("join Player7");
            out.println("move 3 4 down true");
            out.println("chat caf\u00e9 \u4f60\u597d");
            check("println did not throw", true);

            // Assert once the replies have had time to arrive. Scheduling this
            // rather than calling it inline is the point: the reader is parked
            // on the event loop, so the checks must run after it resumes.
            new Thread(() -> {
                try {
                    Thread.sleep(120);
                } catch (InterruptedException ignored) {
                    Thread.currentThread().interrupt();
                }
                verify();
            }, "socket-test-verify").start();

        } catch (Exception e) {
            check("connect threw: " + e, false);
        }
    }

    private static void verify() {
        check("blocking readLine() delivered the greeting", received.contains("welcome"));
        check("second line arrived", received.contains("echo:join Player7"));
        check("lines arrived in order",
                received.indexOf("welcome") < received.indexOf("echo:join Player7"));
        check("utf-8 survived the round trip", received.contains("echo:chat caf\u00e9 \u4f60\u597d"));
    }
}
