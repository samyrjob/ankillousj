package concurrent;

/** The handle of a scheduled task: cancelling it stops the timer, and a repeating task's later runs. */
public class ScheduledFuture<V> extends TaskFuture<V> {

    /** The browser timer waiting to start the next run; -1 when none is. */
    int timer = -1;

    ScheduledFuture() { }

    @Override public boolean cancel(boolean mayInterruptIfRunning) {
        if (timer != -1) {
            EventLoop.cancelTimeout(timer);
            timer = -1;
        }
        return super.cancel(mayInterruptIfRunning);
    }
}
