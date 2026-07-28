package time;

import org.teavm.jso.JSBody;

/**
 * java.time.LocalDateTime, enough for timestamping.
 *
 * Backed by the browser's clock. Fields come from the local Date object, so
 * "local" means the user's timezone, which is what the desktop class means too.
 */
public final class LocalDateTime implements Comparable<LocalDateTime> {

    private final long epochMilli;

    private LocalDateTime(long epochMilli) { this.epochMilli = epochMilli; }

    public static LocalDateTime now() { return new LocalDateTime((long) nowMillis()); }

    public static LocalDateTime ofEpochMilli(long ms) { return new LocalDateTime(ms); }

    public int getYear()       { return field(epochMilli, 0); }
    public int getMonthValue() { return field(epochMilli, 1) + 1; }   // JS months are 0-based
    public int getDayOfMonth() { return field(epochMilli, 2); }
    public int getHour()       { return field(epochMilli, 3); }
    public int getMinute()     { return field(epochMilli, 4); }
    public int getSecond()     { return field(epochMilli, 5); }

    public LocalDateTime plusSeconds(long s) { return new LocalDateTime(epochMilli + s * 1000); }
    public LocalDateTime minusSeconds(long s) { return new LocalDateTime(epochMilli - s * 1000); }

    public boolean isBefore(LocalDateTime o) { return epochMilli < o.epochMilli; }
    public boolean isAfter(LocalDateTime o)  { return epochMilli > o.epochMilli; }

    @Override public int compareTo(LocalDateTime o) { return Long.compare(epochMilli, o.epochMilli); }

    /** ISO-8601 without the offset, matching java.time.LocalDateTime.toString(). */
    @Override public String toString() {
        return pad(getYear(), 4) + "-" + pad(getMonthValue(), 2) + "-" + pad(getDayOfMonth(), 2)
             + "T" + pad(getHour(), 2) + ":" + pad(getMinute(), 2) + ":" + pad(getSecond(), 2);
    }

    private static String pad(int v, int width) {
        StringBuilder sb = new StringBuilder(Integer.toString(v));
        while (sb.length() < width) sb.insert(0, '0');
        return sb.toString();
    }

    @JSBody(script = "return Date.now();")
    private static native double nowMillis();

    /** 0 year, 1 month, 2 day, 3 hour, 4 minute, 5 second */
    @JSBody(params = { "ms", "which" }, script =
            "var d = new Date(ms);"
          + "switch (which) {"
          + "  case 0: return d.getFullYear();"
          + "  case 1: return d.getMonth();"
          + "  case 2: return d.getDate();"
          + "  case 3: return d.getHours();"
          + "  case 4: return d.getMinutes();"
          + "  default: return d.getSeconds();"
          + "}")
    private static native int field(double ms, int which);
}
