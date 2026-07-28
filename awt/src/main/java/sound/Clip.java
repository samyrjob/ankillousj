package sound;

import org.teavm.jso.JSBody;
import org.teavm.jso.JSObject;

/**
 * javax.sound.sampled.Clip over an HTML audio element.
 *
 * <h3>Autoplay</h3>
 *
 * Browsers refuse to start audio before the user has interacted with the page.
 * {@link #start()} will silently do nothing until then — the browser rejects
 * the play promise. This is not something a shim can work around; it is a
 * deliberate policy. Trigger the first sound from a click or key press, or
 * accept that ambient audio starts late.
 *
 * <h3>Frames</h3>
 *
 * The JVM counts sample frames; the browser exposes seconds. Frame positions
 * are converted using a nominal 44.1kHz rate, which is right for the sample
 * rates a game ships and wrong for anything unusual. {@code setFramePosition(0)}
 * — by far the common case, meaning "rewind" — is exact either way.
 */
public class Clip {

    public static final int LOOP_CONTINUOUSLY = -1;

    /** Frames per second assumed when converting positions. */
    private static final double NOMINAL_RATE = 44100.0;

    private JSObject audio;
    private boolean open;
    private double linearVolume = 1.0;

    public void open(String url) throws LineUnavailableException {
        audio = Native.create(url);
        Native.setVolume(audio, linearVolume);
        open = true;
    }

    /** Matches the AudioInputStream overload; the stream must carry a URL. */
    public void open(AudioInputStream stream)
            throws LineUnavailableException, java.io.IOException {
        open(stream.url());
    }

    private final java.util.List<LineListener> listeners = new java.util.ArrayList<>();

    public void addLineListener(LineListener l)    { listeners.add(l); }
    public void removeLineListener(LineListener l) { listeners.remove(l); }

    private void fire(LineEvent.Type type) {
        LineEvent e = new LineEvent(this, type);
        for (LineListener l : listeners) l.update(e);
    }

    public void start() {
        if (!open) return;
        Native.play(audio);
        fire(LineEvent.Type.START);
    }

    public void stop() {
        if (!open) return;
        Native.pause(audio);
        fire(LineEvent.Type.STOP);
    }

    public void close() {
        if (!open) return;
        Native.pause(audio);
        Native.setLoop(audio, false);
        open = false;
        fire(LineEvent.Type.CLOSE);
    }

    public void loop(int count) {
        if (!open) return;
        // The browser only offers on/off. A finite repeat count would need
        // counting 'ended' events; continuous is what games actually use.
        Native.setLoop(audio, count == LOOP_CONTINUOUSLY || count > 0);
        Native.play(audio);
    }

    public boolean isOpen() { return open; }

    public boolean isRunning() { return open && Native.isPlaying(audio); }

    public boolean isActive() { return isRunning(); }

    public int getFramePosition() {
        return open ? (int) (Native.currentTime(audio) * NOMINAL_RATE) : 0;
    }

    public void setFramePosition(int frames) {
        if (open) Native.seek(audio, frames / NOMINAL_RATE);
    }

    public long getFrameLength() {
        if (!open) return 0;
        double d = Native.duration(audio);
        return Double.isNaN(d) ? 0 : (long) (d * NOMINAL_RATE);
    }

    public long getMicrosecondLength() {
        if (!open) return 0;
        double d = Native.duration(audio);
        return Double.isNaN(d) ? 0 : (long) (d * 1_000_000);
    }

    public boolean isControlSupported(FloatControl.Type type) {
        return type == FloatControl.Type.MASTER_GAIN || type == FloatControl.Type.VOLUME;
    }

    public FloatControl getControl(FloatControl.Type type) {
        if (!isControlSupported(type)) {
            throw new IllegalArgumentException("unsupported control: " + type);
        }
        return new FloatControl(this);
    }

    void setLinearVolume(double v) {
        linearVolume = Math.max(0.0, Math.min(1.0, v));
        if (open) Native.setVolume(audio, linearVolume);
    }

    static final class Native {
        private Native() { }

        @JSBody(params = "url", script = "var a = new Audio(url); a.preload = 'auto'; return a;")
        static native JSObject create(String url);

        /**
         * play() returns a promise that rejects when autoplay is blocked.
         * Swallowing it keeps an unhandled rejection out of the console; the
         * caller finds out via isRunning().
         */
        @JSBody(params = "a", script = "var p = a.play(); if (p && p.catch) { p.catch(function(){}); }")
        static native void play(JSObject a);

        @JSBody(params = "a", script = "a.pause();")
        static native void pause(JSObject a);

        @JSBody(params = { "a", "on" }, script = "a.loop = on;")
        static native void setLoop(JSObject a, boolean on);

        @JSBody(params = { "a", "v" }, script = "a.volume = v;")
        static native void setVolume(JSObject a, double v);

        @JSBody(params = "a", script = "return !a.paused && !a.ended;")
        static native boolean isPlaying(JSObject a);

        @JSBody(params = "a", script = "return a.currentTime;")
        static native double currentTime(JSObject a);

        @JSBody(params = { "a", "t" }, script = "a.currentTime = t;")
        static native void seek(JSObject a, double t);

        @JSBody(params = "a", script = "return a.duration;")
        static native double duration(JSObject a);
    }
}
