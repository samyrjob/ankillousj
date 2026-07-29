package javazoom.jl.player.advanced;
import java.io.InputStream;
/** Compile-time stand-in: the real MP3 decoder is not in the source drop. */
public class AdvancedPlayer {
    public AdvancedPlayer(InputStream s) { }
    public void play() { }
    public void play(int from, int to) { }
    public void close() { }
    public void setPlayBackListener(PlaybackListener l) { }
}
