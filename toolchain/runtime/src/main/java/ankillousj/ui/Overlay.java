package ankillousj.ui;

import org.teavm.jso.JSBody;
import org.teavm.jso.JSFunctor;
import org.teavm.jso.JSObject;

/**
 * HTML elements layered over the game canvas.
 *
 * <h3>Why not emulate Swing</h3>
 *
 * A canvas can draw a rectangle that looks like a dialog, but it cannot give
 * you a text field. Real ones need focus, an insertion caret, selection,
 * clipboard, IME for non-Latin input, and a screen reader that knows it is a
 * text field. Drawing those is months of work and the result is still worse
 * than the one the browser already has.
 *
 * <p>So the dialogs are HTML, positioned above the canvas. The game keeps
 * calling {@code StyledDialog.showError(...)} and gets a real dialog; it never
 * learns the difference.
 *
 * <h3>Styling</h3>
 *
 * The palette is read from {@code view.shared.Theme} so the HTML matches what
 * the canvas draws. One source of colour, two renderers — the same discipline
 * the port applies everywhere else.
 */
public final class Overlay {

    private Overlay() { }

    private static boolean stylesInstalled;

    /** Injects the stylesheet once, on first use. */
    static void ensureStyles() {
        if (stylesInstalled) return;
        stylesInstalled = true;
        Native.injectCss(css());
    }

    private static String css() {
        return
          ".ank-backdrop{position:fixed;inset:0;background:rgba(6,7,16,.72);"
        + "display:flex;align-items:center;justify-content:center;z-index:1000;"
        + "font:14px/1.5 system-ui,-apple-system,'Segoe UI',sans-serif}"

        + ".ank-dialog{background:linear-gradient(160deg,#261c52,#140f2d);"
        + "border:2px solid;border-image:linear-gradient(135deg,#e6c878,#a07832) 1;"
        + "border-radius:12px;min-width:320px;max-width:min(90vw,520px);"
        + "color:#fafafa;box-shadow:0 24px 64px rgba(0,0,0,.6);overflow:hidden}"

        + ".ank-title{padding:14px 18px 10px;font-weight:600;font-size:15px;color:#e6c878;"
        + "border-bottom:1px solid rgba(230,200,120,.18)}"
        + ".ank-body{padding:16px 18px;color:#e8e9f3;white-space:pre-wrap}"
        + ".ank-actions{padding:12px 18px 16px;display:flex;gap:10px;justify-content:flex-end}"

        + ".ank-btn{padding:8px 18px;border-radius:7px;border:1px solid #2c3155;"
        + "background:#191d36;color:#e8e9f3;font:inherit;cursor:pointer}"
        + ".ank-btn:hover{background:#222746;border-color:#3d4470}"
        + ".ank-btn-primary{background:linear-gradient(135deg,#e6c878,#c8a24a);"
        + "border-color:#a07832;color:#1a1530;font-weight:600}"
        + ".ank-btn-primary:hover{filter:brightness(1.08)}"

        + ".ank-field{width:100%;padding:9px 11px;margin:6px 0 2px;border-radius:7px;"
        + "border:1px solid #2c3155;background:#12142a;color:#fafafa;font:inherit;"
        + "box-sizing:border-box}"
        + ".ank-field:focus{outline:none;border-color:#e6c878}"
        + ".ank-label{font-size:12px;color:#a096be;margin-top:10px;display:block}"

        + ".ank-list{display:flex;flex-direction:column;gap:6px;padding:4px 18px 8px}"
        + ".ank-item{padding:10px 12px;border-radius:7px;border:1px solid #2c3155;"
        + "background:#191d36;cursor:pointer;text-align:left;color:#e8e9f3;font:inherit}"
        + ".ank-item:hover{background:#222746;border-color:#e6c878}"

        + ".ank-bar{height:8px;border-radius:4px;background:#12142a;overflow:hidden;margin-top:10px}"
        + ".ank-bar>i{display:block;height:100%;width:0;"
        + "background:linear-gradient(90deg,#e6c878,#f5a623);transition:width .2s}"

        + ".ank-frozen{position:fixed;inset:0;background:rgba(6,7,16,.55);"
        + "backdrop-filter:blur(3px);z-index:900;display:flex;align-items:center;"
        + "justify-content:center;color:#e8e9f3;font:15px system-ui,sans-serif}";
    }

    // ── element handles ───────────────────────────────────────────────

    @JSFunctor
    public interface Action extends JSObject { void run(); }

    @JSFunctor
    public interface TextAction extends JSObject { void run(String value); }

