package security;

/**
 * java.security.NoSuchAlgorithmException.
 *
 * TeaVM ships this under java.security, but code ported onto the `security`
 * package needs it here so its catch blocks resolve.
 */
public class NoSuchAlgorithmException extends java.security.GeneralSecurityException {

    public NoSuchAlgorithmException() { super(); }
    public NoSuchAlgorithmException(String message) { super(message); }
    public NoSuchAlgorithmException(String message, Throwable cause) { super(message, cause); }
}
