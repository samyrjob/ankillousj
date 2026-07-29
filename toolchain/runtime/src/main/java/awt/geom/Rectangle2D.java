package awt.geom;

import awt.Shape;
import awt.Graphics2D;

public abstract class Rectangle2D implements Shape {
    public abstract double x();
    public abstract double y();
    public abstract double w();
    public abstract double h();

    @Override public void trace(Graphics2D g2d) { emit(g2d.sink()); }

    @Override public void emit(PathSink p) {
        p.moveTo(x(), y());
        p.lineTo(x() + w(), y());
        p.lineTo(x() + w(), y() + h());
        p.lineTo(x(), y() + h());
        p.closePath();
    }

    public static class Double extends Rectangle2D {
        public double x, y, width, height;
        public Double() { }
        public Double(double x, double y, double w, double h) { this.x=x; this.y=y; this.width=w; this.height=h; }
        @Override public double x() { return x; }
        @Override public double y() { return y; }
        @Override public double w() { return width; }
        @Override public double h() { return height; }
    }

    public static class Float extends Rectangle2D {
        public float x, y, width, height;
        public Float() { }
        public Float(float x, float y, float w, float h) { this.x=x; this.y=y; this.width=w; this.height=h; }
        @Override public double x() { return x; }
        @Override public double y() { return y; }
        @Override public double w() { return width; }
        @Override public double h() { return height; }
    }
}
