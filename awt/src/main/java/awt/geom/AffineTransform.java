package awt.geom;

import awt.Shape;

/**
 * java.awt.geom.AffineTransform.
 *
 * A value type holding the six matrix entries:
 * <pre>
 *   [ m00 m01 m02 ]      x' = m00*x + m01*y + m02
 *   [ m10 m11 m12 ]      y' = m10*x + m11*y + m12
 * </pre>
 * Applying one to a Graphics2D goes through {@code g2d.transform(...)} or
 * {@code g2d.setTransform(...)}, which push it onto the canvas.
 */
public class AffineTransform {

    private double m00 = 1, m10, m01, m11 = 1, m02, m12;

    public AffineTransform() { }

    public AffineTransform(double m00, double m10, double m01,
                           double m11, double m02, double m12) {
        this.m00 = m00; this.m10 = m10; this.m01 = m01;
        this.m11 = m11; this.m02 = m02; this.m12 = m12;
    }

    public AffineTransform(AffineTransform t) {
        this(t.m00, t.m10, t.m01, t.m11, t.m02, t.m12);
    }

    // ── Factories ─────────────────────────────────────────────────────

    public static AffineTransform getTranslateInstance(double tx, double ty) {
        return new AffineTransform(1, 0, 0, 1, tx, ty);
    }

    public static AffineTransform getScaleInstance(double sx, double sy) {
        return new AffineTransform(sx, 0, 0, sy, 0, 0);
    }

    public static AffineTransform getRotateInstance(double theta) {
        double c = Math.cos(theta), s = Math.sin(theta);
        return new AffineTransform(c, s, -s, c, 0, 0);
    }

    /** A rotation about the point (x, y). */
    public static AffineTransform getRotateInstance(double theta, double x, double y) {
        AffineTransform t = getTranslateInstance(x, y);
        t.concatenate(getRotateInstance(theta));
        t.concatenate(getTranslateInstance(-x, -y));
        return t;
    }

    public static AffineTransform getShearInstance(double shx, double shy) {
        return new AffineTransform(1, shy, shx, 1, 0, 0);
    }

    // ── Mutators (each appends: this = this * op, as in the JDK) ───────

    public void translate(double tx, double ty) { concatenate(getTranslateInstance(tx, ty)); }
    public void scale(double sx, double sy)     { concatenate(getScaleInstance(sx, sy)); }
    public void rotate(double theta)            { concatenate(getRotateInstance(theta)); }
    public void rotate(double theta, double x, double y) { concatenate(getRotateInstance(theta, x, y)); }
    public void shear(double shx, double shy)   { concatenate(getShearInstance(shx, shy)); }

    public void setToIdentity() {
        m00 = 1; m10 = 0; m01 = 0; m11 = 1; m02 = 0; m12 = 0;
    }

    public void setToTranslation(double tx, double ty) { setTransform(1, 0, 0, 1, tx, ty); }
    public void setToScale(double sx, double sy)       { setTransform(sx, 0, 0, sy, 0, 0); }
    public void setToRotation(double theta)            { setTransform(getRotateInstance(theta)); }

    public void setTransform(AffineTransform t) {
        setTransform(t.m00, t.m10, t.m01, t.m11, t.m02, t.m12);
    }

    public void setTransform(double m00, double m10, double m01,
                             double m11, double m02, double m12) {
        this.m00 = m00; this.m10 = m10; this.m01 = m01;
        this.m11 = m11; this.m02 = m02; this.m12 = m12;
    }

    /** this = this * t: {@code t} is applied to a point first, then this. */
    public void concatenate(AffineTransform t) {
        double n00 = m00 * t.m00 + m01 * t.m10;
        double n10 = m10 * t.m00 + m11 * t.m10;
        double n01 = m00 * t.m01 + m01 * t.m11;
        double n11 = m10 * t.m01 + m11 * t.m11;
        double n02 = m00 * t.m02 + m01 * t.m12 + m02;
        double n12 = m10 * t.m02 + m11 * t.m12 + m12;
        m00 = n00; m10 = n10; m01 = n01; m11 = n11; m02 = n02; m12 = n12;
    }

    /** The name this method had before {@link #concatenate}; kept for callers. */
    public void concat(AffineTransform t) { concatenate(t); }

    /** this = t * this: this is applied to a point first, then {@code t}. */
    public void preConcatenate(AffineTransform t) {
        AffineTransform r = new AffineTransform(t);
        r.concatenate(this);
        setTransform(r);
    }

    // ── Reading ───────────────────────────────────────────────────────

