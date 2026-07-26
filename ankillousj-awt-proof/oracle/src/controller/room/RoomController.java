package controller.room;

import model.room.Room;

/** Only the methods RoomInfoCard.draw() actually touches. */
public class RoomController {
    private final Room room;
    private final boolean owner;

    public RoomController(Room room, boolean owner) { this.room = room; this.owner = owner; }

    public Room getCurrentRoom()        { return room; }
    public boolean isOwnerOfCurrentRoom() { return owner; }
}
