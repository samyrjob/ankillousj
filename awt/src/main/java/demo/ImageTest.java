package demo;

import awt.image.BufferedImage;
import imageio.ImageIO;

import java.io.ByteArrayInputStream;
import java.io.IOException;

import org.teavm.jso.JSBody;

/**
 * Exercises ImageIO as a program thread sees it: {@code read} returns a
 * decoded picture, or says why not, as the JDK's does.
 */
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
        try {
            checks();
        } catch (IOException e) {
            check("the image checks ran (" + e.getMessage() + ")", false);
        }
    }

    private static void checks() throws IOException {
        final BufferedImage a = ImageIO.read("/res/tile/wall.png");
        check("read() returns the decoded picture to a thread", a != null && ImageIO.isLoaded(a));
        check("its size is right as soon as read() returns", a.getWidth() == 64 && a.getHeight() == 32);

        BufferedImage again = ImageIO.read("/res/tile/wall.png");
        check("repeat read shares one image", a == again);

        // A picture that cannot be fetched is an IOException, as the JDK says it.
        boolean refused = false;
        try {
            ImageIO.read("/res/icons/chat.png");
        } catch (IOException e) {
            refused = true;
        }
        check("a picture that cannot be had is an IOException", refused);

        // Bytes that are no picture: null, the JDK's answer when no reader takes them.
        BufferedImage none = ImageIO.read(new ByteArrayInputStream(new byte[] { 1, 2, 3 }));
        check("bytes that are no picture read as null", none == null);

        // One of these is made to fail by the harness: preload must still
        // resolve, or a single broken asset would hang startup forever.
        ImageIO.preload("/res/tile/wall.png", "/res/tile/floor.png", "/res/icons/chat.png")
               .thenRun(() -> {
                   check("preload resolves even when an image fails", true);
                   check("isLoaded true after load", ImageIO.isLoaded(a));
               });
    }
}
