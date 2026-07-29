package awt;

/** java.awt.Cursor, mapped to CSS cursor names. */
public class Cursor {

    public static final int DEFAULT_CURSOR   = 0;
    public static final int CROSSHAIR_CURSOR = 1;
    public static final int TEXT_CURSOR      = 2;
    public static final int WAIT_CURSOR      = 3;
    public static final int HAND_CURSOR      = 12;
    public static final int MOVE_CURSOR      = 13;

    private final int type;

    public Cursor(int type) { this.type = type; }

    public static Cursor getPredefinedCursor(int type) { return new Cursor(type); }
    public static Cursor getDefaultCursor() { return new Cursor(DEFAULT_CURSOR); }

    public int getType() { return type; }

    /** The CSS value a canvas element should be given. */
    public String toCss() {
        switch (type) {
            case CROSSHAIR_CURSOR: return "crosshair";
            case TEXT_CURSOR:      return "text";
            case WAIT_CURSOR:      return "wait";
            case HAND_CURSOR:      return "pointer";
            case MOVE_CURSOR:      return "move";
            default:               return "default";
        }
    }
}
