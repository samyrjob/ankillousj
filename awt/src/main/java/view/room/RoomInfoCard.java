package view.room;

import main.GamePanel;
import controller.room.RoomController;
import model.room.Room;
import view.shared.Theme;

import awt.*;
import awt.geom.RoundRectangle2D;

/**
 * RoomInfoCard — TeaVM/Canvas port.
 *
 * All ten drawing/input methods below are copied VERBATIM from the desktop
 * game. Exactly two things were changed to compile without Swing:
 *
 *   1. handleClick() no longer opens the settings dialog (JOptionPane path).
 *   2. bottomAnchorY() reads gp.getHeight() instead of walking to the toolbar
 *      HUD, which is not part of this slice.
 *
 * Everything else — the gradients, the gold border, the watermark, the vector
 * gear, the crown, the user glyph, the text truncation — is the original code
 * running unmodified against a Graphics2D backed by Canvas2D.
 */
public class RoomInfoCard {

    private final GamePanel gp;
    private final RoomController controller;

    private boolean visible = true;

    private static final int CARD_X      = 10;
    private static final int CARD_WIDTH  = 235;
    private static final int CARD_HEIGHT = 60;
    private static final int CORNER      = 12;

    private static final Color CARD_BG_START = Theme.CARD_GRAD_TOP;
    private static final Color CARD_BG_END   = Theme.CARD_GRAD_BOTTOM;
    private static final Color GOLD_LIGHT    = Theme.GOLD_LIGHT;
    private static final Color GOLD_DARK     = Theme.GOLD_DARK;
    private static final Color GOLD_FLAT     = Theme.GOLD_FLAT;
    private static final Color TEXT_WHITE    = Theme.TEXT_WHITE;
    private static final Color TEXT_PURPLE   = Theme.LAVENDER;

    private final Rectangle gearBounds = new Rectangle();
    private boolean hoverGear = false;

    public RoomInfoCard(GamePanel gp, RoomController controller) {
        if (gp == null)         throw new IllegalArgumentException("gp must not be null");
        if (controller == null) throw new IllegalArgumentException("controller must not be null");
        this.gp = gp;
        this.controller = controller;
    }

    public void setHoverGear(boolean v) { hoverGear = v; }
    public boolean isHoverGear() { return hoverGear; }

public void draw(Graphics2D g2d) {
        if (!visible) return;

        Room room = controller.getCurrentRoom();
        if (room == null) return;

        // int cardY = gp.screenHeight - CARD_HEIGHT - 6;    // hugs the bottom edge, level with the chat row
        int cardY = bottomAnchorY() - CARD_HEIGHT;   // glued to the toolbar/chat row (fullscreen-safe)

        // Save Graphics state
        Composite savedComposite = g2d.getComposite();
        Font savedFont           = g2d.getFont();

        try {
            drawBackgroundAndBorder(g2d, cardY);
            drawWatermark(g2d, cardY);
            drawRoomName(g2d, room, cardY);
            drawGearIcon(g2d, room, cardY);
            drawOwnerLine(g2d, room, cardY);
            drawPlayerCount(g2d, room, cardY);
        } finally {
            // Ch8 §8.4 — always restore, even if a draw method throws
            g2d.setComposite(savedComposite);
            g2d.setFont(savedFont);
        }
    }

private void drawBackgroundAndBorder(Graphics2D g2d, int y) {
        // Subtle indigo gradient body
        GradientPaint bg = new GradientPaint(
                CARD_X, y, CARD_BG_START,
                CARD_X + CARD_WIDTH, y + CARD_HEIGHT, CARD_BG_END);
        g2d.setPaint(bg);
        g2d.fillRoundRect(CARD_X, y, CARD_WIDTH, CARD_HEIGHT, CORNER, CORNER);

        // Metallic gold gradient border
        GradientPaint border = new GradientPaint(
                CARD_X, y, GOLD_LIGHT,
                CARD_X + CARD_WIDTH, y + CARD_HEIGHT, GOLD_DARK);
        g2d.setPaint(border);
        g2d.setStroke(new BasicStroke(2.5f));
        g2d.drawRoundRect(CARD_X, y, CARD_WIDTH, CARD_HEIGHT, CORNER, CORNER);
    }

private void drawWatermark(Graphics2D g2d, int y) {
        Shape saveClip          = g2d.getClip();
        Composite saveComposite = g2d.getComposite();
        try {
            g2d.clip(new RoundRectangle2D.Float(CARD_X, y, CARD_WIDTH, CARD_HEIGHT, CORNER, CORNER));
            g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 0.04f));
            g2d.setColor(Color.WHITE);
            g2d.setStroke(new BasicStroke(1.1f));

            int cx = CARD_X + CARD_WIDTH - 46;
            int cy = y + CARD_HEIGHT / 2;
            for (int i = 0; i < 3; i++) {
                g2d.drawOval(cx - 18 - (i * 6), cy - 18 - (i * 6), 36 + (i * 12), 36 + (i * 12));
                g2d.drawLine(cx - 44, cy - 44 + (i * 24), cx + 44, cy + 44 - (i * 24));
            }

            g2d.setFont(new Font("SansSerif", Font.BOLD, 15));
            g2d.drawString("FUTURA", cx - 34, cy + 5);
        } finally {
            g2d.setClip(saveClip);
            g2d.setComposite(saveComposite);
        }
    }

