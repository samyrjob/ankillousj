package json;

/** JSON null. A singleton, as in Gson. */
public final class JsonNull extends JsonElement {
        public static final JsonNull INSTANCE = new JsonNull();
        private JsonNull() { }
        @Override void write(StringBuilder sb) { sb.append("null"); }
        @Override public boolean equals(Object o) { return o instanceof JsonNull; }
        @Override public int hashCode() { return 0; }
    }
