package json;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Writers for application types: what {@link JsonReaders} is for reading.
 *
 * <p>{@code gson.toJson(new SendRequestBody(name, gender))} asks a library to
 * look inside an object it knows nothing about. A map, a list or an array
 * describe themselves and need nothing; an application type says how it is
 * written, once:
 *
 * <pre>
 *     JsonWriters.register(SendRequestBody.class, b -&gt; {
 *         JsonObject o = new JsonObject();
 *         o.addProperty("toUsername", b.toUsername);
 *         return o;
 *     });
 * </pre>
 *
 * A writer is looked for under the object's own class, then its superclasses.
 * It also serves where the object sits inside a map or a list.
 */
public final class JsonWriters {

    private JsonWriters() { }

    private static final Map<Class<?>, Function<Object, JsonElement>> WRITERS = new HashMap<>();

    /** Registers how a {@code type} is written as a JSON value. */
    @SuppressWarnings("unchecked")
    public static <T> void register(Class<T> type, Function<? super T, JsonElement> writer) {
        WRITERS.put(type, (Function<Object, JsonElement>) (Function<?, JsonElement>) writer);
    }

    /** The tree of {@code src}, or null when no writer knows its class. */
    static JsonElement write(Object src) {
        for (Class<?> c = src.getClass(); c != null && c != Object.class; c = c.getSuperclass()) {
            Function<Object, JsonElement> writer = WRITERS.get(c);
            if (writer != null) return writer.apply(src);
        }
        return null;
    }
}
