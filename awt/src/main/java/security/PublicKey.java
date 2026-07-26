package security;

/** java.security.PublicKey, holding the raw 32-byte Ed25519 key. */
public class PublicKey {

    private final byte[] raw;
    private final String algorithm;

    PublicKey(byte[] raw, String algorithm) {
        this.raw = raw;
        this.algorithm = algorithm;
    }

    public String getAlgorithm() { return algorithm; }
    public String getFormat()    { return "RAW"; }
    public byte[] getEncoded()   { return raw.clone(); }

    byte[] raw() { return raw; }
}
