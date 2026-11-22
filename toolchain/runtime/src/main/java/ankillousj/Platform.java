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

    /**
     * What {@code Runtime.getRuntime().maxMemory()} answers in a browser (TeaVM has no such
     * method; the port rewrites the call to this one).
     *
     * <p>A program asks it to size its caches: so many percent of the memory it may use. A
     * page has no fixed heap, so the answer is a budget: a quarter of the device's memory as
     * the browser reports it, between 512 MB and 2 GB; 1 GB when the browser does not say.
     */
    public static long maxMemory() {
        double gigabytes = deviceMemory();
        long budget = gigabytes <= 0 ? 1024L * 1024 * 1024
                                    : (long) (gigabytes * 0.25 * 1024 * 1024 * 1024);
        return Math.max(512L * 1024 * 1024, Math.min(2048L * 1024 * 1024, budget));
    }

    @JSBody(script =
            "return (typeof navigator !== 'undefined' && navigator.deviceMemory) ? navigator.deviceMemory : 0;")
    private static native double deviceMemory();

    /**
     * Hands the page back to the browser until its next frame.
     *
     * <p>A desktop thread may loop without ever pausing: the others run beside it. In a page
     * there is one thread of execution, and a program thread that never waits freezes
     * everything — no picture, no mouse, no network. A loop that would spin calls this once
     * per turn: it returns at the browser's next frame (about sixty times a second), or after
     * a tenth of a second when the tab is hidden and no frame comes.
     *
     * <p>Called from the browser's own calls (a paint, an event) it returns at once: those
     * cannot wait, and have no reason to.
     */
    public static void nextFrame() {
        if (inThread()) awaitFrame();
    }

    @JSBody(script =
            "return typeof $rt_nativeThread === 'function' && $rt_nativeThread() !== null;")
    public static native boolean inThread();

    @org.teavm.interop.Async
    private static native Boolean awaitFrame();

    private static void awaitFrame(org.teavm.interop.AsyncCallback<Boolean> callback) {
        onNextFrame(() -> callback.complete(Boolean.TRUE));
    }

    @org.teavm.jso.JSFunctor
    interface Tick extends org.teavm.jso.JSObject { void run(); }

    @JSBody(params = "tick", script =
            "var done = false;"
          + "var go = function() { if (!done) { done = true; tick(); } };"
          + "if (typeof requestAnimationFrame === 'function') requestAnimationFrame(go);"
          + "setTimeout(go, 100);")
    private static native void onNextFrame(Tick tick);

    /** Hook for showing an error state, since there is no window to close. */
    public static void setExitHandler(Runnable handler) { onExit = handler; }

    @JSBody(params = "m", script =
            "if (globalThis.__ankLog) globalThis.__ankLog(m);"
          + "else if (typeof console !== 'undefined') console.warn(m);")
    public static native void report(String m);
}
