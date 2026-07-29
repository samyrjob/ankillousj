package swing;

import awt.event.ActionEvent;
import awt.event.ActionListener;
import concurrent.EventLoop;

/**
 * javax.swing.Timer over setInterval.
 *
 * Swing fires these on the event dispatch thread; the browser fires them on
 * its only thread, so the guarantee holds for free.
 */
public class Timer {

    private final int delayMs;
    private final ActionListener listener;
    private int handle = -1;
    private boolean repeats = true;

    public Timer(int delayMs, ActionListener listener) {
        this.delayMs = delayMs;
        this.listener = listener;
    }

    public void start() {
        if (handle != -1) return;
        if (repeats) {
            handle = EventLoop.repeat(this::fire, delayMs);
        } else {
            handle = EventLoop.delay(() -> { fire(); handle = -1; }, delayMs);
        }
    }

    public void stop() {
        if (handle == -1) return;
        if (repeats) EventLoop.cancelInterval(handle);
        else EventLoop.cancelTimeout(handle);
        handle = -1;
    }

    public void restart() { stop(); start(); }

    public boolean isRunning() { return handle != -1; }

    public void setRepeats(boolean b) { repeats = b; }

    public void setInitialDelay(int ms) { }

    private void fire() {
        if (listener != null) listener.actionPerformed(new ActionEvent(this, "timer"));
    }
}
