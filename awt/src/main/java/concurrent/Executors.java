package concurrent;

/**
 * java.util.concurrent.Executors.
 *
 * Pool size is ignored — there is one thread, and every factory method returns
 * an executor over the same event loop. The distinction between single-thread
 * and fixed-pool has no meaning without Web Workers.
 */
public final class Executors {

    private Executors() { }

    public static ExecutorService newSingleThreadExecutor()      { return new ExecutorService(); }
    public static ExecutorService newFixedThreadPool(int n)      { return new ExecutorService(); }
    public static ExecutorService newCachedThreadPool()          { return new ExecutorService(); }
    public static ExecutorService newWorkStealingPool()          { return new ExecutorService(); }

    public static ScheduledExecutorService newSingleThreadScheduledExecutor() {
        return new ScheduledExecutorService();
    }

    public static ScheduledExecutorService newScheduledThreadPool(int n) {
        return new ScheduledExecutorService();
    }
}
