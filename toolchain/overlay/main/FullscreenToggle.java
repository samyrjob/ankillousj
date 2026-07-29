package main;

/**
 * No-op stand-in for the Swing implementation.
 *
 * This class was built on javax.swing widgets, which have no canvas
 * equivalent. It is one of the ten files earmarked for rebuilding as HTML
 * overlays rather than emulating.
 *
 * The public API is preserved so callers compile and link unchanged; the
 * methods do nothing, so a dialog simply does not appear. That is deliberate:
 * a missing dialog is obvious, whereas a silently-broken one is not.
 */
public class FullscreenToggle {

    public boolean isFullscreen() { return false; }

    public void toggle() { }

    public void setFullscreen(boolean a0) { }
}
