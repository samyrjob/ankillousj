package awt.event;

/**
 * java.awt.event.InputEvent: what key and mouse events share — the modifier
 * masks, and which of them were down when the event happened.
 */
public abstract class InputEvent {
    // The old masks (getModifiers)
    public static final int SHIFT_MASK = 1;
    public static final int CTRL_MASK  = 2;
    public static final int META_MASK  = 4;
    public static final int ALT_MASK   = 8;
    public static final int BUTTON1_MASK = 16;
    public static final int BUTTON2_MASK = 8;
    public static final int BUTTON3_MASK = 4;

    // The extended masks (getModifiersEx)
    public static final int SHIFT_DOWN_MASK     = 1 << 6;
    public static final int CTRL_DOWN_MASK      = 1 << 7;
    public static final int META_DOWN_MASK      = 1 << 8;
    public static final int ALT_DOWN_MASK       = 1 << 9;
    public static final int BUTTON1_DOWN_MASK   = 1 << 10;
    public static final int BUTTON2_DOWN_MASK   = 1 << 11;
    public static final int BUTTON3_DOWN_MASK   = 1 << 12;
    public static final int ALT_GRAPH_DOWN_MASK = 1 << 13;

    /** The extended mask of a mouse button: 1 is the left one, 2 the middle, 3 the right. */
    public static int getMaskForButton(int button) {
        switch (button) {
            case 1: return BUTTON1_DOWN_MASK;
            case 2: return BUTTON2_DOWN_MASK;
            case 3: return BUTTON3_DOWN_MASK;
            default:
                if (button <= 0) throw new IllegalArgumentException("button doesn't exist " + button);
                return 1 << (11 + button);   // extra buttons, as the JDK numbers them
        }
    }

    /** The modifier keys and mouse buttons down just after the event, as extended masks. */
    public abstract int getModifiersEx();

    public abstract boolean isShiftDown();
    public abstract boolean isControlDown();
    public abstract boolean isAltDown();
    public abstract boolean isMetaDown();

    /** The keys' part of {@link #getModifiersEx()}. */
    protected static int keyMasks(boolean shift, boolean ctrl, boolean alt, boolean meta) {
        return (shift ? SHIFT_DOWN_MASK : 0) | (ctrl ? CTRL_DOWN_MASK : 0)
             | (alt ? ALT_DOWN_MASK : 0) | (meta ? META_DOWN_MASK : 0);
    }
}
