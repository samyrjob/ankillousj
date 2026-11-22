package awt.image;

import awt.Graphics2D;
import org.teavm.jso.canvas.CanvasImageSource;
import org.teavm.jso.canvas.CanvasRenderingContext2D;
import org.teavm.jso.dom.html.HTMLCanvasElement;
import org.teavm.jso.dom.html.HTMLDocument;
import org.teavm.jso.dom.html.HTMLImageElement;

/**
 * BufferedImage over an offscreen canvas.
 *
 * A decoded <img> and a canvas are both CanvasImageSource, so a BufferedImage
 * can wrap either: one you loaded from a URL, or one you draw into.
 */
public class BufferedImage {
    public static final int TYPE_INT_RGB      = 1;
    public static final int TYPE_INT_ARGB     = 2;
    public static final int TYPE_INT_ARGB_PRE = 3;
    public static final int TYPE_INT_BGR      = 4;
    public static final int TYPE_3BYTE_BGR    = 5;
    public static final int TYPE_4BYTE_ABGR   = 6;
    public static final int TYPE_BYTE_GRAY    = 10;

    private final CanvasImageSource src;
    private final HTMLCanvasElement canvas;   // null when wrapping a loaded image
    private final HTMLImageElement image;     // null when wrapping a canvas
    private final int width, height;

    /** Blank offscreen surface you can draw into. */
    public BufferedImage(int w, int h, int type) {
        HTMLDocument doc = HTMLDocument.current();
        this.canvas = (HTMLCanvasElement) doc.createElement("canvas");
        this.canvas.setWidth(w);
        this.canvas.setHeight(h);
        this.src = this.canvas;
        this.image = null;
        this.width = w;
        this.height = h;
    }

    /**
     * Wraps an image element, which may still be decoding. Dimensions are read
     * live rather than captured, so they become correct once it loads.
     */
    public BufferedImage(HTMLImageElement img) {
        this.canvas = null;
        this.image = img;
        this.src = img;
        this.width = 0;
        this.height = 0;
    }

    public int getWidth()  { return image != null ? image.getWidth() : width; }
    public int getHeight() { return image != null ? image.getHeight() : height; }

    /** The underlying element, for load callbacks. */
    public HTMLImageElement element() { return image; }

    public CanvasImageSource source() { return src; }

    public Graphics2D createGraphics() {
        if (canvas == null) throw new IllegalStateException("image is read-only");
        return new Graphics2D((CanvasRenderingContext2D) canvas.getContext("2d"));
    }

    public Graphics2D getGraphics() { return createGraphics(); }

    // ── Reading pixels ────────────────────────────────────────────────
    //
    // A Java picture is memory: reading one pixel costs nothing, and programs
    // read them one by one by the million (a bounding box, a hit test, an
    // average colour). A canvas answers each read through a call a thousand
    // times dearer. So a few reads are asked of the browser as they come, and
    // a picture read again and again is taken into memory whole, once, and
    // answered from there until something draws into it.

    /** Reads this many are always asked of the browser, however small the picture. */
    private static final int MIN_READS = 16;
    /** One more read is allowed for each so many pixels: about where the whole picture costs no more. */
    private static final int PIXELS_PER_READ = 2048;
    /** All the pictures held in memory together; the oldest is let go past this. */
    private static final long HELD_BYTES_MAX = 64L * 1024 * 1024;

    private static final java.util.ArrayDeque<BufferedImage> HELD = new java.util.ArrayDeque<>();
    private static long heldBytes;
    private static final int[] ONE = new int[1];

    private int[] held;            // the whole picture as packed ARGB, or null
    private int heldW, heldH;
    private int reads;             // since the last drawing into it, or since its copy was let go
    private boolean watched;       // a canvas whose drawing calls tell us (see Native.watch)

    /**
     * Reads one pixel as packed 0xAARRGGBB; 0 outside the picture.
     *
     * <p><b>Pictures from another site.</b> Loaded without that site's
     * permission (CORS), a picture can be drawn but not read: every pixel
     * reads as 0. Serve game pictures from the page's own site, or with
     * {@code Access-Control-Allow-Origin}.
     */
    public int getRGB(int x, int y) {
        int[] all = held != null ? held : heldAfterThisRead();
        if (all != null) {
            return x < 0 || y < 0 || x >= heldW || y >= heldH ? 0 : all[y * heldW + x];
        }
        ONE[0] = 0;
        Native.read(src, canvas != null, x, y, 1, 1, ONE, 0, 1);
        return ONE[0];
    }

