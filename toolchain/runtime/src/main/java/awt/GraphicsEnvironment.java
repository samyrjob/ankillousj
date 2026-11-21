package awt;

/**
 * java.awt.GraphicsEnvironment. A page cannot list the fonts of the machine it
 * runs on, so the families named here are the ones CSS always resolves — the
 * generic ones — and the common ones nearly every system has.
 */
public class GraphicsEnvironment {

    private static final GraphicsEnvironment LOCAL = new GraphicsEnvironment();

    private static final String[] FAMILIES = {
        "Arial", "Courier New", "Dialog", "DialogInput", "Georgia", "Helvetica",
        "Monospaced", "SansSerif", "Serif", "Tahoma", "Times New Roman", "Verdana"
    };

    protected GraphicsEnvironment() { }

    public static GraphicsEnvironment getLocalGraphicsEnvironment() { return LOCAL; }

    public static boolean isHeadless() { return false; }

    public String[] getAvailableFontFamilyNames() { return FAMILIES.clone(); }

    public String[] getAvailableFontFamilyNames(java.util.Locale locale) { return FAMILIES.clone(); }

    public Rectangle getMaximumWindowBounds() {
        Dimension screen = Toolkit.getDefaultToolkit().getScreenSize();
        return new Rectangle(0, 0, screen.width, screen.height);
    }
}
