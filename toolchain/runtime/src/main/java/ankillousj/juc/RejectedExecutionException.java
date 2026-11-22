package ankillousj.juc;

/**
 * java.util.concurrent.RejectedExecutionException, which TeaVM's class
 * library does not ship. Supplied through the substitution policy, like the
 * atomic arrays.
 */
public class RejectedExecutionException extends RuntimeException {
    public RejectedExecutionException() { }
    public RejectedExecutionException(String message) { super(message); }
    public RejectedExecutionException(String message, Throwable cause) { super(message, cause); }
    public RejectedExecutionException(Throwable cause) { super(cause); }
}
