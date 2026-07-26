import security.Ed25519;
import java.security.*;
import java.util.Arrays;
import java.util.Random;

/**
 * Ed25519 verification against the JDK as oracle, plus the RFC 8032 vectors.
 * Negative cases matter as much as positive ones: a verifier that returns true
 * for everything passes every positive test.
 */
public class EdCheck {

    static int checked = 0, bad = 0;

    static void expect(String what, boolean got, boolean want) {
        checked++;
        if (got != want) { bad++; if (bad < 8) System.out.println("  " + what + ": got " + got + " want " + want); }
    }

    static byte[] rawPublic(PublicKey pk) {
        // X.509 wraps Ed25519 keys; the raw 32 bytes are the tail
        byte[] enc = pk.getEncoded();
        return Arrays.copyOfRange(enc, enc.length - 32, enc.length);
    }

    static byte[] hex(String s) {
        byte[] out = new byte[s.length() / 2];
        for (int i = 0; i < out.length; i++) {
            out[i] = (byte) Integer.parseInt(s.substring(i * 2, i * 2 + 2), 16);
        }
        return out;
    }

    public static void main(String[] a) throws Exception {
        // --- RFC 8032 section 7.1 test vectors ---
        rfc("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a",
            "",
            "e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b");
        rfc("3d4017c3e843895a92b70aa74d1b7ebc9c982ccf2ec4968cc0cd55f12af4660c",
            "72",
            "92a009a9f0d4cab8720e820b5f642540a2b27b5416503f8fb3762223ebdb69da085ac1e43e15996e458f3613d0f11d8c387b2eaeb4302aeeb00d291612bb0c00");
        rfc("fc51cd8e6218a1a38da47ed00230f0580816ed13ba3303ac5deb911548908025",
            "af82",
            "6291d657deec24024827e69c3abe01a30ce548a284743a445e3680d7db5ac3ac18ff9b538d16f290ae67f760984dc6594a7c15e9716ed28dc027beceea1ec40a");
        System.out.println("RFC 8032 vectors: " + (bad == 0 ? "all pass" : bad + " FAILED"));

        // --- differential against the JDK ---
        KeyPairGenerator g = KeyPairGenerator.getInstance("Ed25519");
        Random rnd = new Random(1234);
        int rounds = 300;
        for (int i = 0; i < rounds; i++) {
            KeyPair kp = g.generateKeyPair();
            byte[] pub = rawPublic(kp.getPublic());

            byte[] msg = new byte[rnd.nextInt(200)];
            rnd.nextBytes(msg);

            Signature s = Signature.getInstance("Ed25519");
            s.initSign(kp.getPrivate());
            s.update(msg);
            byte[] sig = s.sign();

            expect("valid signature", Ed25519.verify(pub, msg, sig), true);

            // flip one bit of the signature
            byte[] badSig = sig.clone();
            badSig[rnd.nextInt(64)] ^= (byte) (1 << rnd.nextInt(8));
            expect("tampered signature", Ed25519.verify(pub, msg, badSig), false);

            // flip one bit of the message
            if (msg.length > 0) {
                byte[] badMsg = msg.clone();
                badMsg[rnd.nextInt(badMsg.length)] ^= 1;
                expect("tampered message", Ed25519.verify(pub, badMsg, sig), false);
            }

            // a different key
            byte[] otherPub = rawPublic(g.generateKeyPair().getPublic());
            expect("wrong public key", Ed25519.verify(otherPub, msg, sig), false);
        }

        // --- malformed inputs must be rejected, not crash ---
        KeyPair kp = g.generateKeyPair();
        byte[] pub = rawPublic(kp.getPublic());
        Signature s = Signature.getInstance("Ed25519");
        s.initSign(kp.getPrivate());
        s.update("x".getBytes());
        byte[] sig = s.sign();

        expect("null key", Ed25519.verify(null, "x".getBytes(), sig), false);
        expect("short key", Ed25519.verify(new byte[31], "x".getBytes(), sig), false);
        expect("short signature", Ed25519.verify(pub, "x".getBytes(), new byte[63]), false);
        expect("all-zero signature", Ed25519.verify(pub, "x".getBytes(), new byte[64]), false);

        // S >= L must be rejected: otherwise signatures are malleable
        byte[] bigS = sig.clone();
        for (int i = 32; i < 64; i++) bigS[i] = (byte) 0xff;
        expect("S >= L rejected", Ed25519.verify(pub, "x".getBytes(), bigS), false);

        // a public key that is not a curve point
        byte[] notOnCurve = new byte[32];
        Arrays.fill(notOnCurve, (byte) 0xff);
        expect("key not on curve", Ed25519.verify(notOnCurve, "x".getBytes(), sig), false);

        System.out.println(checked + " checks, " + bad + " failures");
        System.exit(bad == 0 ? 0 : 1);
    }

    static void rfc(String pubHex, String msgHex, String sigHex) {
        expect("RFC vector", Ed25519.verify(hex(pubHex), hex(msgHex), hex(sigHex)), true);
    }
}
