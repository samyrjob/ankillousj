package awt;

public class Rectangle implements Shape {
    public int x, y, width, height;

    public Rectangle() { this(0, 0, 0, 0); }
    public Rectangle(int x, int y, int w, int h) { this.x=x; this.y=y; this.width=w; this.height=h; }
    public Rectangle(Rectangle r) { this(r.x, r.y, r.width, r.height); }
    public Rectangle(int w, int h) { this(0, 0, w, h); }
    public Rectangle(Point p, Dimension d) { this(p.x, p.y, d.width, d.height); }

    public void setBounds(int x, int y, int w, int h) { this.x=x; this.y=y; this.width=w; this.height=h; }
    public void setBounds(Rectangle r) { setBounds(r.x, r.y, r.width, r.height); }
    public void setLocation(int x, int y) { this.x = x; this.y = y; }
    public void setLocation(Point p) { setLocation(p.x, p.y); }
    public void setSize(int w, int h) { this.width = w; this.height = h; }
    public void translate(int dx, int dy) { x += dx; y += dy; }

    public boolean contains(int px, int py) {
        return px >= x && py >= y && px < x + width && py < y + height;
    }
    public boolean contains(Point p) { return contains(p.x, p.y); }

    /** Whether {@code r} lies wholly inside this rectangle. */
    public boolean contains(Rectangle r) {
        return !isEmpty() && !r.isEmpty()
            && r.x >= x && r.y >= y && r.x + r.width <= x + width && r.y + r.height <= y + height;
    }

    @Override public Rectangle getBounds() { return new Rectangle(this); }
    public Point getLocation() { return new Point(x, y); }
    public Dimension getSize() { return new Dimension(width, height); }

    public boolean isEmpty() { return width <= 0 || height <= 0; }

    public boolean intersects(Rectangle r) {
        return !isEmpty() && !r.isEmpty()
            && r.x < x + width && r.x + r.width > x
            && r.y < y + height && r.y + r.height > y;
    }

    /** The part both rectangles cover; of no width or height when they do not meet (as the JDK). */
    public Rectangle intersection(Rectangle r) {
        int x1 = Math.max(x, r.x), y1 = Math.max(y, r.y);
        int x2 = Math.min(x + width, r.x + r.width), y2 = Math.min(y + height, r.y + r.height);
        return new Rectangle(x1, y1, x2 - x1, y2 - y1);
    }

    /** The smallest rectangle holding both. An empty one counts for nothing (as the JDK). */
    public Rectangle union(Rectangle r) {
        if (isEmpty()) return new Rectangle(r);
        if (r.isEmpty()) return new Rectangle(this);
        int x1 = Math.min(x, r.x), y1 = Math.min(y, r.y);
        int x2 = Math.max(x + width, r.x + r.width), y2 = Math.max(y + height, r.y + r.height);
        return new Rectangle(x1, y1, x2 - x1, y2 - y1);
    }

    /** Grows this rectangle to hold the point too. */
    public void add(int px, int py) {
        int x1 = Math.min(x, px), y1 = Math.min(y, py);
        int x2 = Math.max(x + width, px), y2 = Math.max(y + height, py);
        setBounds(x1, y1, x2 - x1, y2 - y1);
    }

    /** Grows this rectangle to hold {@code r} too. */
    public void add(Rectangle r) { setBounds(union(r)); }

    /** {@code h} more on the left and on the right, {@code v} more above and below. */
    public void grow(int h, int v) {
        x -= h; y -= v; width += 2 * h; height += 2 * v;
    }

    // Typed double, as java.awt.Rectangle inherits them from Rectangle2D.
    public double getX()      { return x; }
    public double getY()      { return y; }
    public double getWidth()  { return width; }
    public double getHeight() { return height; }
    public double getMinX()   { return x; }
    public double getMinY()   { return y; }
    public double getMaxX()   { return x + width; }
    public double getMaxY()   { return y + height; }
    public double getCenterX() { return x + width / 2.0; }
    public double getCenterY() { return y + height / 2.0; }

    @Override public boolean equals(Object o) {
        if (!(o instanceof Rectangle)) return false;
        Rectangle r = (Rectangle) o;
        return x == r.x && y == r.y && width == r.width && height == r.height;
    }

    @Override public int hashCode() { return ((x * 31 + y) * 31 + width) * 31 + height; }

    @Override public String toString() {
        return "Rectangle[x=" + x + ",y=" + y + ",w=" + width + ",h=" + height + "]";
    }

    @Override public void emit(awt.geom.PathSink p) {
        p.moveTo(x, y);
        p.lineTo(x + width, y);
        p.lineTo(x + width, y + height);
        p.lineTo(x, y + height);
        p.closePath();
    }
}
