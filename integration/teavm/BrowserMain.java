package main;

import org.teavm.jso.JSBody;

/**
 * Browser entry point.
 *
 * The desktop Main builds a JFrame and hands it a GamePanel. There is no frame
 * here — GamePanel extends awt.Component, which claims the page's canvas in
 * its own constructor, so constructing it is the whole bootstrap.
 *
 * Auth is deliberately not wired up yet: this build exists to answer whether
 * TeaVM can compile and link the game at all.
 */
public final class BrowserMain {

    @JSBody(params = "m", script = "if (globalThis.__ankLog) globalThis.__ankLog(m); "
                                 + "else if (typeof console !== 'undefined') console.log(m);")
    private static native void log(String m);

    private BrowserMain() { }

    public static void main(String[] args) {
        log("AnkillousJ: starting Futura in the browser");
        try {
            GamePanel gp = new GamePanel("WebPlayer", "MALE", "", 1, "");
            log("GamePanel constructed: " + gp.getWidth() + "x" + gp.getHeight());
        } catch (Throwable t) {
            log("startup failed: " + t);
        }
    }
}
