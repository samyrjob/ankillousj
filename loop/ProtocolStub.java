import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * A stand-in for GameServer, speaking Futura's wire protocol.
 *
 * <p>The real server needs Kafka and MySQL, which is a lot of infrastructure
 * to stand up just to answer the question "does the browser client reach a TCP
 * server through the gateway". This speaks the same line-based protocol and
 * nothing else.
 *
 * <p>It is deliberately small and deliberately honest: it does not persist
 * anything, and it makes up plausible responses. What it proves is that the
 * transport works end to end — the client's own `NetworkManager` and
 * `ServerMessageWatcher`, unmodified, exchanging real lines with a real TCP
 * socket through the WebSocket gateway.
 */
public class ProtocolStub {

    private static final List<PrintWriter> clients = new ArrayList<>();
    private static final List<String> transcript = new ArrayList<>();

    public static void main(String[] args) throws IOException {
        int port = args.length > 0 ? Integer.parseInt(args[0]) : 5555;
        ServerSocket server = new ServerSocket(port);
        System.out.println("protocol stub listening on " + port);

        while (true) {
            Socket s = server.accept();
            new Thread(() -> serve(s), "client").start();
        }
    }

    private static void serve(Socket socket) {
        try {
            socket.setTcpNoDelay(true);
            BufferedReader in = new BufferedReader(
                new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
            PrintWriter out = new PrintWriter(
                new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8), true);

            synchronized (clients) { clients.add(out); }
            System.out.println("client connected from " + socket.getRemoteSocketAddress());

            String line;
            while ((line = in.readLine()) != null) {
                synchronized (transcript) { transcript.add("-> " + line); }
                System.out.println("  recv: " + line);
                respond(out, line);
            }
        } catch (IOException e) {
            System.out.println("client gone: " + e.getMessage());
        } finally {
            synchronized (clients) { clients.removeIf(w -> w.checkError()); }
        }
    }

    private static void respond(PrintWriter out, String line) {
        String[] parts = line.split(" ");
        String cmd = parts.length > 0 ? parts[0] : "";

        switch (cmd) {
            case "join": {
                String user = parts.length > 1 ? parts[1] : "player";
                send(out, "playerJoined " + user + " 5 5 down 1 MALE");
                // a second occupant, so the room is not empty
                send(out, "playerJoined Guest 8 6 left 1 FEMALE");
                send(out, "adminMessage Welcome to the AnkillousJ protocol stub");
                break;
            }
            case "move": {
                // move <x> <y> <dir> <inMovement>
                if (parts.length >= 5) {
                    send(out, "playerMoved Guest " + parts[1] + " " + parts[2]
                            + " " + parts[3] + " " + parts[4]);
                }
                break;
            }
            case "chat": {
                String text = line.length() > 5 ? line.substring(5) : "";
                send(out, "playerChat Guest " + text);
                break;
            }
            case "whoIsHere":
                send(out, "detailsFor Guest 8 6 left 1 FEMALE");
                break;
            case "activity":
                // the client pings this to stay alive; nothing to say back
                break;
            case "refreshGameJwt":
                send(out, "gameJwtRefreshed stub-token");
                break;
            default:
                System.out.println("  (no handler for '" + cmd + "')");
        }
    }

    private static void send(PrintWriter out, String line) {
        synchronized (transcript) { transcript.add("<- " + line); }
        System.out.println("  send: " + line);
        out.println(line);
    }
}
