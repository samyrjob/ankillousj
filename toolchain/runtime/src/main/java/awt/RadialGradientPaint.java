package awt;

import awt.geom.Point2D;

/**
 * java.awt.RadialGradientPaint: colours along the radius of a circle, which
 * is Canvas2D's {@code createRadialGradient}. Beyond the radius the last
 * colour goes on, as the JDK's default (NO_CYCLE) does.
 */
public class RadialGradientPaint implements Paint {
    public final float cx, cy, radius;
    public final float fx, fy;
    private final float[] fractions;
    private final Color[] colors;

    public RadialGradientPaint(float cx, float cy, float radius, float[] fractions, Color[] colors) {
        this(cx, cy, radius, cx, cy, fractions, colors);
    }

    public RadialGradientPaint(Point2D center, float radius, float[] fractions, Color[] colors) {
        this((float) center.getX(), (float) center.getY(), radius, fractions, colors);
    }

    /** With a focus point other than the centre: where the first colour sits. */
    public RadialGradientPaint(float cx, float cy, float radius, float fx, float fy,
                               float[] fractions, Color[] colors) {
        if (fractions == null || colors == null) throw new NullPointerException("fractions and colors");
        if (fractions.length != colors.length) {
            throw new IllegalArgumentException("Colors and fractions must have equal size");
        }
        if (radius <= 0) throw new IllegalArgumentException("Radius must be greater than zero");
        this.cx = cx; this.cy = cy; this.radius = radius;
        this.fx = fx; this.fy = fy;
        this.fractions = fractions.clone();
        this.colors = colors.clone();
    }

    public Point2D getCenterPoint() { return new Point2D.Float(cx, cy); }
    public Point2D getFocusPoint()  { return new Point2D.Float(fx, fy); }
    public float getRadius()        { return radius; }
    public float[] getFractions()   { return fractions.clone(); }
    public Color[] getColors()      { return colors.clone(); }

    int stops()            { return fractions.length; }
    float fraction(int i)  { return fractions[i]; }
    Color color(int i)     { return colors[i]; }
}
