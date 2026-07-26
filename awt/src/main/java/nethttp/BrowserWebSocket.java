package nethttp;

import concurrent.CompletableFuture;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import org.teavm.jso.JSObject;

/** WebSocket implementation over the browser's native socket. */
class BrowserWebSocket implements WebSocket {

    private final JSObject socket;
    private final Listener listener;
    private boolean inputClosed;
    private boolean outputClosed;

    /** Sends issued before the socket opens, replayed on open. */
    private final List<String> queued = new ArrayList<>();
    private boolean open;

    BrowserWebSocket(String url, Listener listener, CompletableFuture<WebSocket> ready) {
        this.listener = listener;
        this.socket = Native.open(url);

        Native.bind(socket,
            () -> {
                open = true;
                for (String s : queued) Native.send(socket, s);
                queued.clear();
                ready.complete(this);
                listener.onOpen(this);
            },
            text -> listener.onText(this, text, true),
            (code, reason) -> {
                inputClosed = true;
                outputClosed = true;
                listener.onClose(this, code, reason);
            },
            () -> {
                // The browser deliberately withholds the reason, to avoid
                // leaking cross-origin information. There is nothing more to
                // report than that it failed.
                RuntimeException e = new RuntimeException("websocket error");
                if (!ready.isDone()) ready.completeExceptionally(e);
                listener.onError(this, e);
            });
    }

    @Override
    public CompletableFuture<WebSocket> sendText(CharSequence data, boolean last) {
        String s = data.toString();
        if (open) Native.send(socket, s);
        else queued.add(s);   // sending before open would throw in the browser
        return CompletableFuture.completedFuture(this);
    }

    @Override
    public CompletableFuture<WebSocket> sendClose(int statusCode, String reason) {
        outputClosed = true;
        Native.close(socket, statusCode, reason == null ? "" : reason);
        return CompletableFuture.completedFuture(this);
    }

    /** No-op: the browser reassembles messages, so there is no demand to signal. */
    @Override public void request(long n) { }

    @Override
    public void abort() {
        inputClosed = true;
        outputClosed = true;
        Native.close(socket, NORMAL_CLOSURE, "");
    }

    @Override public boolean isInputClosed()  { return inputClosed; }
    @Override public boolean isOutputClosed() { return outputClosed; }

    static class BuilderImpl implements Builder {
        private final List<String[]> headers = new ArrayList<>();

        @Override public Builder header(String name, String value) {
            headers.add(new String[] { name, value });
            return this;
        }

        /** The browser owns the handshake; there is no timeout to set. */
        @Override public Builder connectTimeout(time.Duration timeout) { return this; }

        @Override public Builder subprotocols(String most, String... rest) { return this; }

        @Override
        public CompletableFuture<WebSocket> buildAsync(URI uri, Listener listener) {
            CompletableFuture<WebSocket> ready = new CompletableFuture<>();
            new BrowserWebSocket(withHeadersAsQuery(uri.toString()), listener, ready);
            return ready;
        }

        /**
         * Headers cannot be set on a browser WebSocket handshake, so they are
         * moved into the query string. The server must read them from there.
         */
        private String withHeadersAsQuery(String url) {
            if (headers.isEmpty()) return url;
            StringBuilder sb = new StringBuilder(url);
            sb.append(url.indexOf('?') >= 0 ? '&' : '?');
            for (int i = 0; i < headers.size(); i++) {
                if (i > 0) sb.append('&');
                sb.append(encode(headers.get(i)[0])).append('=').append(encode(headers.get(i)[1]));
            }
            return sb.toString();
        }

        private static String encode(String s) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < s.length(); i++) {
                char c = s.charAt(i);
                boolean safe = (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')
                        || (c >= '0' && c <= '9') || c == '-' || c == '_' || c == '.' || c == '~';
                if (safe) {
                    sb.append(c);
                } else {
                    sb.append('%');
                    String hex = Integer.toHexString(c & 0xFF).toUpperCase();
                    if (hex.length() < 2) sb.append('0');
                    sb.append(hex);
                }
            }
            return sb.toString();
        }
    }
}
