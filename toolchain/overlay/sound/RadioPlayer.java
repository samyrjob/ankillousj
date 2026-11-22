package sound;

import org.teavm.jso.JSBody;
import org.teavm.jso.JSFunctor;
import org.teavm.jso.JSObject;

import java.util.function.Consumer;

/**
 * The radio, for a tab.
 *
 * <p>The desktop class plays a station with two Java sound libraries: JLayer
 * reads an MP3 stream byte by byte, JavaFX plays an HLS one. A browser has
 * neither and needs neither: an audio element plays both kinds by itself (MP3
 * everywhere; HLS in Safari and in the Chrome and Edge of today), follows a
 * stream's redirects, and asks nobody's permission to listen to another site.
 * So this is the desktop class's public face, the same methods, listener and
 * states, over one audio element.
 *
 * <p>Left as it was, the desktop class did worse in a tab than stay silent.
 * For an MP3 station it asked for the stream through an HttpURLConnection,
 * which here is a download: of a stream that never ends, kept in memory second
 * after second.
 *
 * <p>If the desktop class learns something new (a kind of stream, a method),
 * this one must learn it too.
 */
public class RadioPlayer {

    /** A station that drops is called again after this long. */
    private static final int RECONNECT_MS = 2_000;

    /** The desktop starts JavaFX here, for HLS. A browser plays HLS itself: nothing to start. */
    public static void initFx() { }

    private RadioStation currentStation;
    private boolean playing;
    private boolean connecting;
    private boolean stopping;
    /** Goes up at every play and stop: what an audio element let go of says afterwards is not listened to. */
    private int session;
    /** Has this session's station been heard at all: a station that drops is called again, one never heard is not. */
    private boolean heardIt;
    private float volume = 1.0f;
    private JSObject audio;
    private RadioListener listener;

    public interface RadioListener {
        void onStationChanged(RadioStation station);
        void onPlaybackStarted();
        void onPlaybackStopped();
        void onError(String message);
    }

    // ── What the game asks ────────────────────────────────────────────

    public void play(RadioStation station) {
        if (station == null || !station.isStream()) return;
        if (station == currentStation && isActive()) {
            System.out.println("[RADIO] play() ignored — already " + (playing ? "playing" : "connecting"));
            return;
        }
        stop();
        currentStation = station;
        stopping = false;
        connecting = true;
        connect(station);
    }

    public void stop() {
        if (!isActive() && audio == null) return;
        session++;                      // what the old element still says is no longer heard
        stopping = true;
        playing = false;
        connecting = false;
        letGo();
        System.out.println("[RADIO] Stopped");
    }

    public boolean isPlaying()              { return playing; }
    public boolean isActive()               { return playing || connecting; }
    public RadioStation getCurrentStation() { return currentStation; }
    public float getVolume()                { return volume; }

    public void setVolume(float vol) {
        this.volume = Math.max(0f, Math.min(1f, vol));
        if (audio != null) setVolume(audio, this.volume);
    }

    public void setListener(RadioListener l) { this.listener = l; }

    public void nextStation() {
        RadioStation next = (currentStation != null) ? currentStation.next() : RadioStation.values()[0];
        if (next.isStream()) play(next);
    }

    public void previousStation() {
        RadioStation prev = (currentStation != null) ? currentStation.previous() : RadioStation.values()[0];
        if (prev.isStream()) play(prev);
    }

    // ── The audio element ─────────────────────────────────────────────

    private void connect(final RadioStation station) {
        letGo();
        final int mine = ++session;
        heardIt = false;
        System.out.println("[RADIO] Connecting to " + station.getDisplayName());
        audio = start(station.getStreamUrl(), volume, (what, detail) -> heard(mine, station, what, detail));
        if (audio == null && mine == session) failed("this page cannot play sound");
    }

