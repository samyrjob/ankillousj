package json;

/**
 * The subset of Gson's facade this codebase actually uses.
 *
 * <h3>What is here</h3>
 *
 * {@code toJson} on any {@link JsonElement}, and {@code fromJson} to
 * {@code JsonElement}, {@code JsonObject}, {@code JsonArray} or
 * {@code JsonPrimitive}. That is the tree model, which is the overwhelming
 * majority of use.
 *
 * <h3>What is not, and why</h3>
 *
 * Binding to an arbitrary class — {@code fromJson(text, MyDto.class)} — needs
 * reflection, and reflection is what makes Gson unusable under a whole-program
 * compiler. Its {@code UnsafeAllocator} reaches for {@code ObjectStreamClass},
 * {@code ConstructorConstructor} enumerates every collection type it might
 * need, and {@code TypeAdapters} registers adapters for {@code InetAddress},
 * {@code java.sql.Date} and {@code AtomicIntegerArray}. All of it gets pulled
 * in whether the application wants it or not.
 *
 * <p>Rather than reproduce that, the reflective overloads throw with a message
 * naming the alternative. There are only a handful of such call sites, and
 * each becomes a few lines of explicit field reading — smaller, faster, and it
 * does not break silently when a field is renamed.
 */
public class Gson {

    public String toJson(JsonElement element) {
        return element == null ? "null" : element.toString();
    }

    public String toJson(Object src) {
        if (src == null) return "null";
        if (src instanceof JsonElement) return src.toString();
        throw new UnsupportedOperationException(
            "Gson.toJson(Object) needs reflection, which a whole-program compiler cannot "
            + "follow without pulling in Unsafe and serialization. Build a JsonObject with "
            + "addProperty and call toJson(JsonElement).");
    }

    /** Generic like Gson's, so {@code JsonObject o = gson.fromJson(s, JsonObject.class)} compiles. */
    @SuppressWarnings("unchecked")
    public <T> T fromJson(String text, Class<T> type) {
        JsonElement parsed = Json.parse(text);
        if (type == JsonElement.class)   return (T) parsed;
        if (type == JsonObject.class)    return (T) parsed.getAsJsonObject();
        if (type == JsonArray.class)     return (T) parsed.getAsJsonArray();
        if (type == JsonPrimitive.class) return (T) parsed.getAsJsonPrimitive();
        if (type == String.class)        return (T) parsed.getAsString();
        throw new UnsupportedOperationException(
            "Gson.fromJson(String, " + type.getSimpleName() + ") needs reflection. Parse to a "
            + "JsonObject and read the fields explicitly — there are only a handful of these, "
            + "and the result is smaller and does not break silently on a rename.");
    }

    /** The TypeToken overload, present so those call sites still compile. */
    public <T> T fromJson(String text, java.lang.reflect.Type type) {
        throw new UnsupportedOperationException(
            "Gson.fromJson(String, Type) needs reflection. Parse to a JsonArray or JsonObject "
            + "and read the elements explicitly.");
    }
}
