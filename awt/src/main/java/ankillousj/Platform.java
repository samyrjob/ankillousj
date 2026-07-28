package ankillousj;

import org.teavm.jso.JSBody;

/**
 * The handful of JVM behaviours that have no browser equivalent.
 *
 * <p>Each one here is a place where the honest answer is "that concept does
 * not exist", rather than something a shim can fake.
 */
public final class Platform {

    private Platform() { }

    private static boolean halted;
    private static Runnable onExit;

    /**
     * Stands in for {@code System.exit}, which TeaVM does not ship — a page
     * cannot exit, and pretending otherwise would be worse than saying so.
     *
     * <p>Every call site in a game is a fatal-error path: connection lost,
     * authentication failed, unrecoverable state. On the desktop the right
     * response is to close the window; in a browser it is to stop the game
     * loop and show the user what happened. That is what this does.
     *
     * <p>{@link #isHalted()} lets a render loop check whether to keep going.
     */
    public static void exit(int status) {
        if (halted) return;
        halted = true;
        report(status == 0 ? "the game stopped normally"
                           : "the game stopped with status " + status);
        if (onExit != null) onExit.run();
    }

    /** True once {@link #exit} has been called. */
    public static boolean isHalted() { return halted; }

    /** Hook for showing an error state, since there is no window to close. */
    public static void setExitHandler(Runnable handler) { onExit = handler; }

    @JSBody(params = "m", script =
            "if (globalThis.__ankLog) globalThis.__ankLog(m);"
          + "else if (typeof console !== 'undefined') console.warn(m);")
    private static native void report(String m);
}
