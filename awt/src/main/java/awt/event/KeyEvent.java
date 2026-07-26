package awt.event;

public class KeyEvent {
    public static final char CHAR_UNDEFINED = 0xFFFF;

    public static final int VK_ENTER = 10, VK_BACK_SPACE = 8, VK_TAB = 9;
    public static final int VK_ESCAPE = 27, VK_SPACE = 32, VK_DELETE = 127;
    public static final int VK_LEFT = 37, VK_UP = 38, VK_RIGHT = 39, VK_DOWN = 40;
    public static final int VK_SHIFT = 16, VK_CONTROL = 17, VK_ALT = 18;
    public static final int VK_HOME = 36, VK_END = 35;
    public static final int VK_PAGE_UP = 33, VK_PAGE_DOWN = 34;
    public static final int VK_A = 65, VK_Z = 90, VK_0 = 48, VK_9 = 57;
    public static final int VK_F1 = 112, VK_F11 = 122, VK_F12 = 123;

    private final Object source;
    private final int keyCode;
    private final char keyChar;
    private final boolean shift, ctrl, alt, meta;
    private boolean consumed = false;

    public KeyEvent(Object source, int keyCode, char keyChar,
                    boolean shift, boolean ctrl, boolean alt, boolean meta) {
        this.source = source; this.keyCode = keyCode; this.keyChar = keyChar;
        this.shift = shift; this.ctrl = ctrl; this.alt = alt; this.meta = meta;
    }

    public int getKeyCode()  { return keyCode; }
    public char getKeyChar() { return keyChar; }
    public Object getSource() { return source; }
    public boolean isShiftDown()   { return shift; }
    public boolean isControlDown() { return ctrl; }
    public boolean isAltDown()     { return alt; }
    public boolean isMetaDown()    { return meta; }
    public void consume()       { consumed = true; }
    public boolean isConsumed() { return consumed; }
}
