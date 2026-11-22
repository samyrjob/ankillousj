package concurrent;

/** A future whose result is known when it is made. */
public class CompletedFuture<V> extends TaskFuture<V> {

    public CompletedFuture(V value) { complete(value); }

    public CompletedFuture(RuntimeException failure) { fail(failure); }
}
