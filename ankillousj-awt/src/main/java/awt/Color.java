package awt;

public class Color implements Paint {
    public static final Color WHITE = new Color(255, 255, 255);
    public static final Color BLACK = new Color(0, 0, 0);

    private final int r, g, b, a;

    public Color(int r, int g, int b)        { this(r, g, b, 255); }
    public Color(int r, int g, int b, int a) { this.r=r; this.g=g; this.b=b; this.a=a; }

    public int getRed()   { return r; }
    public int getGreen() { return g; }
    public int getBlue()  { return b; }
    public int getAlpha() { return a; }

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
