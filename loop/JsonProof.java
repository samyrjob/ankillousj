package ankillousj;

import json.Gson;
import json.JsonObject;
import model.room.Room;

import java.util.List;
import java.util.Map;

import org.teavm.jso.JSBody;

/** Proves both directions on a real Room, inside the compiled build. */
public final class JsonProof {

    @JSBody(params = "m", script = "if (typeof console !== 'undefined') console.log(m);")
    private static native void log(String m);

    private JsonProof() { }

    public static void run() {
        GameJsonReaders.install();
        Gson gson = new Gson();

        String wire = "{\"roomId\":\"r7\",\"roomName\":\"Rooftop\",\"ownerUsername\":\"Dev\","
                    + "\"roomType\":\"PRIVATE\",\"maxPlayers\":42,\"currentPlayerCount\":17,"
                    + "\"width\":8,\"height\":6,\"freePlacement\":true,"
                    + "\"tileMap\":[[0,1],[1,0]],\"owners\":[\"Dev\",\"Mod\"]}";

        // DESERIALISE: one object
        Room r = gson.fromJson(wire, Room.class);
        log("read one   : " + r.getRoomName() + " / " + r.getOwnerUsername()
            + " / " + r.getRoomType() + " / " + r.getCurrentPlayerCount() + " of " + r.getMaxPlayers()
            + " / " + r.getWidth() + "x" + r.getHeight()
            + " / freePlacement=" + r.isFreePlacement());

        // DESERIALISE: an array, from one registration
        Room[] many = gson.fromJson("[" + wire + "," + wire + "]", Room[].class);
        log("read array : " + many.length + " rooms, first=" + many[0].getRoomId());

        // SERIALISE: a map, which needs no registration at all
        String body = gson.toJson(Map.of("username", "WebPlayer"));
        log("write map  : " + body);

        // SERIALISE: a tree built by hand
        JsonObject o = new JsonObject();
        o.addProperty("roomId", r.getRoomId());
        o.addProperty("players", r.getCurrentPlayerCount());
        o.add("owners", gson.fromJson("[\"Dev\"]", json.JsonArray.class));
        log("write tree : " + gson.toJson(o));

        // ROUND TRIP: object -> JSON -> object
        JsonObject back = new JsonObject();
        back.addProperty("roomId", r.getRoomId());
        back.addProperty("roomName", r.getRoomName());
        back.addProperty("ownerUsername", r.getOwnerUsername());
        back.addProperty("maxPlayers", r.getMaxPlayers());
        Room again = gson.fromJson(back.toString(), Room.class);
        log("round trip : " + again.getRoomName() + " maxPlayers=" + again.getMaxPlayers()
            + "  identical=" + (again.getRoomName().equals(r.getRoomName())
                             && again.getMaxPlayers() == r.getMaxPlayers()));
    }
}
