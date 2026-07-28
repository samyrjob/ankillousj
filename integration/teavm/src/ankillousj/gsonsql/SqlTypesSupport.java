package ankillousj.gsonsql;

import com.google.gson.TypeAdapterFactory;

/**
 * Stands in for {@code com.google.gson.internal.sql.SqlTypesSupport}.
 *
 * <p>Gson's original holds static references to adapters for
 * {@code java.sql.Date}, {@code Time} and {@code Timestamp}. TeaVM does
 * whole-program analysis, follows those static fields, and cannot link them
 * because it ships no {@code java.sql}.
 *
 * <p>Reporting no SQL support is a configuration Gson already handles — it is
 * what happens on a JRE assembled without the {@code java.sql} module, and
 * every path guards on {@code SUPPORTS_SQL_TYPES} before touching a factory.
 *
 * <p>The field types here are deliberately {@code Object} rather than Gson's
 * package-private {@code DefaultDateTypeAdapter.DateType}: they are only ever
 * read behind the {@code SUPPORTS_SQL_TYPES} guard, and referencing the real
 * type would drag the SQL adapters back in.
 */
public final class SqlTypesSupport {

    public static final boolean SUPPORTS_SQL_TYPES = false;

    public static final Object DATE_DATE_TYPE = null;
    public static final Object TIMESTAMP_DATE_TYPE = null;

    public static final TypeAdapterFactory DATE_FACTORY = null;
    public static final TypeAdapterFactory TIME_FACTORY = null;
    public static final TypeAdapterFactory TIMESTAMP_FACTORY = null;

    private SqlTypesSupport() { }
}
