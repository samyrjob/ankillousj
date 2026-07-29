package sound;

import javafx.scene.media.Media;
import javafx.scene.media.MediaPlayer;

import javazoom.jl.player.advanced.AdvancedPlayer;
import javazoom.jl.player.advanced.PlaybackEvent;
import javazoom.jl.player.advanced.PlaybackListener;

import java.io.BufferedInputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Streams live internet radio.
 *
 * MP3 streams  -> JLayer (AdvancedPlayer)
 * HLS streams  -> JavaFX MediaPlayer (handles .m3u8 + AAC natively)
 *
 * Requires:
 *   - jl1.0.1.jar    (JLayer)      for MP3
 *   - javafx-media    (JavaFX SDK)  for HLS
 *
 * IMPORTANT: Call RadioPlayer.initFx() once at app startup before using HLS.
 */
public class RadioPlayer {

    // ── JavaFX must be initialized once ──
    private static boolean fxReady = false;

    /**
     * Call once at startup (e.g. in main()) to bootstrap the JavaFX runtime.
     * Without this, JavaFX MediaPlayer will throw an IllegalStateException.
     */
    public static void initFx() {
        if (fxReady) return;
        try {
            new javafx.embed.swing.JFXPanel();
            fxReady = true;
            System.out.println("[RADIO] JavaFX runtime initialized (HLS support enabled)");
        } catch (Exception e) {
            System.err.println("[RADIO] JavaFX not available — HLS streams won't work: " + e.getMessage());
        }
    }

    // ── State ──
    private RadioStation currentStation;
    private volatile boolean playing  = false;
    private volatile boolean stopping = false;
    /** True from play() until the stream actually starts (or fails). */
    private volatile boolean connecting = false;
    /**
     * Incremented on every stop()/play(). A connect thread captures the value
     * at spawn time and aborts if it changed — this is what prevents a
     * double-clicked Play from ending up with two live streams (interrupting
     * a thread blocked in HTTP connect does not reliably kill it).
     */
    private final java.util.concurrent.atomic.AtomicInteger session =
            new java.util.concurrent.atomic.AtomicInteger();
    private float volume = 1.0f;

    // ── JLayer (MP3) ──
    private AdvancedPlayer jlPlayer;
    private Thread jlThread;

    // ── JavaFX (HLS) ──
    private MediaPlayer fxPlayer;

    // ── Listener ──
    private RadioListener listener;

    public interface RadioListener {
        void onStationChanged(RadioStation station);
        void onPlaybackStarted();
        void onPlaybackStopped();
        void onError(String message);
    }

    // ══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ══════════════════════════════════════════════════════════════

    public void play(RadioStation station) {
        if (station == null || !station.isStream()) return;

        // Idempotent: this station is already playing (or mid-connect) — no-op.
        if (station == currentStation && isActive()) {
            System.out.println("[RADIO] play() ignored — already " +
                    (playing ? "playing" : "connecting"));
            return;
        }

        stop();
        currentStation = station;
        stopping = false;
        connecting = true;

        switch (station.getStreamType()) {
            case MP3: playMp3(station); break;
            case HLS: playHls(station); break;
            default: connecting = false; break;
        }
    }

    public void stop() {
        // Idempotent: nothing running, nothing to do.
        if (!isActive() && jlPlayer == null && fxPlayer == null) return;

        session.incrementAndGet(); // invalidate any in-flight connect thread
        stopping = true;
        playing = false;
        connecting = false;

        stopMp3();
        stopHls();

        System.out.println("[RADIO] Stopped");
    }

    public boolean isPlaying()              { return playing; }

    /** Playing OR still connecting — the button-level idempotence check. */
    public boolean isActive()               { return playing || connecting; }
    public RadioStation getCurrentStation() { return currentStation; }
    public float getVolume()                { return volume; }

