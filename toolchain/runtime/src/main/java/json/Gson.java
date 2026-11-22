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
        if (src instanceof CharSequence) {
            StringBuilder sb = new StringBuilder();
            Json.escape(src.toString(), sb);
            return sb.toString();
        }
        if (src instanceof Number || src instanceof Boolean) return String.valueOf(src);

        // Maps, lists and arrays describe their own structure, so no
        // reflection is needed to write them. This covers the common
        // `Map.of("username", name)` request-body idiom outright.
        JsonElement tree = toTree(src);
        if (tree != null) return tree.toString();

        throw new UnsupportedOperationException(
            "no JSON writer for " + src.getClass().getSimpleName() + ". Reflection is deliberately "
            + "not used here. A Map, a list or an array describe themselves; for an application "
            + "type register a writer:\n"
            + "    JsonWriters.register(" + src.getClass().getSimpleName() + ".class, x -> ...);");
    }

    /** @return the value as a tree, or null if its shape is not self-describing */
    private static JsonElement toTree(Object src) {
        if (src == null) return JsonNull.INSTANCE;
        if (src instanceof JsonElement) return (JsonElement) src;
        if (src instanceof CharSequence) return new JsonPrimitive(src.toString());
        if (src instanceof Number) return new JsonPrimitive((Number) src);
        if (src instanceof Boolean) return new JsonPrimitive((Boolean) src);

        if (src instanceof java.util.Map) {
            JsonObject o = new JsonObject();
            for (java.util.Map.Entry<?, ?> e : ((java.util.Map<?, ?>) src).entrySet()) {
                JsonElement v = toTree(e.getValue());
                if (v == null) return null;
                o.add(String.valueOf(e.getKey()), v);
            }
            return o;
        }

        if (src instanceof Iterable) {
            JsonArray a = new JsonArray();
            for (Object item : (Iterable<?>) src) {
                JsonElement v = toTree(item);
                if (v == null) return null;
                a.add(v);
            }
            return a;
        }

        if (src.getClass().isArray()) {
            JsonArray a = new JsonArray();
            int n = java.lang.reflect.Array.getLength(src);
            for (int i = 0; i < n; i++) {
                JsonElement v = toTree(java.lang.reflect.Array.get(src, i));
                if (v == null) return null;
                a.add(v);
            }
            return a;
        }

        // An application type: written by the writer registered for it, if any.
        return JsonWriters.write(src);
    }

    /**
     * What Gson builds when asked for an Object: a map for an object, a list
     * for an array, a Double for a number, as its callers expect.
     */
    private static Object natural(JsonElement e) {
        if (e == null || e.isJsonNull()) return null;
        if (e.isJsonObject()) {
            java.util.Map<String, Object> map = new java.util.LinkedHashMap<>();
            for (java.util.Map.Entry<String, JsonElement> entry : e.getAsJsonObject().entrySet()) {
                map.put(entry.getKey(), natural(entry.getValue()));
            }
            return map;
        }
        if (e.isJsonArray()) {
            java.util.List<Object> list = new java.util.ArrayList<>();
            for (JsonElement item : e.getAsJsonArray()) list.add(natural(item));
            return list;
        }
        JsonPrimitive p = e.getAsJsonPrimitive();
        if (p.isBoolean()) return p.getAsBoolean();
        if (p.isNumber()) return p.getAsDouble();
        return p.getAsString();
    }

    /** Generic like Gson's, so {@code JsonObject o = gson.fromJson(s, JsonObject.class)} compiles. */
    public <T> T fromJson(String text, Class<T> type) {
        return fromJson(Json.parse(text), type);
    }

    /** From a tree already parsed: one element of an array read item by item. */
    @SuppressWarnings("unchecked")
    public <T> T fromJson(JsonElement parsed, Class<T> type) {
        if (parsed == null) return null;
        if (parsed.isJsonNull() && type != JsonElement.class) return null;
        if (type == JsonElement.class)   return (T) parsed;
        if (type == JsonObject.class)    return (T) parsed.getAsJsonObject();
        if (type == JsonArray.class)     return (T) parsed.getAsJsonArray();
        if (type == JsonPrimitive.class) return (T) parsed.getAsJsonPrimitive();
        if (type == String.class)        return (T) parsed.getAsString();
        if (type == Object.class)        return (T) natural(parsed);

        // An explicitly registered reader, which is the alternative to
        // reflection. See JsonReaders.
        if (JsonReaders.has(type)) return JsonReaders.read(type, parsed);
        if (type.isArray() && JsonReaders.has(type.getComponentType())) {
            return (T) JsonReaders.readArray(type.getComponentType(), parsed);
        }

        throw new UnsupportedOperationException(
            "no JSON reader for " + type.getSimpleName() + ". Reflection is deliberately not "
            + "used here — it is what drags Unsafe, serialization and half the collections API "
            + "into a whole-program build. Register a reader instead:\n"
            + "    JsonReaders.register(" + type.getSimpleName() + ".class, o -> ...);");
    }

    /** The TypeToken overload, present so those call sites still compile. */
    public <T> T fromJson(String text, java.lang.reflect.Type type) {
        throw new UnsupportedOperationException(
            "Gson.fromJson(String, Type) needs reflection. Parse to a JsonArray or JsonObject "
            + "and read the elements explicitly.");
    }
}
