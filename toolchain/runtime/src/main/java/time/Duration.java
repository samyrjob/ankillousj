package time;

/** java.time.Duration — the subset a client actually uses for timeouts. */
public final class Duration {

    private final long millis;

    private Duration(long millis) { this.millis = millis; }

    public static Duration ofMillis(long ms)   { return new Duration(ms); }
    public static Duration ofSeconds(long s)   { return new Duration(s * 1000L); }
    public static Duration ofMinutes(long m)   { return new Duration(m * 60_000L); }
    public static Duration ofHours(long h)     { return new Duration(h * 3_600_000L); }
    public static Duration ofDays(long d)      { return new Duration(d * 86_400_000L); }
    public static Duration ZERO                = new Duration(0);

    public long toMillis()  { return millis; }
    public long getSeconds() { return millis / 1000L; }
    public long toSeconds()  { return millis / 1000L; }
    public long toMinutes()  { return millis / 60_000L; }

    public Duration plus(Duration other)  { return new Duration(millis + other.millis); }
    public Duration minus(Duration other) { return new Duration(millis - other.millis); }
    public boolean isZero()     { return millis == 0; }
    public boolean isNegative() { return millis < 0; }

    @Override public String toString() { return "PT" + (millis / 1000.0) + "S"; }
}
