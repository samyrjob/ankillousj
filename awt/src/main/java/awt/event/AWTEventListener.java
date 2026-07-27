package awt.event;

import awt.AWTEvent;

/**
 * java.awt.event.AWTEventListener.
 *
 * Swing uses this to watch every event in the application regardless of which
 * component has focus — idle detection being the usual reason. The browser
 * equivalent is a listener on {@code document} in the capture phase, which
 * {@link awt.Toolkit} installs.
 */
public interface AWTEventListener {
    void eventDispatched(AWTEvent event);
}
