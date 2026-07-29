package swing;

import concurrent.EventLoop;

/**
 * javax.swing.SwingUtilities.
 *
 * Swing funnels UI work onto the event dispatch thread. The browser has the
 * same idea with one queue and no threads, so invokeLater becomes a deferred
 * task and everything is always "on the EDT".
 */
public final class SwingUtilities {

    private SwingUtilities() { }

    /** Runs after the current task, matching Swing's queue-it-up semantics. */
    public static void invokeLater(Runnable r) {
        EventLoop.defer(r::run);
    }

    /**
     * Swing blocks the caller until the work is done. There is only one thread
     * here, so the closest honest equivalent is to run it now — which is also
     * what Swing does if you are already on the EDT.
     */
    public static void invokeAndWait(Runnable r) {
        r.run();
    }

    /** Always true: there is one thread, and it is this one. */
    public static boolean isEventDispatchThread() {
        return true;
    }

    /**
     * There are no window ancestors to walk — dialogs are not part of the
     * canvas port. Returns null, which callers already handle since a
     * component not yet added to a window returns null on the desktop too.
     */
    public static awt.Window getWindowAncestor(Object component) {
        return null;
    }
}
