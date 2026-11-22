package main;

import awt.Color;
import awt.Graphics2D;
import awt.image.BufferedImage;
import concurrent.CompletableFuture;
import entity.player.SpriteCache;

import org.teavm.jso.JSBody;
import org.teavm.jso.JSObject;

import java.util.concurrent.TimeUnit;

/**
 * What the offline start can show of a backend's public pictures, without a
 * session: an avatar composed from its parts, an item picture read the way a
 * room reads its furniture. For the headless harness, and for a look when
 * pictures go missing in a tab.
 *
 * <pre>
 *   #offline&amp;parts=http://localhost:9090/parts&amp;picture=assets/8864.png
 * </pre>
 *
 * Each result is logged, and left on the page for whoever drives it:
 * {@code globalThis.__ankProbe = { look: <canvas>, picture: <img> }}.
 */
final class OfflineProbe {

    private OfflineProbe() { }

    /** Composes {@code figure} from the parts at {@code partsBaseUrl}. */
    static void look(String partsBaseUrl, String figure) {
        SpriteCache cache = SpriteCache.getInstance();
        cache.configure(partsBaseUrl);
        boolean composed = cache.loadLook(figure);
        BufferedImage front = composed ? cache.getSprite(figure, "sprite-front.png") : null;
        log("offline: look " + (composed ? "composed" : "NOT composed")
                + (front == null ? "" : ", its front frame " + describe(front)));
        if (front != null) keep("look", front.source());
    }

    /** Reads an item picture through the game's own loader. */
    static void picture(String path) {
        final CompletableFuture<BufferedImage> read = new CompletableFuture<>();
        object.Furniture.fetchSprite(path, read::complete);
        BufferedImage img = null;
        try {
            img = read.get(30, TimeUnit.SECONDS);
        } catch (Exception notRead) {
            // said below
        }
        log("offline: picture " + path + (img == null ? " NOT read" : " read, " + describe(img)));
        if (img != null) keep("picture", img.source());
    }

    /**
     * The runtime's pixel reading, on a picture drawn here: what is read one
     * pixel at a time must be what a block read gives, and both must follow
     * what is drawn afterwards.
     */
    static void pixels() {
        BufferedImage t = new BufferedImage(64, 64, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = t.createGraphics();
        g.setColor(Color.RED);
        g.fillRect(0, 0, 32, 64);
        g.dispose();
        boolean half = oneByOne(t) == 32 * 64 && inBlock(t) == 32 * 64;

        g = t.createGraphics();
        g.setColor(Color.BLUE);
        g.fillRect(32, 0, 32, 64);
        g.dispose();
        boolean whole = oneByOne(t) == 64 * 64 && inBlock(t) == 64 * 64;

        t.setRGB(0, 0, 64, 1, new int[64], 0, 64);
        boolean less = oneByOne(t) == 64 * 63 && inBlock(t) == 64 * 63;
        boolean colours = t.getRGB(1, 1) == 0xFFFF0000 && t.getRGB(40, 1) == 0xFF0000FF && t.getRGB(1, 0) == 0;

        log("offline: pixels " + (half && whole && less && colours ? "read right" : "READ WRONG")
                + " (half drawn " + half + ", after more drawing " + whole
                + ", after a write " + less + ", colours " + colours + ")");
    }

    /** Size, how much of it is drawn, and how long the game's own trim of it takes. */
    private static String describe(BufferedImage img) {
        int w = img.getWidth(), h = img.getHeight();
        if (w <= 0 || h <= 0) return w + "x" + h;
        int block = inBlock(img);
        long t0 = System.currentTimeMillis();
        int[] box = util.AlphaTrim.box(img);
        long ms = System.currentTimeMillis() - t0;
        int single = oneByOne(img);
        return w + "x" + h + ", " + block + " pixels drawn"
                + (single == block ? "" : " (ONE BY ONE GIVES " + single + ")")
                + ", trimmed to " + box[2] + "x" + box[3] + " in " + ms + " ms";
    }

    private static int oneByOne(BufferedImage img) {
        int n = 0;
        for (int y = 0; y < img.getHeight(); y++) {
            for (int x = 0; x < img.getWidth(); x++) if ((img.getRGB(x, y) >>> 24) != 0) n++;
        }
        return n;
    }

    private static int inBlock(BufferedImage img) {
        int n = 0;
        for (int px : img.getRGB(0, 0, img.getWidth(), img.getHeight(), null, 0, img.getWidth())) {
            if ((px >>> 24) != 0) n++;
        }
        return n;
    }

    @JSBody(params = { "name", "o" }, script =
            "(globalThis.__ankProbe = globalThis.__ankProbe || {})[name] = o;")
    private static native void keep(String name, JSObject o);

    @JSBody(params = "m", script = "if (globalThis.__ankLog) globalThis.__ankLog(m); "
                                 + "else if (typeof console !== 'undefined') console.log(m);")
    private static native void log(String m);
}
