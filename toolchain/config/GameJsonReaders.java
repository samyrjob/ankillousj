package ankillousj;

import json.JsonArray;
import json.JsonElement;
import json.JsonObject;
import json.JsonReaders;
import json.JsonWriters;

import model.room.FloorPlanResult;
import model.room.Room;
import model.room.RoomLayout;
import service.api.AgentApprovalClient;
import service.api.AgentFileClient;
import service.api.HttpClient;
import service.api.RoomApiClient;
import service.friend.FriendApiService;

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
        JsonReaders.register(AgentApprovalClient.Pending.class, GameJsonReaders::readPending);
        JsonReaders.register(AgentApprovalClient.Grant.class, GameJsonReaders::readGrant);
        JsonReaders.register(AgentFileClient.Doc.class, GameJsonReaders::readDoc);
        JsonReaders.register(RoomApiClient.Unlock.class, GameJsonReaders::readUnlock);

        // These keep their fields to themselves in the game (private, or a
        // private class): a patch in patches/ opens them in the working copy,
        // and changes nothing else. A patch that no longer applies stops the
        // build: the type has changed, and so must its reader here.
        JsonReaders.register(HttpClient.ApiResponse.class, GameJsonReaders::readApiResponse);
        JsonReaders.register(FloorPlanResult.class, GameJsonReaders::readFloorPlanResult);
        JsonReaders.register(RoomLayout.class, GameJsonReaders::readRoomLayout);

        // What the game writes that is not a map or a list.
        JsonWriters.register(FriendApiService.SendRequestBody.class, GameJsonReaders::writeSendRequest);
    }

    /**
     * The backend's plain "done or not" answer: every room setting (walls,
     * floor, free placement, name, password...), a kick, a placing by REST.
     * Without it each of those is reported as failed though the backend did it.
     */
    private static HttpClient.ApiResponse readApiResponse(JsonElement element) {
        JsonObject o = element.getAsJsonObject();
        HttpClient.ApiResponse r = new HttpClient.ApiResponse();
        r.success = bool(o, "success", false);
        r.message = str(o, "message");
        return r;
    }

    /** What changing a room's floor plan answers: the room as it is now, what was paid, what came back to the bag. */
    private static FloorPlanResult readFloorPlanResult(JsonElement element) {
        JsonObject o = element.getAsJsonObject();
        FloorPlanResult r = new FloorPlanResult();
        r.success = bool(o, "success", false);
        r.message = str(o, "message");
        r.room = o.has("room") && o.get("room").isJsonObject() ? readRoom(o.get("room")) : null;
        r.credits = num(o, "credits", 0L);
        r.returnedItems = num(o, "returnedItems", 0);
        return r;
    }

    /** A room shape offered when a room is created. */
    private static RoomLayout readRoomLayout(JsonElement element) {
        JsonObject o = element.getAsJsonObject();
        RoomLayout l = new RoomLayout();
        l.layoutKey = str(o, "layoutKey");
        l.name = str(o, "name");
        l.description = str(o, "description");
        l.category = str(o, "category");
        l.width = num(o, "width", 0);
        l.height = num(o, "height", 0);
        l.heightmap = str(o, "heightmap");
        l.doorX = num(o, "doorX", 0);
        l.doorY = num(o, "doorY", 0);
        return l;
    }

    /** The answer of a password room's door. */
    private static RoomApiClient.Unlock readUnlock(JsonElement element) {
        JsonObject o = element.getAsJsonObject();
        return new RoomApiClient.Unlock(bool(o, "success", false), str(o, "reason"), str(o, "message"));
    }

    /** A friend request as it is sent. As Gson writes it: a field that is null is left out. */
    private static JsonElement writeSendRequest(FriendApiService.SendRequestBody body) {
        JsonObject o = new JsonObject();
        if (body.toUsername != null) o.addProperty("toUsername", body.toUsername);
        if (body.fromGender != null) o.addProperty("fromGender", body.fromGender);
        return o;
    }

    /** One request waiting for the owner (the agents' approvals inbox). */
    private static AgentApprovalClient.Pending readPending(JsonElement element) {
        JsonObject o = element.getAsJsonObject();
        AgentApprovalClient.Pending p = new AgentApprovalClient.Pending();
        p.id = num(o, "id", 0L);
        p.agent = str(o, "agent");
        p.visitor = str(o, "visitor");
        p.tool = str(o, "tool");
        p.arguments = str(o, "arguments");
        p.reason = str(o, "reason");
        p.kind = str(o, "kind");
        p.canAlways = bool(o, "canAlways", false);
        p.createdAt = str(o, "createdAt");
        if (o.has("editable") && o.get("editable").isJsonArray()) {
            List<String> names = new ArrayList<>();
            for (JsonElement e : o.getAsJsonArray("editable")) names.add(e.isJsonNull() ? null : e.getAsString());
            p.editable = names;
        }
        if (o.has("values") && o.get("values").isJsonObject()) {
            Map<String, String> values = new LinkedHashMap<>();
            JsonObject v = o.getAsJsonObject("values");
            for (String key : v.keySet()) {
                JsonElement e = v.get(key);
                values.put(key, e == null || e.isJsonNull() ? null : e.getAsString());
            }
            p.values = values;
        }
        return p;
    }

    /** A tool the owner said to always approve. */
    private static AgentApprovalClient.Grant readGrant(JsonElement element) {
        JsonObject o = element.getAsJsonObject();
        AgentApprovalClient.Grant g = new AgentApprovalClient.Grant();
        g.id = num(o, "id", 0L);
        g.agent = str(o, "agent");
        g.tool = str(o, "tool");
        g.grantedBy = str(o, "grantedBy");
        g.createdAt = str(o, "createdAt");
        return g;
    }

    /** A document given to an agent. */
    private static AgentFileClient.Doc readDoc(JsonElement element) {
        JsonObject o = element.getAsJsonObject();
        AgentFileClient.Doc d = new AgentFileClient.Doc();
        d.id = num(o, "id", 0L);
        d.name = str(o, "name");
        d.type = str(o, "type");
        d.sizeBytes = num(o, "sizeBytes", 0L);
        d.status = str(o, "status");
        d.readable = bool(o, "readable", false);
        d.characters = num(o, "characters", 0);
        d.pages = o.has("pages") && !o.get("pages").isJsonNull() ? Integer.valueOf(num(o, "pages", 0)) : null;
        d.problem = str(o, "problem");
        return d;
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
