package concurrent;

import ankillousj.Platform;

import org.teavm.interop.Async;
import org.teavm.interop.AsyncCallback;

/**
 * One thread's wait for one wake-up: the brick the futures, the executors and
 * the event queue are built on.
 *
 * <p>A program thread calls {@link #await}; TeaVM suspends it and the page
 * goes on living. Anyone — another thread, a timer, an event of the browser's
 * — calls {@link #signal}, and the waiting thread resumes on the next turn. A
 * signal given before the wait is kept, so neither order loses it.
 *
 * <p>Java's own {@code wait}/{@code notify} would do between threads, but half
 * the wake-ups here come from the browser's callbacks, which are not threads
 * and own no monitor.
 */
public final class Waiter {

    private AsyncCallback<Boolean> parked;
    private boolean signalled;
    private int timer = -1;

    /**
     * Waits for the signal. {@code timeoutMs < 0} waits for as long as it
     * takes; otherwise false is returned when the time ran out first.
     *
     * @throws IllegalStateException when the caller is not a program thread
     */
    public boolean await(long timeoutMs) {
        if (signalled) {
            signalled = false;
            return true;
        }
        if (!Platform.inThread()) {
            throw new IllegalStateException(
                "a call made by the browser (a paint, an event, a timer) cannot wait; "
                + "only a program thread can");
        }
        return park(this, timeoutMs).booleanValue();
    }

    /** Wakes the waiting thread; kept for the next {@link #await} when none is waiting. */
    public void signal() {
        final AsyncCallback<Boolean> waiting = parked;
        if (waiting == null) {
            signalled = true;
            return;
        }
        parked = null;
        if (timer != -1) {
            EventLoop.cancelTimeout(timer);
            timer = -1;
        }
        EventLoop.soon(() -> waiting.complete(Boolean.TRUE));
    }

    @Async
    private static native Boolean park(Waiter waiter, long timeoutMs);

    private static void park(final Waiter waiter, long timeoutMs, final AsyncCallback<Boolean> callback) {
        waiter.parked = callback;
        if (timeoutMs >= 0) {
            waiter.timer = EventLoop.delay(() -> {
                if (waiter.parked == callback) {
                    waiter.parked = null;
                    waiter.timer = -1;
                    callback.complete(Boolean.FALSE);
                }
            }, timeoutMs);
        }
    }
}
