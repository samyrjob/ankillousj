package awt.geom;

import awt.Shape;
import awt.Graphics2D;

/** Ellipse traced as four cubic Béziers so it reverses like any other path. */
public abstract class Ellipse2D implements Shape {
    /** Magic constant for approximating a quarter circle with a cubic. */
    static final double K = 0.5522847498307936;

    public abstract double x();
    public abstract double y();
    public abstract double w();
    public abstract double h();

    /** Moves and sizes the shape: its box becomes (x, y, w, h). */
    public abstract void setFrame(double x, double y, double w, double h);

    public double getX()       { return x(); }
    public double getY()       { return y(); }
    public double getWidth()   { return w(); }
    public double getHeight()  { return h(); }
    public double getMinX()    { return x(); }
    public double getMinY()    { return y(); }
    public double getMaxX()    { return x() + w(); }
    public double getMaxY()    { return y() + h(); }
    public double getCenterX() { return x() + w() / 2; }
    public double getCenterY() { return y() + h() / 2; }
    public boolean isEmpty()   { return w() <= 0 || h() <= 0; }

    @Override public void trace(Graphics2D g2d) { emit(g2d.sink()); }

    @Override public void emit(PathSink p) {
        double rx = w() / 2, ry = h() / 2;
        double cx = x() + rx, cy = y() + ry;
        double ox = rx * K, oy = ry * K;
        p.moveTo(cx + rx, cy);
        p.curveTo(cx + rx, cy + oy, cx + ox, cy + ry, cx, cy + ry);
        p.curveTo(cx - ox, cy + ry, cx - rx, cy + oy, cx - rx, cy);
        p.curveTo(cx - rx, cy - oy, cx - ox, cy - ry, cx, cy - ry);
        p.curveTo(cx + ox, cy - ry, cx + rx, cy - oy, cx + rx, cy);
        p.closePath();
    }

    public static class Double extends Ellipse2D {
        public double x, y, width, height;
        public Double() { }
        public Double(double x, double y, double w, double h) { this.x=x; this.y=y; this.width=w; this.height=h; }
        @Override public void setFrame(double x, double y, double w, double h) { this.x=x; this.y=y; this.width=w; this.height=h; }
        @Override public double x() { return x; }
        @Override public double y() { return y; }
        @Override public double w() { return width; }
        @Override public double h() { return height; }
    }

    public static class Float extends Ellipse2D {
        public float x, y, width, height;
        public Float() { }
        public Float(float x, float y, float w, float h) { this.x=x; this.y=y; this.width=w; this.height=h; }
        @Override public void setFrame(double x, double y, double w, double h) {
            this.x=(float) x; this.y=(float) y; this.width=(float) w; this.height=(float) h;
        }
        @Override public double x() { return x; }
        @Override public double y() { return y; }
        @Override public double w() { return width; }
        @Override public double h() { return height; }
    }
}
