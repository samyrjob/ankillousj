package concurrent;

/**
 * java.util.concurrent.ThreadFactory, which TeaVM's class library does not
 * ship.
 *
 * Present so `Executors.newSingleThreadScheduledExecutor(r -> ...)` compiles
 * and links. The factory is never invoked — there is one thread — but a
 * lambda passed here needs a functional interface to target, and `Object`
 * would not give it one.
 */
@FunctionalInterface
public interface ThreadFactory {
    Thread newThread(Runnable r);
}
