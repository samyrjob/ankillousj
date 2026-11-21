package awt.geom;

/** java.awt.geom.Point2D, with its Float and Double forms. */
public abstract class Point2D {

    public abstract double getX();
    public abstract double getY();
    public abstract void setLocation(double x, double y);

    public void setLocation(Point2D p) { setLocation(p.getX(), p.getY()); }

    public double distance(double px, double py) {
        double dx = px - getX(), dy = py - getY();
        return Math.sqrt(dx * dx + dy * dy);
    }

    public double distance(Point2D p) { return distance(p.getX(), p.getY()); }

    public double distanceSq(double px, double py) {
        double dx = px - getX(), dy = py - getY();
        return dx * dx + dy * dy;
    }

    public static double distance(double x1, double y1, double x2, double y2) {
        double dx = x2 - x1, dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    @Override public boolean equals(Object o) {
        if (!(o instanceof Point2D)) return false;
        Point2D p = (Point2D) o;
        return getX() == p.getX() && getY() == p.getY();
    }

    @Override public int hashCode() {
        long bits = java.lang.Double.doubleToLongBits(getX()) * 31
                  + java.lang.Double.doubleToLongBits(getY());
        return (int) (bits ^ (bits >>> 32));
    }

    public static class Double extends Point2D {
        public double x, y;
        public Double() { }
        public Double(double x, double y) { this.x = x; this.y = y; }
        @Override public double getX() { return x; }
        @Override public double getY() { return y; }
        @Override public void setLocation(double x, double y) { this.x = x; this.y = y; }
        @Override public String toString() { return "Point2D.Double[" + x + ", " + y + "]"; }
    }

    public static class Float extends Point2D {
        public float x, y;
        public Float() { }
        public Float(float x, float y) { this.x = x; this.y = y; }
        @Override public double getX() { return x; }
        @Override public double getY() { return y; }
        @Override public void setLocation(double x, double y) { this.x = (float) x; this.y = (float) y; }
        public void setLocation(float x, float y) { this.x = x; this.y = y; }
        @Override public String toString() { return "Point2D.Float[" + x + ", " + y + "]"; }
    }
}
