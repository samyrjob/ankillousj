package awt;

public class Color implements Paint {
    public static final Color WHITE      = new Color(255, 255, 255);
    public static final Color BLACK      = new Color(0, 0, 0);
    public static final Color RED        = new Color(255, 0, 0);
    public static final Color GREEN      = new Color(0, 255, 0);
    public static final Color BLUE       = new Color(0, 0, 255);
    public static final Color YELLOW     = new Color(255, 255, 0);
    public static final Color CYAN       = new Color(0, 255, 255);
    public static final Color MAGENTA    = new Color(255, 0, 255);
    public static final Color ORANGE     = new Color(255, 200, 0);
    public static final Color PINK       = new Color(255, 175, 175);
    public static final Color GRAY       = new Color(128, 128, 128);
    public static final Color LIGHT_GRAY = new Color(192, 192, 192);
    public static final Color DARK_GRAY  = new Color(64, 64, 64);

    // Lower-case aliases, which java.awt.Color also defines
    public static final Color white = WHITE;
    public static final Color black = BLACK;
    public static final Color red = RED;
    public static final Color green = GREEN;
    public static final Color blue = BLUE;
    public static final Color yellow = YELLOW;
    public static final Color cyan = CYAN;
    public static final Color magenta = MAGENTA;
    public static final Color orange = ORANGE;
    public static final Color pink = PINK;
    public static final Color gray = GRAY;
    public static final Color lightGray = LIGHT_GRAY;
    public static final Color darkGray = DARK_GRAY;

    private final int r, g, b, a;

    public Color(int r, int g, int b)        { this(r, g, b, 255); }

    /** Packed 0xRRGGBB, as java.awt.Color(int) reads it. */
    public Color(int rgb) {
        this((rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff, 255);
    }

    public Color(int rgba, boolean hasAlpha) {
        this((rgba >> 16) & 0xff, (rgba >> 8) & 0xff, rgba & 0xff,
             hasAlpha ? (rgba >>> 24) & 0xff : 255);
    }

    public Color(float r, float g, float b) {
        this(Math.round(r * 255f), Math.round(g * 255f), Math.round(b * 255f), 255);
    }

    public Color(float r, float g, float b, float a) {
        this(Math.round(r * 255f), Math.round(g * 255f),
             Math.round(b * 255f), Math.round(a * 255f));
    }
    public Color(int r, int g, int b, int a) { this.r=r; this.g=g; this.b=b; this.a=a; }

    public int getRed()   { return r; }
    public int getGreen() { return g; }
    public int getBlue()  { return b; }
    public int getAlpha() { return a; }

    /** Packed 0xAARRGGBB, as java.awt.Color.getRGB() returns it. */
    public int getRGB() {
        return (a << 24) | (r << 16) | (g << 8) | b;
    }

    @Override public boolean equals(Object o) {
        if (!(o instanceof Color)) return false;
        Color c = (Color) o;
        return c.r == r && c.g == g && c.b == b && c.a == a;
    }

    @Override public int hashCode() { return getRGB(); }

    @Override public String toString() {
        return "Color[r=" + r + ",g=" + g + ",b=" + b + ",a=" + a + "]";
    }

    private static int clamp(int v) { return v < 0 ? 0 : (v > 255 ? 255 : v); }

    /** Mirrors awt.Color.brighter(). */
    public Color brighter() {
        int i = (int) (1.0 / (1.0 - 0.7));
        if (r == 0 && g == 0 && b == 0) return new Color(i, i, i, a);
        int nr = r, ng = g, nb = b;
        if (nr > 0 && nr < i) nr = i;
        if (ng > 0 && ng < i) ng = i;
        if (nb > 0 && nb < i) nb = i;
        return new Color(clamp((int)(nr/0.7)), clamp((int)(ng/0.7)), clamp((int)(nb/0.7)), a);
    }

    public Color darker() {
        return new Color(clamp((int)(r*0.7)), clamp((int)(g*0.7)), clamp((int)(b*0.7)), a);
    }

    /** CSS colour string for Canvas2D. */
    public String toCss() {
        if (a == 255) return "rgb(" + r + "," + g + "," + b + ")";
        return "rgba(" + r + "," + g + "," + b + "," + (a / 255.0) + ")";
    }
}
