package awt;

public class Rectangle {
    public int x, y, width, height;

    public Rectangle() { this(0,0,0,0); }
    public Rectangle(int x, int y, int w, int h) { this.x=x; this.y=y; this.width=w; this.height=h; }

    public void setBounds(int x, int y, int w, int h) { this.x=x; this.y=y; this.width=w; this.height=h; }
    public boolean contains(int px, int py) {
        return px >= x && py >= y && px < x + width && py < y + height;
    }
}
