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
    /**
     * From a stream: by the time one exists its bytes are in memory already (a
     * classpath resource arrives over HTTP as a whole), so they are read to the
     * end and handed to the browser as a blob it can decode. The same answer
     * ImageIO.read(InputStream) gives for pictures.
     */
    public static AudioInputStream getAudioInputStream(InputStream stream)
            throws UnsupportedAudioFileException, java.io.IOException {
        if (stream == null) throw new java.io.IOException("no audio stream");
        java.io.ByteArrayOutputStream buffer = new java.io.ByteArrayOutputStream();
        byte[] chunk = new byte[8192];
        int n;
        while ((n = stream.read(chunk)) > 0) buffer.write(chunk, 0, n);
        byte[] bytes = buffer.toByteArray();
        if (bytes.length == 0) throw new UnsupportedAudioFileException("empty audio stream");
        return new AudioInputStream(blobUrl(bytes, mimeOf(bytes)));
    }

    /** WAV, Ogg or MP3, told by the first bytes; MP3 when nothing else matches. */
    private static String mimeOf(byte[] b) {
        if (b.length >= 4 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F') return "audio/wav";
        if (b.length >= 4 && b[0] == 'O' && b[1] == 'g' && b[2] == 'g' && b[3] == 'S') return "audio/ogg";
        return "audio/mpeg";
    }

    @org.teavm.jso.JSBody(params = { "bytes", "mime" }, script =
            "try { return URL.createObjectURL(new Blob([bytes], { type: mime })); }"
          + "catch (e) { return ''; }")
    private static native String blobUrl(@org.teavm.jso.JSByRef byte[] bytes, String mime);
}