    /** What the audio element says. Called by the browser: nothing here may wait. */
    private void heard(int mine, RadioStation station, String what, String detail) {
        if (mine != session) return;
        if ("playing".equals(what)) {
            if (playing) return;        // back from a pause for buffering: it was playing all along
            connecting = false;
            playing = true;
            heardIt = true;
            System.out.println("[RADIO] Playing: " + station.getDisplayName());
            tell(l -> {
                l.onStationChanged(station);
                l.onPlaybackStarted();
            });
        } else if ("ended".equals(what) || ("error".equals(what) && heardIt)) {
            // A live station does not end: its connection dropped. Called again, as the desktop does.
            playing = false;
            if (stopping) return;
            connecting = true;
            System.out.println("[RADIO] Stream ended, reconnecting...");
            later(() -> {
                if (mine == session && !stopping) connect(station);
            }, RECONNECT_MS);
        } else if ("blocked".equals(what)) {
            failed("the browser plays no sound before a click on the page: press play again");
        } else if ("error".equals(what)) {
            failed(detail == null || detail.isEmpty() ? "this browser cannot play this station" : detail);
        }
    }

    private void failed(String why) {
        playing = false;
        connecting = false;
        letGo();
        if (stopping) return;
        System.err.println("[RADIO] Error: " + why);
        tell(l -> l.onError(why));
    }

    private void letGo() {
        if (audio != null) {
            stop(audio);
            audio = null;
        }
    }

    /** The listener hears on the event dispatch thread, where it may do what a listener does on a desktop. */
    private void tell(Consumer<RadioListener> what) {
        final RadioListener l = listener;
        if (l != null) awt.EventQueue.invokeLater(() -> what.accept(l));
    }

    // ── The page ──────────────────────────────────────────────────────

    @JSFunctor
    interface Heard extends JSObject {
        void heard(String what, String detail);
    }

    @JSFunctor
    interface Then extends JSObject {
        void run();
    }

    /**
     * An audio element playing {@code url}. It says "playing" when sound comes
     * out, "ended" when the stream stops, "error" when it cannot be played, and
     * "blocked" when the browser will not play before the page was clicked.
     * A secure page may only fetch secure sound: on one, an http address is
     * asked for by https.
     */
    @JSBody(params = { "url", "volume", "heard" }, script =
            "if (typeof Audio === 'undefined') return null;"
          + "if (typeof location !== 'undefined' && location.protocol === 'https:' && url.indexOf('http://') === 0) {"
          + "  url = 'https://' + url.substring(7);"
          + "}"
          + "var a = new Audio();"
          + "a.preload = 'none';"
          + "a.volume = Math.max(0, Math.min(1, volume));"
          + "a.addEventListener('playing', function() { heard('playing', ''); });"
          + "a.addEventListener('ended', function() { heard('ended', ''); });"
          + "a.addEventListener('error', function() {"
          + "  var e = a.error;"
          + "  heard('error', e ? ('the browser says: ' + (e.message || ('media error ' + e.code))) : '');"
          + "});"
          + "a.src = url;"
          + "var started = a.play();"
          + "if (started && started.catch) started.catch(function(err) {"
          + "  if (err && err.name === 'NotAllowedError') heard('blocked', '');"
          // AbortError: let go of before it began. NotSupportedError: the element's own error says it.
          + "});"
          + "return a;")
    private static native JSObject start(String url, float volume, Heard heard);

    /** Silence, and the connection closed: a live stream left alone goes on being fetched. */
    @JSBody(params = "a", script =
            "try { a.pause(); a.removeAttribute('src'); a.load(); } catch (e) { }")
    private static native void stop(JSObject a);

    @JSBody(params = { "a", "volume" }, script = "a.volume = Math.max(0, Math.min(1, volume));")
    private static native void setVolume(JSObject a, float volume);

    @JSBody(params = { "then", "ms" }, script = "setTimeout(function() { then(); }, ms);")
    private static native void later(Then then, int ms);
}
