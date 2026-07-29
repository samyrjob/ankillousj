package awt;

public class Dimension {
    public int width, height;

    public Dimension() { this(0, 0); }
    public Dimension(int w, int h) { this.width = w; this.height = h; }
    public Dimension(Dimension d) { this(d.width, d.height); }

    public int getWidth()  { return width; }
    public int getHeight() { return height; }
    public Dimension getSize() { return new Dimension(width, height); }
    public void setSize(int w, int h) { width = w; height = h; }

    @Override public boolean equals(Object o) {
        return o instanceof Dimension
            && ((Dimension) o).width == width && ((Dimension) o).height == height;
    }
    @Override public int hashCode() { return width * 31 + height; }
    @Override public String toString() { return "Dimension[" + width + "x" + height + "]"; }
}
