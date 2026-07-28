package json;

/**
 * JSON parsing and writing.
 *
 * <p>A straight recursive-descent parser over a string — no reflection, no
 * streaming, no dependencies. JSON's grammar is small enough that this is a
 * few hundred lines and easy to be confident about.
 */
public final class Json {

    private Json() { }

    /** Parses a complete JSON document. */
    public static JsonElement parse(String text) {
        if (text == null) return JsonNull.INSTANCE;
        Parser p = new Parser(text);
        p.skipWhitespace();
        JsonElement value = p.readValue();
        p.skipWhitespace();
        if (!p.atEnd()) {
            throw new JsonSyntaxException("trailing content at position " + p.position());
        }
        return value;
    }

    /** Appends {@code s} as a quoted, escaped JSON string. */
    static void escape(String s, StringBuilder sb) {
        sb.append('"');
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"':  sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                default:
                    // Control characters must be escaped; everything else, including
                    // non-ASCII, is valid UTF-8 in a JSON string and is left alone.
                    if (c < 0x20) {
                        sb.append("\\u");
                        String hex = Integer.toHexString(c);
                        for (int p = hex.length(); p < 4; p++) sb.append('0');
                        sb.append(hex);
                    } else {
                        sb.append(c);
                    }
            }
        }
        sb.append('"');
    }

    /** Thrown on malformed input, matching Gson's name so catch blocks compile. */
    public static class JsonSyntaxException extends RuntimeException {
        public JsonSyntaxException(String message) { super(message); }
        public JsonSyntaxException(String message, Throwable cause) { super(message, cause); }
    }

    // ── parser ────────────────────────────────────────────────────────

    private static final class Parser {
        private final String s;
        private int i;

        Parser(String s) { this.s = s; }

        int position()  { return i; }
        boolean atEnd() { return i >= s.length(); }

        void skipWhitespace() {
            while (i < s.length()) {
                char c = s.charAt(i);
                if (c == ' ' || c == '\t' || c == '\n' || c == '\r') i++;
                else break;
            }
        }

        JsonElement readValue() {
            if (atEnd()) throw new JsonSyntaxException("unexpected end of input");
            char c = s.charAt(i);
            switch (c) {
                case '{': return readObject();
                case '[': return readArray();
                case '"': return new JsonPrimitive(readString());
                case 't': expect("true");  return new JsonPrimitive(Boolean.TRUE);
                case 'f': expect("false"); return new JsonPrimitive(Boolean.FALSE);
                case 'n': expect("null");  return JsonNull.INSTANCE;
                default:  return readNumber();
            }
        }

        JsonElement readObject() {
            JsonObject o = new JsonObject();
            i++;                                  // '{'
            skipWhitespace();
            if (!atEnd() && s.charAt(i) == '}') { i++; return o; }

            while (true) {
                skipWhitespace();
                if (atEnd() || s.charAt(i) != '"') {
                    throw new JsonSyntaxException("expected a property name at " + i);
                }
                String name = readString();
                skipWhitespace();
                if (atEnd() || s.charAt(i) != ':') {
                    throw new JsonSyntaxException("expected ':' at " + i);
                }
                i++;
                skipWhitespace();
                o.add(name, readValue());
                skipWhitespace();
                if (atEnd()) throw new JsonSyntaxException("unterminated object");
                char c = s.charAt(i++);
                if (c == '}') return o;
                if (c != ',') throw new JsonSyntaxException("expected ',' or '}' at " + (i - 1));
            }
        }

        JsonElement readArray() {
            JsonArray a = new JsonArray();
            i++;                                  // '['
            skipWhitespace();
            if (!atEnd() && s.charAt(i) == ']') { i++; return a; }

            while (true) {
                skipWhitespace();
                a.add(readValue());
                skipWhitespace();
                if (atEnd()) throw new JsonSyntaxException("unterminated array");
                char c = s.charAt(i++);
                if (c == ']') return a;
                if (c != ',') throw new JsonSyntaxException("expected ',' or ']' at " + (i - 1));
            }
        }

        String readString() {
            i++;                                  // opening quote
            StringBuilder sb = new StringBuilder();
            while (true) {
                if (atEnd()) throw new JsonSyntaxException("unterminated string");
                char c = s.charAt(i++);
                if (c == '"') return sb.toString();
                if (c != '\\') { sb.append(c); continue; }

                if (atEnd()) throw new JsonSyntaxException("unterminated escape");
                char e = s.charAt(i++);
                switch (e) {
                    case '"':  sb.append('"');  break;
                    case '\\': sb.append('\\'); break;
                    case '/':  sb.append('/');  break;
                    case 'b':  sb.append('\b'); break;
                    case 'f':  sb.append('\f'); break;
                    case 'n':  sb.append('\n'); break;
                    case 'r':  sb.append('\r'); break;
                    case 't':  sb.append('\t'); break;
                    case 'u':
                        if (i + 4 > s.length()) throw new JsonSyntaxException("truncated \\u escape");
                        sb.append((char) Integer.parseInt(s.substring(i, i + 4), 16));
                        i += 4;
                        break;
                    default:
                        throw new JsonSyntaxException("bad escape '\\" + e + "' at " + (i - 1));
                }
            }
        }

        JsonElement readNumber() {
            int start = i;
            if (!atEnd() && (s.charAt(i) == '-' || s.charAt(i) == '+')) i++;
            while (!atEnd()) {
                char c = s.charAt(i);
                if ((c >= '0' && c <= '9') || c == '.' || c == 'e' || c == 'E'
                        || c == '-' || c == '+') {
                    i++;
                } else {
                    break;
                }
            }
            if (i == start) {
                throw new JsonSyntaxException("unexpected character '" + s.charAt(i) + "' at " + i);
            }
            String text = s.substring(start, i);
            try {
                // Validate now, but keep the source text. JSON has one number
                // type, and a document written with `1.2e3` should serialise
                // back as `1.2e3`, not `1200.0` — which is what parsing to a
                // double and reformatting would produce.
                Double.parseDouble(text);
            } catch (NumberFormatException e) {
                throw new JsonSyntaxException("bad number '" + text + "' at " + start, e);
            }
            return JsonPrimitive.ofLiteral(text);
        }

        void expect(String literal) {
            if (!s.startsWith(literal, i)) {
                throw new JsonSyntaxException("expected '" + literal + "' at " + i);
            }
            i += literal.length();
        }
    }
}
