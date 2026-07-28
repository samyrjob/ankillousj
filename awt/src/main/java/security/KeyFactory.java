package security;

/**
 * java.security.KeyFactory, Ed25519 only.
 *
 * An Ed25519 SubjectPublicKeyInfo is a fixed 44-byte structure — a twelve-byte
 * prefix naming the algorithm, then the key. Rather than pull in a DER parser
 * for one shape, the prefix is checked and the tail taken.
 */
public class KeyFactory {

    /** 30 2a 30 05 06 03 2b 65 70 03 21 00 — SEQUENCE, OID 1.3.101.112, BIT STRING */
    private static final byte[] ED25519_SPKI_PREFIX = {
        0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00
    };

    private final String algorithm;

    private KeyFactory(String algorithm) { this.algorithm = algorithm; }

    public static KeyFactory getInstance(String algorithm) throws NoSuchAlgorithmException {
        if (!isEd25519(algorithm)) {
            throw new NoSuchAlgorithmException(
                "KeyFactory supports Ed25519 only; asked for " + algorithm);
        }
        return new KeyFactory(algorithm);
    }

    static boolean isEd25519(String algorithm) {
        return "Ed25519".equalsIgnoreCase(algorithm)
            || "EdDSA".equalsIgnoreCase(algorithm)
            || "1.3.101.112".equals(algorithm);
    }

    public PublicKey generatePublic(X509EncodedKeySpec spec) throws InvalidKeySpecException {
        byte[] enc = spec.getEncoded();

        // Already raw
        if (enc.length == 32) return new PublicKey(enc, algorithm);

        if (enc.length == ED25519_SPKI_PREFIX.length + 32) {
            for (int i = 0; i < ED25519_SPKI_PREFIX.length; i++) {
                if (enc[i] != ED25519_SPKI_PREFIX[i]) {
                    throw new InvalidKeySpecException(
                        "not an Ed25519 SubjectPublicKeyInfo: prefix mismatch at byte " + i);
                }
            }
            byte[] raw = new byte[32];
            System.arraycopy(enc, ED25519_SPKI_PREFIX.length, raw, 0, 32);
            return new PublicKey(raw, algorithm);
        }

        throw new InvalidKeySpecException(
            "expected 32 raw bytes or a 44-byte Ed25519 SubjectPublicKeyInfo, got " + enc.length);
    }
}
