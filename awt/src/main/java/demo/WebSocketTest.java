package demo;

import concurrent.CompletableFuture;
import concurrent.CompletionStage;
import nethttp.HttpClient;
import nethttp.WebSocket;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import org.teavm.jso.JSBody;

/**
 * Exercises the WebSocket shim against a stub socket supplied by the test
 * harness. Written the way the game writes it — HttpClient, a Listener,
 * buildAsync — so the shapes are the ones that actually have to work.
 */
public final class WebSocketTest {

    @JSBody(params = "m", script = "if (globalThis.__ankTest) globalThis.__ankTest(m);")
    private static native void report(String m);

    private static void check(String name, boolean ok) {
        report((ok ? "PASS " : "FAIL ") + name);
    }

    private WebSocketTest() { }

    static final List<String> events = new ArrayList<>();

    public static void run() {
        HttpClient client = HttpClient.newHttpClient();

        Listener listener = new Listener();
        CompletableFuture<WebSocket> f = client.newWebSocketBuilder()
                .header("X-Game-Version", "1.4.2")
                .connectTimeout(time.Duration.ofSeconds(10))
                .buildAsync(URI.create("wss://example.test/socket"), listener);

        check("buildAsync returns a future", f != null);
        check("future is not complete before the socket opens", !f.isDone());

        // Sending before open must queue rather than throw
        f.thenAccept(ws -> {
            check("future completes when the socket opens", true);
            ws.sendText("hello", true);
            check("isInputClosed false while open", !ws.isInputClosed());
            ws.request(1);
            ws.sendClose(WebSocket.NORMAL_CLOSURE, "bye");
            check("isOutputClosed true after sendClose", ws.isOutputClosed());
        });
    }

    static class Listener implements WebSocket.Listener {
        @Override public void onOpen(WebSocket ws) {
            events.add("open");
            ws.request(1);
        }
        @Override public CompletionStage<?> onText(WebSocket ws, CharSequence data, boolean last) {
            events.add("text:" + data + ":" + last);
            check("onText delivers a whole message with last=true", last);
            return null;
        }
        @Override public CompletionStage<?> onClose(WebSocket ws, int code, String reason) {
            events.add("close:" + code + ":" + reason);
            return null;
        }
        @Override public void onError(WebSocket ws, Throwable t) {
            events.add("error");
        }
    }

}
