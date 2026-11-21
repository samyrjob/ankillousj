package awt;

/**
 * java.awt.AlphaComposite: the Porter-Duff rules, with an extra alpha.
 *
 * Canvas2D has the same rules under {@code globalCompositeOperation}; see
 * {@link #cssOperation()}. Two differ in what they touch: on a canvas
 * "source-in", "source-out", "destination-in", "destination-atop" and "copy"
 * also clear what lies outside the drawn shape, where Java2D only touches the
 * shape's own pixels. {@code CLEAR} and {@code SRC} are given exactly by
 * Graphics2D for rectangles and images, the cases that matter.
 */
public class AlphaComposite implements Composite {
    public static final int CLEAR    = 1;
    public static final int SRC      = 2;
    public static final int SRC_OVER = 3;
    public static final int DST_OVER = 4;
    public static final int SRC_IN   = 5;
    public static final int DST_IN   = 6;
    public static final int SRC_OUT  = 7;
    public static final int DST_OUT  = 8;
    public static final int DST      = 9;
    public static final int SRC_ATOP = 10;
    public static final int DST_ATOP = 11;
    public static final int XOR      = 12;

    public static final AlphaComposite Clear   = new AlphaComposite(CLEAR, 1f);
    public static final AlphaComposite Src     = new AlphaComposite(SRC, 1f);
    public static final AlphaComposite Dst     = new AlphaComposite(DST, 1f);
    public static final AlphaComposite SrcOver = new AlphaComposite(SRC_OVER, 1f);
    public static final AlphaComposite DstOver = new AlphaComposite(DST_OVER, 1f);
    public static final AlphaComposite SrcIn   = new AlphaComposite(SRC_IN, 1f);
    public static final AlphaComposite DstIn   = new AlphaComposite(DST_IN, 1f);
    public static final AlphaComposite SrcOut  = new AlphaComposite(SRC_OUT, 1f);
    public static final AlphaComposite DstOut  = new AlphaComposite(DST_OUT, 1f);
    public static final AlphaComposite SrcAtop = new AlphaComposite(SRC_ATOP, 1f);
    public static final AlphaComposite DstAtop = new AlphaComposite(DST_ATOP, 1f);
    public static final AlphaComposite Xor     = new AlphaComposite(XOR, 1f);

    private final int rule;
    private final float alpha;

    private AlphaComposite(int rule, float alpha) {
        if (rule < CLEAR || rule > XOR) throw new IllegalArgumentException("unknown composite rule");
        // The JDK refuses an alpha outside 0..1. Float arithmetic is not bit for bit the same in a
        // browser, and a refusal here would cost the rest of the frame: it is brought back into range.
        this.rule = rule;
        this.alpha = alpha != alpha ? 1f : Math.max(0f, Math.min(1f, alpha));
    }

    public static AlphaComposite getInstance(int rule, float alpha) { return new AlphaComposite(rule, alpha); }
    public static AlphaComposite getInstance(int rule)              { return new AlphaComposite(rule, 1f); }

    /** The same rule with another alpha. */
    public AlphaComposite derive(float alpha) { return new AlphaComposite(rule, alpha); }

    /** Another rule with the same alpha. */
    public AlphaComposite derive(int rule) { return new AlphaComposite(rule, alpha); }

    @Override public float getAlpha() { return alpha; }
    public int getRule() { return rule; }

    /** The Canvas2D {@code globalCompositeOperation} of this rule. */
    public String cssOperation() {
        switch (rule) {
            case CLEAR:    return "destination-out";   // with an opaque source: nothing is left
            case SRC:      return "source-over";       // Graphics2D clears first where it can
            case DST:      return "destination-over";  // drawn under everything: only shows through holes
            case DST_OVER: return "destination-over";
            case SRC_IN:   return "source-in";
            case DST_IN:   return "destination-in";
            case SRC_OUT:  return "source-out";
            case DST_OUT:  return "destination-out";
            case SRC_ATOP: return "source-atop";
            case DST_ATOP: return "destination-atop";
            case XOR:      return "xor";
            default:       return "source-over";
        }
    }

    @Override public boolean equals(Object o) {
        return o instanceof AlphaComposite && ((AlphaComposite) o).rule == rule
                && ((AlphaComposite) o).alpha == alpha;
    }

    @Override public int hashCode() { return Float.floatToIntBits(alpha) * 31 + rule; }
}
