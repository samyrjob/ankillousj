package awt;

public class Font {
    public static final int PLAIN  = 0;
    public static final int BOLD   = 1;
    public static final int ITALIC = 2;

    private final String name;
    private final int style;
    private final int size;

    public Font(String name, int style, int size) {
        this.name = name; this.style = style; this.size = size;
    }

    public String getName() { return name; }
    public int getStyle()   { return style; }
    public int getSize()    { return size; }

    /** Canvas2D ctx.font string. */
    public String toCss() {
        StringBuilder sb = new StringBuilder();
        if ((style & ITALIC) != 0) sb.append("italic ");
        if ((style & BOLD)   != 0) sb.append("bold ");
        sb.append(size).append("px ").append(mapFamily(name));
        return sb.toString();
    }

    private static String mapFamily(String awtName) {
        if ("SansSerif".equals(awtName))  return "sans-serif";
        if ("Serif".equals(awtName))      return "serif";
        if ("Monospaced".equals(awtName)) return "monospace";
        if ("Dialog".equals(awtName))     return "sans-serif";
        return awtName;
    }
}
