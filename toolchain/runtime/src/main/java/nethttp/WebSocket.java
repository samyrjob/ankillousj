package nethttp;

import concurrent.CompletableFuture;
import concurrent.CompletionStage;

import java.net.URI;

import org.teavm.jso.JSBody;
import org.teavm.jso.JSFunctor;
import org.teavm.jso.JSObject;

/**
 * java.net.http.WebSocket over the browser's native WebSocket.
 *
 * The message model differs. The JDK hands you fragments and expects you to
 * request more with {@code request(n)}; the browser reassembles frames and
 * delivers whole messages. So {@code onText} always arrives with
 * {@code last = true} and {@code request(n)} is a no-op — there is no flow
 * control to exert.
 */
public interface WebSocket {

    CompletableFuture<WebSocket> sendText(CharSequence data, boolean last);
    CompletableFuture<WebSocket> sendClose(int statusCode, String reason);
    void request(long n);
    void abort();
    boolean isInputClosed();
    boolean isOutputClosed();

    int NORMAL_CLOSURE = 1000;

    /**
     * Callbacks. Defaults match the JDK's, so a listener only overrides what
     * it cares about.
     */
    interface Listener {
        default void onOpen(WebSocket webSocket) {
            webSocket.request(1);
        }

        default CompletionStage<?> onText(WebSocket webSocket, CharSequence data, boolean last) {
            webSocket.request(1);
            return null;
        }

        default CompletionStage<?> onBinary(WebSocket webSocket, byte[] data, boolean last) {
            webSocket.request(1);
            return null;
        }

        default CompletionStage<?> onClose(WebSocket webSocket, int statusCode, String reason) {
            return null;
        }

        default void onError(WebSocket webSocket, Throwable error) {
        }
    }

    /**
     * Builder.
     *
     * <p><b>Headers do not work.</b> The browser WebSocket API gives no way to
     * set request headers — the handshake is issued by the browser itself. A
     * call to {@link #header} is therefore appended to the URL as a query
     * parameter instead, and the server has to read it from there.
     *
     * <p>This is a real behavioural difference, not a detail: a server that
     * authenticates on a header will reject the connection until it also looks
     * at the query string. It is called out loudly rather than silently
     * dropped, because silently dropping an auth header is the kind of thing
     * that costs an afternoon.
     */
    interface Builder {
        Builder header(String name, String value);
        Builder connectTimeout(time.Duration timeout);
        Builder connectTimeout(java.time.Duration timeout);
        Builder subprotocols(String most, String... rest);
        CompletableFuture<WebSocket> buildAsync(URI uri, Listener listener);
    }

    // ── browser interop ───────────────────────────────────────────────

    @JSFunctor
    interface StringHandler extends JSObject { void handle(String s); }

    @JSFunctor
    interface CloseHandler extends JSObject { void handle(int code, String reason); }

    @JSFunctor
    interface VoidHandler extends JSObject { void handle(); }

    final class Native {
        private Native() { }

        @JSBody(params = "url", script = "return new WebSocket(url);")
        static native JSObject open(String url);

        @JSBody(params = { "url", "protocols" }, script = "return new WebSocket(url, protocols);")
        static native JSObject openWithProtocols(String url, String[] protocols);

        @JSBody(params = { "ws", "onOpen", "onMessage", "onClose", "onError" }, script =
                "ws.onopen = function() { onOpen(); };"
              + "ws.onmessage = function(e) { onMessage(typeof e.data === 'string' ? e.data : ''); };"
              + "ws.onclose = function(e) { onClose(e.code, e.reason || ''); };"
              + "ws.onerror = function() { onError(); };")
        static native void bind(JSObject ws, VoidHandler onOpen, StringHandler onMessage,
                               CloseHandler onClose, VoidHandler onError);

        @JSBody(params = { "ws", "text" }, script = "ws.send(text);")
        static native void send(JSObject ws, String text);

        @JSBody(params = { "ws", "code", "reason" }, script = "ws.close(code, reason);")
        static native void close(JSObject ws, int code, String reason);

        /** 0 CONNECTING, 1 OPEN, 2 CLOSING, 3 CLOSED */
        @JSBody(params = "ws", script = "return ws.readyState;")
        static native int readyState(JSObject ws);
    }
}
