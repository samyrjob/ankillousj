package ankillousj;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

import org.teavm.jso.JSBody;
import org.teavm.jso.JSObject;
import org.teavm.jso.typedarrays.Int8Array;

/**
 * Classpath resources, served over HTTP.
 *
 * <p>{@code getClass().getResourceAsStream("/res/map/room.txt")} has no
 * meaning in a browser — there is no classpath and no synchronous file read.
 * But the *shape* of the call is satisfiable: fetch the bytes and hand back a
 * stream over them, so every {@code BufferedReader}, {@code Scanner} and
 * {@code ImageIO.read} above it keeps working unchanged.
 *
 * <p><b>This blocks.</b> Synchronous XHR is the only way to return bytes from
 * a method that must return them, and it freezes the page while it runs.
 * Acceptable for the handful of small files a game loads at startup; not for
 * anything in a frame loop. {@link #preload} exists so a whole set can be
 * warmed asynchronously first, after which {@link #open} is served from cache
 * and never blocks.
 */
public final class Resources {

    private Resources() { }

    private static String base = "";
    private static final java.util.Map<String, byte[]> CACHE = new java.util.HashMap<>();

    /**
     * Prefix for classpath-style paths, so existing paths keep working.
     * {@code setBase("assets")} maps {@code /res/tile/x.png} to
     * {@code assets/res/tile/x.png}.
     */
    public static void setBase(String prefix) { base = prefix == null ? "" : prefix; }

    /** @return a stream over the resource, or null if it could not be fetched */
    public static InputStream open(String path) {
        byte[] bytes = read(path);
        return bytes == null ? null : new ByteArrayInputStream(bytes);
    }

    /** @return the raw bytes, or null */
    public static byte[] read(String path) {
        String url = resolve(path);
        byte[] cached = CACHE.get(url);
        if (cached != null) return cached;

        Int8Array data = Native.fetchSync(url);
        if (data == null) return null;

        byte[] bytes = new byte[data.getLength()];
        for (int i = 0; i < bytes.length; i++) bytes[i] = data.get(i);
        CACHE.put(url, bytes);
        return bytes;
    }

    /** Convenience for text resources. */
    public static String readString(String path) {
        byte[] bytes = read(path);
        if (bytes == null) return null;
        try {
            return new String(bytes, "UTF-8");
        } catch (java.io.UnsupportedEncodingException e) {
            return null;
        }
    }

    /**
     * Warms the cache without blocking. Resolve this before the first frame
     * and every later {@link #open} is served from memory.
     */
    public static concurrent.CompletableFuture<Void> preload(String... paths) {
        concurrent.CompletableFuture<Void> done = new concurrent.CompletableFuture<>();
        if (paths.length == 0) {
            done.complete(null);
            return done;
        }
        int[] remaining = { paths.length };
        for (String path : paths) {
            String url = resolve(path);
            Native.fetchAsync(url,
                data -> {
                    byte[] bytes = new byte[data.getLength()];
                    for (int i = 0; i < bytes.length; i++) bytes[i] = data.get(i);
                    CACHE.put(url, bytes);
                    if (--remaining[0] == 0) done.complete(null);
                },
                // a missing file must not stall startup
                () -> { if (--remaining[0] == 0) done.complete(null); });
        }
        return done;
    }

    public static boolean isCached(String path) { return CACHE.containsKey(resolve(path)); }

    public static void clearCache() { CACHE.clear(); }

    private static String resolve(String path) {
        if (path == null) return "";
        if (path.startsWith("http://") || path.startsWith("https://")) return path;
        if (base.isEmpty()) return path;
        return path.startsWith("/") ? base + path : base + "/" + path;
    }

    @org.teavm.jso.JSFunctor
    interface DataHandler extends JSObject { void handle(Int8Array data); }

    @org.teavm.jso.JSFunctor
    interface ErrorHandler extends JSObject { void handle(); }

    static final class Native {
        private Native() { }

        @JSBody(params = "url", script =
                "var x = new XMLHttpRequest();"
              + "x.open('GET', url, false);"              // false = synchronous
              + "x.overrideMimeType('text/plain; charset=x-user-defined');"
              + "try { x.send(null); } catch (e) { return null; }"
              + "if (x.status !== 200 && x.status !== 0) return null;"
              + "var s = x.responseText, a = new Int8Array(s.length);"
              + "for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i) & 255;"
              + "return a;")
        static native Int8Array fetchSync(String url);

        @JSBody(params = { "url", "ok", "err" }, script =
                "fetch(url).then(function(r) {"
              + "  if (!r.ok) { err(); return; }"
              + "  return r.arrayBuffer().then(function(b) { ok(new Int8Array(b)); });"
              + "}).catch(function() { err(); });")
        static native void fetchAsync(String url, DataHandler ok, ErrorHandler err);
    }
}
