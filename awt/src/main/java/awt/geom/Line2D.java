package awt.geom;

import awt.Shape;
import awt.Graphics2D;

public abstract class Line2D implements Shape {
    public abstract double x1();
    public abstract double y1();
    public abstract double x2();
    public abstract double y2();

    @Override public void trace(Graphics2D g2d) { emit(g2d.sink()); }

    @Override public void emit(PathSink p) {
        p.moveTo(x1(), y1());
        p.lineTo(x2(), y2());
    }

    public static class Double extends Line2D {
        public double x1, y1, x2, y2;
        public Double() { }
        public Double(double x1, double y1, double x2, double y2) { this.x1=x1; this.y1=y1; this.x2=x2; this.y2=y2; }
        @Override public double x1() { return x1; }
        @Override public double y1() { return y1; }
        @Override public double x2() { return x2; }
        @Override public double y2() { return y2; }
    }

    public static class Float extends Line2D {
        public float x1, y1, x2, y2;
        public Float() { }
        public Float(float x1, float y1, float x2, float y2) { this.x1=x1; this.y1=y1; this.x2=x2; this.y2=y2; }
        @Override public double x1() { return x1; }
        @Override public double y1() { return y1; }
        @Override public double x2() { return x2; }
        @Override public double y2() { return y2; }
    }
}
