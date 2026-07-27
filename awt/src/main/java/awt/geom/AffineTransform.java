package awt.geom;

/**
 * java.awt.geom.AffineTransform.
 *
 * A value type holding the six matrix entries. Applying one to a Graphics2D
 * goes through {@code g2d.transform(...)}, which pushes it onto the canvas.
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

    public static AffineTransform getShearInstance(double shx, double shy) {
        return new AffineTransform(1, shy, shx, 1, 0, 0);
    }

    public void translate(double tx, double ty) { concat(getTranslateInstance(tx, ty)); }
    public void scale(double sx, double sy)     { concat(getScaleInstance(sx, sy)); }
    public void rotate(double theta)            { concat(getRotateInstance(theta)); }
    public void shear(double shx, double shy)   { concat(getShearInstance(shx, shy)); }

    public void setToIdentity() {
        m00 = 1; m10 = 0; m01 = 0; m11 = 1; m02 = 0; m12 = 0;
    }

    /** this = this * other */
    public void concat(AffineTransform t) {
        double n00 = m00 * t.m00 + m01 * t.m10;
        double n10 = m10 * t.m00 + m11 * t.m10;
        double n01 = m00 * t.m01 + m01 * t.m11;
        double n11 = m10 * t.m01 + m11 * t.m11;
        double n02 = m00 * t.m02 + m01 * t.m12 + m02;
        double n12 = m10 * t.m02 + m11 * t.m12 + m12;
        m00 = n00; m10 = n10; m01 = n01; m11 = n11; m02 = n02; m12 = n12;
    }

    public double getScaleX()     { return m00; }
    public double getScaleY()     { return m11; }
    public double getShearX()     { return m01; }
    public double getShearY()     { return m10; }
    public double getTranslateX() { return m02; }
    public double getTranslateY() { return m12; }

    public void getMatrix(double[] out) {
        out[0] = m00; out[1] = m10; out[2] = m01;
        out[3] = m11; out[4] = m02; out[5] = m12;
    }
}
