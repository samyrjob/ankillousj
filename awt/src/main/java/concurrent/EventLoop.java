package concurrent;

import org.teavm.jso.JSBody;
import org.teavm.jso.JSFunctor;
import org.teavm.jso.JSObject;

/**
 * The browser's event loop, which is the only scheduler available here.
 *
 * Everything in this package is built on it. There are no threads: JavaScript
 * runs one task at a time and yields between them, so "concurrent" work is
 * interleaved rather than parallel.
 */
public final class EventLoop {

    private EventLoop() { }

    @JSFunctor
    public interface Task extends JSObject { void run(); }

    /** Runs after the current task finishes. This is what invokeLater means here. */
    @JSBody(params = "t", script = "return setTimeout(function() { t(); }, 0);")
    public static native int defer(Task t);

    @JSBody(params = { "t", "ms" }, script = "return setTimeout(function() { t(); }, ms);")
    public static native int delay(Task t, double ms);

    @JSBody(params = { "t", "ms" }, script = "return setInterval(function() { t(); }, ms);")
    public static native int repeat(Task t, double ms);

    @JSBody(params = "id", script = "clearTimeout(id);")
    public static native void cancelTimeout(int id);

    @JSBody(params = "id", script = "clearInterval(id);")
    public static native void cancelInterval(int id);
}
