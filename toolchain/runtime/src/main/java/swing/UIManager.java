package swing;

/**
 * No-op stand-in for javax.swing.UIManager.
 *
 * Look-and-feel has no meaning on a canvas: the game draws every pixel itself.
 * Property lookups return null, which is what UIManager does for an unknown
 * key anyway.
 */
public final class UIManager {

    private UIManager() { }

    public static void put(Object key, Object value) { }
    public static Object get(Object key)             { return null; }
    public static java.awt.Color getColor(Object key) { return null; }
    public static void setLookAndFeel(String className) { }
    public static String getSystemLookAndFeelClassName() { return "canvas"; }
}
