import com.google.gson.JsonParser;
import java.util.Random;

/**
 * Differential test against real Gson.
 *
 * Every document is parsed by both, re-serialised by both, and the results
 * compared. A parser that silently drops a field would pass a "does it parse"
 * test; comparing the re-serialised form does not let that through.
 */
public class JsonCheck {

    static int checked, bad;

    static void same(String what, Object got, Object want) {
        checked++;
        if (!String.valueOf(got).equals(String.valueOf(want))) {
            bad++;
            if (bad < 10) System.out.println("  " + what + "\n     got  " + got + "\n     want " + want);
        }
    }

    /** Parse with both, re-serialise with both, compare. */
    static void roundTrip(String label, String text) {
        String ours = json.Json.parse(text).toString();
        String ref = JsonParser.parseString(text).toString();
        same(label, ours, ref);
    }

    public static void main(String[] a) {
        roundTrip("empty object", "{}");
        roundTrip("empty array", "[]");
        roundTrip("null", "null");
        roundTrip("true", "true");
        roundTrip("number", "42");
        roundTrip("negative", "-17");
        roundTrip("float", "3.5");
        roundTrip("exponent", "1.2e3");
        roundTrip("string", "\"hello\"");
        roundTrip("flat object", "{\"a\":1,\"b\":\"two\",\"c\":true,\"d\":null}");
        roundTrip("nested", "{\"a\":{\"b\":{\"c\":[1,2,3]}}}");
        roundTrip("array of objects", "[{\"x\":1},{\"x\":2}]");
        roundTrip("whitespace", "  {  \"a\" :  1 ,  \"b\" : [ 2 , 3 ]  }  ");
        roundTrip("escapes", "{\"s\":\"a\\\"b\\\\c\\nd\\te\"}");
        roundTrip("unicode escape", "{\"s\":\"\\u00e9\\u4f60\"}");
        roundTrip("literal unicode", "{\"s\":\"caf\u00e9 \u4f60\u597d\"}");
        roundTrip("empty string", "{\"s\":\"\"}");
        roundTrip("deep array", "[[[[[1]]]]]");
        roundTrip("big int", "2147483647");
        roundTrip("beyond int", "2147483648");
        roundTrip("zero", "0");
        roundTrip("mixed array", "[1,\"a\",true,null,{\"k\":[]}]");

        // the shapes the game's protocol actually produces
        roundTrip("room payload",
            "{\"roomId\":\"room-42\",\"name\":\"Futura Lounge\",\"players\":17,"
          + "\"public\":true,\"tiles\":[[0,1],[1,0]],\"owner\":{\"id\":7,\"name\":\"Dev\"}}");
        roundTrip("friend list",
            "[{\"id\":1,\"username\":\"a\",\"online\":true},{\"id\":2,\"username\":\"b\",\"online\":false}]");

        // random documents
        Random rnd = new Random(42);
        for (int i = 0; i < 400; i++) roundTrip("random " + i, randomDoc(rnd, 0));

        // reading values back out
        json.JsonObject o = json.Json.parse(
            "{\"n\":42,\"d\":3.5,\"s\":\"x\",\"b\":true,\"nil\":null,\"arr\":[1,2],\"obj\":{\"k\":1}}")
            .getAsJsonObject();
        same("getAsInt", o.get("n").getAsInt(), 42);
        same("getAsLong", o.get("n").getAsLong(), 42L);
        same("getAsDouble", o.get("d").getAsDouble(), 3.5);
        same("getAsString", o.get("s").getAsString(), "x");
        same("getAsBoolean", o.get("b").getAsBoolean(), true);
        same("isJsonNull", o.get("nil").isJsonNull(), true);
        same("array size", o.getAsJsonArray("arr").size(), 2);
        same("nested get", o.getAsJsonObject("obj").get("k").getAsInt(), 1);
        same("has present", o.has("n"), true);
        same("has absent", o.has("zzz"), false);
        same("absent is null", o.get("zzz"), null);
        // a value written as 3.0 must still read as an int
        same("lenient int", json.Json.parse("{\"v\":3.0}").getAsJsonObject().get("v").getAsInt(), 3);

        // building
        json.JsonObject built = new json.JsonObject();
        built.addProperty("name", "Dev");
        built.addProperty("level", 7);
        built.addProperty("active", true);
        json.JsonArray items = new json.JsonArray();
        items.add("sword");
        items.add(3);
        built.add("items", items);
        same("built output", built.toString(),
            "{\"name\":\"Dev\",\"level\":7,\"active\":true,\"items\":[\"sword\",3]}");

        // malformed input must throw, not return something wrong
        same("unterminated object", throwsSyntax("{\"a\":1"), true);
        same("trailing comma", throwsSyntax("{\"a\":1,}"), true);
        same("bare word", throwsSyntax("{a:1}"), true);
        same("trailing content", throwsSyntax("{} extra"), true);
        same("unterminated string", throwsSyntax("\"abc"), true);

        System.out.println(checked + " comparisons, " + bad + " mismatches");
        System.exit(bad == 0 ? 0 : 1);
    }

    static boolean throwsSyntax(String text) {
        try { json.Json.parse(text); return false; }
        catch (RuntimeException e) { return true; }
    }

    static String randomDoc(Random rnd, int depth) {
        int kind = depth > 3 ? rnd.nextInt(4) : rnd.nextInt(6);
        switch (kind) {
            case 0: return String.valueOf(rnd.nextInt(2000) - 1000);
            case 1: return "\"s" + rnd.nextInt(1000) + "\"";
            case 2: return rnd.nextBoolean() ? "true" : "false";
            case 3: return "null";
            case 4: {
                StringBuilder sb = new StringBuilder("[");
                int n = rnd.nextInt(4);
                for (int i = 0; i < n; i++) {
                    if (i > 0) sb.append(',');
                    sb.append(randomDoc(rnd, depth + 1));
                }
                return sb.append(']').toString();
            }
            default: {
                StringBuilder sb = new StringBuilder("{");
                int n = rnd.nextInt(4);
                for (int i = 0; i < n; i++) {
                    if (i > 0) sb.append(',');
                    sb.append("\"k").append(i).append("\":").append(randomDoc(rnd, depth + 1));
                }
                return sb.append('}').toString();
            }
        }
    }
}
