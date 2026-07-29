package awt;

import awt.geom.PathSink;

/** java.awt.Polygon — a closed path over integer points. */
public class Polygon implements Shape {

    public int npoints;
    public int[] xpoints;
    public int[] ypoints;

    public Polygon() {
        xpoints = new int[4];
        ypoints = new int[4];
    }

    public Polygon(int[] xpoints, int[] ypoints, int npoints) {
        this.xpoints = xpoints;
        this.ypoints = ypoints;
        this.npoints = npoints;
    }

    public void addPoint(int x, int y) {
        if (npoints == xpoints.length) {
            int[] nx = new int[npoints * 2 + 4];
            int[] ny = new int[npoints * 2 + 4];
            System.arraycopy(xpoints, 0, nx, 0, npoints);
            System.arraycopy(ypoints, 0, ny, 0, npoints);
            xpoints = nx;
            ypoints = ny;
        }
        xpoints[npoints] = x;
        ypoints[npoints] = y;
        npoints++;
    }

    public void reset() { npoints = 0; }

    /** Even-odd ray casting, matching java.awt.Polygon.contains. */
    public boolean contains(int x, int y) {
        boolean inside = false;
        for (int i = 0, j = npoints - 1; i < npoints; j = i++) {
            if ((ypoints[i] > y) != (ypoints[j] > y)
                    && x < (double) (xpoints[j] - xpoints[i]) * (y - ypoints[i])
                            / (ypoints[j] - ypoints[i]) + xpoints[i]) {
                inside = !inside;
            }
        }
        return inside;
    }

    public boolean contains(Point p) { return contains(p.x, p.y); }

    public Rectangle getBounds() {
        if (npoints == 0) return new Rectangle();
        int minX = xpoints[0], maxX = xpoints[0];
        int minY = ypoints[0], maxY = ypoints[0];
        for (int i = 1; i < npoints; i++) {
            minX = Math.min(minX, xpoints[i]);
            maxX = Math.max(maxX, xpoints[i]);
            minY = Math.min(minY, ypoints[i]);
            maxY = Math.max(maxY, ypoints[i]);
        }
        return new Rectangle(minX, minY, maxX - minX, maxY - minY);
    }

    @Override public void emit(PathSink p) {
        if (npoints == 0) return;
        p.moveTo(xpoints[0], ypoints[0]);
        for (int i = 1; i < npoints; i++) p.lineTo(xpoints[i], ypoints[i]);
        p.closePath();
    }
}
