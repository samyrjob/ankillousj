package concurrent;

import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

/**
 * java.util.concurrent.ScheduledExecutorService.
 *
 * <p>The browser's timer says WHEN; the task itself runs on one of the pool's
 * program threads, so it may wait like any other task. A repeating task never
 * overlaps itself: its next run is timed once the current one has ended, at
 * the fixed rate when the run was shorter than the period, at once otherwise.
 * A run that throws ends the repetition, as in the JDK.
 */
public class ScheduledExecutorService extends ExecutorService {

    public ScheduledExecutorService() { this(1, null); }

    public ScheduledExecutorService(int maxWorkers, ThreadFactory factory) {
        super(maxWorkers, factory);
    }

    public ScheduledFuture<?> schedule(final Runnable task, long delay, TimeUnit unit) {
        final ScheduledFuture<Object> future = new ScheduledFuture<>();
        future.timer = EventLoop.delay(() -> {
            future.timer = -1;
            if (future.isCancelled() || isShutdown()) return;
            execute(() -> {
                if (future.isCancelled()) return;
                try {
                    task.run();
                    future.complete(null);
                } catch (Throwable t) {
                    future.fail(t);
                }
            });
        }, Math.max(0, unit.toMillis(delay)));
        return future;
    }

    public <V> ScheduledFuture<V> schedule(final Callable<V> task, long delay, TimeUnit unit) {
        final ScheduledFuture<V> future = new ScheduledFuture<>();
        future.timer = EventLoop.delay(() -> {
            future.timer = -1;
            if (future.isCancelled() || isShutdown()) return;
            execute(() -> {
                if (future.isCancelled()) return;
                try {
                    future.complete(task.call());
                } catch (Throwable t) {
                    future.fail(t);
                }
            });
        }, Math.max(0, unit.toMillis(delay)));
        return future;
    }

    public ScheduledFuture<?> scheduleAtFixedRate(Runnable task, long initialDelay,
                                                  long period, TimeUnit unit) {
        ScheduledFuture<Object> future = new ScheduledFuture<>();
        arm(future, task, Math.max(0, unit.toMillis(initialDelay)), Math.max(1, unit.toMillis(period)), true);
        return future;
    }

    public ScheduledFuture<?> scheduleWithFixedDelay(Runnable task, long initialDelay,
                                                     long delay, TimeUnit unit) {
        ScheduledFuture<Object> future = new ScheduledFuture<>();
        arm(future, task, Math.max(0, unit.toMillis(initialDelay)), Math.max(1, unit.toMillis(delay)), false);
        return future;
    }

    /** Times the next run of a repeating task. */
    private void arm(final ScheduledFuture<Object> future, final Runnable task,
                     long waitMs, final long periodMs, final boolean fixedRate) {
        future.timer = EventLoop.delay(() -> {
            future.timer = -1;
            if (future.isCancelled() || isShutdown()) return;
            execute(() -> {
                if (future.isCancelled()) return;
                double started = EventLoop.now();
                try {
                    task.run();
                } catch (Throwable t) {
                    future.fail(t);      // no further runs
                    return;
                }
                if (future.isCancelled() || isShutdown()) return;
                long took = (long) (EventLoop.now() - started);
                arm(future, task, fixedRate ? Math.max(0, periodMs - took) : periodMs, periodMs, fixedRate);
            });
        }, waitMs);
    }
}
