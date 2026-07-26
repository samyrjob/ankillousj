package awt.geom;

import awt.Graphics2D;
import awt.Shape;

public abstract class RoundRectangle2D implements Shape {

    public static class Float extends RoundRectangle2D {
        public float x, y, width, height, arcwidth, archeight;

        public Float(float x, float y, float w, float h, float aw, float ah) {
            this.x=x; this.y=y; this.width=w; this.height=h; this.arcwidth=aw; this.archeight=ah;
        }

        @Override public void trace(Graphics2D g2d) {
            g2d.roundRectPath(x, y, width, height, arcwidth / 2.0, archeight / 2.0);
        }
    }

    public static class Double extends RoundRectangle2D {
        public double x, y, width, height, arcwidth, archeight;

        public Double(double x, double y, double w, double h, double aw, double ah) {
            this.x=x; this.y=y; this.width=w; this.height=h; this.arcwidth=aw; this.archeight=ah;
        }

        @Override public void trace(Graphics2D g2d) {
            g2d.roundRectPath(x, y, width, height, arcwidth / 2.0, archeight / 2.0);
        }
    }
}
