import org.teavm.classlib.java.awt.TColor;
import java.awt.Color;
import java.util.Random;

/** Wider sweep: every grey, every single-channel value, and 200k random colours. */
public class Exhaustive {
    static int checked = 0, bad = 0;

    static void check(int r, int g, int b, int alpha) {
        Color ref = new Color(r, g, b, alpha);
        TColor ours = new TColor(r, g, b, alpha);
        cmp("brighter", r, g, b, alpha, ref.brighter(), ours.brighter());
        cmp("darker",   r, g, b, alpha, ref.darker(),   ours.darker());
    }

    static void cmp(String op, int r, int g, int b, int alpha, Color ref, TColor ours) {
        checked++;
        if (ref.getRed() != ours.getRed() || ref.getGreen() != ours.getGreen()
                || ref.getBlue() != ours.getBlue() || ref.getAlpha() != ours.getAlpha()) {
            bad++;
            if (bad < 10) {
                System.out.println(op + "(" + r + "," + g + "," + b + "," + alpha + ") ref="
                    + ref.getRed() + "," + ref.getGreen() + "," + ref.getBlue() + "," + ref.getAlpha()
                    + " ours=" + ours.getRed() + "," + ours.getGreen() + "," + ours.getBlue() + "," + ours.getAlpha());
            }
        }
    }

    public static void main(String[] a) {
        for (int v = 0; v <= 255; v++) {          // every grey, every alpha step
            check(v, v, v, 255);
            check(v, v, v, v);
            check(v, 0, 0, 255);
            check(0, v, 0, 255);
            check(0, 0, v, 128);
        }
        Random rnd = new Random(12345);
        for (int i = 0; i < 200000; i++) {
            check(rnd.nextInt(256), rnd.nextInt(256), rnd.nextInt(256), rnd.nextInt(256));
        }
        // repeated application, where rounding drift would show up
        Color ref = new Color(37, 211, 102, 240);
        TColor ours = new TColor(37, 211, 102, 240);
        for (int i = 0; i < 12; i++) {
            ref = ref.brighter(); ours = ours.brighter();
            cmp("brighter^" + (i + 1), 37, 211, 102, 240, ref, ours);
        }
        ref = new Color(37, 211, 102, 240); ours = new TColor(37, 211, 102, 240);
        for (int i = 0; i < 12; i++) {
            ref = ref.darker(); ours = ours.darker();
            cmp("darker^" + (i + 1), 37, 211, 102, 240, ref, ours);
        }
        System.out.println(checked + " comparisons, " + bad + " mismatches");
        System.exit(bad == 0 ? 0 : 1);
    }
}
