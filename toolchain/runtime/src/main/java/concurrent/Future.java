package concurrent;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * java.util.concurrent.Future, with the JDK's own signatures: code that
 * catches what {@code get} may throw compiles here as it does there.
 *
 * <p>{@code get} waits when a program thread calls it. Called by the browser
 * itself (a paint, an event) on a result that is not there yet, it cannot
 * wait and says so with an IllegalStateException.
 */
public interface Future<V> {
    V get() throws InterruptedException, ExecutionException;
    V get(long timeout, TimeUnit unit) throws InterruptedException, ExecutionException, TimeoutException;
    boolean isDone();
    boolean isCancelled();
    boolean cancel(boolean mayInterruptIfRunning);
}
