package net;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayDeque;
import java.util.Deque;

import org.teavm.interop.Async;
import org.teavm.interop.AsyncCallback;
import org.teavm.jso.JSBody;
import org.teavm.jso.JSFunctor;
import org.teavm.jso.JSObject;

/**
 * java.net.Socket over a browser WebSocket.
 *
 * <h2>The problem this solves</h2>
 *
 * A browser cannot open a TCP socket, so a game whose protocol runs over
 * {@code ServerSocket} is unreachable from a browser however the client is
 * compiled. The {@code ankillousj.gateway} module handles the far end: it
 * accepts WebSocket connections and forwards them to the TCP server, which is
 * never modified. This class handles the near end, so the client code is never
 * modified either.
 *
 * <p>What makes that possible is that the two halves are the same shape.
 * Line-based text over TCP and text messages over WebSocket carry exactly the
 * same information, so
 *
 * <pre>
 *     socket = new Socket(host, port);
 *     in  = new BufferedReader(new InputStreamReader(socket.getInputStream()));
 *     out = new PrintWriter(socket.getOutputStream(), true);
 *     while ((line = in.readLine()) != null) { ... }
 * </pre>
 *
 * keeps working, unchanged, in a browser.
 *
 * <h2>How a blocking read is possible</h2>
 *
 * {@code readLine()} blocks, and blocking the browser's only thread would
 * freeze the event loop that delivers the message being waited for — a
 * deadlock, not a delay.
 *
 * <p>TeaVM's {@code @Async} is the way out. A method annotated with it is
 * compiled into a coroutine: it suspends, returns control to the event loop,
 * and resumes when its {@link AsyncCallback} fires. From the calling code's
 * point of view it simply blocked and returned a value. Every intermediate
 * frame is split at the call site by the compiler, so
 * {@code ServerMessageWatcher.run()} does not need to know any of this.
 *
 * <p>That is why this port targets TeaVM 0.13 or later: coroutine support in
 * the WebAssembly GC backend landed there. Before it, this was not possible at
 * all.
 *
 * <h2>Threads</h2>
 *
 * The game starts the read loop with {@code new Thread(watcher).start()}.
 * TeaVM implements {@code Thread} on the same coroutine machinery, so that
 * works — but it is cooperative, not parallel. The loop yields whenever it
 * waits for a message, which is exactly when a reader should yield.
 */
public class Socket {

    private final WebSocketHandle handle;
    private final SocketInputStream input;
    private final SocketOutputStream output;
    private boolean closed;

    /**
     * Connects to {@code host:port}.
     *
     * <p>The URL is derived from the host and port so existing code passes its
     * usual arguments. Set {@link #setUrlMapper} at startup if the gateway
     * lives somewhere else, or {@link #setSecure} to use {@code wss://}.
     */
    public Socket(String host, int port) throws IOException {
        this.handle = connect(url(host, port));
        if (handle == null) {
            throw new IOException("could not connect to " + host + ":" + port
                    + " — is the AnkillousJ gateway running?");
        }
        this.input = new SocketInputStream(handle);
        this.output = new SocketOutputStream(handle);
    }

    public InputStream getInputStream()   { return input; }
    public OutputStream getOutputStream() { return output; }

    public void close() throws IOException {
        if (closed) return;
        closed = true;
        Native.close(handle.socket());
    }

    public boolean isClosed()    { return closed || handle.isClosed(); }
    public boolean isConnected() { return !isClosed(); }

    /** Accepted and ignored: the browser manages the transport. */
    public void setTcpNoDelay(boolean on) { }
    public void setSoTimeout(int timeout)  { }
    public void setKeepAlive(boolean on)   { }

    // ── URL derivation ────────────────────────────────────────────────

    private static boolean secure;
    private static UrlMapper mapper;

    /** Maps a host and port to the WebSocket URL to dial. */
    public interface UrlMapper {
        String toUrl(String host, int port);
    }

    /** Overrides how {@code host:port} becomes a URL. */
    public static void setUrlMapper(UrlMapper m) { mapper = m; }

    /** Use {@code wss://} rather than {@code ws://}. Required on an https page. */
    public static void setSecure(boolean on) { secure = on; }

    private static String url(String host, int port) {
        if (mapper != null) return mapper.toUrl(host, port);
        return (secure ? "wss://" : "ws://") + host + ":" + port;
    }

    // ── the suspending connect ────────────────────────────────────────

    /**
     * Suspends until the socket opens or fails.
     *
     * @return the handle, or null when the connection could not be made
     */
    @Async
    private static native WebSocketHandle connect(String url);

    private static void connect(String url, AsyncCallback<WebSocketHandle> callback) {
        WebSocketHandle handle = new WebSocketHandle();
        JSObject ws = Native.open(url);
        handle.attach(ws);

        Native.bind(ws,
            () -> {
                handle.markOpen();
                callback.complete(handle);
            },
            text -> handle.deliver(text),
            (code, reason) -> {
                boolean wasOpen = handle.isOpen();
                handle.markClosed();
                // A close before open means the connection never succeeded
                if (!wasOpen) callback.complete(null);
            },
            () -> {
                boolean wasOpen = handle.isOpen();
                handle.markClosed();
                if (!wasOpen) callback.complete(null);
            });
    }

    // ── shared state between the socket and its streams ───────────────

    static final class WebSocketHandle {
        private JSObject socket;
        private boolean open;
        private boolean closed;

