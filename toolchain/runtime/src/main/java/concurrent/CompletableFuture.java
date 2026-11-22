package concurrent;

import ankillousj.Platform;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.function.BiConsumer;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;

/**
 * java.util.concurrent.CompletableFuture.
 *
 * <p>Two things make it behave as on a desktop:
 *
 * <ul>
 *   <li><b>{@code get} and {@code join} wait</b> when a program thread calls
 *       them. Called by the browser itself (a paint, an event) on a result not
 *       there yet, they cannot wait and say so.</li>
 *   <li><b>What depends on the result runs on a program thread</b>, so a
 *       {@code thenAccept} that fetches or reads may. The async suppliers run
 *       on a thread of their own, or on the executor given; the stages attached
 *       run where the result arrives when that is a thread, and on a fresh one
 *       when the result came from a call of the browser's (a socket opening, a
 *       timer).</li>
 * </ul>
 */
public class CompletableFuture<T> implements Future<T>, CompletionStage<T> {

    private T value;
    private Throwable failure;
    private boolean done;
    private boolean cancelled;
    private final List<BiConsumer<T, Throwable>> callbacks = new ArrayList<>();
    private final List<Waiter> waiters = new ArrayList<>(1);

    public CompletableFuture() { }

    public static <U> CompletableFuture<U> completedFuture(U value) {
        CompletableFuture<U> f = new CompletableFuture<>();
        f.complete(value);
        return f;
    }

    public static <U> CompletableFuture<U> failedFuture(Throwable t) {
        CompletableFuture<U> f = new CompletableFuture<>();
        f.completeExceptionally(t);
        return f;
    }

    // ── Starting work ─────────────────────────────────────────────────

