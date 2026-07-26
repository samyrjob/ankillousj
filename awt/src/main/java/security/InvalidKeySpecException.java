package security;

/**
 * java.security.spec.InvalidKeySpecException.
 *
 * TeaVM's class library has NoSuchAlgorithmException and
 * GeneralSecurityException but not this one, and code that catches it would
 * not compile without it.
 */
public class InvalidKeySpecException extends java.security.GeneralSecurityException {

    public InvalidKeySpecException() { super(); }
    public InvalidKeySpecException(String message) { super(message); }
    public InvalidKeySpecException(String message, Throwable cause) { super(message, cause); }
}
