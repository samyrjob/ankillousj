package json;

/** Alias for {@link Json.JsonSyntaxException}. */
public class JsonSyntaxException extends Json.JsonSyntaxException {
    public JsonSyntaxException(String message) { super(message); }
    public JsonSyntaxException(String message, Throwable cause) { super(message, cause); }
}
