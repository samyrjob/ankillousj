package view.overlay;

import ankillousj.ui.Overlay;

import java.util.function.Consumer;

import org.teavm.jso.JSObject;

/**
 * The "you were disconnected" curtain, in HTML.
 *
 * <p>The Swing original was a component added to the game panel and
 * z-ordered above it. A canvas has no children, so this is an element over the
 * canvas instead — which is closer to what it always wanted to be.
 */
public class FrozenOverlay {

    private final Consumer<String> onResume;
    private JSObject overlay;

    public FrozenOverlay(Object resumeService, Consumer<String> onResume) {
        this.onResume = onResume;
    }

    public void freeze() {
        show("Paused — you were away", "Resume");
    }

    public void disconnectedTerminal(String reason) {
        show(reason == null || reason.isEmpty() ? "Disconnected" : reason, "Reconnect");
    }

    private void show(String message, String buttonLabel) {
        if (overlay != null) return;
        overlay = Overlay.plain("ank-frozen",
            "<div class=\"ank-dialog\" style=\"min-width:300px\">"
          + "<div class=\"ank-title\">" + Overlay.escape(message) + "</div>"
          + "<div class=\"ank-actions\">"
          + "<button class=\"ank-btn ank-btn-primary\" data-resume>"
          + Overlay.escape(buttonLabel) + "</button></div></div>");

        Overlay.onClick(overlay, "[data-resume]", () -> {
            thaw();
            if (onResume != null) onResume.accept(null);
        });
    }

    public void thaw() {
        if (overlay == null) return;
        Overlay.dismiss(overlay);
        overlay = null;
    }

    public boolean isFrozen() { return overlay != null; }

    /** No-ops: the overlay is an element, not a painted component. */
    public void setBounds(int x, int y, int w, int h) { }
    public void setVisible(boolean v) { if (!v) thaw(); }
}