    public static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier) {
        return supplyAsync(supplier, null);
    }

    /** {@code executor}: a java.util.concurrent.Executor (the pools of this package are); else a thread of its own. */
    public static <U> CompletableFuture<U> supplyAsync(final Supplier<U> supplier, Object executor) {
        final CompletableFuture<U> f = new CompletableFuture<>();
        start(() -> {
            try {
                f.complete(supplier.get());
            } catch (Throwable t) {
                f.completeExceptionally(t);
            }
        }, executor);
        return f;
    }

    public static CompletableFuture<Void> runAsync(Runnable task) {
        return runAsync(task, null);
    }

    public static CompletableFuture<Void> runAsync(final Runnable task, Object executor) {
        final CompletableFuture<Void> f = new CompletableFuture<>();
        start(() -> {
            try {
                task.run();
                f.complete(null);
            } catch (Throwable t) {
                f.completeExceptionally(t);
            }
        }, executor);
        return f;
    }

    private static void start(Runnable work, Object executor) {
        if (executor instanceof java.util.concurrent.Executor) {
            ((java.util.concurrent.Executor) executor).execute(work);
        } else {
            new Thread(work).start();
        }
    }

    // ── Completing ────────────────────────────────────────────────────

    public boolean complete(T v) {
        if (done) return false;
        value = v;
        done = true;
        settled();
        return true;
    }

    public boolean completeExceptionally(Throwable t) {
        if (done) return false;
        failure = t;
        done = true;
        settled();
        return true;
    }

    private void settled() {
        for (Waiter w : waiters) w.signal();
        waiters.clear();
        if (callbacks.isEmpty()) return;
        final List<BiConsumer<T, Throwable>> toRun = new ArrayList<>(callbacks);
        callbacks.clear();
        final Runnable fire = () -> {
            for (BiConsumer<T, Throwable> cb : toRun) {
                try {
                    cb.accept(value, failure);
                } catch (Throwable t) {
                    Platform.report("a completion stage failed: " + t);
                }
            }
        };
        // What depends on the result may wait: it runs on a thread. This one when it is one.
        if (Platform.inThread()) fire.run();
        else new Thread(fire).start();
    }

    private void onDone(BiConsumer<T, Throwable> cb) {
        if (done) cb.accept(value, failure);
        else callbacks.add(cb);
    }

    // ── Stages ────────────────────────────────────────────────────────

    public CompletableFuture<T> whenComplete(BiConsumer<? super T, ? super Throwable> action) {
        CompletableFuture<T> next = new CompletableFuture<>();
        onDone((v, t) -> {
            try {
                action.accept(v, t);
            } catch (RuntimeException e) {
                next.completeExceptionally(t != null ? t : e);
                return;
            }
            if (t != null) next.completeExceptionally(t);
            else next.complete(v);
        });
        return next;
    }

    public <U> CompletableFuture<U> handle(BiFunction<? super T, Throwable, ? extends U> fn) {
        CompletableFuture<U> next = new CompletableFuture<>();
        onDone((v, t) -> {
            try {
                next.complete(fn.apply(v, t));
            } catch (RuntimeException e) {
                next.completeExceptionally(e);
            }
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

    // The Async forms: here every stage already runs on a program thread.
    public <U> CompletableFuture<U> thenApplyAsync(Function<? super T, ? extends U> fn) { return thenApply(fn); }
    public CompletableFuture<Void> thenAcceptAsync(Consumer<? super T> action)          { return thenAccept(action); }
    public CompletableFuture<Void> thenRunAsync(Runnable action)                        { return thenRun(action); }

    public <U> CompletableFuture<U> thenCompose(
            Function<? super T, ? extends CompletableFuture<U>> fn) {
        CompletableFuture<U> next = new CompletableFuture<>();
        onDone((v, t) -> {
            if (t != null) {
                next.completeExceptionally(t);
                return;
            }
            try {
                fn.apply(v).whenComplete((u, e) -> {
                    if (e != null) next.completeExceptionally(e);
                    else next.complete(u);
                });
            } catch (RuntimeException e) {
                next.completeExceptionally(e);
            }
        });
        return next;
    }

    public CompletableFuture<T> exceptionally(Function<Throwable, ? extends T> fn) {
        CompletableFuture<T> next = new CompletableFuture<>();
        onDone((v, t) -> {
            if (t == null) {
                next.complete(v);
                return;
            }
            try {
                next.complete(fn.apply(t));
            } catch (RuntimeException e) {
                next.completeExceptionally(e);
            }
        });
        return next;
    }

    /** Done when every one of them is. */
    public static CompletableFuture<Void> allOf(CompletableFuture<?>... futures) {
        final CompletableFuture<Void> all = new CompletableFuture<>();
        if (futures.length == 0) {
            all.complete(null);
            return all;
        }
        final int[] left = { futures.length };
        final Throwable[] firstFailure = { null };
        for (CompletableFuture<?> f : futures) {
            f.whenComplete((v, t) -> {
                if (t != null && firstFailure[0] == null) firstFailure[0] = t;
                if (--left[0] == 0) {
                    if (firstFailure[0] != null) all.completeExceptionally(firstFailure[0]);
                    else all.complete(null);
                }
            });
        }
        return all;
    }

    // ── Reading ───────────────────────────────────────────────────────

    /** Waits until done; false when {@code timeoutMs} (>= 0) ran out first. */
    private boolean await(long timeoutMs) {
        if (done) return true;
        Waiter w = new Waiter();
        waiters.add(w);
        if (!w.await(timeoutMs)) waiters.remove(w);
        return done;
    }

    /** The result, waited for. A failure comes back as the exception itself when unchecked, wrapped when not. */
    public T join() {
        await(-1);
        if (cancelled) throw new CancellationException();
        if (failure != null) throw ExecutorService.wrap(failure);
        return value;
    }

    /** The value when it is there already, else {@code valueIfAbsent}: never waits. */
    public T getNow(T valueIfAbsent) {
        if (!done) return valueIfAbsent;
        return join();
    }

    @Override public T get() throws InterruptedException, ExecutionException {
        await(-1);
        if (cancelled) throw new CancellationException();
        if (failure != null) throw new ExecutionException(failure);
        return value;
    }

    @Override public T get(long timeout, TimeUnit unit)
            throws InterruptedException, ExecutionException, TimeoutException {
        if (!await(Math.max(0, unit.toMillis(timeout)))) throw new TimeoutException();
        if (cancelled) throw new CancellationException();
        if (failure != null) throw new ExecutionException(failure);
        return value;
    }

    @Override public boolean isDone() { return done; }
    @Override public boolean isCancelled() { return cancelled; }

    @Override public boolean cancel(boolean mayInterruptIfRunning) {
        if (done) return false;
        cancelled = true;
        return completeExceptionally(new CancellationException());
    }

    public boolean isCompletedExceptionally() { return done && failure != null; }

    @Override public CompletableFuture<T> toCompletableFuture() { return this; }
}
