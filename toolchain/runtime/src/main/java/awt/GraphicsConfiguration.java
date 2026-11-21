package awt;

import awt.geom.AffineTransform;
import awt.image.BufferedImage;

/**
 * java.awt.GraphicsConfiguration: the screen a Graphics2D draws on. Here that
 * is the browser tab: its default transform is the device pixel ratio.
 */
public class GraphicsConfiguration {

    private final double scale;

    GraphicsConfiguration(double scale) { this.scale = scale <= 0 ? 1 : scale; }

    /** How many screen pixels one unit is: the device pixel ratio. */
    public AffineTransform getDefaultTransform() { return AffineTransform.getScaleInstance(scale, scale); }

    public AffineTransform getNormalizingTransform() { return new AffineTransform(); }

    public BufferedImage createCompatibleImage(int width, int height) {
        return new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
    }

    /** {@code transparency} is one of java.awt.Transparency's values; a canvas always has alpha. */
    public BufferedImage createCompatibleImage(int width, int height, int transparency) {
        return createCompatibleImage(width, height);
    }

    public Rectangle getBounds() {
        Dimension screen = Toolkit.getDefaultToolkit().getScreenSize();
        return new Rectangle(0, 0, screen.width, screen.height);
    }
}
