package concurrent;

/** java.util.concurrent.Executors: pools of program threads, of the size asked for. */
public final class Executors {

    private Executors() { }

    public static ExecutorService newSingleThreadExecutor()                { return new ExecutorService(1, null); }
    public static ExecutorService newSingleThreadExecutor(ThreadFactory f) { return new ExecutorService(1, f); }

    public static ExecutorService newFixedThreadPool(int n)                  { return new ExecutorService(n, null); }
    public static ExecutorService newFixedThreadPool(int n, ThreadFactory f) { return new ExecutorService(n, f); }

    public static ExecutorService newCachedThreadPool()                { return new ExecutorService(Integer.MAX_VALUE, null); }
    public static ExecutorService newCachedThreadPool(ThreadFactory f) { return new ExecutorService(Integer.MAX_VALUE, f); }

    /** The JDK sizes it to the processors; a page has one thread of execution, so a few is plenty. */
    public static ExecutorService newWorkStealingPool() { return new ExecutorService(4, null); }

    public static ScheduledExecutorService newSingleThreadScheduledExecutor() {
        return new ScheduledExecutorService(1, null);
    }

    public static ScheduledExecutorService newSingleThreadScheduledExecutor(ThreadFactory f) {
        return new ScheduledExecutorService(1, f);
    }

    public static ScheduledExecutorService newScheduledThreadPool(int n) {
        return new ScheduledExecutorService(n, null);
    }

    public static ScheduledExecutorService newScheduledThreadPool(int n, ThreadFactory f) {
        return new ScheduledExecutorService(n, f);
    }
}
