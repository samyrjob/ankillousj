package awt.event;

import awt.Point;

public class MouseEvent {
    public static final int NOBUTTON = 0;
    public static final int BUTTON1  = 1;   // left
    public static final int BUTTON2  = 2;   // middle
    public static final int BUTTON3  = 3;   // right

    protected final int x, y, button, clickCount;
    protected final boolean shift, ctrl, alt, meta;
    protected final Object source;

    public MouseEvent(Object source, int x, int y, int button, int clickCount,
                      boolean shift, boolean ctrl, boolean alt, boolean meta) {
        this.source = source; this.x = x; this.y = y;
        this.button = button; this.clickCount = clickCount;
        this.shift = shift; this.ctrl = ctrl; this.alt = alt; this.meta = meta;
    }

    public int getX() { return x; }
    public int getY() { return y; }
    public Point getPoint() { return new Point(x, y); }
    public int getButton() { return button; }
    public int getClickCount() { return clickCount; }
    public Object getSource() { return source; }

    public boolean isShiftDown()   { return shift; }
    public boolean isControlDown() { return ctrl; }
    public boolean isAltDown()     { return alt; }
    public boolean isMetaDown()    { return meta; }
    /** AWT's popup trigger is right-click on every platform we care about here. */
    public boolean isPopupTrigger() { return button == BUTTON3; }

    private boolean consumed = false;
    public void consume()      { consumed = true; }
    public boolean isConsumed() { return consumed; }
}
