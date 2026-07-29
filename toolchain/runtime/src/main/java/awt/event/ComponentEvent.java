package awt.event;

public class ComponentEvent {
    private final Object source;
    public ComponentEvent(Object source) { this.source = source; }
    public Object getSource() { return source; }
    public Object getComponent() { return source; }
}
