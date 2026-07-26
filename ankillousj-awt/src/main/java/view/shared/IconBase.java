package view.shared;

import awt.Graphics2D;
import awt.RenderingHints;
import awt.image.BufferedImage;
import java.util.function.Consumer;

/**
 * Shared plumbing for the Futura UI icons (search, chat, group, bag, room).
 *
 * <p>The icons are drawn as VECTORS in a 64x64 design space, with antialiasing,
 * then scaled to whatever size the caller needs. This is why they look smooth:
 * a vector is re-rasterised at the target size, so there is no pixel grid to
 * enlarge and no staircase edges — unlike the earlier pixel-art sprites, which
 * were fine as retro art but read as "jaggy" inside these clean panels.
 *
 * <p>Palette is shared so every icon is unmistakably the same family.
 */
public final class IconBase {

    private IconBase() {}

    /** The design space every icon paints into. */
    public static final double CANVAS = 64.0;

    // Futura palette
    public static final awt.Color OUTLINE   = new awt.Color(0x12, 0x18, 0x38);  // deep navy edge
    public static final awt.Color GOLD      = new awt.Color(0xF5, 0xA6, 0x23);  // Theme.GOLD
    public static final awt.Color GOLD_DARK = new awt.Color(0xC8, 0x82, 0x12);  // shading
    public static final awt.Color FILL      = new awt.Color(0x23, 0x2B, 0x4A);  // dark interior
    public static final awt.Color GLINT     = new awt.Color(0xB9, 0xBE, 0xDC);  // lavender highlight

    /**
     * Render {@code painter} (which draws in the 64x64 design space) at
     * (x, y) scaled to {@code size}, with smoothing on. The caller's
     * Graphics2D is never mutated — we work on a scratch copy.
     */
    public static void paint(Graphics2D g, int x, int y, int size, Consumer<Graphics2D> painter) {
        Graphics2D g2 = (Graphics2D) g.create();
        try {
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING,
                    RenderingHints.VALUE_ANTIALIAS_ON);
            g2.setRenderingHint(RenderingHints.KEY_STROKE_CONTROL,
                    RenderingHints.VALUE_STROKE_PURE);
            g2.setRenderingHint(RenderingHints.KEY_RENDERING,
                    RenderingHints.VALUE_RENDER_QUALITY);
            g2.translate(x, y);
            g2.scale(size / CANVAS, size / CANVAS);
            painter.accept(g2);
        } finally {
            g2.dispose();
        }
    }

}
