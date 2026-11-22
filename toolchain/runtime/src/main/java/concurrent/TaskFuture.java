package concurrent;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/** The result of a task handed to an executor: there when the task has run. */
public class TaskFuture<V> implements Future<V> {

    private V value;
    private Throwable failure;
    private boolean done;
    private boolean cancelled;
    private final List<Waiter> waiters = new ArrayList<>(2);

    void complete(V v) {
        if (done) return;
        value = v;
        done = true;
        wake();
    }

    void fail(Throwable t) {
        if (done) return;
        failure = t;
        done = true;
        wake();
    }

    private void wake() {
        for (Waiter w : waiters) w.signal();
        waiters.clear();
    }

    /** Waits until done; false when {@code timeoutMs} (>= 0) ran out first. */
    private boolean await(long timeoutMs) {
        if (done) return true;
        Waiter w = new Waiter();
        waiters.add(w);
        if (!w.await(timeoutMs)) waiters.remove(w);
        return done;
    }

    private V result() throws ExecutionException {
        if (cancelled) throw new CancellationException();
        if (failure != null) throw new ExecutionException(failure);
        return value;
    }

    @Override public V get() throws InterruptedException, ExecutionException {
        await(-1);
        return result();
    }

    @Override public V get(long timeout, TimeUnit unit)
            throws InterruptedException, ExecutionException, TimeoutException {
        if (!await(Math.max(0, unit.toMillis(timeout)))) throw new TimeoutException();
        return result();
    }

    @Override public boolean isDone() { return done; }
    @Override public boolean isCancelled() { return cancelled; }

    /** A task not yet done is given up: it is not started, or its result is dropped. */
    @Override public boolean cancel(boolean mayInterruptIfRunning) {
        if (done) return false;
        cancelled = true;
        done = true;
        wake();
        return true;
    }
}
