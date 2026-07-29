package javafx.application;
public final class Platform {
    public static void startup(Runnable r) { r.run(); }
    public static void runLater(Runnable r) { r.run(); }
    public static void setImplicitExit(boolean b) { }
}
