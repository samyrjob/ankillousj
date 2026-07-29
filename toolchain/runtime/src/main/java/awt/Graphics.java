package awt;

/**
 * java.awt.Graphics — the base every AWT paint method receives.
 *
 * Game code is handed a Graphics and casts to Graphics2D, so the cast has to
 * be legal and the common methods have to dispatch through this type. The
 * declarations here exist for that dispatch; Graphics2D implements them.
 */
public abstract class Graphics {

    public abstract void setColor(Color c);
    public abstract Color getColor();
    public abstract void setFont(Font f);
    public abstract Font getFont();
    public abstract FontMetrics getFontMetrics();
    public abstract FontMetrics getFontMetrics(Font f);

    public abstract void drawString(String s, int x, int y);
    public abstract void fillRect(int x, int y, int w, int h);
    public abstract void drawRect(int x, int y, int w, int h);
    public abstract void clearRect(int x, int y, int w, int h);
    public abstract void fillRoundRect(int x, int y, int w, int h, int aw, int ah);
    public abstract void drawRoundRect(int x, int y, int w, int h, int aw, int ah);
    public abstract void fillOval(int x, int y, int w, int h);
    public abstract void drawOval(int x, int y, int w, int h);
    public abstract void drawLine(int x1, int y1, int x2, int y2);
    public abstract void fillPolygon(int[] xs, int[] ys, int n);
    public abstract void drawPolygon(int[] xs, int[] ys, int n);
    public abstract void drawPolyline(int[] xs, int[] ys, int n);
    public abstract void drawArc(int x, int y, int w, int h, int start, int extent);
    public abstract void fillArc(int x, int y, int w, int h, int start, int extent);

    public abstract void setClip(Shape s);
    public abstract Shape getClip();
    public abstract void clipRect(int x, int y, int w, int h);
    public abstract void translate(int x, int y);

    public abstract Graphics create();
    public abstract void dispose();
}
