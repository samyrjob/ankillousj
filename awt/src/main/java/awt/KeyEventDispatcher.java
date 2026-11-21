package awt;

import awt.event.KeyEvent;

/**
 * java.awt.KeyEventDispatcher: sees every key event before the listeners do.
 * Returning true keeps the event: nothing after it receives it.
 */
public interface KeyEventDispatcher {
    boolean dispatchKeyEvent(KeyEvent e);
}
