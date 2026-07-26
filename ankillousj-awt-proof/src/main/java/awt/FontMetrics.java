package awt;

/** Backed by Canvas2D measureText. */
public class FontMetrics {
    private final Graphics2D g;
    private final Font font;

    FontMetrics(Graphics2D g, Font font) { this.g = g; this.font = font; }

    public int stringWidth(String s) {
        if (s == null || s.isEmpty()) return 0;
        return (int) Math.ceil(g.measureTextWidth(s));
    }

    public int charWidth(char c) { return stringWidth(String.valueOf(c)); }

    public int getHeight()  { return (int) Math.ceil(font.getSize() * 1.2); }
    public int getAscent()  { return (int) Math.ceil(font.getSize() * 0.8); }
    public int getDescent() { return (int) Math.ceil(font.getSize() * 0.2); }
    public Font getFont()   { return font; }
}
