package awt;

public class AlphaComposite implements Composite {
    public static final int SRC_OVER = 3;
    public static final int SRC      = 2;

    private final int rule;
    private final float alpha;

    private AlphaComposite(int rule, float alpha) { this.rule = rule; this.alpha = alpha; }

    public static AlphaComposite getInstance(int rule, float alpha) { return new AlphaComposite(rule, alpha); }
    public static AlphaComposite getInstance(int rule)              { return new AlphaComposite(rule, 1f); }

    @Override public float getAlpha() { return alpha; }
    public int getRule() { return rule; }
}
