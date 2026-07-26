package time;

/**
 * java.time.Clock. The browser has one clock and no zone handling worth the
 * name here, so systemUTC and systemDefaultZone are the same object.
 */
public abstract class Clock {

    public abstract Instant instant();

    public long millis() { return instant().toEpochMilli(); }

    private static final Clock SYSTEM = new Clock() {
        @Override public Instant instant() { return Instant.now(); }
    };

    public static Clock systemUTC()          { return SYSTEM; }
    public static Clock systemDefaultZone()  { return SYSTEM; }
}