        /** Messages that arrived before anyone asked for them. */
        private final Deque<String> pending = new ArrayDeque<>();

        /** A reader parked waiting for the next message, if any. */
        private AsyncCallback<String> waiting;

        void attach(JSObject ws)  { this.socket = ws; }
        JSObject socket()         { return socket; }
        void markOpen()           { open = true; }
        boolean isOpen()          { return open; }
        boolean isClosed()        { return closed; }

        void markClosed() {
            closed = true;
            // Wake a parked reader so it sees end-of-stream instead of hanging
            if (waiting != null) {
                AsyncCallback<String> w = waiting;
                waiting = null;
                w.complete(null);
            }
        }

        /** A message arrived: hand it straight to a waiting reader, or queue it. */
        void deliver(String message) {
            if (waiting != null) {
                AsyncCallback<String> w = waiting;
                waiting = null;
                w.complete(message);
            } else {
                pending.addLast(message);
            }
        }

        /**
         * Takes the next message, suspending if none has arrived.
         *
         * @return the message, or null at end of stream
         */
        void take(AsyncCallback<String> callback) {
            if (!pending.isEmpty()) {
                callback.complete(pending.pollFirst());
            } else if (closed) {
                callback.complete(null);
            } else {
                waiting = callback;
            }
        }
    }

    // ── streams ───────────────────────────────────────────────────────

    /**
     * Presents whole WebSocket messages as a byte stream terminated by
     * newlines, which is what a {@link java.io.BufferedReader} above it
     * expects. The newline is synthesised here because the gateway strips it
     * when framing.
     */
    static final class SocketInputStream extends InputStream {
        private final WebSocketHandle handle;
        private byte[] current = new byte[0];
        private int position;
        private boolean ended;

        SocketInputStream(WebSocketHandle handle) { this.handle = handle; }

        @Override
        public int read() throws IOException {
            while (position >= current.length) {
                if (ended) return -1;
                String message = nextMessage(handle);
                if (message == null) {
                    ended = true;
                    return -1;
                }
                current = (message + "\n").getBytes("UTF-8");
                position = 0;
            }
            return current[position++] & 0xff;
        }

        @Override
        public int read(byte[] b, int off, int len) throws IOException {
            int first = read();
            if (first < 0) return -1;
            b[off] = (byte) first;
            int n = 1;
            // Only drain what is already buffered; going back for another
            // message would suspend, and a reader asking for "up to len"
            // should not be made to wait for more than has arrived.
            while (n < len && position < current.length) {
                b[off + n++] = current[position++];
            }
            return n;
        }

        @Override
        public int available() {
            return current.length - position;
        }

        @Override
        public void close() {
            ended = true;
        }
    }

    /** Buffers bytes and sends one WebSocket message per newline. */
    static final class SocketOutputStream extends OutputStream {
        private final WebSocketHandle handle;
        private final StringBuilder line = new StringBuilder();

        SocketOutputStream(WebSocketHandle handle) { this.handle = handle; }

        @Override
        public void write(int b) {
            if (b == '\n') {
                flushLine();
            } else if (b != '\r') {
                line.append((char) (b & 0xff));
            }
        }

        @Override
        public void write(byte[] b, int off, int len) throws IOException {
            // Decode as UTF-8 rather than byte by byte: appending each byte as
            // a char would mangle any multi-byte sequence.
            String chunk = new String(b, off, len, "UTF-8");
            for (int i = 0; i < chunk.length(); i++) {
                char c = chunk.charAt(i);
                if (c == '\n') flushLine();
                else if (c != '\r') line.append(c);
            }
        }

        private void flushLine() {
            if (handle.isClosed()) return;
            Native.send(handle.socket(), line.toString());
            line.setLength(0);
        }

        @Override
        public void flush() {
            // Deliberately empty: a message is sent at each newline, and
            // flushing a partial line would send a fragment the server would
            // read as a complete command.
        }

        @Override
        public void close() {
            if (line.length() > 0) flushLine();
        }
    }

    /** Suspends until the next message arrives or the socket closes. */
    @Async
    private static native String nextMessage(WebSocketHandle handle);

    private static void nextMessage(WebSocketHandle handle, AsyncCallback<String> callback) {
        handle.take(callback);
    }

    // ── browser interop ───────────────────────────────────────────────

    @JSFunctor interface VoidHandler   extends JSObject { void handle(); }
    @JSFunctor interface StringHandler extends JSObject { void handle(String s); }
    @JSFunctor interface CloseHandler  extends JSObject { void handle(int code, String reason); }

    static final class Native {
        private Native() { }

        @JSBody(params = "url", script = "return new WebSocket(url);")
        static native JSObject open(String url);

        @JSBody(params = { "ws", "onOpen", "onMessage", "onClose", "onError" }, script =
                "ws.onopen = function() { onOpen(); };"
              + "ws.onmessage = function(e) { onMessage(typeof e.data === 'string' ? e.data : ''); };"
              + "ws.onclose = function(e) { onClose(e.code, e.reason || ''); };"
              + "ws.onerror = function() { onError(); };")
        static native void bind(JSObject ws, VoidHandler onOpen, StringHandler onMessage,
                                CloseHandler onClose, VoidHandler onError);

        @JSBody(params = { "ws", "text" }, script = "ws.send(text);")
        static native void send(JSObject ws, String text);

        @JSBody(params = "ws", script = "try { ws.close(); } catch (e) { }")
        static native void close(JSObject ws);
    }
}
