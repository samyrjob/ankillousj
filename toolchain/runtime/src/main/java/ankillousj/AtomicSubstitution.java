package ankillousj;

import org.teavm.extension.spi.substitution.SimpleSubstitutionPolicy;
import org.teavm.extension.spi.substitution.SubstitutionSink;

/**
 * Supplies the atomic array classes TeaVM's class library does not ship.
 *
 * <p>Nothing exists at those names in the classlib, so the substitution takes
 * cleanly. This is the same code that {@code teavm-atomic-array-patch/}
 * proposes upstream, applied locally so the build does not have to wait for
 * it.
 */
public class AtomicSubstitution extends SimpleSubstitutionPolicy {
    @Override
    public void contribute(SubstitutionSink sink) {
        sink.selectClasses(inPackage("java.util.concurrent.atomic", false))
            .replacePackage("java.util.concurrent.atomic", "ankillousj.atomic");
    }
}
