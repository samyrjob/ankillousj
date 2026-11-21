package awt;

/** Backed by Canvas2D measureText, in this metrics' own font whatever the graphics is set to. */
public class FontMetrics {
    private final Graphics2D g;
    private final Font font;

    FontMetrics(Graphics2D g, Font font) { this.g = g; this.font = font; }

    public int stringWidth(String s) {
        if (s == null || s.isEmpty()) return 0;
        return (int) Math.ceil(g.measureTextWidth(s, font));
    }

    public int charWidth(char c) { return stringWidth(String.valueOf(c)); }
    public int charWidth(int codePoint) { return stringWidth(new String(Character.toChars(codePoint))); }

    public int getHeight()  { return (int) Math.ceil(font.getSize() * 1.2); }
    public int getAscent()  { return (int) Math.ceil(font.getSize() * 0.8); }
    public int getDescent() { return (int) Math.ceil(font.getSize() * 0.2); }
    public int getLeading() { return Math.max(0, getHeight() - getAscent() - getDescent()); }
    public int getMaxAscent()  { return getAscent(); }
    public int getMaxDescent() { return getDescent(); }
    public int getMaxAdvance() { return stringWidth("W"); }
    public Font getFont()   { return font; }
}
