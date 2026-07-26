package awt.geom;

import java.util.ArrayList;
import java.util.List;

/**
 * Receives path segments. Graphics2D implements one that writes straight to
 * the canvas; RecordingSink captures them so a path can be replayed reversed,
 * which is how Area gets union and subtraction without boolean geometry.
 */
public interface PathSink {
    void moveTo(double x, double y);
    void lineTo(double x, double y);
    void quadTo(double cx, double cy, double x, double y);
    void curveTo(double c1x, double c1y, double c2x, double c2y, double x, double y);
    void closePath();

    /**
     * Records segments so they can be replayed in either direction.
     *
     * Reversing a subpath flips its winding direction. Under the nonzero fill
     * rule that turns a solid region into a hole, which is exactly what
     * Area.subtract needs — and appending same-direction subpaths gives the
     * union that Area.add needs.
     */
    final class Recording implements PathSink {
        /** [op, x0,y0, x1,y1, x2,y2] — op: 0 move, 1 line, 2 quad, 3 cubic, 4 close */
        private final List<double[]> segs = new ArrayList<>();

        @Override public void moveTo(double x, double y)  { segs.add(new double[]{0, x, y, 0,0, 0,0}); }
        @Override public void lineTo(double x, double y)  { segs.add(new double[]{1, x, y, 0,0, 0,0}); }
        @Override public void quadTo(double cx, double cy, double x, double y) {
            segs.add(new double[]{2, x, y, cx, cy, 0, 0});
        }
        @Override public void curveTo(double c1x, double c1y, double c2x, double c2y, double x, double y) {
            segs.add(new double[]{3, x, y, c1x, c1y, c2x, c2y});
        }
        @Override public void closePath() { segs.add(new double[]{4, 0,0, 0,0, 0,0}); }

        public void replay(PathSink out) {
            for (double[] s : segs) emit(out, s);
        }

        private static void emit(PathSink out, double[] s) {
            switch ((int) s[0]) {
                case 0: out.moveTo(s[1], s[2]); break;
                case 1: out.lineTo(s[1], s[2]); break;
                case 2: out.quadTo(s[3], s[4], s[1], s[2]); break;
                case 3: out.curveTo(s[3], s[4], s[5], s[6], s[1], s[2]); break;
                case 4: out.closePath(); break;
                default: break;
            }
        }

        /** Replay with every subpath traversed backwards, flipping its winding. */
        public void replayReversed(PathSink out) {
            int i = 0;
            while (i < segs.size()) {
                // find the extent of this subpath
                int start = i;
                i++;
                while (i < segs.size() && (int) segs.get(i)[0] != 0) i++;
                int end = i; // exclusive

                boolean closed = false;
                int last = end - 1;
                if (last >= start && (int) segs.get(last)[0] == 4) { closed = true; last--; }
                if (last < start) continue;

                // Walk backwards: the endpoint of segment k becomes the start of
                // the reversed segment, so control points swap for curves.
                out.moveTo(segs.get(last)[1], segs.get(last)[2]);
                for (int k = last; k > start; k--) {
                    double[] cur = segs.get(k);
                    double[] prev = segs.get(k - 1);
                    double px = prev[1], py = prev[2];
                    switch ((int) cur[0]) {
                        case 1: out.lineTo(px, py); break;
                        case 2: out.quadTo(cur[3], cur[4], px, py); break;
                        case 3: out.curveTo(cur[5], cur[6], cur[3], cur[4], px, py); break;
                        default: out.lineTo(px, py); break;
                    }
                }
                if (closed) out.closePath();
                else out.closePath();
            }
        }

        public boolean isEmpty() { return segs.isEmpty(); }
    }
}
