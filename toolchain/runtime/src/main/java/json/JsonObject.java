package json;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** A JSON object. Insertion-ordered, so round-tripping preserves field order. */
public class JsonObject extends JsonElement {
        private final Map<String, JsonElement> members = new LinkedHashMap<>();

        public void add(String property, JsonElement value) {
            members.put(property, value == null ? JsonNull.INSTANCE : value);
        }

        public void addProperty(String property, String value) {
            add(property, value == null ? JsonNull.INSTANCE : new JsonPrimitive(value));
        }

        public void addProperty(String property, Number value) {
            add(property, value == null ? JsonNull.INSTANCE : new JsonPrimitive(value));
        }

        public void addProperty(String property, Boolean value) {
            add(property, value == null ? JsonNull.INSTANCE : new JsonPrimitive(value));
        }

        public void addProperty(String property, Character value) {
            add(property, value == null ? JsonNull.INSTANCE : new JsonPrimitive(value));
        }

        public JsonElement remove(String property) { return members.remove(property); }

        /** Null when absent — callers routinely test for that. */
        public JsonElement get(String property) { return members.get(property); }

        public JsonPrimitive getAsJsonPrimitive(String property) {
            JsonElement e = members.get(property);
            return e == null ? null : e.getAsJsonPrimitive();
        }

        public JsonObject getAsJsonObject(String property) {
            JsonElement e = members.get(property);
            return e == null ? null : e.getAsJsonObject();
        }

        public JsonArray getAsJsonArray(String property) {
            JsonElement e = members.get(property);
            return e == null ? null : e.getAsJsonArray();
        }

        public boolean has(String property) { return members.containsKey(property); }
        public Set<Map.Entry<String, JsonElement>> entrySet() { return members.entrySet(); }
        public Set<String> keySet() { return members.keySet(); }
        public int size() { return members.size(); }

        @Override void write(StringBuilder sb) {
            sb.append('{');
            boolean first = true;
            for (Map.Entry<String, JsonElement> e : members.entrySet()) {
                if (!first) sb.append(',');
                first = false;
                Json.escape(e.getKey(), sb);
                sb.append(':');
                e.getValue().write(sb);
            }
            sb.append('}');
        }
    }
