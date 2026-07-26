package awt.geom;

import awt.Shape;
import awt.Graphics2D;

/** Arc flattened to line segments — enough for the icon work, and reverses cleanly. */
public abstract class Arc2D implements Shape {
    public static final int OPEN = 0;
    public static final int CHORD = 1;
    public static final int PIE = 2;

    public abstract double x();
    public abstract double y();
    public abstract double w();
    public abstract double h();
    public abstract double start();
    public abstract double extent();
    public abstract int type();

    @Override public void trace(Graphics2D g2d) { emit(g2d.sink()); }

    @Override public void emit(PathSink p) {
        double rx = w() / 2, ry = h() / 2;
        double cx = x() + rx, cy = y() + ry;
        int steps = Math.max(8, (int) Math.abs(extent() / 4));
        // AWT angles: degrees, counter-clockwise, y up. Canvas: y down.
        for (int i = 0; i <= steps; i++) {
            double deg = start() + extent() * i / steps;
            double rad = Math.toRadians(deg);
            double px = cx + Math.cos(rad) * rx;
            double py = cy - Math.sin(rad) * ry;
            if (i == 0) p.moveTo(px, py); else p.lineTo(px, py);
        }
        if (type() == PIE) { p.lineTo(cx, cy); p.closePath(); }
        else if (type() == CHORD) p.closePath();
    }

    public static class Double extends Arc2D {
        public double x, y, width, height, start, extent;
        public int arcType;
        public Double(double x, double y, double w, double h, double st, double ex, int t) {
            this.x=x; this.y=y; this.width=w; this.height=h; this.start=st; this.extent=ex; this.arcType=t;
        }
        @Override public double x() { return x; }
        @Override public double y() { return y; }
        @Override public double w() { return width; }
        @Override public double h() { return height; }
        @Override public double start()  { return start; }
        @Override public double extent() { return extent; }
        @Override public int type() { return arcType; }
    }
}
