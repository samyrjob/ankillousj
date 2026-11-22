package main;

import ankillousj.GameJsonReaders;
import ankillousj.Resources;
import ankillousj.ui.Overlay;
import auth.GameJwtValidator;
import auth.GameSession;
import auth.InvalidGameTokenException;
import config.AppConfig;
import imageio.ImageIO;
import net.Socket;

import org.teavm.jso.JSBody;

import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * Browser entry point: the desktop {@code Main}, for a tab.
 *
 * <p>The steps are the desktop's, in its order — session, validation, the
 * one-use claim, the player's own look, the window, the world's preload, the
 * reveal. Three things differ, because a page is not a program on a disk:
 *
 * <ul>
 *   <li><b>The session comes from the page</b>, not from the launcher's pipe:
 *       {@code globalThis.__futuraSession = { jwt, refresh }}, or the address's
 *       fragment ({@code #jwt=...&refresh=...}), which is erased from the
 *       address bar as soon as it is read.</li>
 *   <li><b>Resources are fetched</b> from {@code assets/} beside the page; the
 *       classpath paths keep their shape.</li>
 *   <li><b>The game server is reached through the gateway</b>: a browser cannot
 *       open a TCP socket, so the game's address is sent to the WebSocket
 *       gateway in front of the unmodified server.</li>
 * </ul>
 *
 * <p>The page can set, before the game starts:
 * <pre>
 *   globalThis.__futuraSession = { jwt: "...", refresh: "..." }
 *   globalThis.__futuraGateway = "wss://play.example/game"   // default: ws://&lt;game host&gt;:5556
 *   globalThis.__futuraAssets  = "assets"                    // default
 *   globalThis.__futuraOffline = true    // no session, no server: the game alone, to look at
 * </pre>
 */
public final class BrowserMain {

    private static final String DEFAULT_ASSET_BASE = "assets";
    private static final int DEFAULT_GATEWAY_PORT = 5556;

    private BrowserMain() { }

    public static void main(String[] args) {
        log("AnkillousJ: starting Futura in the browser");

        // Explicit JSON readers, in place of reflective binding.
        GameJsonReaders.install();

        String assets = pageSetting("__futuraAssets");
        if (assets == null || assets.isEmpty()) assets = DEFAULT_ASSET_BASE;
        Resources.setBase(assets);
        ImageIO.setResourceBase(assets);

        // The game still asks for the host and port of its TCP server; the
        // answer is the gateway's WebSocket address.
        final String gateway = pageSetting("__futuraGateway");
        Socket.setUrlMapper((host, port) ->
                gateway != null && !gateway.isEmpty() ? gateway : "ws://" + host + ":" + DEFAULT_GATEWAY_PORT);

        // Nothing is drawn until the window is revealed: the panel is long in the building (its
        // pictures and rooms are fetched as it goes), and a frame from a half-built one fails.
        awt.Component.setPaintingEnabled(false);

        if (isOffline()) {
            startOffline();
            return;
        }

        String jwt = sessionValue("jwt");
        String refreshToken = sessionValue("refresh");
        forgetFragment();
        if (jwt == null || jwt.isEmpty()) {
            showFatalError("No game session.\n\nOpen Futura from the site, signed in: it starts the game here.", null);
            return;
        }
        start(jwt, refreshToken == null || refreshToken.isEmpty() ? null : refreshToken);
    }

    /** The desktop Main's sequence, from the token on. */
    private static void start(String jwt, String refreshToken) {
        auth.GameClientToken.set(jwt);

        GameSession session;
        try {
            session = new GameJwtValidator().validate(jwt);
        } catch (InvalidGameTokenException e) {
            showFatalError("Game session is invalid or expired.\n\nGo back to the site and start the game again.", e);
            return;
        }
        log("[MAIN] JWT validated locally for user=" + session.username()
                + " (id=" + session.userId() + ", credits=" + session.credits()
                + ", look=" + session.lookId() + " v" + session.lookVersion() + ")");

        if (!claimJti(jwt)) {
            showFatalError("This game session has already been used.\n\nGo back to the site to start a new one.", null);
            return;
        }
        log("[MAIN] jti claimed — session is unique");

        ui.LoadingDialog loadingDialog = new ui.LoadingDialog();
        loadingDialog.setStatus("Loading your character...");
        loadingDialog.show();

        try {
            final String figure = avatar.LegacyLookFigures.resolve(session.figure(), session.lookId()).toString();
            log("[MAIN] Figure " + figure + "; parts from " + session.partsBaseUrl());
            entity.player.SpriteCache.getInstance().configure(session.partsBaseUrl());
            loadingDialog.setProgress(5);
            boolean composed = entity.player.SpriteCache.getInstance().loadLook(figure);
            log("[MAIN] " + (composed ? "Own look composed" : "Own look NOT composed — grey until the parts are reachable"));
            loadingDialog.setProgress(15);

            loadingDialog.setStatus("Preparing world...");
            loadingDialog.setProgress(18);

            GameWindow gameWindow = new GameWindow(
                    session.username(), session.gender(), jwt, session.lookId(), refreshToken, figure);
            GamePanel gamePanel = gameWindow.getGamePanel();
            gamePanel.setPlayerCredits(session.credits());

            boolean ok = gamePanel.preloadEverything((statusText, pct) -> {
                loadingDialog.setStatus(statusText);
                loadingDialog.setProgress(18 + (pct * 82 / 100));
            });
            if (!ok) throw new IllegalStateException("World preload failed — no spawn room available");

            loadingDialog.setStatus("Entering world...");
            loadingDialog.setProgress(100);
            Thread.sleep(150);

            loadingDialog.close();
            gameWindow.reveal();

            activity.ActivityTracker.install(gameWindow.getWindow(),
                    () -> gameWindow.getGamePanel().networkManager.sendActivity());
            new auth.GameTokenRefresher(gameWindow.getGamePanel().networkManager).start();
            log("[MAIN] in the world");
        } catch (Throwable e) {
            loadingDialog.close();
            log("startup failed: " + e);
            showFatalError("Failed to load the game.\n\nCheck your internet connection and try again.", e);
        }
    }

    /**
     * No session and no server: the game alone, in its starting room. For a
     * look at what the build draws, and for the headless harness.
     *
     * <p>The address may name pictures a backend serves to anyone, to see them
     * come through the build without signing in (see {@link OfflineProbe}):
     * {@code #offline&parts=http://localhost:9090/parts&picture=assets/8864.png}
     */
    private static void startOffline() {
        try {
            final String figure = avatar.LegacyLookFigures.figureFor(1).toString();
            String parts = sessionValue("parts");
            if (parts != null && !parts.isEmpty()) OfflineProbe.look(parts, figure);
            String picture = sessionValue("picture");
            if (picture != null && !picture.isEmpty()) {
                OfflineProbe.pixels();
                OfflineProbe.picture(picture);
            }

            log("constructing GamePanel (offline)...");
            GameWindow window = new GameWindow("WebPlayer", "MALE", "", 1, "", figure);
            GamePanel gp = window.getGamePanel();
            log("GamePanel live: " + gp.getWidth() + "x" + gp.getHeight());
            gp.preloadEverything(null);
            log("preload done");
            window.reveal();
            log("game thread started");
        } catch (Throwable t) {
            log("startup failed: " + t);
        }
    }

    /**
     * Burns the session's id on the backend, as the desktop does: a game token
     * starts one game, once.
     */
    private static boolean claimJti(String jwt) {
        HttpURLConnection conn = null;
        try {
            URL url = new URL(AppConfig.getBackendUrl() + "/api/game/claim-jti");
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + jwt);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            try (OutputStream os = conn.getOutputStream()) {
                os.write(new byte[0]);
            }
            int code = conn.getResponseCode();
            if (code == 200) return true;
            String body = "";
            try {
                if (conn.getErrorStream() != null) {
                    body = new String(conn.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
                }
            } catch (IOException ignored) { }
            log("[MAIN] claim-jti HTTP " + code + " body=" + body);
            return false;
        } catch (Exception e) {
            log("[MAIN] claim-jti failed: " + e);
            return false;
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    /** What the desktop shows in a message box: here a panel over the page, with nothing to click away. */
    private static void showFatalError(String message, Throwable cause) {
        log("FATAL: " + message.replace('\n', ' ') + (cause == null ? "" : " (" + cause + ")"));
        if (!hasPage()) return;
        Overlay.dialog("Futura", "<p style=\"white-space:pre-line;margin:0\">" + Overlay.escape(message) + "</p>", "");
    }

    // ── The page ──────────────────────────────────────────────────────

    @JSBody(params = "m", script = "if (globalThis.__ankLog) globalThis.__ankLog(m); "
                                 + "else if (typeof console !== 'undefined') console.log(m);")
    private static native void log(String m);

    @JSBody(script = "return typeof document !== 'undefined' && !!document.body && !!document.createElement;")
    private static native boolean hasPage();

    /** A string the page set on globalThis before starting the game; null when it did not. */
    @JSBody(params = "name", script =
            "var v = globalThis[name]; return (typeof v === 'string' && v.length) ? v : null;")
    private static native String pageSetting(String name);

    @JSBody(script =
            "if (globalThis.__futuraOffline === true) return true;"
          + "return typeof location !== 'undefined' && /(^|[#&])offline(&|$)/.test(location.hash || '');")
    private static native boolean isOffline();

    /** A value of the session: from the page's object first, else from the address's fragment. */
    @JSBody(params = "key", script =
            "var s = globalThis.__futuraSession;"
          + "if (s && typeof s[key] === 'string' && s[key].length) return s[key];"
          + "if (typeof location === 'undefined' || !location.hash) return null;"
          + "var parts = location.hash.replace(/^#/, '').split('&');"
          + "for (var i = 0; i < parts.length; i++) {"
          + "  var eq = parts[i].indexOf('=');"
          + "  if (eq > 0 && parts[i].substring(0, eq) === key) {"
          + "    try { return decodeURIComponent(parts[i].substring(eq + 1)); } catch (e) { return null; }"
          + "  }"
          + "}"
          + "return null;")
    private static native String sessionValue(String key);

    /** The token must not stay in the address bar, the history or a shared link. */
    @JSBody(script =
            "try {"
          + "  if (typeof location !== 'undefined' && location.hash && /(^|[#&])(jwt|refresh)=/.test(location.hash)"
          + "      && typeof history !== 'undefined' && history.replaceState) {"
          + "    history.replaceState(null, '', location.pathname + location.search);"
          + "  }"
          + "} catch (e) { }")
    private static native void forgetFragment();
}
