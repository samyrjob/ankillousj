package demo;

import controller.room.RoomController;
import main.GamePanel;
import model.room.Room;
import view.room.RoomInfoCard;

import awt.Color;
import awt.Graphics2D;

import org.teavm.jso.JSBody;
import org.teavm.jso.canvas.CanvasRenderingContext2D;

/**
 * Entry point for the proof.
 *
 * The 2D context is pulled from a host-provided global rather than from
 * document.getElementById, so the exact same compiled output runs in a browser
 * and headless under Node with a canvas polyfill.
 */
public final class Main {

    @JSBody(script = "return globalThis.__ankCtx;")
    private static native CanvasRenderingContext2D hostContext();

    @JSBody(params = "msg", script = "if (globalThis.__ankLog) globalThis.__ankLog(msg);")
    private static native void log(String msg);

    public static void main(String[] args) {
        CanvasRenderingContext2D ctx = hostContext();
        if (ctx == null) {
            log("no canvas context provided on globalThis.__ankCtx");
            return;
        }

        Graphics2D g2d = new Graphics2D(ctx);

        // Backdrop so the card's translucent watermark has something to sit on
        g2d.setColor(new Color(13, 14, 28));
        g2d.fillRect(0, 0, 420, 140);
        g2d.setColor(new Color(30, 32, 58));
        for (int i = 0; i < 420; i += 24) g2d.drawLine(i, 0, i - 60, 140);

        Room room = new Room(
                "room-42",
                "Futura Lounge — Rooftop",
                "AnkillousDev",
                17, 50,
                Room.RoomType.PUBLIC);

        GamePanel gp = new GamePanel(140);
        RoomController controller = new RoomController(room, true);

        RoomInfoCard card = new RoomInfoCard(gp, controller);
        card.draw(g2d);

        // --- GroupIcon: exercises Area union, Path2D, create/dispose, scale ---
        view.shared.GroupIcon.draw(g2d, 290, 20, 96);

        log("card drawn: " + card.toString());
    }
}
