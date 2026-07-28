package awt;

/**
 * java.awt.KeyboardFocusManager.
 *
 * Swing tracks which component owns the keyboard across a widget tree. There
 * is one canvas here, so it always owns focus and the answers are constant.
 * Present so focus-coordination code compiles and behaves sensibly rather than
 * needing to be deleted.
 */
public class KeyboardFocusManager {

    private static final KeyboardFocusManager INSTANCE = new KeyboardFocusManager();

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
}
