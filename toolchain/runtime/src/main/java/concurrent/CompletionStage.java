package concurrent;

/**
 * java.util.concurrent.CompletionStage.
 *
 * Present mainly because WebSocket.Listener methods are declared to return it.
 * CompletableFuture implements it; most listener code returns null, which the
 * JDK also accepts.
 */
public interface CompletionStage<T> {
    CompletableFuture<T> toCompletableFuture();
}
