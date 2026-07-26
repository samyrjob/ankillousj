package awt;

public class BasicStroke implements Stroke {
    public static final int CAP_BUTT   = 0;
    public static final int CAP_ROUND  = 1;
    public static final int CAP_SQUARE = 2;
    public static final int JOIN_MITER = 0;
    public static final int JOIN_ROUND = 1;
    public static final int JOIN_BEVEL = 2;

    private final float width;
    private final int cap, join;

    public BasicStroke()        { this(1f, CAP_SQUARE, JOIN_MITER); }
    public BasicStroke(float w) { this(w, CAP_SQUARE, JOIN_MITER); }
    public BasicStroke(float w, int cap, int join) { this.width=w; this.cap=cap; this.join=join; }

    public float getLineWidth() { return width; }
    public String capCss()  { return cap == CAP_ROUND ? "round" : cap == CAP_SQUARE ? "square" : "butt"; }
    public String joinCss() { return join == JOIN_ROUND ? "round" : join == JOIN_BEVEL ? "bevel" : "miter"; }
}
