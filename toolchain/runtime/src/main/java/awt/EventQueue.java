package awt;

import ankillousj.Platform;
import concurrent.Waiter;

import java.util.ArrayDeque;

/**
 * java.awt.EventQueue: the event dispatch thread.
 *
 * <p>On a desktop every listener and every paint runs on one thread, one after
 * the other, and that thread may wait — a click handler that fetches a page,
 * a paint that reads a picture. A browser calls its listeners itself, and what
 * it calls cannot wait. So the browser's calls only QUEUE the work, and one
 * program thread runs the queue: the same single file, and the right to wait.
 *
 * <p>As on a desktop, a handler that waits long holds up what is behind it.
 */
public class EventQueue {

    private static final ArrayDeque<Runnable> QUEUE = new ArrayDeque<>();
    private static final Waiter WAKE = new Waiter();
    private static Thread thread;

    protected EventQueue() { }

    /** Runs {@code r} on the event dispatch thread, after what is already queued. */
    public static void invokeLater(Runnable r) {
        if (r == null) throw new NullPointerException();
        QUEUE.add(r);
        if (thread == null) {
            thread = new Thread(EventQueue::loop, "AWT-EventQueue-0");
            thread.start();
        } else {
            WAKE.signal();
        }
    }

    /**
     * Runs {@code r} on the event dispatch thread and waits for it. On that
     * thread already it runs at once; called by the browser itself, which
     * cannot wait, it is queued.
     */
    public static void invokeAndWait(final Runnable r) {
        if (isDispatchThread()) {
            r.run();
            return;
        }
        if (!Platform.inThread()) {
            invokeLater(r);
            return;
        }
        final Waiter done = new Waiter();
        invokeLater(() -> {
            try {
                r.run();
            } finally {
                done.signal();
            }
        });
        done.await(-1);
    }

    public static boolean isDispatchThread() {
        return thread != null && Platform.inThread() && Thread.currentThread() == thread;
    }

    private static void loop() {
        while (true) {
            Runnable next = QUEUE.poll();
            if (next == null) {
                WAKE.await(-1);
                continue;
            }
            try {
                next.run();
            } catch (Throwable t) {
                // One failed listener must not end the thread every other one runs on.
                Platform.report("an event handler failed: " + t);
            }
        }
    }
}