    /**
     * Creates a backdrop with a dialog inside it.
     *
     * @return the backdrop element, to pass to {@link #dismiss}
     */
    public static JSObject dialog(String title, String bodyHtml, String actionsHtml) {
        ensureStyles();
        return Native.createDialog(title, bodyHtml, actionsHtml);
    }

    /** Removes an overlay from the page. */
    public static void dismiss(JSObject overlay) {
        Native.remove(overlay);
    }

    /** Wires a click handler onto an element inside the overlay, found by selector. */
    public static void onClick(JSObject overlay, String selector, final Action action) {
        // On the event dispatch thread, like a Swing button's listener: what the click starts may
        // then wait (a request to the server), which a call of the browser's own could not.
        Native.onClick(overlay, selector, () -> awt.EventQueue.invokeLater(action::run));
    }

    /** Reads the current value of an input inside the overlay. */
    public static String valueOf(JSObject overlay, String selector) {
        return Native.value(overlay, selector);
    }

    public static void focus(JSObject overlay, String selector) {
        Native.focus(overlay, selector);
    }

    public static void setText(JSObject overlay, String selector, String text) {
        Native.setText(overlay, selector, text);
    }

    public static void setWidth(JSObject overlay, String selector, int percent) {
        Native.setWidth(overlay, selector, percent);
    }

    /** Marks one element in a group as selected, clearing the others. */
    public static void selectOne(JSObject overlay, String groupSelector, String chosenSelector) {
        Native.selectOne(overlay, groupSelector, chosenSelector);
    }

    /** Escapes text for safe interpolation into the HTML above. */
    public static String escape(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '&': sb.append("&amp;"); break;
                case '<': sb.append("&lt;"); break;
                case '>': sb.append("&gt;"); break;
                case '"': sb.append("&quot;"); break;
                case '\'': sb.append("&#39;"); break;
                default: sb.append(c);
            }
        }
        return sb.toString();
    }

    static final class Native {
        private Native() { }

        @JSBody(params = "css", script =
                "var s = document.createElement('style');"
              + "s.textContent = css;"
              + "document.head.appendChild(s);")
        static native void injectCss(String css);

        @JSBody(params = { "title", "body", "actions" }, script =
                "var back = document.createElement('div');"
              + "back.className = 'ank-backdrop';"
              + "back.innerHTML = '<div class=\"ank-dialog\" role=\"dialog\" aria-modal=\"true\">'"
              + "  + (title ? '<div class=\"ank-title\">' + title + '</div>' : '')"
              + "  + '<div class=\"ank-body\">' + body + '</div>'"
              + "  + (actions ? '<div class=\"ank-actions\">' + actions + '</div>' : '')"
              + "  + '</div>';"
              + "document.body.appendChild(back);"
              + "return back;")
        static native JSObject createDialog(String title, String body, String actions);

        @JSBody(params = "el", script = "if (el && el.parentNode) el.parentNode.removeChild(el);")
        static native void remove(JSObject el);

        @JSBody(params = { "root", "sel", "cb" }, script =
                "var el = root.querySelector(sel);"
              + "if (el) el.addEventListener('click', function() { cb(); });")
        static native void onClick(JSObject root, String sel, Action cb);

        @JSBody(params = { "root", "sel" }, script =
                "var el = root.querySelector(sel); return el ? el.value : '';")
        static native String value(JSObject root, String sel);

        @JSBody(params = { "root", "sel" }, script =
                "var el = root.querySelector(sel); if (el && el.focus) el.focus();")
        static native void focus(JSObject root, String sel);

        @JSBody(params = { "root", "sel", "text" }, script =
                "var el = root.querySelector(sel); if (el) el.textContent = text;")
        static native void setText(JSObject root, String sel, String text);

        @JSBody(params = { "root", "sel", "pct" }, script =
                "var el = root.querySelector(sel); if (el) el.style.width = pct + '%';")
        static native void setWidth(JSObject root, String sel, int pct);

        @JSBody(params = { "root", "group", "chosen" }, script =
                "var all = root.querySelectorAll(group);"
              + "for (var i = 0; i < all.length; i++) all[i].style.borderColor = '';"
              + "var el = root.querySelector(chosen);"
              + "if (el) el.style.borderColor = '#e6c878';")
        static native void selectOne(JSObject root, String group, String chosen);

        @JSBody(params = { "cls", "html" }, script =
                "var d = document.createElement('div');"
              + "d.className = cls; d.innerHTML = html;"
              + "document.body.appendChild(d); return d;")
        static native JSObject createPlain(String cls, String html);
    }

    /** A bare overlay with no dialog chrome — used by the frozen-world screen. */
    public static JSObject plain(String cssClass, String html) {
        ensureStyles();
        return Native.createPlain(cssClass, html);
    }
}
