package javafx.scene.media;
public class MediaPlayer {
    public static final int INDEFINITE = -1;
    public MediaPlayer(Media m) { }
    public void play() { }
    public void pause() { }
    public void stop() { }
    public void dispose() { }
    public void setVolume(double v) { }
    public double getVolume() { return 1.0; }
    public void setCycleCount(int c) { }
    public void setOnReady(Runnable r) { }
    public void setOnError(Runnable r) { }
    public void setOnEndOfMedia(Runnable r) { }
    public MediaException getError() { return null; }
    public void setOnStopped(Runnable r) { }
    public void setOnPlaying(Runnable r) { }
    public void setOnPaused(Runnable r) { }
    public Object getStatus() { return null; }
}
