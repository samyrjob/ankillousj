package swing;

import awt.EventQueue;

/** javax.swing.SwingUtilities: the doors onto the event dispatch thread (see {@link EventQueue}). */
public final class SwingUtilities {

    private SwingUtilities() { }

    public static void invokeLater(Runnable r) {
        EventQueue.invokeLater(r);
    }

    public static void invokeAndWait(Runnable r) {
        EventQueue.invokeAndWait(r);
    }

    public static boolean isEventDispatchThread() {
        return EventQueue.isDispatchThread();
    }

    /** The page is the window of every component. */
    public static awt.Window getWindowAncestor(Object component) {
        return null;
    }
}
