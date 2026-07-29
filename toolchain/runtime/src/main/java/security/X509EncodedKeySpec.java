package security;

/** java.security.spec.X509EncodedKeySpec. */
public class X509EncodedKeySpec {

    private final byte[] encoded;

    public X509EncodedKeySpec(byte[] encoded) { this.encoded = encoded.clone(); }

    public byte[] getEncoded() { return encoded.clone(); }
    public String getFormat()  { return "X.509"; }
}
