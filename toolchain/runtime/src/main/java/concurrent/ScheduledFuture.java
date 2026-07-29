package concurrent;

/** Handle on work the event loop has been asked to run later. */
public class ScheduledFuture<V> implements Future<V> {

    private final int handle;
    private final boolean periodic;
    private boolean cancelled;
    private boolean done;
    private V value;

    ScheduledFuture(int handle, boolean periodic) {
        this.handle = handle;
        this.periodic = periodic;
    }

    void complete(V v) { this.value = v; this.done = true; }

    /**
     * Unlike get() on a completed Future, there is nothing sensible to return
     * for work that has not run yet — and we cannot wait for it. Callers that
     * need the result should use the scheduled task itself as the callback.
     */
    @Override public V get() { return value; }
    @Override public V get(long timeout, java.util.concurrent.TimeUnit unit) { return value; }
    @Override public boolean isDone() { return done; }
    @Override public boolean isCancelled() { return cancelled; }

    @Override public boolean cancel(boolean mayInterruptIfRunning) {
        if (done || cancelled) return false;
        if (periodic) EventLoop.cancelInterval(handle);
        else EventLoop.cancelTimeout(handle);
        cancelled = true;
        return true;
    }
}
