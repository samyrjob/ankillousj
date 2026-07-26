package demo;

import controller.room.RoomController;
import main.GamePanel;
import model.room.Room;
import view.room.RoomInfoCard;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import javax.imageio.ImageIO;

/** Renders the SAME RoomInfoCard on real java.awt, headless, to a PNG. */
public class Oracle {
    public static void main(String[] a) throws Exception {
        int W = 420, H = 140;
        BufferedImage img = new BufferedImage(W, H, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = img.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        g2d.setColor(new Color(13, 14, 28));
        g2d.fillRect(0, 0, W, H);
        g2d.setColor(new Color(30, 32, 58));
        for (int i = 0; i < W; i += 24) g2d.drawLine(i, 0, i - 60, H);

        Room room = new Room("room-42", "Futura Lounge — Rooftop", "AnkillousDev", 17, 50, Room.RoomType.PUBLIC);
        RoomInfoCard card = new RoomInfoCard(new GamePanel(H), new RoomController(room, true));
        card.draw(g2d);
        view.shared.GroupIcon.draw(g2d, 290, 20, 96);
        g2d.dispose();

        ImageIO.write(img, "png", new File("card-awt.png"));
        System.out.println("wrote card-awt.png");
    }
}
