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
    public static final int TYPE_INT_ARGB = 2;
    public static final int TYPE_INT_RGB  = 1;

    private final CanvasImageSource src;
    private final HTMLCanvasElement canvas;   // null when wrapping a loaded image
    private final int width, height;

    /** Blank offscreen surface you can draw into. */
    public BufferedImage(int w, int h, int type) {
        HTMLDocument doc = HTMLDocument.current();
        this.canvas = (HTMLCanvasElement) doc.createElement("canvas");
        this.canvas.setWidth(w);
        this.canvas.setHeight(h);
        this.src = this.canvas;
        this.width = w;
        this.height = h;
    }

    /** Wraps an already-decoded image element. */
    public BufferedImage(HTMLImageElement img) {
        this.canvas = null;
        this.src = img;
        this.width = img.getWidth();
        this.height = img.getHeight();
    }

    public int getWidth()  { return width; }
    public int getHeight() { return height; }

    public CanvasImageSource source() { return src; }

    public Graphics2D createGraphics() {
        if (canvas == null) throw new IllegalStateException("image is read-only");
        return new Graphics2D((CanvasRenderingContext2D) canvas.getContext("2d"));
    }

    public Graphics2D getGraphics() { return createGraphics(); }
}
