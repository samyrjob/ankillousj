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

    /** Declares what the JDK declares, so existing catch blocks stay reachable. */
    public static Clip getClip() throws LineUnavailableException { return new Clip(); }

    public static AudioInputStream getAudioInputStream(URL url)
            throws UnsupportedAudioFileException, java.io.IOException {
        return new AudioInputStream(url.toString());
    }

    public static AudioInputStream getAudioInputStream(String url)
            throws UnsupportedAudioFileException, java.io.IOException {
        return new AudioInputStream(url);
    }

    /**
     * @throws UnsupportedOperationException always. A stream implies the
     *     caller already has the bytes, which means a synchronous read the
     *     browser cannot do. Pass a URL and let the browser fetch it.
     */
    public static AudioInputStream getAudioInputStream(InputStream stream)
            throws UnsupportedAudioFileException, java.io.IOException {
        throw new UnsupportedOperationException(
            "AudioSystem.getAudioInputStream(InputStream) cannot work in a browser: "
            + "there is no synchronous file read. Use getAudioInputStream(String url) "
            + "and let the browser fetch and decode the audio.");
    }
}
