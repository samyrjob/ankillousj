package awt.geom;

import awt.Shape;
import awt.Graphics2D;

/**
 * Constructive area geometry, done with winding rather than boolean clipping.
 *
 * Canvas2D has no path booleans, but it does have the nonzero winding rule,
 * and that is enough for the two operations this codebase uses:
 *
 *   add(s)       append s with its normal winding  -> regions merge (union)
 *   subtract(s)  append s with reversed winding    -> region becomes a hole
 *
 * Filling the combined path under nonzero then produces the correct result
 * with no geometry computation at all. Stroking is handled separately in
 * Graphics2D.draw, which clips to the complement so interior seams between
 * merged shapes are not drawn.
 */
public class Area implements Shape {

    private final PathSink.Recording rec = new PathSink.Recording();
    private final java.util.List<Shape> parts = new java.util.ArrayList<>();

    public Area() { }

    public Area(Shape s) { add(s); }

    public void add(Shape s) {
        s.emit(rec);
        parts.add(s);
    }

    public void subtract(Shape s) {
        PathSink.Recording tmp = new PathSink.Recording();
        s.emit(tmp);
        tmp.replayReversed(rec);
        // deliberately not added to `parts`: a hole has no outer boundary to stroke
    }

    public boolean isEmpty() { return rec.isEmpty(); }

    /** The shapes that contribute an outer boundary, for outline stroking. */
    public java.util.List<Shape> outlineParts() { return parts; }

    @Override public void trace(Graphics2D g2d) { emit(g2d.sink()); }
    @Override public void emit(PathSink p) { rec.replay(p); }
}
