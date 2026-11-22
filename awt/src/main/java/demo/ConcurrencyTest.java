package demo;

import concurrent.CompletableFuture;
import concurrent.ExecutorService;
import concurrent.Executors;
import concurrent.Future;
import concurrent.ScheduledExecutorService;
import concurrent.ScheduledFuture;
import swing.SwingUtilities;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.teavm.jso.JSBody;

/**
 * Self-checking exercise of the concurrency shims, run in the browser or in
 * Node. Results are reported through the host log so the harness can assert on
 * them without a JUnit runner.
 */
public final class ConcurrencyTest {

    @JSBody(params = "m", script = "if (globalThis.__ankTest) globalThis.__ankTest(m);")
    private static native void report(String m);

    private static void check(String name, boolean ok) {
        report((ok ? "PASS " : "FAIL ") + name);
    }

    private ConcurrencyTest() { }

    public static void run() {
        submitRunsAndCompletes();
        executeIsDeferred();
        scheduleRespectsDelay();
        fixedRateRepeatsAndCancels();
        completableChain();
        completableFailure();
        joinOnIncompleteIsLoud();
        invokeLaterOrdering();
        deferredWorkActuallyRuns();
    }

    /**
     * Deferring is only half the contract — the work has to arrive. These
     * checks report from inside the callbacks, after the loop has drained.
     */
    private static void deferredWorkActuallyRuns() {
        ExecutorService ex = Executors.newSingleThreadExecutor();
        ex.execute(() -> check("execute() eventually runs the task", true));

        SwingUtilities.invokeLater(() -> check("invokeLater() eventually runs the task", true));

        ScheduledExecutorService sch = Executors.newSingleThreadScheduledExecutor();
        sch.schedule(() -> check("schedule() fires after its delay", true),
                15, TimeUnit.MILLISECONDS);

        final int[] ticks = { 0 };
        final ScheduledFuture<?>[] periodic = new ScheduledFuture<?>[1];
        periodic[0] = sch.scheduleAtFixedRate(() -> {
            ticks[0]++;
            if (ticks[0] == 3) {
                periodic[0].cancel(false);
                check("scheduleAtFixedRate repeats", true);
            }
        }, 0, 10, TimeUnit.MILLISECONDS);

        CompletableFuture.supplyAsync(() -> 21)
            .thenApply(v -> v * 2)
            .thenAccept(v -> check("supplyAsync resolves through the chain", v == 42));

        CompletableFuture.<String>supplyAsync(() -> {
            throw new IllegalStateException("nope");
        }).exceptionally(t -> "handled")
          .thenAccept(v -> check("supplyAsync failure reaches exceptionally", "handled".equals(v)));

        // Ordering: a later-queued task must not overtake an earlier one.
        final List<Integer> seq = new ArrayList<>();
        SwingUtilities.invokeLater(() -> seq.add(1));
        SwingUtilities.invokeLater(() -> seq.add(2));
        SwingUtilities.invokeLater(() -> {
            seq.add(3);
            check("invokeLater preserves FIFO order",
                    seq.size() == 3 && seq.get(0) == 1 && seq.get(1) == 2 && seq.get(2) == 3);
        });
    }

    private static void submitRunsAndCompletes() {
        ExecutorService ex = Executors.newSingleThreadExecutor();
        Future<Integer> f = ex.submit(() -> 6 * 7);
        // The task runs on a thread of the pool: not done yet, and get() waits for it.
        boolean pending = !f.isDone();
        Integer got = null;
        try {
            got = f.get();
        } catch (Exception e) {
            // reported by the check below
        }
        check("submit(Callable) runs on the pool and get() waits for it",
                pending && f.isDone() && got != null && got == 42);
        ex.shutdown();
        check("shutdown() flags the executor", ex.isShutdown());
    }

