package json;

/**
 * Gson's builder.
 *
 * The configuration methods are accepted and ignored: with no reflective
 * binding there is no field-naming policy, no adapter registry and no
 * date format to configure. They exist so existing setup code compiles.
 */
public class GsonBuilder {

    public GsonBuilder setPrettyPrinting()                          { return this; }
    public GsonBuilder serializeNulls()                             { return this; }
    public GsonBuilder disableHtmlEscaping()                        { return this; }
    public GsonBuilder setDateFormat(String pattern)                { return this; }
    public GsonBuilder setFieldNamingPolicy(Object policy)          { return this; }
    public GsonBuilder registerTypeAdapter(Object type, Object a)   { return this; }
    public GsonBuilder excludeFieldsWithoutExposeAnnotation()       { return this; }

    public Gson create() { return new Gson(); }
}
