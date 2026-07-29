package swing;

import awt.image.BufferedImage;

/**
 * swing.ImageIcon, carrying an image and nothing else.
 *
 * Icon classes expose a {@code swingIcon()} helper so a JLabel or JButton can
 * display them. Those widgets do not exist here, but the helper is kept
 * compiling — the same icon is drawn to the canvas through its own
 * {@code draw()} method, which is the path the game actually uses.
 */
public class ImageIcon implements Icon {

    private final BufferedImage image;

    public ImageIcon()                    { this.image = null; }
    public ImageIcon(BufferedImage image) { this.image = image; }

    public BufferedImage getImage()  { return image; }
    @Override public int getIconWidth()        { return image != null ? image.getWidth() : 0; }
    @Override public int getIconHeight()       { return image != null ? image.getHeight() : 0; }
}
