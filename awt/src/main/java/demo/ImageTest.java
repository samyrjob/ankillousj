package demo;

import awt.image.BufferedImage;
import imageio.ImageIO;

import java.io.ByteArrayInputStream;

import org.teavm.jso.JSBody;

/** Exercises the ImageIO shim, including the parts that deliberately fail. */
public final class ImageTest {

    @JSBody(params = "m", script = "if (globalThis.__ankTest) globalThis.__ankTest(m);")
    private static native void report(String m);

    private static void check(String name, boolean ok) {
        report((ok ? "PASS " : "FAIL ") + name);
    }

    private ImageTest() { }

    public static void run() {
        ImageIO.clearCache();
        ImageIO.setResourceBase("assets");

        BufferedImage a = ImageIO.read("/res/tile/wall.png");
        check("read() returns immediately", a != null);
        check("dimensions are 0 while decoding", a.getWidth() == 0 && a.getHeight() == 0);
        check("isLoaded false while decoding", !ImageIO.isLoaded(a));

        BufferedImage again = ImageIO.read("/res/tile/wall.png");
        check("repeat read shares one image", a == again);

        BufferedImage abs = ImageIO.read("https://cdn.test/sprite.png");
        check("absolute URLs bypass the resource base", abs != a);

        boolean threw = false;
        try {
            ImageIO.read(new ByteArrayInputStream(new byte[] { 1, 2, 3 }));
        } catch (UnsupportedOperationException e) {
            threw = e.getMessage().contains("read(String url)");
        }
        check("read(InputStream) fails loudly with a fix in the message", threw);

        // One of these is made to fail by the harness: preload must still
        // resolve, or a single broken asset would hang startup forever.
        ImageIO.preload("/res/tile/wall.png", "/res/tile/floor.png", "/res/icons/chat.png")
               .thenRun(() -> {
                   check("preload resolves even when an image fails", true);
                   check("dimensions become correct after load",
                           a.getWidth() == 64 && a.getHeight() == 32);
                   check("isLoaded true after load", ImageIO.isLoaded(a));
               });
    }
}