    private static void executeIsDeferred() {
        ExecutorService ex = Executors.newSingleThreadExecutor();
        List<String> order = new ArrayList<>();
        ex.execute(() -> order.add("task"));
        order.add("caller");
        // execute must not run inline, or the caller would appear second
        check("execute() defers past the caller", order.size() == 1 && order.get(0).equals("caller"));
    }

    private static void scheduleRespectsDelay() {
        ScheduledExecutorService ex = Executors.newSingleThreadScheduledExecutor();
        final boolean[] ran = { false };
        ScheduledFuture<?> f = ex.schedule(() -> ran[0] = true, 20, TimeUnit.MILLISECONDS);
        check("schedule() does not run immediately", !ran[0]);
        check("schedule() returns a live handle", !f.isDone() && !f.isCancelled());
        f.cancel(false);
        check("scheduled task can be cancelled", f.isCancelled());
    }

    private static void fixedRateRepeatsAndCancels() {
        ScheduledExecutorService ex = Executors.newSingleThreadScheduledExecutor();
        ScheduledFuture<?> f = ex.scheduleAtFixedRate(() -> { }, 0, 10, TimeUnit.MILLISECONDS);
        boolean cancelled = f.cancel(false);
        check("fixed-rate task cancels cleanly", cancelled && f.isCancelled());
    }

    private static void completableChain() {
        CompletableFuture<Integer> f = CompletableFuture.completedFuture(10);
        final int[] seen = { 0 };
        f.thenApply(v -> v * 3)
         .thenAccept(v -> seen[0] = v);
        check("thenApply/thenAccept chain runs", seen[0] == 30);

        final String[] outcome = { null };
        CompletableFuture.completedFuture("x").whenComplete((v, t) -> outcome[0] = v + ":" + (t == null));
        check("whenComplete sees value and null error", "x:true".equals(outcome[0]));
    }

    private static void completableFailure() {
        CompletableFuture<String> f = new CompletableFuture<>();
        f.completeExceptionally(new IllegalStateException("boom"));
        check("completeExceptionally marks failure", f.isCompletedExceptionally());

        final String[] recovered = { null };
        f.exceptionally(t -> "recovered").thenAccept(v -> recovered[0] = v);
        check("exceptionally substitutes a value", "recovered".equals(recovered[0]));

        final boolean[] sawError = { false };
        f.whenComplete((v, t) -> sawError[0] = t != null);
        check("whenComplete sees the error", sawError[0]);
    }

    private static void joinOnIncompleteIsLoud() {
        // A program thread waits: the result arrives from a timer, twenty milliseconds on.
        final CompletableFuture<String> later = new CompletableFuture<>();
        concurrent.EventLoop.delay(() -> later.complete("there"), 20);
        check("join() waits for the result when a thread calls it", "there".equals(later.join()));

        // A call of the browser's own cannot wait for the loop it is running on: it is told so,
        // loudly, rather than hanging the page.
        concurrent.EventLoop.defer(() -> {
            boolean threw = false;
            try {
                new CompletableFuture<String>().join();
            } catch (IllegalStateException e) {
                threw = true;
            }
            check("join() on incomplete future throws rather than blocking, from a browser call", threw);
        });
    }

    private static void invokeLaterOrdering() {
        final List<String> order = new ArrayList<>();
        final boolean[] onDispatchThread = { false };
        SwingUtilities.invokeLater(() -> {
            order.add("later");
            onDispatchThread[0] = SwingUtilities.isEventDispatchThread();
        });
        order.add("now");
        check("invokeLater defers past the caller", order.size() == 1);
        check("isEventDispatchThread is false off the dispatch thread", !SwingUtilities.isEventDispatchThread());
        SwingUtilities.invokeAndWait(() -> order.add("wait"));
        check("invokeAndWait runs on the dispatch thread and the caller waits",
                order.size() == 3 && order.get(1).equals("later") && order.get(2).equals("wait"));
        check("isEventDispatchThread is true on the dispatch thread", onDispatchThread[0]);
    }
}
