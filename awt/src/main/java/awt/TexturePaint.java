package awt;

import awt.geom.Rectangle2D;
import awt.image.BufferedImage;

/**
 * java.awt.TexturePaint: a picture repeated edge to edge. The anchor rectangle
 * says where one copy sits and how large it is; the others follow from it in
 * every direction. On a canvas this is a pattern with a transform.
 */
public class TexturePaint implements Paint {
    private final BufferedImage image;
    private final double x, y, width, height;

    public TexturePaint(BufferedImage image, Rectangle2D anchor) {
        this.image = image;
        this.x = anchor.x();
        this.y = anchor.y();
        this.width = anchor.w();
        this.height = anchor.h();
    }

    public BufferedImage getImage() { return image; }

    public Rectangle2D getAnchorRect() { return new Rectangle2D.Double(x, y, width, height); }

    double anchorX()      { return x; }
    double anchorY()      { return y; }
    double anchorWidth()  { return width; }
    double anchorHeight() { return height; }
}
