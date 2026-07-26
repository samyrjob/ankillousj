package main;

/** Stub: the card only reads screen height to bottom-anchor itself. */
public class GamePanel {
    public int screenHeight;
    public GamePanel(int screenHeight) { this.screenHeight = screenHeight; }
    public int getHeight() { return screenHeight; }
}
