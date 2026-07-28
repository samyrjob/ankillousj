package ui;

import ankillousj.ui.Overlay;

import org.teavm.jso.JSObject;

/**
 * The startup progress overlay, in HTML.
 *
 * <p>Same API as the Swing original. It does not block, which suits it better
 * than it suited Swing: the loading screen exists precisely so work can happen
 * while the user watches.
 */
public class LoadingDialog {

    private JSObject overlay;

    public void show() {
        if (overlay != null) return;
        overlay = Overlay.dialog(
            "Loading Futura",
            "<div data-status>Starting…</div>"
                + "<div class=\"ank-bar\"><i data-bar></i></div>",
            null);
    }

    public void setStatus(String text) {
        if (overlay != null) Overlay.setText(overlay, "[data-status]", text);
    }

    public void setProgress(int percent) {
        if (overlay != null) {
            Overlay.setWidth(overlay, "[data-bar]", Math.max(0, Math.min(100, percent)));
        }
    }

    public void close() {
        if (overlay == null) return;
        Overlay.dismiss(overlay);
        overlay = null;
    }
}
