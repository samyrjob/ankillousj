package ankillousj;

import org.teavm.jso.JSBody;

/** Opens each dialog so the harness can inspect the DOM it produces. */
public final class UiProof {

    @JSBody(params = "m", script = "if (typeof console !== 'undefined') console.log(m);")
    private static native void log(String m);

    private UiProof() { }

    public static void run() {
        log("-- StyledDialog.showError --");
        view.room.StyledDialog.showError(null, "Connection Failed", "Could not reach the server.");

        log("-- StyledDialog.showChoice --");
        view.room.StyledDialog.showChoice(null, "Max Players", "Select max players:",
            new String[] { "5", "10", "20", "50" }, "10",
            v -> log("chose " + v));

        log("-- RoomCreationDialog.showAsync --");
        view.room.RoomCreationDialog.showAsync(null,
            r -> log("created " + r.getRoomName() + " " + r.getTemplate()));

        log("-- LoadingDialog --");
        ui.LoadingDialog loading = new ui.LoadingDialog();
        loading.show();
        loading.setStatus("Loading room…");
        loading.setProgress(63);

        log("-- FrozenOverlay --");
        new view.overlay.FrozenOverlay(null, t -> log("resumed")).freeze();
    }
}
