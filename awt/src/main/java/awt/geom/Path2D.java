package awt.geom;

import awt.Shape;
import awt.Graphics2D;

/** Freeform path. Records its own segments so it can be replayed either way. */
public abstract class Path2D implements Shape {
    protected final PathSink.Recording rec = new PathSink.Recording();

    public void moveTo(double x, double y)  { rec.moveTo(x, y); }
    public void lineTo(double x, double y)  { rec.lineTo(x, y); }
    public void quadTo(double cx, double cy, double x, double y) { rec.quadTo(cx, cy, x, y); }
    public void curveTo(double c1x, double c1y, double c2x, double c2y, double x, double y) {
        rec.curveTo(c1x, c1y, c2x, c2y, x, y);
    }
    public void closePath() { rec.closePath(); }

    public void append(Shape s, boolean connect) { s.emit(rec); }

    @Override public void trace(Graphics2D g2d) { emit(g2d.sink()); }
    @Override public void emit(PathSink p) { rec.replay(p); }

    public static class Double extends Path2D {
        public Double() { }
    }
    public static class Float extends Path2D {
        public Float() { }
    }
}
