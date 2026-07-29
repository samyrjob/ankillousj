package json;

import java.util.ArrayList;
import java.util.List;

/** A JSON array. */
public class JsonArray extends JsonElement implements Iterable<JsonElement> {
        private final List<JsonElement> elements = new ArrayList<>();

        public void add(JsonElement value) { elements.add(value == null ? JsonNull.INSTANCE : value); }
        public void add(String value)   { elements.add(value == null ? JsonNull.INSTANCE : new JsonPrimitive(value)); }
        public void add(Number value)   { elements.add(value == null ? JsonNull.INSTANCE : new JsonPrimitive(value)); }
        public void add(Boolean value)  { elements.add(value == null ? JsonNull.INSTANCE : new JsonPrimitive(value)); }

        public void addAll(JsonArray other) { elements.addAll(other.elements); }

        public JsonElement get(int i) { return elements.get(i); }
        public JsonElement set(int i, JsonElement value) { return elements.set(i, value); }
        public boolean remove(JsonElement value) { return elements.remove(value); }
        public JsonElement remove(int i) { return elements.remove(i); }
        public boolean contains(JsonElement value) { return elements.contains(value); }
        public int size() { return elements.size(); }
        public boolean isEmpty() { return elements.isEmpty(); }

        @Override public java.util.Iterator<JsonElement> iterator() { return elements.iterator(); }

        @Override void write(StringBuilder sb) {
            sb.append('[');
            for (int i = 0; i < elements.size(); i++) {
                if (i > 0) sb.append(',');
                elements.get(i).write(sb);
            }
            sb.append(']');
        }
    }
