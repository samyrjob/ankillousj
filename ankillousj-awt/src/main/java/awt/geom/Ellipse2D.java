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
        @Override public double x() { return x; }
        @Override public double y() { return y; }
        @Override public double w() { return width; }
        @Override public double h() { return height; }
    }

    public static class Float extends Ellipse2D {
        public float x, y, width, height;
        public Float() { }
        public Float(float x, float y, float w, float h) { this.x=x; this.y=y; this.width=w; this.height=h; }
        @Override public double x() { return x; }
        @Override public double y() { return y; }
        @Override public double w() { return width; }
        @Override public double h() { return height; }
    }
}
