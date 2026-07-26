package security;

/**
 * java.security.KeyFactory.
 *
 * Exists only to fail with the same explanation as {@link Signature}: key
 * material is imported through WebCrypto, which is asynchronous, so there is
 * no synchronous KeyFactory to offer. {@code Signature.verifyAsync} takes the
 * raw key bytes directly and imports them itself.
 */
public final class KeyFactory {

    private KeyFactory() { }

    public static KeyFactory getInstance(String algorithm) {
        throw new UnsupportedOperationException(
            "java.security.KeyFactory cannot work in a browser: WebCrypto key import is "
            + "asynchronous. security.Signature.verifyAsync(...) takes raw key bytes and "
            + "imports them itself. See security.Signature for why client-side "
            + "verification is usually the wrong place for this check.");
    }
}
