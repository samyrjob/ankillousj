package awt.image;

/** java.awt.image.ColorModel: every canvas pixel is four bytes, red green blue alpha. */
public class ColorModel {

    static final ColorModel RGBA = new ColorModel();

    protected ColorModel() { }

    public int getPixelSize()        { return 32; }
    public boolean hasAlpha()        { return true; }
    public boolean isAlphaPremultiplied() { return false; }
    public int getNumComponents()    { return 4; }
    public int getNumColorComponents() { return 3; }
    public int getTransparency()     { return 3; }   // java.awt.Transparency.TRANSLUCENT
}
