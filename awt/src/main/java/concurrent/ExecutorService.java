package concurrent;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

/**
 * java.util.concurrent.ExecutorService over the browser event loop.
 *
 * Submitted work runs inline and immediately, so the returned Future is
 * already complete — see {@link Future} for why blocking is not an option.
 * `execute` defers to the next tick instead, matching the fire-and-forget
 * intent of code that uses it.
 */
public class ExecutorService {

    private boolean shutdown;
    private final List<Integer> pending = new ArrayList<>();

    public <T> Future<T> submit(Callable<T> task) {
        if (shutdown) throw new IllegalStateException("executor is shut down");
        try {
            return new CompletedFuture<>(task.call());
        } catch (Exception e) {
            return new CompletedFuture<>(wrap(e));
        }
    }

    public Future<?> submit(Runnable task) {
        if (shutdown) throw new IllegalStateException("executor is shut down");
        try {
            task.run();
            return new CompletedFuture<Object>((Object) null);
        } catch (RuntimeException e) {
            return new CompletedFuture<Object>(e);
        }
    }

    /** Fire and forget — deferred so the caller returns first, as on a pool. */
    public void execute(Runnable task) {
        if (shutdown) throw new IllegalStateException("executor is shut down");
        int id = EventLoop.defer(task::run);
        pending.add(id);
    }

    public void shutdown() {
        shutdown = true;
    }

    public List<Runnable> shutdownNow() {
        shutdown = true;
        for (int id : pending) EventLoop.cancelTimeout(id);
        pending.clear();
        return new ArrayList<>();
    }

    public boolean isShutdown() { return shutdown; }
    public boolean isTerminated() { return shutdown && pending.isEmpty(); }

    /**
     * Cannot wait — waiting would block the loop that runs the work. Reports
     * whether everything already finished.
     */
    public boolean awaitTermination(long timeout, TimeUnit unit) { return isTerminated(); }

    static RuntimeException wrap(Exception e) {
        return e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
    }
}
