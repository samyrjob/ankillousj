package awt.event;

public class ActionEvent {
    private final Object source;
    private final String command;
    public ActionEvent(Object source, String command) { this.source = source; this.command = command; }
    public Object getSource() { return source; }
    public String getActionCommand() { return command; }
}
