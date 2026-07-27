package awt;

/**
 * java.awt.AWTEvent.
 *
 * Only the event-mask constants and the id are really used by application
 * code that listens globally; the browser delivers real events through
 * {@link Toolkit}.
 */
public class AWTEvent {

    public static final long MOUSE_EVENT_MASK        = 0x20;
    public static final long MOUSE_MOTION_EVENT_MASK = 0x40;
    public static final long MOUSE_WHEEL_EVENT_MASK  = 0x20000;
    public static final long KEY_EVENT_MASK          = 0x08;
    public static final long WINDOW_EVENT_MASK       = 0x40000;
    public static final long FOCUS_EVENT_MASK        = 0x04;

    public static final int MOUSE_PRESSED  = 501;
    public static final int MOUSE_RELEASED = 502;
    public static final int MOUSE_MOVED    = 503;
    public static final int MOUSE_DRAGGED  = 506;
    public static final int MOUSE_WHEEL    = 507;
    public static final int KEY_PRESSED    = 401;
    public static final int KEY_RELEASED   = 402;
    public static final int KEY_TYPED      = 400;

    private final Object source;
    private final int id;

    public AWTEvent(Object source, int id) {
        this.source = source;
        this.id = id;
    }

    public Object getSource() { return source; }
    public int getID()        { return id; }
}
