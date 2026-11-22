package imageio;

import awt.image.BufferedImage;
import concurrent.CompletableFuture;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import org.teavm.jso.JSBody;
import org.teavm.jso.JSFunctor;
import org.teavm.jso.JSObject;
import org.teavm.jso.JSObject;
import org.teavm.jso.dom.html.HTMLImageElement;

/**
 * javax.imageio.ImageIO.
 *
 * <h3>The mismatch</h3>
 *
 * {@code ImageIO.read} is synchronous: it returns a fully decoded image. A
 * browser cannot do that. Decoding happens off-thread and completes on the
 * event loop, and there is no way to wait for it without freezing the loop
 * that would finish the job.
 *
 * <h3>What this does about it</h3>
 *
 * Two answers, by who is asking.
 *
 * <p>A program thread can wait without freezing anything: TeaVM compiles it
 * to a coroutine, which hands the event loop back while it waits. That is
 * {@code main}, anything started with {@code new Thread}, a task of an
 * executor, and every listener and paint (they run on the event dispatch
 * thread, see {@code awt.EventQueue}). For such a caller {@code read} is what
 * the JDK's is: it returns once the picture is decoded, its size is right and
 * its pixels can be read at once. A picture that cannot be fetched or decoded
 * is an IOException, or null from a stream, as in the JDK.
 *
 * <p>Only a call made by the browser itself — a callback handed to a script —
 * cannot wait: the loop it would wait for is the one running it. There
 * {@link #read(String)} returns immediately with a BufferedImage whose pixels
 * arrive later. Drawing it before then is harmless — the canvas ignores an
 * incomplete image — and once decoded it appears on the next repaint.
 *
 * <p>The catch is {@code getWidth()} / {@code getHeight()}, which report 0
 * until the image loads. Code that scales or centres by those values will get
 * it wrong on the first frames. Where that matters, use {@link #preload} at
 * startup and only begin rendering once its future completes.
 *
 * <h3>Resource streams</h3>
 *
 * {@code ImageIO.read(getClass().getResourceAsStream(path))} cannot work: the
 * browser has no classpath and no synchronous file read. Those call sites need
 * to become URLs — but {@link #read(InputStream)} still works, because
 * {@code ankillousj.Resources} fetches the bytes first and the stream is over
 * bytes already in memory.
 */
public final class ImageIO {

    private ImageIO() { }

    private static final Map<String, BufferedImage> CACHE = new HashMap<>();
    private static String base = "";

    /**
     * Prefix applied to paths starting with '/', so classpath-style resource
     * paths keep working once they are served over HTTP.
     * {@code setResourceBase("assets")} maps {@code /res/tile/wall.png} to
     * {@code assets/res/tile/wall.png}.
     */
    public static void setResourceBase(String prefix) {
        base = prefix == null ? "" : prefix;
    }

    /**
     * Loads a picture by address. Repeat calls share one image.
     *
     * <p>From a program thread it returns the decoded picture, or throws when
     * it cannot be had. From the browser's own calls it returns at once, the
     * pixels to follow (see the class comment).
     */
    public static BufferedImage read(String url) throws java.io.IOException {
        String resolved = resolve(url);
        BufferedImage bi = begin(resolved);
        if (canWait() && !awaitDecoded(bi.element())) {
            CACHE.remove(resolved);     // a later try may succeed: the failure is not kept
            throw new java.io.IOException("Can't read the picture at " + url);
        }
        return bi;
    }

    /** The shared picture of an address, its load started if it was not: never waits. */
    private static BufferedImage begin(String resolved) {
        BufferedImage bi = CACHE.get(resolved);
        if (bi == null) {
            HTMLImageElement img = newImage();
            bi = new BufferedImage(img);
            CACHE.put(resolved, bi);
            start(img, resolved, isForeign(resolved));
        }
        return bi;
    }

    public static BufferedImage read(java.net.URL url) throws java.io.IOException {
        return read(url.toString());
    }

    /**
     * Decodes bytes you already hold — downloaded, cached, or unpacked from an
     * archive. The bytes become a blob URL, which the browser decodes exactly
     * as it would a fetched file.
     *
     * <p>This covers the {@code ImageIO.read(new ByteArrayInputStream(bytes))}
     * shape without any change to how the bytes were obtained.
     */
    public static BufferedImage read(byte[] bytes) throws java.io.IOException {
        return read(bytes, "image/png");
    }

    public static BufferedImage read(byte[] bytes, String mimeType) throws java.io.IOException {
        HTMLImageElement img = newImage();
        BufferedImage bi = new BufferedImage(img);
        String blob = blobUrl(toJs(bytes), mimeType);
        start(img, blob, false);
        if (canWait()) {
            boolean decoded = awaitDecoded(img);
            revoke(blob);                    // the picture holds its pixels now; the bytes can go
            if (!decoded) return null;       // not a picture: the JDK's answer for bytes no reader takes
        }
        return bi;
    }

    /**
     * Drains the stream and decodes the bytes.
     *
     * <p>This works because the bytes are already in hand by the time the
     * stream exists — {@code ankillousj.Resources.open} fetched them. What
     * still cannot happen synchronously is the *decode*, so the returned image
     * populates on a later tick exactly as {@link #read(String)} does.
     */
    public static BufferedImage read(InputStream stream) throws java.io.IOException {
        if (stream == null) return null;
        java.io.ByteArrayOutputStream buffer = new java.io.ByteArrayOutputStream();
        byte[] chunk = new byte[8192];
        int n;
        while ((n = stream.read(chunk)) > 0) buffer.write(chunk, 0, n);
        return buffer.size() == 0 ? null : read(buffer.toByteArray(), "image/png");
    }

