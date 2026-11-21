package awt.event;

import awt.Point;

public class MouseEvent extends InputEvent {
    public static final int MOUSE_FIRST    = 500;
    public static final int MOUSE_CLICKED  = 500;
    public static final int MOUSE_PRESSED  = 501;
    public static final int MOUSE_RELEASED = 502;
    public static final int MOUSE_MOVED    = 503;
    public static final int MOUSE_ENTERED  = 504;
    public static final int MOUSE_EXITED   = 505;
    public static final int MOUSE_DRAGGED  = 506;
    public static final int MOUSE_WHEEL    = 507;
    public static final int MOUSE_LAST     = 507;

    public static final int NOBUTTON = 0;
    public static final int BUTTON1  = 1;   // left
    public static final int BUTTON2  = 2;   // middle
    public static final int BUTTON3  = 3;   // right

    protected final int x, y, button, clickCount;
    protected final boolean shift, ctrl, alt, meta;
    protected final Object source;
    private int id;
    private int buttonsDown;

    public MouseEvent(Object source, int x, int y, int button, int clickCount,
                      boolean shift, boolean ctrl, boolean alt, boolean meta) {
        this.source = source; this.x = x; this.y = y;
        this.button = button; this.clickCount = clickCount;
        this.shift = shift; this.ctrl = ctrl; this.alt = alt; this.meta = meta;
    }

    /**
     * What the browser says beyond the constructor: the kind of event, and the
     * mouse buttons held down just after it (extended masks). Returns this.
     */
    public MouseEvent with(int id, int buttonsDownMask) {
        this.id = id;
        this.buttonsDown = buttonsDownMask;
        return this;
    }

    public int getID() { return id; }
    public int getX() { return x; }
    public int getY() { return y; }
    public Point getPoint() { return new Point(x, y); }
    public int getButton() { return button; }
    public int getClickCount() { return clickCount; }
    public Object getSource() { return source; }
    public Object getComponent() { return source; }

    @Override public boolean isShiftDown()   { return shift; }
    @Override public boolean isControlDown() { return ctrl; }
    @Override public boolean isAltDown()     { return alt; }
    @Override public boolean isMetaDown()    { return meta; }

    /** The keys and the mouse buttons down just after the event: a released button is not among them. */
    @Override public int getModifiersEx() { return keyMasks(shift, ctrl, alt, meta) | buttonsDown; }

    /** AWT's popup trigger is right-click on every platform we care about here. */
    public boolean isPopupTrigger() { return button == BUTTON3; }

    private boolean consumed = false;
    public void consume()      { consumed = true; }
    public boolean isConsumed() { return consumed; }
}
