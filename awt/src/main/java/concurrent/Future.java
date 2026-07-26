package concurrent;

/**
 * java.util.concurrent.Future.
 *
 * IMPORTANT SEMANTIC DIFFERENCE. On the JVM {@code get()} blocks until the
 * result is ready. A browser cannot block — doing so would freeze the very
 * event loop that would produce the result. So a task submitted to an executor
 * here runs immediately and inline, and the Future it returns is already
 * complete by the time you hold it.
 *
 * That keeps {@code submit(...).get()} working, which is what most code does.
 * What it does not give you is parallelism: work is interleaved, not
 * simultaneous. Genuine parallelism needs Web Workers.
 */
public interface Future<V> {
    V get();
    V get(long timeout, java.util.concurrent.TimeUnit unit);
    boolean isDone();
    boolean isCancelled();
    boolean cancel(boolean mayInterruptIfRunning);
}
