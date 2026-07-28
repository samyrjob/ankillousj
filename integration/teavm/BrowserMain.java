package main;

import ankillousj.Resources;
import imageio.ImageIO;

import org.teavm.jso.JSBody;

/**
 * Browser entry point.
 *
 * The desktop Main builds a JFrame and hands it a GamePanel. There is no frame
 * here — GamePanel extends awt.Component, which claims the page's canvas in
 * its own constructor, so constructing it is the whole bootstrap.
 *
 * <p>The only setup this adds is telling the resource layer where the assets
 * are served from. Classpath paths like {@code /res/tile/grass00.png} keep
 * their shape; they are simply prefixed.
 */
public final class BrowserMain {

    /** Where the assets are served, relative to the page. */
    private static final String ASSET_BASE = "assets";

    @JSBody(params = "m", script = "if (globalThis.__ankLog) globalThis.__ankLog(m); "
                                 + "else if (typeof console !== 'undefined') console.log(m);")
    private static native void log(String m);

    private BrowserMain() { }

    public static void main(String[] args) {
        log("AnkillousJ: starting Futura in the browser");

        Resources.setBase(ASSET_BASE);
        ImageIO.setResourceBase(ASSET_BASE);

        try {
            log("constructing GamePanel...");
            GamePanel gp = new GamePanel("WebPlayer", "MALE", "", 1, "");
            log("GamePanel live: " + gp.getWidth() + "x" + gp.getHeight());
        } catch (Throwable t) {
            log("startup failed: " + t);
        }
    }
}
