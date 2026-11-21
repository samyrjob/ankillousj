package awt;

/** java.awt.BasicStroke: width, cap, join, miter limit and dashes, all of which Canvas2D has. */
public class BasicStroke implements Stroke {
    public static final int CAP_BUTT   = 0;
    public static final int CAP_ROUND  = 1;
    public static final int CAP_SQUARE = 2;
    public static final int JOIN_MITER = 0;
    public static final int JOIN_ROUND = 1;
    public static final int JOIN_BEVEL = 2;

    private final float width;
    private final int cap, join;
    private final float miterLimit;
    private final float[] dash;
    private final float dashPhase;

    public BasicStroke()        { this(1f, CAP_SQUARE, JOIN_MITER, 10f, null, 0f); }
    public BasicStroke(float w) { this(w, CAP_SQUARE, JOIN_MITER, 10f, null, 0f); }
    public BasicStroke(float w, int cap, int join) { this(w, cap, join, 10f, null, 0f); }
    public BasicStroke(float w, int cap, int join, float miterLimit) { this(w, cap, join, miterLimit, null, 0f); }

    /** The dashed form: {@code dash} is lengths of ink and gap in turn, {@code dashPhase} where in it the line starts. */
    public BasicStroke(float w, int cap, int join, float miterLimit, float[] dash, float dashPhase) {
        this.width = w;
        this.cap = cap;
        this.join = join;
        this.miterLimit = miterLimit;
        this.dash = dash == null ? null : dash.clone();
        this.dashPhase = dashPhase;
    }

    public float getLineWidth()   { return width; }
    public int getEndCap()        { return cap; }
    public int getLineJoin()      { return join; }
    public float getMiterLimit()  { return miterLimit; }
    public float[] getDashArray() { return dash == null ? null : dash.clone(); }
    public float getDashPhase()   { return dashPhase; }

    public String capCss()  { return cap == CAP_ROUND ? "round" : cap == CAP_SQUARE ? "square" : "butt"; }
    public String joinCss() { return join == JOIN_ROUND ? "round" : join == JOIN_BEVEL ? "bevel" : "miter"; }
}