    /**
     * The bulk form: reads a rectangle into {@code out}, row by row.
     *
     * <p>The array goes to the browser BY REFERENCE ({@code @JSByRef}). TeaVM
     * hands a script a copy of a Java array otherwise, and what the script
     * writes into a copy never comes back: every block read was all zeros,
     * so whatever was composed or recoloured from one came out blank.
     */
    public int[] getRGB(int startX, int startY, int w, int h,
                        int[] out, int offset, int scansize) {
        int[] result = out != null ? out : new int[offset + Math.max(0, h) * scansize];
        if (w <= 0 || h <= 0) return result;
        int[] all = held != null ? held : heldAfterThisRead();
        if (all == null) {
            Native.read(src, canvas != null, startX, startY, w, h, result, offset, scansize);
            return result;
        }
        int from = Math.max(0, startX), to = Math.min(heldW, startX + w);
        for (int j = 0; j < h; j++) {
            int y = startY + j, at = offset + j * scansize;
            if (y < 0 || y >= heldH || to <= from) {
                java.util.Arrays.fill(result, at, at + w, 0);
                continue;
            }
            if (to - from < w) java.util.Arrays.fill(result, at, at + w, 0);
            System.arraycopy(all, y * heldW + from, result, at + (from - startX), to - from);
        }
        return result;
    }

    /**
     * Counts a read; once reading piecemeal has cost about what the whole
     * picture does, takes the whole picture into memory and returns it.
     * Null while the browser is still to be asked.
     */
    private int[] heldAfterThisRead() {
        int w = getWidth(), h = getHeight();
        if (w <= 0 || h <= 0) return null;                    // not arrived yet
        long bytes = 4L * w * h;
        if (bytes > HELD_BYTES_MAX) return null;              // too big to hold: read as it comes
        if (++reads <= Math.max(MIN_READS, (int) (((long) w * h) / PIXELS_PER_READ))) return null;

        int[] all = new int[w * h];
        if (!Native.read(src, canvas != null, 0, 0, w, h, all, 0, w)) {
            reads = 0;                                        // cannot be read now: asked again later
            return null;
        }
        if (canvas != null && !watched) {
            watched = true;
            Native.watch(canvas, this::drawnInto);
        }
        held = all;
        heldW = w;
        heldH = h;
        HELD.add(this);
        heldBytes += bytes;
        while (heldBytes > HELD_BYTES_MAX && HELD.size() > 1) HELD.peek().letGo();
        return all;
    }

    /** The copy in memory is dropped; the next reads go to the browser again, and earn a new one. */
    private void letGo() {
        if (held != null) {
            heldBytes -= 4L * heldW * heldH;
            held = null;
            HELD.remove(this);
        }
        reads = 0;
    }

    /** Called by the canvas itself at each drawing call, once it is watched: what was held is stale. */
    private void drawnInto() {
        letGo();
    }

    public void setRGB(int x, int y, int rgb) {
        Native.setPixel(writable(), x, y, rgb);
    }

    /** The bulk form: writes a rectangle of packed 0xAARRGGBB pixels, row by row. */
    public void setRGB(int startX, int startY, int w, int h,
                       int[] rgb, int offset, int scansize) {
        if (w <= 0 || h <= 0 || rgb == null) return;
        Native.setPixels(writable(), startX, startY, w, h, rgb, offset, scansize);
    }

    /** A picture drawn into is a canvas; a loaded one is read-only, as its pixels are the browser's. */
    private HTMLCanvasElement writable() {
        if (canvas == null) throw new IllegalStateException("image is read-only");
        return canvas;
    }

    /**
     * A new picture holding the rectangle (x, y, w, h) of this one.
     *
     * <p>The JDK's shares its pixels with the original; this one is a copy,
     * which is the same to anyone who only looks at it or draws it.
     */
    public BufferedImage getSubimage(int x, int y, int w, int h) {
        BufferedImage part = new BufferedImage(Math.max(1, w), Math.max(1, h), TYPE_INT_ARGB);
        Native.copyRegion(part.canvas, src, x, y, w, h);
        return part;
    }

    /** Always ARGB: a canvas has no other kind of pixel. */
    public int getType() { return TYPE_INT_ARGB; }

    public ColorModel getColorModel() { return ColorModel.RGBA; }

    /** java.awt.Image's form, which takes an observer nobody needs here. */
    public int getWidth(Object observer)  { return getWidth(); }
    public int getHeight(Object observer) { return getHeight(); }

    /** Lets go of what was held for reading; the browser collects a canvas like anything else. */
    public void flush() { letGo(); }

    static final class Native {
        private Native() { }

