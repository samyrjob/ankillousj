package awt.event;

/** Browsers have no windows; these fire on page lifecycle where sensible. */
public abstract class WindowAdapter implements WindowListener {
    @Override public void windowOpened(WindowEvent e)      { }
    @Override public void windowClosing(WindowEvent e)     { }
    @Override public void windowClosed(WindowEvent e)      { }
    @Override public void windowActivated(WindowEvent e)   { }
    @Override public void windowDeactivated(WindowEvent e) { }
}
