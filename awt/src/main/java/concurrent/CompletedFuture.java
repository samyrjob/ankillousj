package concurrent;

/** A Future whose work has already run. */
public class CompletedFuture<V> implements Future<V> {

    private final V value;
    private final RuntimeException failure;
    private boolean cancelled;

    public CompletedFuture(V value) { this.value = value; this.failure = null; }

    public CompletedFuture(RuntimeException failure) { this.value = null; this.failure = failure; }

    @Override public V get() {
        if (failure != null) throw failure;
        return value;
    }

    @Override public V get(long timeout, java.util.concurrent.TimeUnit unit) { return get(); }
    @Override public boolean isDone() { return true; }
    @Override public boolean isCancelled() { return cancelled; }

    /** Already finished, so there is nothing left to cancel. */
    @Override public boolean cancel(boolean mayInterruptIfRunning) { return false; }
}
