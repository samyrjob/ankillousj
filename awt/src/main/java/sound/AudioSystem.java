package sound;

import java.io.InputStream;
import java.net.URL;

/**
 * javax.sound.sampled.AudioSystem.
 *
 * Format support is the browser's, not the JVM's: MP3, AAC, WAV and OGG all
 * work, and the JVM's own list is irrelevant here.
 */
public final class AudioSystem {

    private AudioSystem() { }

    public static Clip getClip() { return new Clip(); }

    public static AudioInputStream getAudioInputStream(URL url) {
        return new AudioInputStream(url.toString());
    }

    public static AudioInputStream getAudioInputStream(String url) {
        return new AudioInputStream(url);
    }

    /**
     * @throws UnsupportedOperationException always. A stream implies the
     *     caller already has the bytes, which means a synchronous read the
     *     browser cannot do. Pass a URL and let the browser fetch it.
     */
    public static AudioInputStream getAudioInputStream(InputStream stream) {
        throw new UnsupportedOperationException(
            "AudioSystem.getAudioInputStream(InputStream) cannot work in a browser: "
            + "there is no synchronous file read. Use getAudioInputStream(String url) "
            + "and let the browser fetch and decode the audio.");
    }
}
