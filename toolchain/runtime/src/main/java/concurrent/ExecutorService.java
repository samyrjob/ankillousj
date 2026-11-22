package concurrent;

import ankillousj.Platform;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.TimeUnit;

/**
 * java.util.concurrent.ExecutorService, on program threads.
 *
 * <p>A task runs on a thread of its own kind — a TeaVM coroutine — so it may
 * do what a desktop task does: fetch over HTTP, read a picture, sleep, wait
 * for another result. The pool's size is kept: a pool of four runs four tasks
 * at a time and queues the rest, in the order they came. That matters beyond
 * fidelity — a program that loads two hundred pictures through a pool of four
 * is counting on not opening two hundred connections.
 *
 * <p>Workers are not kept idle: one is started when a task arrives and there
 * is room, and ends when the queue is empty. A coroutine costs next to
 * nothing to start.
 */
public class ExecutorService implements java.util.concurrent.Executor {

    private final int maxWorkers;
    private final ThreadFactory factory;
    private final ArrayDeque<Runnable> queue = new ArrayDeque<>();
    private int workers;
    private boolean shutdown;
    private final List<Waiter> terminationWaiters = new ArrayList<>(1);

    /** As many workers as there are tasks: a cached pool. */
    public ExecutorService() { this(Integer.MAX_VALUE, null); }

    public ExecutorService(int maxWorkers, ThreadFactory factory) {
        this.maxWorkers = Math.max(1, maxWorkers);
        this.factory = factory;
    }

    @Override
    public void execute(Runnable task) {
        if (task == null) throw new NullPointerException();
        if (shutdown) throw new RejectedExecutionException("executor is shut down");
        queue.add(task);
        if (workers < maxWorkers) {
            workers++;
            Thread worker = factory != null ? factory.newThread(this::work) : null;
            if (worker == null) worker = new Thread(this::work);
            worker.start();
        }
    }

    private void work() {
        try {
            Runnable task;
            while ((task = queue.poll()) != null) {
                try {
                    task.run();
                } catch (Throwable t) {
                    Platform.report("a task failed: " + t);
                }
            }
        } finally {
            workers--;
            if (workers == 0 && queue.isEmpty()) {
                for (Waiter w : terminationWaiters) w.signal();
                terminationWaiters.clear();
            }
        }
    }

    public <T> Future<T> submit(Callable<T> task) {
        if (task == null) throw new NullPointerException();
        final TaskFuture<T> future = new TaskFuture<>();
        execute(() -> {
            if (future.isCancelled()) return;
            try {
                future.complete(task.call());
            } catch (Throwable t) {
                future.fail(t);
            }
        });
        return future;
    }

    public Future<?> submit(Runnable task) {
        return submit(task, null);
    }

    public <T> Future<T> submit(Runnable task, T result) {
        if (task == null) throw new NullPointerException();
        final TaskFuture<T> future = new TaskFuture<>();
        execute(() -> {
            if (future.isCancelled()) return;
            try {
                task.run();
                future.complete(result);
            } catch (Throwable t) {
                future.fail(t);
            }
        });
        return future;
    }

    /** Runs them all and waits for every one. Only from a program thread. */
    public <T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks) throws InterruptedException {
        List<Future<T>> futures = new ArrayList<>(tasks.size());
        for (Callable<T> task : tasks) futures.add(submit(task));
        for (Future<T> f : futures) {
            try {
                f.get();
            } catch (java.util.concurrent.ExecutionException | RuntimeException ignored) {
                // the caller reads each outcome from its future
            }
        }
        return futures;
    }

    /** No new task is taken; the ones queued still run. */
    public void shutdown() {
        shutdown = true;
    }

    /** No new task is taken, and the ones not yet started are handed back. */
    public List<Runnable> shutdownNow() {
        shutdown = true;
        List<Runnable> never = new ArrayList<>(queue);
        queue.clear();
        return never;
    }

    public boolean isShutdown() { return shutdown; }

    public boolean isTerminated() { return shutdown && workers == 0 && queue.isEmpty(); }

    /** Waits for the last task after a shutdown. Called by the browser itself, it only answers. */
    public boolean awaitTermination(long timeout, TimeUnit unit) throws InterruptedException {
        if (isTerminated() || !shutdown || !Platform.inThread()) return isTerminated();
        Waiter w = new Waiter();
        terminationWaiters.add(w);
        if (!w.await(Math.max(0, unit.toMillis(timeout)))) terminationWaiters.remove(w);
        return isTerminated();
    }

    static RuntimeException wrap(Throwable e) {
        return e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
    }
}
