package demo;

import awt.Color;
import awt.Component;
import awt.Font;
import awt.Graphics;
import awt.Graphics2D;
import awt.event.KeyAdapter;
import awt.event.KeyEvent;
import awt.event.MouseAdapter;
import awt.event.MouseEvent;

import controller.room.RoomController;
import main.GamePanel;
import model.room.Room;
import view.room.RoomInfoCard;
import view.shared.GroupIcon;

/**
 * Written entirely against java.awt. Nothing in this file knows AnkillousJ
 * exists — it extends java.awt.Component, overrides paint(Graphics), casts to
 * Graphics2D, and registers the usual listeners. It would compile on a desktop
 * JVM unchanged.
 *
 * TeaVM's SubstitutionPolicy redirects java.awt.* to the canvas-backed
 * implementation, so the same source runs in a browser.
 */
public class InteractivePanel extends Component {

    private RoomInfoCard card;
    private Room room;

    private int mouseX = -1, mouseY = -1;
    private String status = "move the mouse over the gear";
    private int clicks = 0;
    private int iconSize = 96;

    public InteractivePanel() {
        addMouseMotionListener(new MouseAdapter() {
            @Override public void mouseMoved(MouseEvent e) {
                mouseX = e.getX();
                mouseY = e.getY();
                if (card != null) card.handleMouseMove(mouseX, mouseY);
                repaint();
            }
        });

        addMouseListener(new MouseAdapter() {
            @Override public void mouseClicked(MouseEvent e) {
                if (card == null) return;
                boolean hit = card.handleClick(e.getX(), e.getY());
                clicks++;
                status = hit
                        ? "gear clicked - handleClick returned true  (" + clicks + ")"
                        : "click at " + e.getX() + "," + e.getY() + " - not the gear";
                repaint();
            }
            @Override public void mouseExited(MouseEvent e) {
                mouseX = mouseY = -1;
                if (card != null) card.handleMouseMove(-1, -1);
                repaint();
            }
        });

        addMouseWheelListener(e -> {
            iconSize = Math.max(48, Math.min(160, iconSize - e.getWheelRotation() * 8));
            status = "wheel: icon " + iconSize + "px";
            repaint();
        });

        addKeyListener(new KeyAdapter() {
            @Override public void keyPressed(KeyEvent e) {
                if (card == null) return;
                if (e.getKeyCode() == KeyEvent.VK_SPACE) {
                    card.toggle();
                    status = "space - card visible=" + card.isVisible();
                } else if (e.getKeyChar() != KeyEvent.CHAR_UNDEFINED) {
                    status = "key '" + e.getKeyChar() + "'  code=" + e.getKeyCode();
                }
                repaint();
            }
        });
    }

    /** Built on first paint, when the component finally knows its size. */
    private void ensureCard(int h) {
        if (card != null) return;
        room = new Room("room-42", "Futura Lounge — Rooftop", "AnkillousDev",
                17, 50, Room.RoomType.PUBLIC);
        card = new RoomInfoCard(new GamePanel(h), new RoomController(room, true));
    }

    @Override
    public void paint(Graphics g) {
        Graphics2D g2d = (Graphics2D) g;
        int w = getWidth(), h = getHeight();
        ensureCard(h);

        g2d.setColor(new Color(13, 14, 28));
        g2d.fillRect(0, 0, w, h);
        g2d.setColor(new Color(30, 32, 58));
        for (int i = 0; i < w + h; i += 24) g2d.drawLine(i, 0, i - h, h);

        card.draw(g2d);
        GroupIcon.draw(g2d, w - iconSize - 24, 20, iconSize);

        g2d.setFont(new Font("SansSerif", Font.PLAIN, 11));
        g2d.setColor(new Color(160, 150, 190));
        g2d.drawString(status, 12, h - 10);
        if (mouseX >= 0) g2d.drawString(mouseX + ", " + mouseY, w - 70, h - 10);
    }
}
