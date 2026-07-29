package awt.geom;

import awt.Shape;
import awt.Graphics2D;

public abstract class RoundRectangle2D implements Shape {
    public abstract double x();
    public abstract double y();
    public abstract double w();
    public abstract double h();
    public abstract double arcW();
    public abstract double arcH();

    @Override public void trace(Graphics2D g2d) { emit(g2d.sink()); }

    /** AWT's arcwidth/archeight are the full arc size, so the radius is half. */
    @Override public void emit(PathSink p) {
        double x = x(), y = y(), w = w(), h = h();
        double r = Math.min(Math.min(arcW() / 2, arcH() / 2), Math.min(w / 2, h / 2));
        p.moveTo(x + r, y);
        p.lineTo(x + w - r, y);
        p.quadTo(x + w, y, x + w, y + r);
        p.lineTo(x + w, y + h - r);
        p.quadTo(x + w, y + h, x + w - r, y + h);
        p.lineTo(x + r, y + h);
        p.quadTo(x, y + h, x, y + h - r);
        p.lineTo(x, y + r);
        p.quadTo(x, y, x + r, y);
        p.closePath();
    }

    public static class Float extends RoundRectangle2D {
        public float x, y, width, height, arcwidth, archeight;
        public Float() { }
        public Float(float x, float y, float w, float h, float aw, float ah) {
            this.x=x; this.y=y; this.width=w; this.height=h; this.arcwidth=aw; this.archeight=ah;
        }
        @Override public double x() { return x; }
        @Override public double y() { return y; }
        @Override public double w() { return width; }
        @Override public double h() { return height; }
        @Override public double arcW() { return arcwidth; }
        @Override public double arcH() { return archeight; }
    }

    public static class Double extends RoundRectangle2D {
        public double x, y, width, height, arcwidth, archeight;
        public Double() { }
        public Double(double x, double y, double w, double h, double aw, double ah) {
            this.x=x; this.y=y; this.width=w; this.height=h; this.arcwidth=aw; this.archeight=ah;
        }
        @Override public double x() { return x; }
        @Override public double y() { return y; }
        @Override public double w() { return width; }
        @Override public double h() { return height; }
        @Override public double arcW() { return arcwidth; }
        @Override public double arcH() { return archeight; }
    }
}
