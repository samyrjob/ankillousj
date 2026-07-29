package swing;

/**
 * No-op stand-in for javax.swing.JOptionPane.
 *
 * A modal dialog has no canvas equivalent — it is an HTML overlay, which is
 * part of the dialog rewrite. Until then these return the "cancelled" answer,
 * which every call site already handles, rather than blocking or pretending
 * the user said yes.
 */
public final class JOptionPane {

    public static final int YES_NO_OPTION      = 0;
    public static final int YES_NO_CANCEL_OPTION = 1;
    public static final int OK_CANCEL_OPTION   = 2;
    public static final int YES_OPTION         = 0;
    public static final int NO_OPTION          = 1;
    public static final int CANCEL_OPTION      = 2;
    public static final int CLOSED_OPTION      = -1;
    public static final int OK_OPTION          = 0;

    public static final int ERROR_MESSAGE       = 0;
    public static final int INFORMATION_MESSAGE = 1;
    public static final int WARNING_MESSAGE     = 2;
    public static final int QUESTION_MESSAGE    = 3;
    public static final int PLAIN_MESSAGE       = -1;

    private JOptionPane() { }

    public static void showMessageDialog(Object parent, Object message) { }
    public static void showMessageDialog(Object parent, Object message, String title, int type) { }

    /** Always "closed", so callers take their cancel path. */
    public static int showConfirmDialog(Object parent, Object message) { return CLOSED_OPTION; }
    public static int showConfirmDialog(Object parent, Object message, String title, int optionType) {
        return CLOSED_OPTION;
    }
    public static int showConfirmDialog(Object parent, Object message, String title,
                                        int optionType, int messageType) {
        return CLOSED_OPTION;
    }

    public static String showInputDialog(Object parent, Object message) { return null; }
    public static String showInputDialog(Object parent, Object message, Object initial) { return null; }

    public static Object showInputDialog(Object parent, Object message, String title,
                                         int type, Object icon, Object[] values, Object initial) {
        return null;
    }

    public static int showOptionDialog(Object parent, Object message, String title,
                                       int optionType, int messageType, Object icon,
                                       Object[] options, Object initial) {
        return CLOSED_OPTION;
    }
}