private void drawRoomName(Graphics2D g2d, Room room, int y) {
        g2d.setFont(new Font("SansSerif", Font.BOLD, 12));
        g2d.setColor(TEXT_WHITE);
        String name = truncateToWidth(g2d, room.getRoomName(), CARD_WIDTH - 42);
        g2d.drawString(name, CARD_X + 12, y + 18);
    }

private void drawGearIcon(Graphics2D g2d, Room room, int y) {
        if (!controller.isOwnerOfCurrentRoom()) {
            gearBounds.setBounds(0, 0, 0, 0);   // clear hit area
            return;
        }

        int cx = CARD_X + CARD_WIDTH - 17;
        int cy = y + 15;
        int outerRadius = 5;
        int innerRadius = 2;
        gearBounds.setBounds(cx - outerRadius - 4, cy - outerRadius - 4,
                             (outerRadius + 4) * 2, (outerRadius + 4) * 2);

        Color hi = hoverGear ? GOLD_LIGHT.brighter() : GOLD_LIGHT;
        Color lo = hoverGear ? GOLD_LIGHT            : GOLD_DARK;
        GradientPaint gearGradient = new GradientPaint(
                cx - outerRadius, cy - outerRadius, hi,
                cx + outerRadius, cy + outerRadius, lo);
        g2d.setPaint(gearGradient);

        // Teeth
        g2d.setStroke(new BasicStroke(2f));
        for (int i = 0; i < 8; i++) {
            double angle = i * (Math.PI / 4.0);
            int x1 = (int) (cx + Math.cos(angle) * innerRadius);
            int y1 = (int) (cy + Math.sin(angle) * innerRadius);
            int x2 = (int) (cx + Math.cos(angle) * (outerRadius + 2));
            int y2 = (int) (cy + Math.sin(angle) * (outerRadius + 2));
            g2d.drawLine(x1, y1, x2, y2);
        }

        // Body
        g2d.fillOval(cx - outerRadius, cy - outerRadius, outerRadius * 2, outerRadius * 2);

        // Punch a "hole" in the middle (indigo of the card behind it)
        g2d.setColor(CARD_BG_START);
        g2d.fillOval(cx - innerRadius, cy - innerRadius, innerRadius * 2, innerRadius * 2);

        // Inner gold ring
        g2d.setPaint(gearGradient);
        g2d.setStroke(new BasicStroke(1.5f));
        g2d.drawOval(cx - innerRadius, cy - innerRadius, innerRadius * 2, innerRadius * 2);
    }

private void drawOwnerLine(Graphics2D g2d, Room room, int y) {
        int iconX = CARD_X + 12;
        int iconY = y + 27;

        // Vector crown — avoids ugly / inconsistent system emoji glyphs
        g2d.setColor(GOLD_FLAT);
        int[] xs = {iconX, iconX + 2, iconX + 4, iconX + 6, iconX + 8};
        int[] ys = {iconY + 7, iconY, iconY + 5, iconY, iconY + 7};
        g2d.fillPolygon(xs, ys, 5);
        g2d.fillRect(iconX, iconY + 8, 8, 2);   // crown base

        g2d.setFont(new Font("SansSerif", Font.PLAIN, 10));
        g2d.setColor(TEXT_WHITE);
        String owner = truncateToWidth(g2d, room.getOwnerUsername(), CARD_WIDTH - 36);
        g2d.drawString(owner, CARD_X + 25, y + 35);
    }

private void drawPlayerCount(Graphics2D g2d, Room room, int y) {
        int iconX = CARD_X + 13;
        int iconY = y + 42;

        // Vector user glyph (head + shoulders)
        g2d.setColor(TEXT_PURPLE);
        g2d.fillOval(iconX + 1, iconY, 5, 5);
        g2d.fillRoundRect(iconX - 1, iconY + 6, 9, 5, 5, 5);

        g2d.setFont(new Font("SansSerif", Font.PLAIN, 10));
        g2d.drawString(room.getCurrentPlayerCount() + " / " + room.getMaxPlayers(),
                       CARD_X + 25, y + 50);
    }

private static String truncateToWidth(Graphics2D g2d, String text, int maxWidth) {
        if (text == null) return "";
        FontMetrics fm = g2d.getFontMetrics();
        if (fm.stringWidth(text) <= maxWidth) return text;

        int ellipsisW = fm.stringWidth("…");
        StringBuilder sb = new StringBuilder();
        int w = 0;
        for (int i = 0; i < text.length(); i++) {
            int cw = fm.charWidth(text.charAt(i));
            if (w + cw + ellipsisW > maxWidth) break;
            sb.append(text.charAt(i));
            w += cw;
        }
        return sb.append("…").toString();
    }

public void handleMouseMove(int mx, int my) {
        hoverGear = gearBounds.contains(mx, my);
    }

public boolean handleClick(int mx, int my) {
        if (gearBounds.contains(mx, my) && controller.isOwnerOfCurrentRoom()) {
            // PORT NOTE: settings dialog is Swing; out of scope for the canvas proof.
            return true;
        }
        return false;
    }

    public void toggle()              { visible = !visible; }
    public boolean isVisible()        { return visible; }
    public void setVisible(boolean v) { visible = v; }

    /** PORT NOTE: original walked gp.ui.getToolbarHUD(); simplified for this slice. */
    private int bottomAnchorY() {
        int h = gp.getHeight() > 0 ? gp.getHeight() : gp.screenHeight;
        return h - 6;
    }

    @Override
    public String toString() {
        return String.format("%s[visible=%s]", getClass().getSimpleName(), visible);
    }
}
