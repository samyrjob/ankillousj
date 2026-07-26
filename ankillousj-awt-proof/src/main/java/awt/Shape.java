package awt;

/** Minimal Shape: anything that can trace itself into the current canvas path. */
public interface Shape {
    void trace(Graphics2D g2d);
}
