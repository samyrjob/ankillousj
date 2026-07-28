package ankillousj;

import org.teavm.extension.spi.substitution.SimpleSubstitutionPolicy;
import org.teavm.extension.spi.substitution.SubstitutionSink;

/**
 * Redirects Gson's SQL support class to one that does not reference java.sql.
 *
 * <p>Registered through META-INF/services, so it applies with no build
 * configuration. See {@link ankillousj.gsonsql.SqlTypesSupport} for why.
 */
public class GsonSqlSubstitution extends SimpleSubstitutionPolicy {
    @Override
    public void contribute(SubstitutionSink sink) {
        sink.selectClasses(inPackage("com.google.gson.internal.sql", false))
            .replacePackage("com.google.gson.internal.sql", "ankillousj.gsonsql");
    }
}
