import security.Ed25519;
import java.security.*;
import java.util.Arrays;
public class Bench {
    public static void main(String[] a) throws Exception {
        KeyPair kp = KeyPairGenerator.getInstance("Ed25519").generateKeyPair();
        byte[] enc = kp.getPublic().getEncoded();
        byte[] pub = Arrays.copyOfRange(enc, enc.length - 32, enc.length);
        byte[] msg = "a representative jwt signing input of moderate length".getBytes();
        Signature s = Signature.getInstance("Ed25519");
        s.initSign(kp.getPrivate()); s.update(msg);
        byte[] sig = s.sign();
        for (int i = 0; i < 3; i++) Ed25519.verify(pub, msg, sig);   // warm up
        long t0 = System.nanoTime();
        int n = 20;
        for (int i = 0; i < n; i++) Ed25519.verify(pub, msg, sig);
        long ms = (System.nanoTime() - t0) / 1_000_000 / n;
        System.out.println("affine BigInteger: ~" + ms + " ms per verify (JVM)");
    }
}
