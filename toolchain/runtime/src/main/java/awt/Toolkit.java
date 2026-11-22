package awt;

import awt.event.AWTEventListener;

import java.util.ArrayList;
import java.util.List;

import org.teavm.jso.JSBody;
import org.teavm.jso.JSFunctor;
import org.teavm.jso.JSObject;

/**
 * java.awt.Toolkit.
 *
 * The part that matters here is {@code addAWTEventListener}, which watches
 * every event in the application no matter which component has focus.
 * Idle-detection code relies on it — Futura's ActivityTracker does exactly
 * that.
 *
 * <p>The browser equivalent is a listener registered on {@code document} in
 * the capture phase, which sees events before any element handles them. The
 * mask decides which DOM events get bound, so a caller asking only for key
 * events does not pay for mouse traffic.
 */
public class Toolkit {

    private static final Toolkit INSTANCE = new Toolkit();

    private final List<AWTEventListener> listeners = new ArrayList<>();
    private boolean bound;

    protected Toolkit() { }

    public static Toolkit getDefaultToolkit() { return INSTANCE; }

    public void addAWTEventListener(AWTEventListener listener, long eventMask) {
        listeners.add(listener);
        bind(eventMask);
    }

    public void removeAWTEventListener(AWTEventListener listener) {
        listeners.remove(listener);
    }

    private void bind(long mask) {
        if (bound) return;
        bound = true;

        if ((mask & AWTEvent.MOUSE_EVENT_MASK) != 0) {
            on("mousedown", () -> dispatch(AWTEvent.MOUSE_PRESSED));
            on("mouseup",   () -> dispatch(AWTEvent.MOUSE_RELEASED));
        }
        if ((mask & AWTEvent.MOUSE_MOTION_EVENT_MASK) != 0) {
            on("mousemove", () -> dispatch(AWTEvent.MOUSE_MOVED));
        }
        if ((mask & AWTEvent.MOUSE_WHEEL_EVENT_MASK) != 0) {
            on("wheel", () -> dispatch(AWTEvent.MOUSE_WHEEL));
        }
        if ((mask & AWTEvent.KEY_EVENT_MASK) != 0) {
            on("keydown", () -> dispatch(AWTEvent.KEY_PRESSED));
            on("keyup",   () -> dispatch(AWTEvent.KEY_RELEASED));
        }
    }

    /** Delivered on the event dispatch thread, like every other listener (see EventQueue). */
    private void dispatch(int id) {
        if (listeners.isEmpty()) return;
        final AWTEvent event = new AWTEvent(this, id);
        EventQueue.invokeLater(() -> {
            for (AWTEventListener l : new ArrayList<>(listeners)) l.eventDispatched(event);
        });
    }

    public Dimension getScreenSize() {
        return new Dimension(screenWidth(), screenHeight());
    }

    public void beep() { }

    /**
     * A desktop setting by name. The one a game asks for is how long two
     * clicks may be apart to count as a double click: 500 ms, the usual value
     * (a page cannot read the system's). Anything else is unknown: null.
     */
    public Object getDesktopProperty(String name) {
        if ("awt.multiClickInterval".equals(name)) return Integer.valueOf(500);
        return null;
    }

    private final awt.datatransfer.Clipboard clipboard = new awt.datatransfer.Clipboard("System");

    /** The browser's clipboard: text copied here reaches other programs. */
    public awt.datatransfer.Clipboard getSystemClipboard() { return clipboard; }

    @JSFunctor
    interface Handler extends JSObject { void handle(); }

    /** Capture phase, so this sees events before any element consumes them. */
    @JSBody(params = { "type", "cb" }, script =
            "if (typeof document !== 'undefined') "
          + "document.addEventListener(type, function() { cb(); }, true);")
    private static native void on(String type, Handler cb);

    @JSBody(script = "return (typeof screen !== 'undefined') ? screen.width : 1920;")
    private static native int screenWidth();

    @JSBody(script = "return (typeof screen !== 'undefined') ? screen.height : 1080;")
    private static native int screenHeight();
}
