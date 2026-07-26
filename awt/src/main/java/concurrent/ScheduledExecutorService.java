package concurrent;

import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

/**
 * Scheduled work, backed by setTimeout / setInterval.
 *
 * Delays are real here — unlike plain submission, deferring genuinely means
 * something on an event loop.
 */
public class ScheduledExecutorService extends ExecutorService {

    public ScheduledFuture<?> schedule(Runnable task, long delay, TimeUnit unit) {
        ScheduledFuture<Object>[] holder = newHolder();
        int id = EventLoop.delay(() -> {
            task.run();
            holder[0].complete(null);
        }, unit.toMillis(delay));
        holder[0] = new ScheduledFuture<>(id, false);
        return holder[0];
    }

    public <V> ScheduledFuture<V> schedule(Callable<V> task, long delay, TimeUnit unit) {
        ScheduledFuture<V>[] holder = newHolder();
        int id = EventLoop.delay(() -> {
            try {
                holder[0].complete(task.call());
            } catch (Exception e) {
                throw wrap(e);
            }
        }, unit.toMillis(delay));
        holder[0] = new ScheduledFuture<>(id, false);
        return holder[0];
    }

    public ScheduledFuture<?> scheduleAtFixedRate(Runnable task, long initialDelay,
                                                  long period, TimeUnit unit) {
        return repeating(task, initialDelay, period, unit);
    }

    /**
     * setInterval measures from the start of each run rather than the end, so
     * fixed-rate and fixed-delay collapse to the same thing here. The
     * difference only shows when a task overruns its period.
     */
    public ScheduledFuture<?> scheduleWithFixedDelay(Runnable task, long initialDelay,
                                                     long delay, TimeUnit unit) {
        return repeating(task, initialDelay, delay, unit);
    }

    private ScheduledFuture<?> repeating(Runnable task, long initialDelay,
                                         long period, TimeUnit unit) {
        ScheduledFuture<Object>[] holder = newHolder();
        long periodMs = unit.toMillis(period);
        if (initialDelay <= 0) {
            holder[0] = new ScheduledFuture<>(EventLoop.repeat(task::run, periodMs), true);
            return holder[0];
        }
        // Wait out the initial delay, then hand over to the repeating timer.
        int id = EventLoop.delay(() -> {
            task.run();
            EventLoop.repeat(task::run, periodMs);
        }, unit.toMillis(initialDelay));
        holder[0] = new ScheduledFuture<>(id, false);
        return holder[0];
    }

    @SuppressWarnings("unchecked")
    private static <V> ScheduledFuture<V>[] newHolder() {
        return new ScheduledFuture[1];
    }
}
