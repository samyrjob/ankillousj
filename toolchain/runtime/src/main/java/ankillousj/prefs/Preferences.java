package ankillousj.prefs;

import org.teavm.jso.JSBody;

/**
 * java.util.prefs.Preferences, kept in the browser's localStorage.
 *
 * <p>The desktop keeps a program's settings in the registry or a dot folder; a
 * page has localStorage, which lasts between visits the same way. A node is a
 * prefix: the key {@code hidden} of the node {@code /view/chat} is stored as
 * {@code prefs:/view/chat:hidden}.
 *
 * <p>When the browser refuses storage (private windows of some browsers), a
 * value simply does not stay: reads give the default, as on a desktop whose
 * preferences cannot be written.
 */
public class Preferences {

    private static final Preferences USER_ROOT = new Preferences("");

    private final String path;

    private Preferences(String path) { this.path = path; }

    public static Preferences userRoot()   { return USER_ROOT; }
    public static Preferences systemRoot() { return USER_ROOT; }

    /** The node of a class's package: {@code view.chat.X} gives {@code /view/chat}. */
    public static Preferences userNodeForPackage(Class<?> c) {
        String name = c.getName();
        int dot = name.lastIndexOf('.');
        return new Preferences(dot < 0 ? "/<unnamed>" : "/" + name.substring(0, dot).replace('.', '/'));
    }

    public static Preferences systemNodeForPackage(Class<?> c) { return userNodeForPackage(c); }

    /** A node under this one; a path starting with a slash is taken from the root. */
    public Preferences node(String pathName) {
        if (pathName == null || pathName.isEmpty()) return this;
        if (pathName.startsWith("/")) return new Preferences(pathName.length() == 1 ? "" : pathName);
        return new Preferences(path + "/" + pathName);
    }

    public String name() {
        int slash = path.lastIndexOf('/');
        return slash < 0 ? "" : path.substring(slash + 1);
    }

    public String absolutePath() { return path.isEmpty() ? "/" : path; }

    private String storageKey(String key) { return "prefs:" + absolutePath() + ":" + key; }

    // ── Values ────────────────────────────────────────────────────────

    public String get(String key, String def) {
        String stored = read(storageKey(key));
        return stored == null ? def : stored;
    }

    public void put(String key, String value) {
        if (key == null || value == null) throw new NullPointerException();
        write(storageKey(key), value);
    }

    public void remove(String key) { delete(storageKey(key)); }

    public boolean getBoolean(String key, boolean def) {
        String stored = read(storageKey(key));
        if ("true".equalsIgnoreCase(stored)) return true;
        if ("false".equalsIgnoreCase(stored)) return false;
        return def;
    }

    public void putBoolean(String key, boolean value) { put(key, String.valueOf(value)); }

    public int getInt(String key, int def) {
        try {
            String stored = read(storageKey(key));
            return stored == null ? def : Integer.parseInt(stored.trim());
        } catch (NumberFormatException e) {
            return def;
        }
    }

    public void putInt(String key, int value) { put(key, Integer.toString(value)); }

    public long getLong(String key, long def) {
        try {
            String stored = read(storageKey(key));
            return stored == null ? def : Long.parseLong(stored.trim());
        } catch (NumberFormatException e) {
            return def;
        }
    }

    public void putLong(String key, long value) { put(key, Long.toString(value)); }

    public double getDouble(String key, double def) {
        try {
            String stored = read(storageKey(key));
            return stored == null ? def : Double.parseDouble(stored.trim());
        } catch (NumberFormatException e) {
            return def;
        }
    }

    public void putDouble(String key, double value) { put(key, Double.toString(value)); }

    public float getFloat(String key, float def) {
        try {
            String stored = read(storageKey(key));
            return stored == null ? def : Float.parseFloat(stored.trim());
        } catch (NumberFormatException e) {
            return def;
        }
    }

    public void putFloat(String key, float value) { put(key, Float.toString(value)); }

    /** Every key of this node is forgotten. */
    public void clear() throws BackingStoreException { deletePrefix("prefs:" + absolutePath() + ":"); }

    /** localStorage writes at once: nothing waits to be flushed. */
    public void flush() throws BackingStoreException { }
    public void sync() throws BackingStoreException { }

    @Override public String toString() { return "User Preference Node: " + absolutePath(); }

    // ── localStorage ──────────────────────────────────────────────────

    @JSBody(params = "key", script =
            "try { return (typeof localStorage === 'undefined') ? null : localStorage.getItem(key); }"
          + "catch (e) { return null; }")
    private static native String read(String key);

    @JSBody(params = { "key", "value" }, script =
            "try { if (typeof localStorage !== 'undefined') localStorage.setItem(key, value); } catch (e) { }")
    private static native void write(String key, String value);

    @JSBody(params = "key", script =
            "try { if (typeof localStorage !== 'undefined') localStorage.removeItem(key); } catch (e) { }")
    private static native void delete(String key);

    @JSBody(params = "prefix", script =
            "try {"
          + "  if (typeof localStorage === 'undefined') return;"
          + "  for (var i = localStorage.length - 1; i >= 0; i--) {"
          + "    var k = localStorage.key(i);"
          + "    if (k && k.indexOf(prefix) === 0) localStorage.removeItem(k);"
          + "  }"
          + "} catch (e) { }")
    private static native void deletePrefix(String prefix);
}
