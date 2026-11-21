package sound;

/**
 * Stands in for javax.sound.sampled.AudioInputStream.
 *
 * There is no stream — the browser fetches and decodes the audio itself. This
 * only carries the URL through to the Clip.
 */
public class AudioInputStream implements java.io.Closeable {

    private final String url;

    AudioInputStream(String url) { this.url = url; }

    public String url() { return url; }

    @Override public void close() { }
}
