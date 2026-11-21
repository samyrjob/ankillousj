package awt;

import org.teavm.jso.JSBody;

/**
 * java.awt.Window. The page is the window: it has the focus when the browser
 * tab does. Dialogs are HTML overlays, so the rest is a placeholder.
 */
public class Window {
    public boolean isVisible() { return false; }
    public void dispose() { }

    /** Whether the browser tab has the keyboard. */
    public boolean isFocused() { return documentHasFocus(); }
    public boolean isActive()  { return documentHasFocus(); }

    @JSBody(script =
            "return (typeof document === 'undefined' || !document.hasFocus) ? true : !!document.hasFocus();")
    private static native boolean documentHasFocus();
}
