package awt.event;

/**
 * java.awt.event.KeyEvent.
 *
 * Three kinds, told apart by {@link #getID()}: KEY_PRESSED and KEY_RELEASED
 * carry a virtual key code, KEY_TYPED carries the character and VK_UNDEFINED.
 * The codes are the JDK's own values; {@code awt.Component} translates the
 * browser's, which differ for Enter, Delete, Insert and punctuation.
 */
public class KeyEvent extends InputEvent {
    public static final int KEY_FIRST    = 400;
    public static final int KEY_TYPED    = 400;
    public static final int KEY_PRESSED  = 401;
    public static final int KEY_RELEASED = 402;
    public static final int KEY_LAST     = 402;

    public static final char CHAR_UNDEFINED = 0xFFFF;
    public static final int VK_UNDEFINED = 0;

    public static final int VK_CANCEL = 3, VK_BACK_SPACE = 8, VK_TAB = 9, VK_ENTER = 10, VK_CLEAR = 12;
    public static final int VK_SHIFT = 16, VK_CONTROL = 17, VK_ALT = 18, VK_PAUSE = 19, VK_CAPS_LOCK = 20;
    public static final int VK_ESCAPE = 27, VK_SPACE = 32;
    public static final int VK_PAGE_UP = 33, VK_PAGE_DOWN = 34, VK_END = 35, VK_HOME = 36;
    public static final int VK_LEFT = 37, VK_UP = 38, VK_RIGHT = 39, VK_DOWN = 40;
    public static final int VK_COMMA = 44, VK_MINUS = 45, VK_PERIOD = 46, VK_SLASH = 47;
    public static final int VK_0 = 48, VK_1 = 49, VK_2 = 50, VK_3 = 51, VK_4 = 52,
                            VK_5 = 53, VK_6 = 54, VK_7 = 55, VK_8 = 56, VK_9 = 57;
    public static final int VK_SEMICOLON = 59, VK_EQUALS = 61;
    public static final int VK_A = 65, VK_B = 66, VK_C = 67, VK_D = 68, VK_E = 69, VK_F = 70, VK_G = 71,
                            VK_H = 72, VK_I = 73, VK_J = 74, VK_K = 75, VK_L = 76, VK_M = 77, VK_N = 78,
                            VK_O = 79, VK_P = 80, VK_Q = 81, VK_R = 82, VK_S = 83, VK_T = 84, VK_U = 85,
                            VK_V = 86, VK_W = 87, VK_X = 88, VK_Y = 89, VK_Z = 90;
    public static final int VK_OPEN_BRACKET = 91, VK_BACK_SLASH = 92, VK_CLOSE_BRACKET = 93;
    public static final int VK_NUMPAD0 = 96, VK_NUMPAD1 = 97, VK_NUMPAD2 = 98, VK_NUMPAD3 = 99, VK_NUMPAD4 = 100,
                            VK_NUMPAD5 = 101, VK_NUMPAD6 = 102, VK_NUMPAD7 = 103, VK_NUMPAD8 = 104, VK_NUMPAD9 = 105;
    public static final int VK_MULTIPLY = 106, VK_ADD = 107, VK_SEPARATOR = 108, VK_SUBTRACT = 109,
                            VK_DECIMAL = 110, VK_DIVIDE = 111;
    public static final int VK_F1 = 112, VK_F2 = 113, VK_F3 = 114, VK_F4 = 115, VK_F5 = 116, VK_F6 = 117,
                            VK_F7 = 118, VK_F8 = 119, VK_F9 = 120, VK_F10 = 121, VK_F11 = 122, VK_F12 = 123;
    public static final int VK_DELETE = 127, VK_NUM_LOCK = 144, VK_SCROLL_LOCK = 145;
    public static final int VK_PRINTSCREEN = 154, VK_INSERT = 155, VK_HELP = 156, VK_META = 157;
    public static final int VK_BACK_QUOTE = 192, VK_QUOTE = 222;
    public static final int VK_WINDOWS = 524, VK_CONTEXT_MENU = 525;

    private final Object source;
    private final int id;
    private final int keyCode;
    private final char keyChar;
    private final boolean shift, ctrl, alt, meta;
    private boolean consumed = false;

    public KeyEvent(Object source, int id, int keyCode, char keyChar,
                    boolean shift, boolean ctrl, boolean alt, boolean meta) {
        this.source = source; this.id = id; this.keyCode = keyCode; this.keyChar = keyChar;
        this.shift = shift; this.ctrl = ctrl; this.alt = alt; this.meta = meta;
    }

    /** A key press: the form this class had before events carried their kind. */
    public KeyEvent(Object source, int keyCode, char keyChar,
                    boolean shift, boolean ctrl, boolean alt, boolean meta) {
        this(source, KEY_PRESSED, keyCode, keyChar, shift, ctrl, alt, meta);
    }

    public int getID()       { return id; }
    public int getKeyCode()  { return keyCode; }
    public char getKeyChar() { return keyChar; }
    public Object getSource() { return source; }
    public Object getComponent() { return source; }

    @Override public boolean isShiftDown()   { return shift; }
    @Override public boolean isControlDown() { return ctrl; }
    @Override public boolean isAltDown()     { return alt; }
    @Override public boolean isMetaDown()    { return meta; }

    @Override public int getModifiersEx() { return keyMasks(shift, ctrl, alt, meta); }

    /** The old masks: SHIFT_MASK, CTRL_MASK, META_MASK, ALT_MASK. */
    public int getModifiers() {
        return (shift ? SHIFT_MASK : 0) | (ctrl ? CTRL_MASK : 0)
             | (meta ? META_MASK : 0) | (alt ? ALT_MASK : 0);
    }

    /** Whether the key is an action key: one that types no character. */
    public boolean isActionKey() {
        switch (keyCode) {
            case VK_HOME: case VK_END: case VK_PAGE_UP: case VK_PAGE_DOWN:
            case VK_UP: case VK_DOWN: case VK_LEFT: case VK_RIGHT:
            case VK_F1: case VK_F2: case VK_F3: case VK_F4: case VK_F5: case VK_F6:
            case VK_F7: case VK_F8: case VK_F9: case VK_F10: case VK_F11: case VK_F12:
            case VK_PRINTSCREEN: case VK_SCROLL_LOCK: case VK_CAPS_LOCK: case VK_NUM_LOCK:
            case VK_PAUSE: case VK_INSERT: case VK_HELP: case VK_WINDOWS: case VK_CONTEXT_MENU:
                return true;
            default:
                return false;
        }
    }

    public void consume()       { consumed = true; }
    public boolean isConsumed() { return consumed; }
}
