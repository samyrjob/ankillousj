package demo;

import security.Jwt;
import security.KeyFactory;
import security.Signature;
import sound.AudioSystem;
import sound.Clip;
import sound.FloatControl;

import java.io.ByteArrayInputStream;

import org.teavm.jso.JSBody;

/** Audio and crypto shims, including the parts that deliberately refuse. */
public final class SoundCryptoTest {

    @JSBody(params = "m", script = "if (globalThis.__ankTest) globalThis.__ankTest(m);")
    private static native void report(String m);

    private static void check(String name, boolean ok) {
        report((ok ? "PASS " : "FAIL ") + name);
    }

    private SoundCryptoTest() { }

    public static void run() {
        audio();
        crypto();
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

    private static void crypto() {
        boolean sigThrew = false;
        try {
            Signature.getInstance("Ed25519");
        } catch (UnsupportedOperationException e) {
            sigThrew = e.getMessage().contains("verifyAsync");
        }
        check("Signature.getInstance explains why and points at verifyAsync", sigThrew);

        boolean kfThrew = false;
        try {
            KeyFactory.getInstance("Ed25519");
        } catch (UnsupportedOperationException e) {
            kfThrew = e.getMessage().contains("asynchronous");
        }
        check("KeyFactory.getInstance explains why", kfThrew);

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
