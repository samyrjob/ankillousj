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
}