    public void setVolume(float vol) {
        this.volume = Math.max(0f, Math.min(1f, vol));
        if (fxPlayer != null) {
            javafx.application.Platform.runLater(() -> {
                if (fxPlayer != null) fxPlayer.setVolume(this.volume);
            });
        }
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

    // ══════════════════════════════════════════════════════════════
    // MP3 STREAMING (JLayer)
    // ══════════════════════════════════════════════════════════════

    private void playMp3(RadioStation station) {
        final int mySession = session.get();
        jlThread = new Thread(() -> {
            try {
                System.out.println("[RADIO/MP3] Connecting to " + station.getDisplayName());

                HttpURLConnection conn = openConnection(station.getStreamUrl());
                InputStream raw = conn.getInputStream();
                BufferedInputStream bis = new BufferedInputStream(raw, 8192);

                AdvancedPlayer localPlayer = new AdvancedPlayer(bis);

                // A stop()/play() happened while we were connecting — we are a
                // zombie. Close our own player and vanish without touching state.
                if (mySession != session.get()) {
                    try { localPlayer.close(); } catch (Exception ignored) {}
                    return;
                }

                jlPlayer = localPlayer;
                localPlayer.setPlayBackListener(new PlaybackListener() {
                    @Override
                    public void playbackStarted(PlaybackEvent e) {
                        if (mySession != session.get()) return; // superseded
                        connecting = false;
                        playing = true;
                        System.out.println("[RADIO/MP3] Playing: " + station.getDisplayName());
                        if (listener != null) listener.onPlaybackStarted();
                    }

                    @Override
                    public void playbackFinished(PlaybackEvent e) {
                        if (mySession != session.get()) return; // superseded
                        playing = false;
                        if (!stopping) {
                            System.out.println("[RADIO/MP3] Stream ended, reconnecting...");
                            playMp3(station);
                        } else if (listener != null) {
                            listener.onPlaybackStopped();
                        }
                    }
                });

                if (listener != null) listener.onStationChanged(station);
                localPlayer.play();

            } catch (Exception e) {
                if (mySession == session.get()) {
                    if (!stopping) {
                        System.err.println("[RADIO/MP3] Error: " + e.getMessage());
                        if (listener != null) listener.onError(e.getMessage());
                    }
                    playing = false;
                    connecting = false;
                }
            }
        }, "RadioMP3-" + station.name());

        jlThread.setDaemon(true);
        jlThread.start();
    }

    private void stopMp3() {
        if (jlPlayer != null) {
            try { jlPlayer.close(); } catch (Exception ignored) {}
            jlPlayer = null;
        }
        if (jlThread != null) {
            jlThread.interrupt();
            jlThread = null;
        }
    }

    // ══════════════════════════════════════════════════════════════
    // HLS STREAMING (JavaFX MediaPlayer)
    // ══════════════════════════════════════════════════════════════

    private void playHls(RadioStation station) {
        if (!fxReady) {
            System.err.println("[RADIO/HLS] JavaFX not initialized. Call RadioPlayer.initFx() at startup.");
            connecting = false;
            if (listener != null) listener.onError("JavaFX not available for HLS");
            return;
        }

        final int mySession = session.get();
        javafx.application.Platform.runLater(() -> {
            // stop()/play() happened before this task ran — don't build a player
            if (mySession != session.get()) return;
            try {
                System.out.println("[RADIO/HLS] Connecting to " + station.getDisplayName());

                Media media = new Media(station.getStreamUrl());
                fxPlayer = new MediaPlayer(media);
                fxPlayer.setVolume(volume);

                fxPlayer.setOnReady(() -> {
                    if (mySession != session.get()) return; // superseded
                    fxPlayer.play();
                    connecting = false;
                    playing = true;
                    System.out.println("[RADIO/HLS] Playing: " + station.getDisplayName());
                    if (listener != null) {
                        listener.onStationChanged(station);
                        listener.onPlaybackStarted();
                    }
                });

                fxPlayer.setOnError(() -> {
                    String err = fxPlayer.getError() != null
                            ? fxPlayer.getError().getMessage() : "Unknown error";
                    System.err.println("[RADIO/HLS] Error: " + err);
                    playing = false;
                    if (mySession == session.get()) connecting = false;
                    if (listener != null) listener.onError(err);
                });

                fxPlayer.setOnEndOfMedia(() -> {
                    playing = false;
                    if (!stopping) {
                        System.out.println("[RADIO/HLS] Stream ended, reconnecting...");
                        playHls(station);
                    } else if (listener != null) {
                        listener.onPlaybackStopped();
                    }
                });

                fxPlayer.setOnStopped(() -> {
                    playing = false;
                    if (listener != null) listener.onPlaybackStopped();
                });

            } catch (Exception e) {
                System.err.println("[RADIO/HLS] Failed: " + e.getMessage());
                playing = false;
                connecting = false;
                if (listener != null) listener.onError(e.getMessage());
            }
        });
    }

    private void stopHls() {
        if (fxPlayer != null) {
            javafx.application.Platform.runLater(() -> {
                try {
                    if (fxPlayer != null) {
                        fxPlayer.stop();
                        fxPlayer.dispose();
                        fxPlayer = null;
                    }
                } catch (Exception ignored) {}
            });
        }
    }

    // ══════════════════════════════════════════════════════════════
    // HTTP HELPER
    // ══════════════════════════════════════════════════════════════

    private HttpURLConnection openConnection(String url) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setRequestProperty("User-Agent", "FuturaGame/1.0");
        conn.setConnectTimeout(10_000);
        conn.setReadTimeout(30_000);
        conn.connect();

        int code = conn.getResponseCode();
        if (code == 301 || code == 302) {
            String redirect = conn.getHeaderField("Location");
            conn.disconnect();
            return openConnection(redirect);
        }
        return conn;
    }
}