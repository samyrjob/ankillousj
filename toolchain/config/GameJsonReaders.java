package ankillousj;

import json.JsonArray;
import json.JsonElement;
import json.JsonObject;
import json.JsonReaders;

import model.room.Room;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static json.JsonReaders.arr;
import static json.JsonReaders.bool;
import static json.JsonReaders.intGrid;
import static json.JsonReaders.num;
import static json.JsonReaders.str;

/**
 * Explicit readers for the types the API layer deserialises.
 *
 * <p>These replace Gson's reflective binding. `HttpClient.getList("/public",
 * Room[].class)` and every call like it goes through here instead, and no
 * service code changes.
 *
 * <p>Writing them out is more typing than an annotation. What it buys: the
 * compiler can see exactly what is reachable, a renamed field is a compile
 * error rather than a silent null at runtime, and the build does not have to
 * ship a reflection engine — which is what pulled `Unsafe`,
 * `ObjectStreamClass`, `InetAddress` and `java.sql.Date` into a game that
 * mentions none of them.
 */
public final class GameJsonReaders {

    private GameJsonReaders() { }

    private static boolean installed;

    /** Call once, before anything deserialises. */
    public static void install() {
        if (installed) return;
        installed = true;

        JsonReaders.register(Room.class, GameJsonReaders::readRoom);
        JsonReaders.register(Map.class, GameJsonReaders::readMap);

        // Types with package-private fields register themselves from their own
        // static initialiser instead — see service.api.HttpClient.ApiResponse
        // in the guide. The reader belongs beside the thing it reads.
    }

    private static Room readRoom(JsonElement element) {
        JsonObject o = element.getAsJsonObject();

        Room room = new Room(
            str(o, "roomId", ""),
            str(o, "roomName", "Room"),
            str(o, "ownerUsername", ""));

        String type = str(o, "roomType", "PUBLIC");
        try {
            room.setRoomType(Room.RoomType.valueOf(type));
        } catch (IllegalArgumentException e) {
            // An unknown type from a newer server should not lose the room
            room.setRoomType(Room.RoomType.PUBLIC);
        }

        room.setDescription(str(o, "description", ""));
        room.setMaxPlayers(num(o, "maxPlayers", 50));
        room.setCurrentPlayerCount(num(o, "currentPlayerCount", 0));
        room.setWidth(num(o, "width", 10));
        room.setHeight(num(o, "height", 10));
        room.setPassword(str(o, "password", null));
        room.setFreePlacement(bool(o, "freePlacement", false));
        room.setHideWalls(bool(o, "hideWalls", false));
        room.setHideFloor(bool(o, "hideFloor", false));

        if (o.has("tileMap")) room.setTileMap(intGrid(o, "tileMap"));

        JsonArray owners = arr(o, "owners");
        if (owners.size() > 0) {
            List<String> list = new ArrayList<>();
            for (JsonElement e : owners) list.add(e.getAsString());
            room.setOwners(list);
        }
        return room;
    }

    /**
     * Furniture arrives as a bare map, so it is read as one rather than being
     * given a type it does not have on the server side either.
     */
    private static Map<String, Object> readMap(JsonElement element) {
        Map<String, Object> map = new LinkedHashMap<>();
        JsonObject o = element.getAsJsonObject();
        for (Map.Entry<String, JsonElement> e : o.entrySet()) {
            map.put(e.getKey(), unwrap(e.getValue()));
        }
        return map;
    }

    private static Object unwrap(JsonElement e) {
        if (e == null || e.isJsonNull()) return null;
        if (e.isJsonObject()) return readMap(e);
        if (e.isJsonArray()) {
            List<Object> list = new ArrayList<>();
            for (JsonElement item : e.getAsJsonArray()) list.add(unwrap(item));
            return list;
        }
        json.JsonPrimitive p = e.getAsJsonPrimitive();
        if (p.isBoolean()) return p.getAsBoolean();
        // Gson hands numbers back as Double, and callers cast accordingly
        if (p.isNumber()) return p.getAsDouble();
        return p.getAsString();
    }
}
