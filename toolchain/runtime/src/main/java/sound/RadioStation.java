package sound;

public enum RadioStation {

    LOS40(
        "Los 40",
        "Spanish Hits",
        "https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40.mp3",
        StreamType.MP3
    ),


    BBC_RADIO1(
        "BBC Radio 1",
        "UK Pop & Dance",
        "http://as-hls-ww-live.akamaized.net/pool_01505109/live/ww/bbc_radio_one/bbc_radio_one.isml/bbc_radio_one-audio%3d96000.norewind.m3u8",
        StreamType.HLS
    ),

    OFFLINE(
        "Offline Music",
        "Local Track",
        null,
        StreamType.LOCAL
    );

    public enum StreamType { MP3, HLS, LOCAL }

    private final String displayName;
    private final String genre;
    private final String streamUrl;
    private final StreamType streamType;

    RadioStation(String displayName, String genre, String streamUrl, StreamType streamType) {
        this.displayName = displayName;
        this.genre       = genre;
        this.streamUrl   = streamUrl;
        this.streamType  = streamType;
    }

    public String getDisplayName()    { return displayName; }
    public String getGenre()          { return genre; }
    public String getStreamUrl()      { return streamUrl; }
    public StreamType getStreamType() { return streamType; }
    public boolean isStream()         { return streamType != StreamType.LOCAL; }

    public RadioStation next() {
        RadioStation[] v = values();
        return v[(ordinal() + 1) % v.length];
    }

    public RadioStation previous() {
        RadioStation[] v = values();
        return v[(ordinal() - 1 + v.length) % v.length];
    }
}