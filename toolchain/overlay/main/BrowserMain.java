package main;

import ankillousj.GameJsonReaders;
import ankillousj.Resources;
import imageio.ImageIO;
import net.Socket;

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

    /**
     * Where the AnkillousJ gateway listens.
     *
     * <p>The game asks for {@code localhost:5555} because that is where its TCP
     * server lives, and a browser cannot open a TCP socket. The gateway accepts
     * WebSocket connections and forwards them to that server unchanged, so the
     * only thing to redirect is the port.
     */
    private static final int GATEWAY_PORT = 5556;

    @JSBody(params = "m", script = "if (globalThis.__ankLog) globalThis.__ankLog(m); "
                                 + "else if (typeof console !== 'undefined') console.log(m);")
    private static native void log(String m);

    private BrowserMain() { }

    public static void main(String[] args) {
        log("AnkillousJ: starting Futura in the browser");

        // Explicit JSON readers, in place of reflective binding.
        GameJsonReaders.install();

        // Opt-in dialog demo, for the harness and for eyeballing the overlays.

        Resources.setBase(ASSET_BASE);
        ImageIO.setResourceBase(ASSET_BASE);

        // Send the game's TCP address to the gateway instead. NetworkManager
        // still asks for the host and port it always did.
        Socket.setUrlMapper((host, port) -> "ws://" + host + ":" + GATEWAY_PORT);

        try {
            log("constructing GamePanel...");
            GamePanel gp = new GamePanel("WebPlayer", "MALE", "", 1, "");
            log("GamePanel live: " + gp.getWidth() + "x" + gp.getHeight());

            // The same sequence the desktop launcher runs, in the same order.
            // preloadEverything is documented as blocking and is called from a
            // background thread there; here it can run inline, because the
            // resource layer already has the bytes and nothing suspends.
            gp.preloadEverything(null);
            log("preload done");

            gp.setupGame();
            log("connected to the gateway");

            gp.startGameThread();
            log("game thread started");
        } catch (Throwable t) {
            log("startup failed: " + t);
        }
    }
}
