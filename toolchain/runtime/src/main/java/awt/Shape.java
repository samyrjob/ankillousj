package awt;

import awt.geom.PathSink;

/**
 * A shape knows how to describe itself as path segments.
 *
 * `emit` is the primitive — it writes to any sink, which lets a shape be
 * replayed into the canvas, recorded, or replayed backwards for Area.
 * `trace` is the convenience that writes straight to the current canvas path.
 */
public interface Shape {
    void emit(PathSink sink);

    default void trace(Graphics2D g2d) { emit(g2d.sink()); }

    /**
     * The smallest whole-pixel rectangle around the shape. Measured on the
     * points the path is made of, control points included: exact for straight
     * edges, and never smaller than the truth for curves.
     */
    default Rectangle getBounds() {
        final double[] box = { Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY,
                               Double.NEGATIVE_INFINITY, Double.NEGATIVE_INFINITY };
        emit(new PathSink() {
            private void see(double x, double y) {
                if (x < box[0]) box[0] = x;
                if (y < box[1]) box[1] = y;
                if (x > box[2]) box[2] = x;
                if (y > box[3]) box[3] = y;
            }
            @Override public void moveTo(double x, double y) { see(x, y); }
            @Override public void lineTo(double x, double y) { see(x, y); }
            @Override public void quadTo(double cx, double cy, double x, double y) { see(cx, cy); see(x, y); }
            @Override public void curveTo(double c1x, double c1y, double c2x, double c2y, double x, double y) {
                see(c1x, c1y); see(c2x, c2y); see(x, y);
            }
            @Override public void closePath() { }
        });
        if (box[0] > box[2] || box[1] > box[3]) return new Rectangle();
        int x = (int) Math.floor(box[0]), y = (int) Math.floor(box[1]);
        return new Rectangle(x, y, (int) Math.ceil(box[2]) - x, (int) Math.ceil(box[3]) - y);
    }
}
