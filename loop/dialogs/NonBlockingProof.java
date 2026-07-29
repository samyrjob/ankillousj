package ankillousj;

import org.teavm.jso.JSBody;

/**
 * Proves the dialogs do not stall the caller or the render loop.
 *
 * <p>The question matters: Swing's modal dialogs genuinely block the calling
 * thread, and a naive port could easily reproduce that by spinning. Spinning
 * in a browser does not merely delay the caller — it freezes the event loop the
 * dialog needs in order to ever be dismissed, so the page would hang for good.
 */
public final class NonBlockingProof {

    @JSBody(params = "m", script = "if (typeof console !== 'undefined') console.log(m);")
    private static native void log(String m);

    @JSBody(script = "return Date.now();")
    private static native double now();

    private NonBlockingProof() { }

    /**
     * Opens a dialog shortly after startup, once the game loop is live.
     *
     * <p>Opening dialogs before the panel exists proves nothing about whether
     * they stall it. This is the case that matters, and it is scheduled rather
     * than exported so it needs no TeaVM entry-point configuration.
     */
    public static void install() {
        if (!midRunProbeRequested()) return;
        concurrent.EventLoop.delay(() -> {
            log("opening a dialog mid-run");
            view.room.StyledDialog.showError(null, "Mid-flight", "opened while the loop runs");
            log("mid-run dialog returned");
        }, 300);
    }

    @JSBody(script = "return typeof location !== 'undefined' "
                   + "&& location.search.indexOf('midrun') >= 0;")
    private static native boolean midRunProbeRequested();

    public static void run() {
        long t0 = (long) now();

        view.room.StyledDialog.showError(null, "Test", "message");
        view.room.StyledDialog.showInput(null, "Test", "prompt", "", v -> { });
        view.room.StyledDialog.showChoice(null, "Test", "pick",
            new String[] { "a", "b" }, "a", v -> { });
        view.room.RoomCreationDialog.showAsync(null, r -> { });
        new ui.LoadingDialog().show();

        long elapsed = (long) now() - t0;
        log("five dialogs opened in " + elapsed + " ms");
        log("caller returned: true");

        // The prompts hand back an empty Optional immediately rather than
        // waiting for an answer, which is what makes them non-blocking.
        boolean immediate =
            !view.room.StyledDialog.showInput(null, "x", "y", "").isPresent()
            && !view.room.RoomCreationDialog.show(null).isPresent();
        log("prompts returned without waiting: " + immediate);
    }
}
