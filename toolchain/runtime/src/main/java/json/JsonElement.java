package json;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * A JSON value.
 *
 * <p>This mirrors Gson's {@code JsonElement} hierarchy closely enough that
 * tree-model code compiles against it unchanged, and contains no reflection at
 * all.
 *
 * <h3>Why not just use Gson</h3>
 *
 * Gson is reflection-driven by design. Its {@code UnsafeAllocator} reaches for
 * {@code ObjectStreamClass}, {@code ConstructorConstructor} enumerates every
 * collection type it might ever need, and {@code TypeAdapters} registers
 * adapters for {@code InetAddress}, {@code java.sql.Date},
 * {@code AtomicIntegerArray} and more. A whole-program compiler follows all of
 * it, so pulling in Gson to parse a text protocol drags in serialization,
 * networking and half the collections API — none of which the application
 * touches.
 *
 * <p>Since the overwhelming majority of use here is the tree model, that part
 * is provided directly and the reflective half is not needed.
 */
public abstract class JsonElement {

    public boolean isJsonObject()    { return this instanceof JsonObject; }
    public boolean isJsonArray()     { return this instanceof JsonArray; }
    public boolean isJsonPrimitive() { return this instanceof JsonPrimitive; }
    public boolean isJsonNull()      { return this instanceof JsonNull; }

    public JsonObject getAsJsonObject() {
        if (this instanceof JsonObject) return (JsonObject) this;
        throw new IllegalStateException("not a JSON object: " + this);
    }

    public JsonArray getAsJsonArray() {
        if (this instanceof JsonArray) return (JsonArray) this;
        throw new IllegalStateException("not a JSON array: " + this);
    }

    public JsonPrimitive getAsJsonPrimitive() {
        if (this instanceof JsonPrimitive) return (JsonPrimitive) this;
        throw new IllegalStateException("not a JSON primitive: " + this);
    }

    public String getAsString()   { return getAsJsonPrimitive().getAsString(); }
    public int getAsInt()         { return getAsJsonPrimitive().getAsInt(); }
    public long getAsLong()       { return getAsJsonPrimitive().getAsLong(); }
    public double getAsDouble()   { return getAsJsonPrimitive().getAsDouble(); }
    public float getAsFloat()     { return getAsJsonPrimitive().getAsFloat(); }
    public boolean getAsBoolean() { return getAsJsonPrimitive().getAsBoolean(); }

    /** Compact JSON, the same shape {@code Gson#toJson} produces by default. */
    @Override public String toString() {
        StringBuilder sb = new StringBuilder();
        write(sb);
        return sb.toString();
    }

    abstract void write(StringBuilder sb);

    /** Insertion-ordered, like Gson's, so round-tripping preserves field order. */

    
}
