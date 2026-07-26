package awt.event;

public class MouseWheelEvent extends MouseEvent {
    private final int wheelRotation;
    private final double preciseRotation;

    public MouseWheelEvent(Object source, int x, int y, int rotation, double precise,
                           boolean shift, boolean ctrl, boolean alt, boolean meta) {
        super(source, x, y, NOBUTTON, 0, shift, ctrl, alt, meta);
        this.wheelRotation = rotation;
        this.preciseRotation = precise;
    }

    /** Negative = away from the user (scroll up), matching AWT. */
    public int getWheelRotation() { return wheelRotation; }
    public double getPreciseWheelRotation() { return preciseRotation; }
    public int getScrollAmount() { return 3; }
    public int getUnitsToScroll() { return wheelRotation * 3; }
}
