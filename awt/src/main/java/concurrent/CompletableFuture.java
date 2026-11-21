package concurrent;

import java.util.ArrayList;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;

/**
 * java.util.concurrent.CompletableFuture over the event loop.
 *
 * The callback half of this API — thenApply, whenComplete, exceptionally —
 * maps cleanly, because that is how the browser wants to be programmed.
 *
 * The blocking half does not. {@code join()} and {@code get()} cannot wait:
 * suspending here would freeze the loop that completes the future, so waiting
 * would deadlock rather than delay. They return the value if it has arrived
 * and throw otherwise, which surfaces the problem at the call site instead of
 * hanging the page.
 */
public class CompletableFuture<T> implements Future<T>, CompletionStage<T> {

    private T value;
    private Throwable failure;
    private boolean done;
    private final List<BiConsumer<T, Throwable>> callbacks = new ArrayList<>();

    public static <U> CompletableFuture<U> completedFuture(U value) {
        CompletableFuture<U> f = new CompletableFuture<>();
        f.complete(value);
        return f;
    }

    /** Runs on the next tick, so the caller gets its future back first. */
    public static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier) {
        CompletableFuture<U> f = new CompletableFuture<>();
        EventLoop.defer(() -> {
            try {
                f.complete(supplier.get());
            } catch (RuntimeException e) {
                f.completeExceptionally(e);
            }
        });
        return f;
    }

    /**
     * The Executor overload. There is one thread, so the executor only decides
     * *when* the work runs, not where — and deferring is what every executor
     * here does anyway.
     */
    public static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier, Object executor) {
        return supplyAsync(supplier);
    }

    public static CompletableFuture<Void> runAsync(Runnable task, Object executor) {
        return runAsync(task);
    }

    public static CompletableFuture<Void> runAsync(Runnable task) {
        CompletableFuture<Void> f = new CompletableFuture<>();
        EventLoop.defer(() -> {
            try {
                task.run();
                f.complete(null);
            } catch (RuntimeException e) {
                f.completeExceptionally(e);
            }
        });
        return f;
    }

    public boolean complete(T v) {
        if (done) return false;
        value = v;
        done = true;
        fire();
        return true;
    }

    public boolean completeExceptionally(Throwable t) {
        if (done) return false;
        failure = t;
        done = true;
        fire();
        return true;
    }

    private void fire() {
        for (BiConsumer<T, Throwable> cb : callbacks) cb.accept(value, failure);
        callbacks.clear();
    }

    private void onDone(BiConsumer<T, Throwable> cb) {
        if (done) cb.accept(value, failure);
        else callbacks.add(cb);
    }

    public CompletableFuture<T> whenComplete(BiConsumer<? super T, ? super Throwable> action) {
        CompletableFuture<T> next = new CompletableFuture<>();
        onDone((v, t) -> {
            action.accept(v, t);
            if (t != null) next.completeExceptionally(t);
            else next.complete(v);
        });
        return next;
    }

    public <U> CompletableFuture<U> thenApply(Function<? super T, ? extends U> fn) {
        CompletableFuture<U> next = new CompletableFuture<>();
        onDone((v, t) -> {
            if (t != null) {
                next.completeExceptionally(t);
                return;
            }
            try {
                next.complete(fn.apply(v));
            } catch (RuntimeException e) {
                next.completeExceptionally(e);
            }
        });
        return next;
    }

    public CompletableFuture<Void> thenAccept(Consumer<? super T> action) {
        return thenApply(v -> { action.accept(v); return null; });
    }

    public CompletableFuture<Void> thenRun(Runnable action) {
        return thenApply(v -> { action.run(); return null; });
    }

    public <U> CompletableFuture<U> thenCompose(
            Function<? super T, ? extends CompletableFuture<U>> fn) {
        CompletableFuture<U> next = new CompletableFuture<>();
        onDone((v, t) -> {
            if (t != null) {
                next.completeExceptionally(t);
                return;
            }
            fn.apply(v).whenComplete((u, e) -> {
                if (e != null) next.completeExceptionally(e);
                else next.complete(u);
            });
        });
        return next;
    }

    public CompletableFuture<T> exceptionally(Function<Throwable, ? extends T> fn) {
        CompletableFuture<T> next = new CompletableFuture<>();
        onDone((v, t) -> {
            if (t != null) next.complete(fn.apply(t));
            else next.complete(v);
        });
        return next;
    }

    /** @throws IllegalStateException if the value has not arrived — see class docs. */
    public T join() {
        if (!done) {
            throw new IllegalStateException(
                "join() on an incomplete CompletableFuture cannot block in a browser; "
                + "use thenAccept/whenComplete instead");
        }
        if (failure != null) throw ExecutorService.wrap((Exception) failure);
        return value;
    }

    /** The value when it is there already, else {@code valueIfAbsent}: never waits. */
    public T getNow(T valueIfAbsent) {
        if (!done) return valueIfAbsent;
        return join();
    }

    @Override public T get() { return join(); }
    @Override public T get(long timeout, java.util.concurrent.TimeUnit unit) { return join(); }
    @Override public boolean isDone() { return done; }
    @Override public boolean isCancelled() { return false; }
    @Override public boolean cancel(boolean mayInterruptIfRunning) { return false; }

    public boolean isCompletedExceptionally() { return done && failure != null; }

    @Override public CompletableFuture<T> toCompletableFuture() { return this; }
}
