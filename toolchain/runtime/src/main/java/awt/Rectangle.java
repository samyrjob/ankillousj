package awt;

public class Rectangle implements Shape {
    public int x, y, width, height;

    public Rectangle() { this(0, 0, 0, 0); }
    public Rectangle(int x, int y, int w, int h) { this.x=x; this.y=y; this.width=w; this.height=h; }
    public Rectangle(Rectangle r) { this(r.x, r.y, r.width, r.height); }
    public Rectangle(int w, int h) { this(0, 0, w, h); }

    public void setBounds(int x, int y, int w, int h) { this.x=x; this.y=y; this.width=w; this.height=h; }
    public boolean contains(int px, int py) {
        return px >= x && py >= y && px < x + width && py < y + height;
    }

    public boolean contains(Point p) { return contains(p.x, p.y); }

    public void setBounds(Rectangle r) { setBounds(r.x, r.y, r.width, r.height); }

    public Rectangle getBounds() { return new Rectangle(this); }

    public boolean isEmpty() { return width <= 0 || height <= 0; }

    public boolean intersects(Rectangle r) {
        return !isEmpty() && !r.isEmpty()
            && r.x < x + width && r.x + r.width > x
            && r.y < y + height && r.y + r.height > y;
    }

    public int getX()      { return x; }
    public int getY()      { return y; }
    public int getWidth()  { return width; }
    public int getHeight() { return height; }

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
