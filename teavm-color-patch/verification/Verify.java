import org.teavm.classlib.java.awt.TColor;
import java.io.*;

/** Replays the JVM oracle against the patched TColor. Any mismatch is a bug. */
public class Verify {
    public static void main(String[] a) throws Exception {
        BufferedReader in = new BufferedReader(new FileReader("oracle.txt"));
        String line; int n = 0, bad = 0;
        while ((line = in.readLine()) != null) {
            String[] parts = line.split("\\|");
            int[] rgb = parse(parts[0]);
            int[] wantBr = parse(parts[1]);
            int[] wantDk = parse(parts[2]);

            TColor c = new TColor(rgb[0], rgb[1], rgb[2], 200);
            TColor br = c.brighter(), dk = c.darker();
            n++;
            if (!eq(br, wantBr)) { bad++; if (bad < 6) System.out.println("brighter " + parts[0] + " got " + show(br) + " want " + parts[1]); }
            if (!eq(dk, wantDk)) { bad++; if (bad < 6) System.out.println("darker   " + parts[0] + " got " + show(dk) + " want " + parts[2]); }
        }
        System.out.println(n + " colours checked, " + bad + " mismatches");
        System.exit(bad == 0 ? 0 : 1);
    }
    static int[] parse(String s) { String[] p = s.split(","); int[] o = new int[p.length];
        for (int i = 0; i < p.length; i++) o[i] = Integer.parseInt(p[i]); return o; }
    static boolean eq(TColor c, int[] w) {
        return c.getRed()==w[0] && c.getGreen()==w[1] && c.getBlue()==w[2] && c.getAlpha()==w[3]; }
    static String show(TColor c) { return c.getRed()+","+c.getGreen()+","+c.getBlue()+","+c.getAlpha(); }
}
