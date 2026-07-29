package view.room;

import ankillousj.ui.Overlay;

import awt.Component;

import java.util.Optional;
import java.util.function.Consumer;

import org.teavm.jso.JSObject;

/**
 * The room-creation form, in HTML.
 *
 * <p>The Swing original was 651 lines of hand-built layout: labels, a text
 * field, a template picker, validation, painting. The browser already has all
 * of that, so this is a form and a callback.
 *
 * <p>{@link #show} keeps its signature and returns empty, because a browser
 * cannot block. {@link #showAsync} is the one the game actually uses.
 */
public final class RoomCreationDialog {

    private RoomCreationDialog() { }

    /** The dialog's result, matching the original API exactly. */
    public static final class Result {
        private final String roomName;
        private final RoomTemplate template;

        public Result(String roomName, RoomTemplate template) {
            this.roomName = roomName;
            this.template = template;
        }

        public String getRoomName()       { return roomName; }
        public RoomTemplate getTemplate() { return template; }
    }

    /**
     * @return always empty — a browser cannot block for an answer. Use
     *     {@link #showAsync}, which is what the game calls anyway.
     */
    public static Optional<Result> show(Component parent) {
        showAsync(parent, null);
        return Optional.empty();
    }

    public static void showAsync(Component parent, Consumer<Result> onCreate) {
        RoomTemplate[] templates = RoomTemplate.values();

        StringBuilder body = new StringBuilder();
        body.append("<label class=\"ank-label\">Room name</label>")
            .append("<input class=\"ank-field\" data-name maxlength=\"32\" ")
            .append("placeholder=\"My room\">")
            .append("<label class=\"ank-label\">Size</label>")
            .append("<div class=\"ank-list\" style=\"padding:0\">");

        for (int i = 0; i < templates.length; i++) {
            RoomTemplate t = templates[i];
            body.append("<button class=\"ank-item\" data-t=\"").append(i).append("\"")
                .append(i == 1 ? " data-selected style=\"border-color:#e6c878\"" : "")
                .append("><b>").append(Overlay.escape(t.getName())).append("</b>")
                .append(" <span style=\"color:#a096be\">")
                .append(t.getCols()).append("\u00d7").append(t.getRows())
                .append(" \u2014 ").append(Overlay.escape(t.getDescription()))
                .append("</span></button>");
        }
        body.append("</div>");

        JSObject[] box = new JSObject[1];
        // The default matches the Swing original's preselected template.
        final int[] chosen = { 1 };

        box[0] = Overlay.dialog("Create a room", body.toString(),
            "<button class=\"ank-btn\" data-cancel>Cancel</button>"
                + "<button class=\"ank-btn ank-btn-primary\" data-create>Create</button>");

        for (int i = 0; i < templates.length; i++) {
            final int index = i;
            Overlay.onClick(box[0], "[data-t=\"" + i + "\"]", () -> {
                chosen[0] = index;
                Overlay.selectOne(box[0], "[data-t]", "[data-t=\"" + index + "\"]");
            });
        }

        Overlay.onClick(box[0], "[data-cancel]", () -> Overlay.dismiss(box[0]));
        Overlay.onClick(box[0], "[data-create]", () -> {
            String name = Overlay.valueOf(box[0], "[data-name]");
            if (name == null || name.trim().isEmpty()) {
                // Invalid input keeps the dialog open, as the original did
                Overlay.setText(box[0], "[data-name]", "");
                Overlay.focus(box[0], "[data-name]");
                return;
            }
            Overlay.dismiss(box[0]);
            if (onCreate != null) onCreate.accept(new Result(name.trim(), templates[chosen[0]]));
        });

        Overlay.focus(box[0], "[data-name]");
    }
}