    public double getScaleX()     { return m00; }
    public double getScaleY()     { return m11; }
    public double getShearX()     { return m01; }
    public double getShearY()     { return m10; }
    public double getTranslateX() { return m02; }
    public double getTranslateY() { return m12; }

    /** In the JDK's order: m00, m10, m01, m11, m02, m12. Also Canvas2D's a, b, c, d, e, f. */
    public void getMatrix(double[] out) {
        out[0] = m00; out[1] = m10; out[2] = m01;
        out[3] = m11;
        if (out.length > 5) { out[4] = m02; out[5] = m12; }
    }

    public double getDeterminant() { return m00 * m11 - m01 * m10; }

    public boolean isIdentity() {
        return m00 == 1 && m11 == 1 && m01 == 0 && m10 == 0 && m02 == 0 && m12 == 0;
    }

    public AffineTransform createInverse() throws NoninvertibleTransformException {
        double det = getDeterminant();
        if (Math.abs(det) <= java.lang.Double.MIN_VALUE) {
            throw new NoninvertibleTransformException("Determinant is " + det);
        }
        return new AffineTransform(
                 m11 / det, -m10 / det,
                -m01 / det,  m00 / det,
                (m01 * m12 - m11 * m02) / det,
                (m10 * m02 - m00 * m12) / det);
    }

    public void invert() throws NoninvertibleTransformException { setTransform(createInverse()); }

    // ── Applying to points and shapes ─────────────────────────────────

    public Point2D transform(Point2D src, Point2D dst) {
        if (dst == null) dst = new Point2D.Double();
        double x = src.getX(), y = src.getY();
        dst.setLocation(x * m00 + y * m01 + m02, x * m10 + y * m11 + m12);
        return dst;
    }

    public void transform(double[] src, int srcOff, double[] dst, int dstOff, int numPts) {
        for (int i = 0; i < numPts; i++) {
            double x = src[srcOff + 2 * i], y = src[srcOff + 2 * i + 1];
            dst[dstOff + 2 * i]     = x * m00 + y * m01 + m02;
            dst[dstOff + 2 * i + 1] = x * m10 + y * m11 + m12;
        }
    }

    public void transform(float[] src, int srcOff, float[] dst, int dstOff, int numPts) {
        for (int i = 0; i < numPts; i++) {
            double x = src[srcOff + 2 * i], y = src[srcOff + 2 * i + 1];
            dst[dstOff + 2 * i]     = (float) (x * m00 + y * m01 + m02);
            dst[dstOff + 2 * i + 1] = (float) (x * m10 + y * m11 + m12);
        }
    }

    /** As {@link #transform(Point2D, Point2D)}, without the translation. */
    public Point2D deltaTransform(Point2D src, Point2D dst) {
        if (dst == null) dst = new Point2D.Double();
        double x = src.getX(), y = src.getY();
        dst.setLocation(x * m00 + y * m01, x * m10 + y * m11);
        return dst;
    }

    public Point2D inverseTransform(Point2D src, Point2D dst) throws NoninvertibleTransformException {
        return createInverse().transform(src, dst);
    }

    /** The shape as it is once this transform has moved every point of it. */
    public Shape createTransformedShape(Shape shape) {
        return shape == null ? null : new TransformedShape(shape, m00, m10, m01, m11, m02, m12);
    }

    // ── Value semantics ───────────────────────────────────────────────

    @Override public Object clone() { return new AffineTransform(this); }

    @Override public boolean equals(Object o) {
        if (!(o instanceof AffineTransform)) return false;
        AffineTransform t = (AffineTransform) o;
        return m00 == t.m00 && m10 == t.m10 && m01 == t.m01
            && m11 == t.m11 && m02 == t.m02 && m12 == t.m12;
    }

    @Override public int hashCode() {
        long bits = java.lang.Double.doubleToLongBits(m00);
        bits = bits * 31 + java.lang.Double.doubleToLongBits(m10);
        bits = bits * 31 + java.lang.Double.doubleToLongBits(m01);
        bits = bits * 31 + java.lang.Double.doubleToLongBits(m11);
        bits = bits * 31 + java.lang.Double.doubleToLongBits(m02);
        bits = bits * 31 + java.lang.Double.doubleToLongBits(m12);
        return (int) (bits ^ (bits >>> 32));
    }

    @Override public String toString() {
        return "AffineTransform[[" + m00 + ", " + m01 + ", " + m02 + "], ["
                + m10 + ", " + m11 + ", " + m12 + "]]";
    }
}
