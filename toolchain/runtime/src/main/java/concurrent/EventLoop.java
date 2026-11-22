package concurrent;

import org.teavm.jso.JSBody;
import org.teavm.jso.JSFunctor;
import org.teavm.jso.JSObject;

/**
 * The browser's own scheduling: timers, and the turn that comes right after
 * the current one. What runs from here runs as a call of the browser's — it
 * cannot wait. Work that may wait is handed to a program thread instead (see
 * {@link ExecutorService} and {@code awt.EventQueue}).
 */
public final class EventLoop {

    private EventLoop() { }

    @JSFunctor
    public interface Task extends JSObject { void run(); }

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

    /**
     * Runs the task as soon as what is running now has finished its turn, and
     * before anything else. This is how a waiting thread is woken: a thread
     * cannot be resumed while another is running, and by then none is.
     */
    @JSBody(params = "t", script =
            "if (typeof queueMicrotask === 'function') queueMicrotask(function() { t(); });"
          + "else Promise.resolve().then(function() { t(); });")
    public static native void soon(Task t);

    /** The clock, in milliseconds. */
    @JSBody(script = "return Date.now();")
    public static native double now();
}
