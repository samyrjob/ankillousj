package security;

/** java.security.InvalidKeyException. */
public class InvalidKeyException extends java.security.GeneralSecurityException {

    public InvalidKeyException() { super(); }
    public InvalidKeyException(String message) { super(message); }
    public InvalidKeyException(String message, Throwable cause) { super(message, cause); }
}
