package view.shared;

import awt.BasicStroke;
import awt.Graphics2D;
import awt.geom.Area;
import awt.geom.Ellipse2D;
import awt.geom.RoundRectangle2D;

/**
 * Smooth "two people" icon — the Futura replacement for the 👥 emoji.
 *
 * <p>Vector-drawn in a 64x64 space (see {@link IconBase}). Two overlapping
 * figures: the back one in muted gold, the front one in full gold, each with a
 * navy edge so they stay readable when they overlap.
 */
public final class GroupIcon {

    private GroupIcon() {}

    /** Draw with the top-left corner at (x, y), scaled to {@code size} px square. */
    public static void draw(Graphics2D g, int x, int y, int size) {
        IconBase.paint(g, x, y, size, GroupIcon::paint);
    }


    private static void paint(Graphics2D g) {
        // Back figure (up and to the right), drawn first so the front overlaps it
        figure(g, new Ellipse2D.Double(34, 6, 20, 20),
                  new RoundRectangle2D.Double(28, 29, 32, 24, 22, 22),
                  IconBase.GOLD_DARK);

        // Front figure (down and to the left)
        figure(g, new Ellipse2D.Double(9, 13, 24, 24),
                  new RoundRectangle2D.Double(2, 39, 38, 26, 24, 24),
                  IconBase.GOLD);
    }

    /** One person: head + shoulders fused, navy edge, solid fill. */
    private static void figure(Graphics2D g, Ellipse2D head,
                               RoundRectangle2D body, awt.Color fill) {
        Area person = new Area(head);
        person.add(new Area(body));

        g.setColor(IconBase.OUTLINE);
        g.setStroke(new BasicStroke(9f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        g.draw(person);

        g.setColor(fill);
        g.fill(person);

        g.setColor(IconBase.OUTLINE);
        g.setStroke(new BasicStroke(3f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        g.draw(person);
    }
}