        /**
         * Reads a rectangle of a picture into {@code out} as packed ARGB.
         * False when the browser would not give it (a picture from another
         * site loaded without its permission, a broken one): the rectangle
         * is then all zeros.
         *
         * <p>A canvas is read where it is. A decoded image has no pixels to
         * ask for: the rectangle is drawn onto a canvas kept for that
         * (in memory, {@code willReadFrequently}) and read there. A picture
         * the browser will not let be read spoils that canvas for good, so
         * it is thrown away with the failure.
         */
        @org.teavm.jso.JSBody(params = { "src", "isCanvas", "x", "y", "w", "h", "out", "off", "scan" }, script =
                "var i, j;"
              + "try {"
              + "  var ctx, ox = x, oy = y;"
              + "  if (isCanvas) {"
              + "    ctx = src.getContext('2d');"
              + "  } else {"
              + "    var s = globalThis.__ankReadCanvas;"
              + "    if (!s) {"
              + "      s = globalThis.__ankReadCanvas = document.createElement('canvas');"
              + "      s.width = Math.max(w, 64); s.height = Math.max(h, 64);"
              + "    } else if (s.width < w || s.height < h) {"
              + "      s.width = Math.max(s.width, w); s.height = Math.max(s.height, h);"
              + "    }"
              + "    ctx = s.getContext('2d', { willReadFrequently: true });"
              + "    ctx.imageSmoothingEnabled = false;"
              + "    ctx.clearRect(0, 0, w, h);"
              + "    ctx.drawImage(src, x, y, w, h, 0, 0, w, h);"
              + "    ox = 0; oy = 0;"
              + "  }"
              + "  var d = ctx.getImageData(ox, oy, w, h).data;"
              + "  for (j = 0; j < h; j++) {"
              + "    var row = off + j * scan, p = j * w * 4;"
              + "    for (i = 0; i < w; i++, p += 4) {"
              + "      out[row + i] = (d[p+3] << 24) | (d[p] << 16) | (d[p+1] << 8) | d[p+2];"
              + "    }"
              + "  }"
              + "  return true;"
              + "} catch (e) {"
              + "  if (!isCanvas) globalThis.__ankReadCanvas = null;"
              + "  for (j = 0; j < h; j++) for (i = 0; i < w; i++) out[off + j * scan + i] = 0;"
              + "  return false;"
              + "}")
        static native boolean read(CanvasImageSource src, boolean isCanvas, int x, int y, int w, int h,
                                   @org.teavm.jso.JSByRef int[] out, int off, int scan);

        @org.teavm.jso.JSFunctor
        interface Written extends org.teavm.jso.JSObject { void written(); }

        /**
         * Has a canvas say so whenever something is drawn into it: every call
         * of its context that changes pixels goes through {@code written}
         * first. Whatever draws — a Graphics2D kept from long ago, a pixel
         * write, a runtime class of tomorrow — nothing held for reading can
         * go stale unnoticed. Put on a canvas only once its pixels are held.
         */
        @org.teavm.jso.JSBody(params = { "c", "written" }, script =
                "var ctx = c.getContext('2d');"
              + "['clearRect','fillRect','strokeRect','fill','stroke','fillText','strokeText',"
              + " 'drawImage','putImageData'].forEach(function(n) {"
              + "  var f = ctx[n];"
              + "  ctx[n] = function() { written(); return f.apply(ctx, arguments); };"
              + "});")
        static native void watch(HTMLCanvasElement c, Written written);

        @org.teavm.jso.JSBody(params = { "c", "x", "y", "rgb" }, script =
                "var ctx = c.getContext('2d');"
              + "var d = ctx.createImageData(1, 1);"
              + "d.data[0] = (rgb >> 16) & 255; d.data[1] = (rgb >> 8) & 255;"
              + "d.data[2] = rgb & 255;         d.data[3] = (rgb >>> 24) & 255;"
              + "ctx.putImageData(d, x, y);")
        static native void setPixel(HTMLCanvasElement c, int x, int y, int rgb);

        @org.teavm.jso.JSBody(params = { "c", "x", "y", "w", "h", "rgb", "off", "scan" }, script =
                "var ctx = c.getContext('2d');"
              + "var d = ctx.createImageData(w, h);"
              + "var px = d.data;"
              + "for (var j = 0; j < h; j++) {"
              + "  for (var i = 0; i < w; i++) {"
              + "    var v = rgb[off + j * scan + i], s = (j * w + i) * 4;"
              + "    px[s] = (v >> 16) & 255; px[s+1] = (v >> 8) & 255;"
              + "    px[s+2] = v & 255;       px[s+3] = (v >>> 24) & 255;"
              + "  }"
              + "}"
              + "ctx.putImageData(d, x, y);")
        static native void setPixels(HTMLCanvasElement c, int x, int y, int w, int h,
                                     @org.teavm.jso.JSByRef int[] rgb, int off, int scan);

        @org.teavm.jso.JSBody(params = { "c", "img", "x", "y", "w", "h" }, script =
                "try { c.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h); } catch (e) { }")
        static native void copyRegion(HTMLCanvasElement c, CanvasImageSource img,
                                      int x, int y, int w, int h);
    }
}
