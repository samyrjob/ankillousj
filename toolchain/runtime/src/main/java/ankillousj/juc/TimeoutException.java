package ankillousj.juc;

/**
 * java.util.concurrent.TimeoutException, which TeaVM's class library does not
 * ship. Supplied through the substitution policy, like the atomic arrays.
 */
public class TimeoutException extends Exception {
    public TimeoutException() { }
    public TimeoutException(String message) { super(message); }
}
