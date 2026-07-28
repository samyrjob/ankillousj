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
 * {@link #read(String)} returns immediately with a BufferedImage whose pixels
 * arrive later. Drawing it before then is harmless — the canvas ignores an
 * incomplete image — and once decoded it appears on the next repaint. For a
 * game already painting at 60fps that is a frame or two of nothing, usually
 * invisible.
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

    /** Starts loading and returns immediately. Repeat calls share one image. */
    public static BufferedImage read(String url) {
        String resolved = resolve(url);
        BufferedImage cached = CACHE.get(resolved);
        if (cached != null) return cached;

        HTMLImageElement img = newImage();
        BufferedImage bi = new BufferedImage(img);
        CACHE.put(resolved, bi);
        setSrc(img, resolved);
        return bi;
    }

    public static BufferedImage read(java.net.URL url) {
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
    public static BufferedImage read(byte[] bytes) {
        return read(bytes, "image/png");
    }

    public static BufferedImage read(byte[] bytes, String mimeType) {
        HTMLImageElement img = newImage();
        BufferedImage bi = new BufferedImage(img);
        setSrc(img, blobUrl(toJs(bytes), mimeType));
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
    public static BufferedImage read(InputStream stream) {
        if (stream == null) return null;
        try {
            java.io.ByteArrayOutputStream buffer = new java.io.ByteArrayOutputStream();
            byte[] chunk = new byte[8192];
            int n;
            while ((n = stream.read(chunk)) > 0) buffer.write(chunk, 0, n);
            return buffer.size() == 0 ? null : read(buffer.toByteArray(), "image/png");
        } catch (java.io.IOException e) {
            return null;
        }
    }

    /**
     * Loads everything up front. Resolve this before the first frame and
     * {@code getWidth()} will be correct from the start.
     */
    public static CompletableFuture<Void> preload(String... urls) {
        CompletableFuture<Void> done = new CompletableFuture<>();
        if (urls.length == 0) {
            done.complete(null);
            return done;
        }
        int[] remaining = { urls.length };
        for (String url : urls) {
            BufferedImage bi = read(url);
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

    @JSBody(params = "a", script = "return new Uint8Array(a);")
    private static native JSObject toJs(byte[] a);

    @JSBody(params = { "bytes", "mime" }, script =
            "return URL.createObjectURL(new Blob([bytes], { type: mime }));")
    private static native String blobUrl(JSObject bytes, String mime);

    /** Fires on load or error, so a broken asset cannot stall preload forever. */
    @JSBody(params = { "img", "cb" }, script =
            "if (img.complete) { cb(); return; }"
          + "img.addEventListener('load', function() { cb(); });"
          + "img.addEventListener('error', function() { cb(); });")
    private static native void onSettled(HTMLImageElement img, Callback cb);
}
