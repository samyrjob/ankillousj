package ankillousj.juc;

/**
 * java.util.concurrent.CompletionException, which TeaVM's class library does
 * not ship. Supplied through the substitution policy, like the atomic arrays.
 */
public class CompletionException extends RuntimeException {
    protected CompletionException() { }
    protected CompletionException(String message) { super(message); }
    public CompletionException(String message, Throwable cause) { super(message, cause); }
    public CompletionException(Throwable cause) { super(cause); }
}
