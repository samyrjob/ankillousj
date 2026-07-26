package time;

import org.teavm.jso.JSBody;

/** java.time.Instant backed by Date.now(). Millisecond resolution only. */
public final class Instant implements Comparable<Instant> {

    private final long epochMilli;

    private Instant(long epochMilli) { this.epochMilli = epochMilli; }

    @JSBody(script = "return Date.now();")
    private static native double nowMillis();

    public static Instant now() { return new Instant((long) nowMillis()); }
    public static Instant ofEpochMilli(long ms) { return new Instant(ms); }
    public static Instant ofEpochSecond(long s) { return new Instant(s * 1000L); }

    public long toEpochMilli()  { return epochMilli; }
    public long getEpochSecond() { return epochMilli / 1000L; }

    public Instant plus(Duration d)  { return new Instant(epochMilli + d.toMillis()); }
    public Instant minus(Duration d) { return new Instant(epochMilli - d.toMillis()); }

    public boolean isBefore(Instant other) { return epochMilli < other.epochMilli; }
    public boolean isAfter(Instant other)  { return epochMilli > other.epochMilli; }

    @Override public int compareTo(Instant o) { return Long.compare(epochMilli, o.epochMilli); }
    @Override public boolean equals(Object o) {
        return o instanceof Instant && ((Instant) o).epochMilli == epochMilli;
    }
    @Override public int hashCode() { return Long.hashCode(epochMilli); }
    @Override public String toString() { return "Instant[" + epochMilli + "]"; }
}
