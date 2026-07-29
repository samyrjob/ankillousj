package awt.event;

public class FocusEvent {
    private final Object source;
    public FocusEvent(Object source) { this.source = source; }
    public Object getSource() { return source; }
}
