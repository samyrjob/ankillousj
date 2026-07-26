import java.security.MessageDigest;
import java.util.Random;

/** SHA-512 first: Ed25519 is meaningless if the hash is wrong. */
public class Sha512Check {
    public static void main(String[] a) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-512");
        Random rnd = new Random(7);
        int checked = 0, bad = 0;

        // every length across the padding boundaries (111..112, 119..120, 128)
        for (int len = 0; len <= 300; len++) {
            byte[] msg = new byte[len];
            rnd.nextBytes(msg);
            byte[] want = md.digest(msg);
            byte[] got = invoke(msg);
            checked++;
            if (!java.util.Arrays.equals(want, got)) { bad++; if (bad < 4) System.out.println("  mismatch at len " + len); }
        }
        for (int i = 0; i < 2000; i++) {
            byte[] msg = new byte[rnd.nextInt(2000)];
            rnd.nextBytes(msg);
            checked++;
            if (!java.util.Arrays.equals(md.digest(msg), invoke(msg))) bad++;
        }
        System.out.println("SHA-512: " + checked + " messages, " + bad + " mismatches");
        System.exit(bad == 0 ? 0 : 1);
    }
    static byte[] invoke(byte[] m) throws Exception {
        var c = Class.forName("security.Sha512");
        var meth = c.getDeclaredMethod("digest", byte[].class);
        meth.setAccessible(true);
        return (byte[]) meth.invoke(null, (Object) m);
    }
}
