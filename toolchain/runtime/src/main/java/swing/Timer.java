package swing;

import awt.EventQueue;
import awt.event.ActionEvent;
import awt.event.ActionListener;
import concurrent.EventLoop;

/**
 * javax.swing.Timer: the browser's timer says when, and the listener runs on
 * the event dispatch thread, as Swing's does. A tick whose predecessor has not
 * been handled yet is dropped, which is Swing's coalescing.
 */
public class Timer {

    private int delayMs;
    private int initialDelayMs = -1;
    private final ActionListener listener;
    private int handle = -1;
    private boolean interval;
    private boolean repeats = true;
    private boolean pending;

    public Timer(int delayMs, ActionListener listener) {
        this.delayMs = delayMs;
        this.listener = listener;
    }

    public void start() {
        if (handle != -1) return;
        int first = initialDelayMs >= 0 ? initialDelayMs : delayMs;
        if (repeats && first == delayMs) {
            interval = true;
            handle = EventLoop.repeat(this::tick, Math.max(1, delayMs));
        } else {
            interval = false;
            handle = EventLoop.delay(() -> {
                handle = -1;
                tick();
                if (repeats && handle == -1 && running) {
                    interval = true;
                    handle = EventLoop.repeat(this::tick, Math.max(1, delayMs));
                }
            }, Math.max(0, first));
        }
        running = true;
    }

    private boolean running;

    public void stop() {
        running = false;
        if (handle == -1) return;
        if (interval) EventLoop.cancelInterval(handle);
        else EventLoop.cancelTimeout(handle);
        handle = -1;
    }

    public void restart() { stop(); start(); }

    public boolean isRunning() { return running; }

    public void setRepeats(boolean b) { repeats = b; }
    public boolean isRepeats()        { return repeats; }

    public void setInitialDelay(int ms) { initialDelayMs = ms; }
    public int getInitialDelay()        { return initialDelayMs >= 0 ? initialDelayMs : delayMs; }

    public void setDelay(int ms) {
        delayMs = ms;
        if (running) restart();
    }

    public int getDelay() { return delayMs; }

    private void tick() {
        if (!repeats) running = false;
        if (listener == null || pending) return;
        pending = true;
        EventQueue.invokeLater(() -> {
            pending = false;
            listener.actionPerformed(new ActionEvent(this, "timer"));
        });
    }
}
