package json;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Readers for application types, registered explicitly instead of discovered
 * by reflection.
 *
 * <h3>The problem this replaces</h3>
 *
 * {@code gson.fromJson(text, Room[].class)} asks a library to build an object
 * by introspecting its class. That works on a JVM and is hostile to a
 * whole-program compiler: to support "any class", Gson must keep machinery for
 * every class, which is how {@code Unsafe}, {@code ObjectStreamClass},
 * {@code InetAddress} and {@code java.sql.Date} end up in a build that never
 * mentions them.
 *
 * <h3>The alternative</h3>
 *
 * Say what you want read. A reader is a lambda from {@link JsonObject} to the
 * type:
 *
 * <pre>
 *     JsonReaders.register(Room.class, o -&gt; {
 *         Room r = new Room(o.get("roomId").getAsString(), ...);
 *         return r;
 *     });
 * </pre>
 *
 * Registered once at startup, and {@code fromJson(text, Room.class)} and
 * {@code fromJson(text, Room[].class)} then both work — the array form maps the
 * element reader across the array.
 *
 * <p>It is more typing than an annotation, and in exchange the compiler can see
 * exactly what is reachable, a renamed field is a compile error rather than a
 * silent null, and nothing has to ship a reflection engine.
 */
public final class JsonReaders {

    private JsonReaders() { }

    private static final Map<Class<?>, Function<JsonElement, ?>> READERS = new HashMap<>();

    /** Registers how to build {@code type} from a JSON value. */
    public static <T> void register(Class<T> type, Function<JsonElement, T> reader) {
        READERS.put(type, reader);
    }

    static boolean has(Class<?> type) { return READERS.containsKey(type); }

    @SuppressWarnings("unchecked")
    static <T> T read(Class<T> type, JsonElement element) {
        Function<JsonElement, ?> reader = READERS.get(type);
        if (reader == null) return null;
        if (element == null || element.isJsonNull()) return null;
        return (T) reader.apply(element);
    }

    /**
     * Reads an array by applying the element type's reader to each entry.
     *
     * @return null when the element type has no registered reader
     */
    @SuppressWarnings("unchecked")
    static <T> T[] readArray(Class<T> componentType, JsonElement element) {
        if (!READERS.containsKey(componentType)) return null;
        if (element == null || element.isJsonNull()) {
            return (T[]) java.lang.reflect.Array.newInstance(componentType, 0);
        }
        JsonArray array = element.getAsJsonArray();
        T[] out = (T[]) java.lang.reflect.Array.newInstance(componentType, array.size());
        for (int i = 0; i < array.size(); i++) {
            out[i] = read(componentType, array.get(i));
        }
        return out;
    }

    // ── helpers, so a reader is a few lines rather than a page ────────

    /** @return the string at {@code field}, or {@code fallback} if absent or null */
    public static String str(JsonObject o, String field, String fallback) {
        JsonElement e = o == null ? null : o.get(field);
        return e == null || e.isJsonNull() ? fallback : e.getAsString();
    }

    public static String str(JsonObject o, String field) { return str(o, field, null); }

    public static int num(JsonObject o, String field, int fallback) {
        JsonElement e = o == null ? null : o.get(field);
        return e == null || e.isJsonNull() ? fallback : e.getAsInt();
    }

    public static long num(JsonObject o, String field, long fallback) {
        JsonElement e = o == null ? null : o.get(field);
        return e == null || e.isJsonNull() ? fallback : e.getAsLong();
    }

    public static boolean bool(JsonObject o, String field, boolean fallback) {
        JsonElement e = o == null ? null : o.get(field);
        return e == null || e.isJsonNull() ? fallback : e.getAsBoolean();
    }

    /** A nested object, or null. */
    public static JsonObject obj(JsonObject o, String field) {
        JsonElement e = o == null ? null : o.get(field);
        return e == null || e.isJsonNull() ? null : e.getAsJsonObject();
    }

    /** A nested array, or an empty one — so callers can iterate without a null check. */
    public static JsonArray arr(JsonObject o, String field) {
        JsonElement e = o == null ? null : o.get(field);
        return e == null || e.isJsonNull() ? new JsonArray() : e.getAsJsonArray();
    }

    /** A two-dimensional int array, which is how tile maps arrive. */
    public static int[][] intGrid(JsonObject o, String field) {
        JsonArray rows = arr(o, field);
        int[][] grid = new int[rows.size()][];
        for (int r = 0; r < rows.size(); r++) {
            JsonArray row = rows.get(r).getAsJsonArray();
            grid[r] = new int[row.size()];
            for (int c = 0; c < row.size(); c++) grid[r][c] = row.get(c).getAsInt();
        }
        return grid;
    }
}
