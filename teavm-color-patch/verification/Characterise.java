import java.awt.Color;

/** Dumps the observable behaviour of Color.brighter()/darker() as an oracle. */
public class Characterise {
    public static void main(String[] a) {
        int[] vals = {0, 1, 2, 3, 4, 5, 6, 7, 8, 20, 50, 100, 127, 128, 178, 179, 180, 200, 230, 250, 254, 255};
        for (int r : vals) for (int g : vals) for (int b : vals) {
            Color c = new Color(r, g, b, 200);
            Color br = c.brighter(), dk = c.darker();
            System.out.println(r + "," + g + "," + b
                + "|" + br.getRed() + "," + br.getGreen() + "," + br.getBlue() + "," + br.getAlpha()
                + "|" + dk.getRed() + "," + dk.getGreen() + "," + dk.getBlue() + "," + dk.getAlpha());
        }
    }
}
