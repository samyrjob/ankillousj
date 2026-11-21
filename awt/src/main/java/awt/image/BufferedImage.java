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

    /**
     * Reads one pixel as packed 0xAARRGGBB.
     *
     * <p>Canvas cannot read pixels from an {@code <img>} element directly, so
     * the image is copied into an offscreen canvas the first time this is
     * called and cached. Subsequent reads hit the cache.
     *
     * <p><b>Tainted canvases.</b> If the image came from another origin
     * without CORS headers, the browser refuses the read and this returns 0.
     * Serve game assets from the same origin, or with
     * {@code Access-Control-Allow-Origin}.
     */
    public int getRGB(int x, int y) {
        return Native.pixel(pixelSource(), x, y);
    }

    /** The bulk form: reads a rectangle into {@code out}, row by row. */
    public int[] getRGB(int startX, int startY, int w, int h,
                        int[] out, int offset, int scansize) {
        int[] result = out != null ? out : new int[w * h];
        Native.pixels(pixelSource(), startX, startY, w, h, result, offset, scansize);
        return result;
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

    /** Nothing to release: the browser collects a canvas like anything else. */
    public void flush() { }

    /** An offscreen canvas holding this image's pixels, created on demand. */
    private HTMLCanvasElement pixelCache;

    private HTMLCanvasElement pixelSource() {
        if (canvas != null) return canvas;
        if (pixelCache == null) {
            HTMLDocument doc = HTMLDocument.current();
            HTMLCanvasElement copy = (HTMLCanvasElement) doc.createElement("canvas");
            copy.setWidth(getWidth());
            copy.setHeight(getHeight());
            // Asked before the picture has arrived: there is nothing to copy yet. The empty
            // answer is not kept, or the picture would read as blank for good.
            if (getWidth() <= 0 || getHeight() <= 0) return copy;
            Native.blit(copy, src);
            pixelCache = copy;
        }
        return pixelCache;
    }

    static final class Native {
        private Native() { }

        @org.teavm.jso.JSBody(params = { "c", "img" }, script =
                "c.getContext('2d').drawImage(img, 0, 0);")
        static native void blit(HTMLCanvasElement c, CanvasImageSource img);

        @org.teavm.jso.JSBody(params = { "c", "x", "y" }, script =
                "try {"
              + "  var d = c.getContext('2d').getImageData(x, y, 1, 1).data;"
              + "  return (d[3] << 24) | (d[0] << 16) | (d[1] << 8) | d[2];"
              + "} catch (e) { return 0; }")   // tainted canvas
        static native int pixel(HTMLCanvasElement c, int x, int y);

        @org.teavm.jso.JSBody(params = { "c", "x", "y", "w", "h", "out", "off", "scan" }, script =
                "try {"
              + "  var d = c.getContext('2d').getImageData(x, y, w, h).data;"
              + "  for (var j = 0; j < h; j++) {"
              + "    for (var i = 0; i < w; i++) {"
              + "      var s = (j * w + i) * 4;"
              + "      out[off + j * scan + i] ="
              + "        (d[s+3] << 24) | (d[s] << 16) | (d[s+1] << 8) | d[s+2];"
              + "    }"
              + "  }"
              + "} catch (e) { }")
        static native void pixels(HTMLCanvasElement c, int x, int y, int w, int h,
                                  int[] out, int off, int scan);

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
                                     int[] rgb, int off, int scan);

        @org.teavm.jso.JSBody(params = { "c", "img", "x", "y", "w", "h" }, script =
                "try { c.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h); } catch (e) { }")
        static native void copyRegion(HTMLCanvasElement c, CanvasImageSource img,
                                      int x, int y, int w, int h);
    }
}
