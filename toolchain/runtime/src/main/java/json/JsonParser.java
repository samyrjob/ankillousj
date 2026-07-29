package json;

/**
 * Gson's JsonParser, reflection-free.
 *
 * <p>Both the instance and static forms are present: the instance form is
 * deprecated in recent Gson but still widely used.
 */
public final class JsonParser {

    public JsonParser() { }

    public JsonElement parse(String text) { return Json.parse(text); }

    public static JsonElement parseString(String text) { return Json.parse(text); }
}
