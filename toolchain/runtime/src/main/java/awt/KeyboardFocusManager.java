package awt;

import awt.event.KeyEvent;

import java.util.ArrayList;
import java.util.List;

/**
 * java.awt.KeyboardFocusManager.
 *
 * Swing tracks which component owns the keyboard across a widget tree. There
 * is one canvas here, so it always owns focus and those answers are constant.
 * What is real is the chain of {@link KeyEventDispatcher}s: {@code Component}
 * offers each key event to them before its own listeners.
 */
public class KeyboardFocusManager {

    private static final KeyboardFocusManager INSTANCE = new KeyboardFocusManager();

    private final List<KeyEventDispatcher> dispatchers = new ArrayList<>();

    protected KeyboardFocusManager() { }

    public static KeyboardFocusManager getCurrentKeyboardFocusManager() { return INSTANCE; }

    /** Always null: there is no widget tree to search. */
    public Component getFocusOwner()            { return null; }
    public Component getPermanentFocusOwner()   { return null; }
    public Window getActiveWindow()             { return null; }
    public Window getFocusedWindow()            { return null; }

    public void addPropertyChangeListener(String name, Object listener) { }
    public void removePropertyChangeListener(String name, Object listener) { }
    public void clearGlobalFocusOwner() { }

    public void addKeyEventDispatcher(KeyEventDispatcher dispatcher) {
        if (dispatcher != null && !dispatchers.contains(dispatcher)) dispatchers.add(dispatcher);
    }

    public void removeKeyEventDispatcher(KeyEventDispatcher dispatcher) {
        dispatchers.remove(dispatcher);
    }

    /**
     * Offers a key event to the dispatchers, in the order they were added.
     * True when one of them kept it: the listeners must not see it then.
     */
    public boolean dispatchToDispatchers(KeyEvent e) {
        if (dispatchers.isEmpty()) return false;
        // A copy: a dispatcher may remove itself while handling the event.
        for (KeyEventDispatcher d : new ArrayList<>(dispatchers)) {
            if (d.dispatchKeyEvent(e)) return true;
        }
        return false;
    }
}