    /**
     * Loads everything up front. Resolve this before the first frame and
     * {@code getWidth()} will be correct from the start.
     */
    public static CompletableFuture<Void> preload(String... urls) throws java.io.IOException {
        CompletableFuture<Void> done = new CompletableFuture<>();
        if (urls.length == 0) {
            done.complete(null);
            return done;
        }
        int[] remaining = { urls.length };
        for (String url : urls) {
            BufferedImage bi = begin(resolve(url));     // all at once, none waited for here
            onSettled(bi.element(), () -> {
                if (--remaining[0] == 0) done.complete(null);
            });
        }
        return done;
    }

    /** True once the pixels are available and the dimensions are meaningful. */
    public static boolean isLoaded(BufferedImage image) {
        return image != null && image.getWidth() > 0;
    }

    // ── waiting for a decode ──────────────────────────────────────────

    /**
     * Whether the caller is a program thread, which can wait, and not a call
     * made by the browser (a paint, an event), which cannot. TeaVM keeps the
     * running thread at hand; none is running during a call of the browser's.
     */
    @JSBody(script =
            "return typeof $rt_nativeThread === 'function' && $rt_nativeThread() !== null;")
    private static native boolean canWait();

    /** Waits until the picture is decoded or has failed. True when it can be drawn and read. */
    private static boolean awaitDecoded(HTMLImageElement img) {
        if (!isSettled(img)) settle(img);
        return naturalWidth(img) > 0;
    }

    @org.teavm.interop.Async
    private static native Boolean settle(HTMLImageElement img);

    private static void settle(HTMLImageElement img, org.teavm.interop.AsyncCallback<Boolean> callback) {
        onSettled(img, () -> callback.complete(Boolean.TRUE));
    }

    public static void clearCache() {
        CACHE.clear();
    }

    private static String resolve(String url) {
        if (base.isEmpty()) return url;
        if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
            return url;
        }
        if (url.startsWith("/")) return base + url;
        return url;
    }

    // ── browser interop ───────────────────────────────────────────────

    @JSFunctor
    interface Callback extends JSObject { void call(); }

    @JSBody(script = "return new Image();")
    private static native HTMLImageElement newImage();

    @JSBody(params = { "img", "src" }, script = "img.src = src;")
    private static native void setSrc(HTMLImageElement img, String src);

    /**
     * Starts a load. A picture from another site is asked for with CORS, so
     * its pixels may be read (recolouring, composing, hit tests); when that
     * site does not allow it, the picture is asked for again without: it can
     * then be drawn, though not read. {@code __ankSettled} is set once the
     * final outcome is known, which is what {@link #onSettled} waits for.
     */
    @JSBody(params = { "img", "src", "foreign" }, script =
            "img.__ankSettled = false;"
          + "var retried = !foreign;"
          + "img.addEventListener('load', function() { img.__ankSettled = true; });"
          + "img.addEventListener('error', function() {"
          + "  if (!retried) {"
          + "    retried = true;"
          + "    img.removeAttribute('crossorigin');"
          + "    img.src = src;"
          + "  } else {"
          + "    img.__ankSettled = true;"
          + "    if (img.__ankFailed) img.__ankFailed();"
          + "  }"
          + "});"
          + "if (foreign) img.crossOrigin = 'anonymous';"
          + "img.src = src;")
    private static native void start(HTMLImageElement img, String src, boolean foreign);

    /** An address on another site than the page's: http(s) with another origin. */
    @JSBody(params = "url", script =
            "if (!/^https?:/i.test(url)) return false;"
          + "try { return typeof location !== 'undefined' && new URL(url).origin !== location.origin; }"
          + "catch (e) { return false; }")
    private static native boolean isForeign(String url);

    @JSBody(params = "img", script =
            "return img.__ankSettled === true || (img.__ankSettled === undefined && img.complete === true);")
    private static native boolean isSettled(HTMLImageElement img);

    @JSBody(params = "img", script = "return img.naturalWidth || img.width || 0;")
    private static native int naturalWidth(HTMLImageElement img);

    @JSBody(params = "url", script = "try { URL.revokeObjectURL(url); } catch (e) { }")
    private static native void revoke(String url);

    @JSBody(params = "a", script = "return new Uint8Array(a);")
    private static native JSObject toJs(@org.teavm.jso.JSByRef byte[] a);

    @JSBody(params = { "bytes", "mime" }, script =
            "return URL.createObjectURL(new Blob([bytes], { type: mime }));")
    private static native String blobUrl(JSObject bytes, String mime);

    /**
     * Fires once, on the load or on the final failure (after the retry without
     * CORS, see {@link #start}), so a broken asset cannot stall anything.
     */
    @JSBody(params = { "img", "cb" }, script =
            "if (img.__ankSettled === true || (img.__ankSettled === undefined && img.complete)) { cb(); return; }"
          + "var done = false;"
          + "var once = function() { if (!done) { done = true; cb(); } };"
          + "img.addEventListener('load', once);"
          + "img.__ankFailed = once;"
          + "if (img.__ankSettled === undefined) img.addEventListener('error', once);")
    private static native void onSettled(HTMLImageElement img, Callback cb);
}
