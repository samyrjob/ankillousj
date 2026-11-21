package awt.geom;

import awt.Shape;

/**
 * What {@link AffineTransform#createTransformedShape} returns: the source
 * shape, each of its points moved by the matrix as the path is emitted.
 *
 * An affine map sends lines to lines and Bézier curves to Bézier curves with
 * the control points mapped the same way, so transforming the points of each
 * segment is exact: nothing is flattened.
 */
final class TransformedShape implements Shape {

    private final Shape source;
    private final double m00, m10, m01, m11, m02, m12;

    TransformedShape(Shape source, double m00, double m10, double m01,
                     double m11, double m02, double m12) {
        this.source = source;
        this.m00 = m00; this.m10 = m10; this.m01 = m01;
        this.m11 = m11; this.m02 = m02; this.m12 = m12;
    }

    private double tx(double x, double y) { return x * m00 + y * m01 + m02; }
    private double ty(double x, double y) { return x * m10 + y * m11 + m12; }

    @Override public void emit(final PathSink out) {
        source.emit(new PathSink() {
            @Override public void moveTo(double x, double y) { out.moveTo(tx(x, y), ty(x, y)); }
            @Override public void lineTo(double x, double y) { out.lineTo(tx(x, y), ty(x, y)); }
            @Override public void quadTo(double cx, double cy, double x, double y) {
                out.quadTo(tx(cx, cy), ty(cx, cy), tx(x, y), ty(x, y));
            }
            @Override public void curveTo(double c1x, double c1y, double c2x, double c2y,
                                          double x, double y) {
                out.curveTo(tx(c1x, c1y), ty(c1x, c1y), tx(c2x, c2y), ty(c2x, c2y),
                            tx(x, y), ty(x, y));
            }
            @Override public void closePath() { out.closePath(); }
        });
    }
}
