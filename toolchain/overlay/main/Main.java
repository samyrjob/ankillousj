package main;

/**
 * The desktop launcher, neutralised.
 *
 * <p>The original builds a JFrame, wires a login flow into it, and hands the
 * result to a GamePanel. None of that has a browser equivalent: there is no
 * frame, and the page itself is the window.
 *
 * <p>{@link BrowserMain} is the entry point instead. This class stays so that
 * anything referencing it still links.
 */
public final class Main {

    private Main() { }

    /** Not the entry point here — see {@link BrowserMain}. */
    public static void main(String[] args) {
        BrowserMain.main(args);
    }
}
