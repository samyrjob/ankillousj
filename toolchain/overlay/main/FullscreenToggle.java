package main;

import org.teavm.jso.JSBody;

/**
 * Fullscreen, in a browser tab: the Fullscreen API on the page instead of a
 * JFrame's undecorated mode. Same methods as the desktop class.
 *
 * <p>A browser only enters fullscreen on a user's own gesture (a click, a
 * key). The game asks from its fullscreen button and from F11, which are
 * gestures, so the request is honoured.
 *
 * <p>When a page frames the game (Futura's site does), that page holds
 * fullscreen, because a browser gives Keyboard Lock (Esc in fullscreen) to a
 * top page only. It lends it through {@code globalThis.__ankFullscreen}
 * ({@code active}, {@code enter}, {@code leave}), set by index.html, and the
 * requests go there.
 */
public class FullscreenToggle {

    public FullscreenToggle() { }

    /** The desktop class is built with its window; a page needs none. */
    public FullscreenToggle(Object window) { }

    public boolean isFullscreen() { return active(); }

    public void toggle() { setFullscreen(!isFullscreen()); }

    public void setFullscreen(boolean on) {
        if (on == active()) return;
        if (on) enter(); else leave();
    }

    @JSBody(script =
            "var host = globalThis.__ankFullscreen;"
          + "if (host && typeof host.active === 'function') return !!host.active();"
          + "return typeof document !== 'undefined'"
          + " && !!(document.fullscreenElement || document.webkitFullscreenElement);")
    private static native boolean active();

    @JSBody(script =
            "var host = globalThis.__ankFullscreen;"
          + "if (host && typeof host.active === 'function') { try { host.enter(); } catch (e) { } return; }"
          + "try {"
          + "  var el = document.documentElement;"
          + "  var ask = el.requestFullscreen || el.webkitRequestFullscreen;"
          + "  if (ask) { var p = ask.call(el); if (p && p.catch) p.catch(function() { }); }"
          + "} catch (e) { }")
    private static native void enter();

    @JSBody(script =
            "var host = globalThis.__ankFullscreen;"
          + "if (host && typeof host.active === 'function') { try { host.leave(); } catch (e) { } return; }"
          + "try {"
          + "  var leave = document.exitFullscreen || document.webkitExitFullscreen;"
          + "  if (leave) { var p = leave.call(document); if (p && p.catch) p.catch(function() { }); }"
          + "} catch (e) { }")
    private static native void leave();
}
