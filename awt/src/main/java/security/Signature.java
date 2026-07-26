package security;

import java.io.ByteArrayOutputStream;

/**
 * java.security.Signature for Ed25519, synchronous.
 *
 * <p>The browser's own primitive, WebCrypto, is asynchronous, and this API is
 * not — so rather than force every call site to change, the verification
 * arithmetic is implemented directly in {@link Ed25519}. It is pure
 * computation and runs like any other code.
 *
 * <p>Verification only. Signing requires constant-time arithmetic to be safe,
 * and a client has no business holding a signing key anyway.
 */
public class Signature {

    private final String algorithm;
    private PublicKey key;
    private final ByteArrayOutputStream buffer = new ByteArrayOutputStream();

    private Signature(String algorithm) { this.algorithm = algorithm; }

    public static Signature getInstance(String algorithm) {
        if (!KeyFactory.isEd25519(algorithm)) {
            throw new UnsupportedOperationException(
                "Signature supports Ed25519 only; asked for " + algorithm
                + ". Other algorithms would need their own implementation, since "
                + "WebCrypto is asynchronous and cannot back this API.");
        }
        return new Signature(algorithm);
    }

    public String getAlgorithm() { return algorithm; }

    public void initVerify(PublicKey publicKey) throws InvalidKeyException {
        this.key = publicKey;
        buffer.reset();
    }

    public void update(byte[] data) {
        buffer.write(data, 0, data.length);
    }

    public void update(byte[] data, int off, int len) {
        buffer.write(data, off, len);
    }

    public void update(byte b) {
        buffer.write(b);
    }

    public boolean verify(byte[] signature) throws SignatureException {
        if (key == null) throw new SignatureException("initVerify was not called");
        boolean ok = Ed25519.verify(key.raw(), buffer.toByteArray(), signature);
        buffer.reset();
        return ok;
    }

    /**
     * Signing is not supported.
     *
     * @throws UnsupportedOperationException always
     */
    public void initSign(Object privateKey) {
        throw new UnsupportedOperationException(
            "Ed25519 signing is not implemented: it needs constant-time arithmetic to be "
            + "safe, and a browser client should not hold a signing key. Verification is "
            + "supported.");
    }
}
