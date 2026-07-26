package demo;

import security.Jwt;
import security.KeyFactory;
import security.PublicKey;
import security.Signature;
import security.X509EncodedKeySpec;
import sound.AudioSystem;
import sound.Clip;
import sound.FloatControl;

import java.io.ByteArrayInputStream;

import org.teavm.jso.JSBody;

/** Audio and crypto shims, including the parts that deliberately refuse. */
public final class SoundCryptoTest {

    @JSBody(params = "m", script = "if (globalThis.__ankTest) globalThis.__ankTest(m);")
    private static native void report(String m);

    @JSBody(script = "return Date.now();")
    private static native double nowMillis();

    private static long now() { return (long) nowMillis(); }

    private static void check(String name, boolean ok) {
        report((ok ? "PASS " : "FAIL ") + name);
    }

    private SoundCryptoTest() { }

    public static void run() {
        audio();
        try { crypto(); } catch (Exception e) { check("crypto threw: " + e, false); }
    }

    private static void audio() {
        Clip clip = AudioSystem.getClip();
        check("getClip returns a closed clip", !clip.isOpen());

        clip.open(AudioSystem.getAudioInputStream("/res/sound/theme.mp3"));
        check("open() opens the clip", clip.isOpen());
        check("MASTER_GAIN is supported", clip.isControlSupported(FloatControl.Type.MASTER_GAIN));

        clip.start();
        clip.loop(Clip.LOOP_CONTINUOUSLY);
        clip.setFramePosition(0);
        check("rewind to frame 0 lands at 0", clip.getFramePosition() == 0);

        FloatControl gain = clip.getControl(FloatControl.Type.MASTER_GAIN);
        check("gain range is in decibels", gain.getMinimum() < 0 && gain.getMaximum() > 0);

        // The trap: MASTER_GAIN is dB, HTML volume is linear 0..1
        check("0 dB is unity gain", Math.abs(FloatControl.dbToLinear(0f) - 1.0) < 1e-9);
        check("-6 dB is about half amplitude",
                Math.abs(FloatControl.dbToLinear(-6f) - 0.501) < 0.01);
        check("-80 dB is silence", FloatControl.dbToLinear(-80f) == 0.0);

        clip.stop();
        clip.close();
        check("close() closes the clip", !clip.isOpen());

        boolean threw = false;
        try {
            AudioSystem.getAudioInputStream(new ByteArrayInputStream(new byte[] { 1 }));
        } catch (UnsupportedOperationException e) {
            threw = e.getMessage().contains("getAudioInputStream(String url)");
        }
        check("stream overload fails loudly with a fix in the message", threw);
    }

    /** RFC 8032 section 7.1, vector 2. */
    private static final String RFC_PUB =
        "3d4017c3e843895a92b70aa74d1b7ebc9c982ccf2ec4968cc0cd55f12af4660c";
    private static final String RFC_MSG = "72";
    private static final String RFC_SIG =
        "92a009a9f0d4cab8720e820b5f642540a2b27b5416503f8fb3762223ebdb69da"
        + "085ac1e43e15996e458f3613d0f11d8c387b2eaeb4302aeeb00d291612bb0c00";

    private static byte[] hex(String s) {
        byte[] out = new byte[s.length() / 2];
        for (int i = 0; i < out.length; i++) {
            out[i] = (byte) Integer.parseInt(s.substring(i * 2, i * 2 + 2), 16);
        }
        return out;
    }

    private static void crypto() throws Exception {
        // The whole point: this runs synchronously, in the browser, unchanged.
        KeyFactory kf = KeyFactory.getInstance("Ed25519");
        PublicKey pk = kf.generatePublic(new X509EncodedKeySpec(hex(RFC_PUB)));
        check("KeyFactory accepts a raw 32-byte key", pk != null);

        Signature sig = Signature.getInstance("Ed25519");
        sig.initVerify(pk);
        sig.update(hex(RFC_MSG));
        check("RFC 8032 vector verifies in the browser", sig.verify(hex(RFC_SIG)));

        // tamper with the signature
        byte[] bad = hex(RFC_SIG);
        bad[10] ^= 0x01;
        sig.initVerify(pk);
        sig.update(hex(RFC_MSG));
        check("tampered signature is rejected", !sig.verify(bad));

        // tamper with the message
        sig.initVerify(pk);
        sig.update(hex("73"));
        check("tampered message is rejected", !sig.verify(hex(RFC_SIG)));

        // S >= L would make signatures malleable
        byte[] bigS = hex(RFC_SIG);
        for (int i = 32; i < 64; i++) bigS[i] = (byte) 0xff;
        sig.initVerify(pk);
        sig.update(hex(RFC_MSG));
        check("S >= L is rejected", !sig.verify(bigS));

        // X.509 SubjectPublicKeyInfo, which is what a JWKS hands you
        byte[] spki = new byte[44];
        byte[] prefix = hex("302a300506032b657003210 0".replace(" ", ""));
        System.arraycopy(prefix, 0, spki, 0, 12);
        System.arraycopy(hex(RFC_PUB), 0, spki, 12, 32);
        PublicKey fromSpki = kf.generatePublic(new X509EncodedKeySpec(spki));
        Signature s2 = Signature.getInstance("Ed25519");
        s2.initVerify(fromSpki);
        s2.update(hex(RFC_MSG));
        check("X.509 SubjectPublicKeyInfo unwraps and verifies", s2.verify(hex(RFC_SIG)));

        // Time it honestly: this is the number that decides whether it is usable
        long t0 = now();
        for (int i = 0; i < 5; i++) {
            Signature t = Signature.getInstance("Ed25519");
            t.initVerify(pk);
            t.update(hex(RFC_MSG));
            t.verify(hex(RFC_SIG));
        }
        long per = (now() - t0) / 5;
        report("INFO  Ed25519 verify: ~" + per + " ms each in compiled JS");
        check("a verification completes in under 400 ms", per < 400);

        boolean signThrew = false;
        try {
            Signature.getInstance("Ed25519").initSign(new Object());
        } catch (UnsupportedOperationException e) {
            signThrew = true;
        }
        check("signing is refused", signThrew);

        // Reading claims needs no crypto — which is what most client code wants
        // {"sub":"player-7","exp":2000000000,"iat":1700000000}
        String jwt = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9"
                + ".eyJzdWIiOiJwbGF5ZXItNyIsImV4cCI6MjAwMDAwMDAwMCwiaWF0IjoxNzAwMDAwMDAwfQ"
                + ".c2lnbmF0dXJl";

        String payload = Jwt.decodePayload(jwt);
        check("payload decodes without verifying", payload != null && payload.contains("player-7"));

        String header = Jwt.decodeHeader(jwt);
        check("header decodes", header != null && header.contains("EdDSA"));

        check("numeric claim reads exp", Jwt.numericClaim(jwt, "exp") == 2000000000L);
        check("numeric claim reads iat", Jwt.numericClaim(jwt, "iat") == 1700000000L);
        check("missing claim returns -1", Jwt.numericClaim(jwt, "nope") == -1);

        check("not expired before exp", !Jwt.isExpired(jwt, 1800000000L));
        check("expired after exp", Jwt.isExpired(jwt, 2100000000L));

        check("malformed token returns null", Jwt.decodePayload("not-a-jwt") == null);
        check("null token returns null", Jwt.decodePayload(null) == null);
    }
}
