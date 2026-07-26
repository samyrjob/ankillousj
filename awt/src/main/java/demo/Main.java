package demo;

import org.teavm.jso.JSBody;

/**
 * Entry point.
 *
 * There is no AnkillousJ API here at all — constructing the panel is the whole
 * bootstrap, exactly as `new MyPanel()` would be on a desktop before handing
 * it to a JFrame.
 */
public final class Main {

    @JSBody(params = "msg", script = "if (globalThis.__ankLog) globalThis.__ankLog(msg);")
    private static native void log(String msg);

    public static void main(String[] args) {
        new InteractivePanel();
        ConcurrencyTest.run();
        WebSocketTest.run();
        ImageTest.run();
        log("java.awt.Component live on <canvas> — no AnkillousJ types in the source");
    }
}
