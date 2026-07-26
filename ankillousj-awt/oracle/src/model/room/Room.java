package model.room;

public class Room {
    public enum RoomType { PUBLIC, PRIVATE }

    private final String roomId, roomName, ownerUsername;
    private final int currentPlayerCount, maxPlayers;
    private final RoomType roomType;
    private boolean freePlacement, hideWalls, hideFloor;

    public Room(String roomId, String roomName, String ownerUsername,
                int currentPlayerCount, int maxPlayers, RoomType roomType) {
        this.roomId=roomId; this.roomName=roomName; this.ownerUsername=ownerUsername;
        this.currentPlayerCount=currentPlayerCount; this.maxPlayers=maxPlayers; this.roomType=roomType;
    }

    public String getRoomId()          { return roomId; }
    public String getRoomName()        { return roomName; }
    public String getOwnerUsername()   { return ownerUsername; }
    public int getCurrentPlayerCount() { return currentPlayerCount; }
    public int getMaxPlayers()         { return maxPlayers; }
    public RoomType getRoomType()      { return roomType; }
    public boolean isFreePlacement()   { return freePlacement; }
    public boolean isHideWalls()       { return hideWalls; }
    public boolean isHideFloor()       { return hideFloor; }
    public void setFreePlacement(boolean v) { freePlacement = v; }
}
