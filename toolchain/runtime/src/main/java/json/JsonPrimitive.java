package json;

/** A JSON string, number or boolean. */
public final class JsonPrimitive extends JsonElement {
        private final Object value;

        public JsonPrimitive(String value)  { this.value = value; }
        public JsonPrimitive(Number value)  { this.value = value; }
        public JsonPrimitive(Boolean value) { this.value = value; }
        public JsonPrimitive(Character value) { this.value = String.valueOf(value); }

    /**
     * Wraps a number exactly as it appeared in the source.
     *
     * <p>JSON has a single number type, so the text is the only record of how
     * a value was written. Parsing `1.2e3` to a double and reformatting would
     * emit `1200.0` — the same value, a different document. Keeping the
     * literal makes round-tripping exact, which is what the reference
     * implementation does too.
     */
    static JsonPrimitive ofLiteral(String text) {
        JsonPrimitive p = new JsonPrimitive(text);
        p.numeric = true;
        return p;
    }

    /** True when {@link #value} is a number held as its source text. */
    private boolean numeric;

        public boolean isString()  { return !numeric && value instanceof String; }
        public boolean isNumber()  { return numeric || value instanceof Number; }
        public boolean isBoolean() { return value instanceof Boolean; }

        @Override public String getAsString() {
            return value instanceof String ? (String) value : String.valueOf(value);
        }

        @Override public boolean getAsBoolean() {
            if (value instanceof Boolean) return (Boolean) value;
            return Boolean.parseBoolean(getAsString());
        }

        /**
         * Numbers are parsed leniently: JSON has one number type, so a value
         * written as {@code 3} and one written as {@code 3.0} must both be
         * readable as an int.
         */
        @Override public int getAsInt()       { return (int) getAsDouble(); }
        @Override public long getAsLong()     { return (long) getAsDouble(); }
        @Override public float getAsFloat()   { return (float) getAsDouble(); }

        @Override public double getAsDouble() {
            if (value instanceof Number) return ((Number) value).doubleValue();
            return Double.parseDouble(getAsString());
        }



        @Override public boolean equals(Object o) {
            return o instanceof JsonPrimitive
                && String.valueOf(((JsonPrimitive) o).value).equals(String.valueOf(value));
        }
        @Override public int hashCode() { return String.valueOf(value).hashCode(); }
    
    @Override void write(StringBuilder sb) {
        if (numeric || !(value instanceof String)) sb.append(value);
        else Json.escape((String) value, sb);
    }
}
