package awt.event;

public class WindowEvent {
    private final Object source;
    public WindowEvent(Object source) { this.source = source; }
    public Object getSource() { return source; }
    public Object getWindow() { return source; }
}
