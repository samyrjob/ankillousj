package sound;

/**
 * javax.sound.sampled.FloatControl.
 *
 * Only MASTER_GAIN matters here, and it carries a trap: the JVM expresses it
 * in <b>decibels</b>, while HTML audio volume is linear 0..1. Passing a
 * decibel value straight through would make every sound silent, so the
 * conversion is done here.
 */
public class FloatControl {

    public static class Type {
        public static final Type MASTER_GAIN = new Type("Master Gain");
        public static final Type VOLUME = new Type("Volume");
        private final String name;
        private Type(String name) { this.name = name; }
        @Override public String toString() { return name; }
    }

    private final Clip clip;
    private float value;

    FloatControl(Clip clip) {
        this.clip = clip;
        this.value = 0f;   // 0 dB is unity gain
    }

    public float getMinimum() { return -80f; }
    public float getMaximum() { return 6f; }

    public void setValue(float db) {
        value = Math.max(getMinimum(), Math.min(getMaximum(), db));
        clip.setLinearVolume(dbToLinear(value));
    }

    public float getValue() { return value; }

    /** amplitude = 10^(dB/20); -80 dB is treated as silence. */
    public static double dbToLinear(float db) {
        if (db <= -80f) return 0.0;
        return Math.pow(10.0, db / 20.0);
    }
}
