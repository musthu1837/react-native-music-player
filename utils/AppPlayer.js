import TrackPlayer from 'react-native-track-player';

class AppPlayer {
    static selectedTrackl;

    static initializePlayer = async () => {
        try {
            TrackPlayer.updateOptions({
                stopWithApp: false, // false=> music continues in background even when app is closed
                // Media controls capabilities
                capabilities: [
                    TrackPlayer.CAPABILITY_PLAY,
                    TrackPlayer.CAPABILITY_PAUSE,
                    TrackPlayer.CAPABILITY_STOP,
                    TrackPlayer.CAPABILITY_SEEK_TO,
                ],
                // Capabilities that will show up when the notification is in the compact form on Android
                compactCapabilities: [
                    TrackPlayer.CAPABILITY_PLAY,
                    TrackPlayer.CAPABILITY_PAUSE,
                    TrackPlayer.CAPABILITY_STOP,
                    TrackPlayer.CAPABILITY_SEEK_TO,
                ],
            });

            await TrackPlayer.setupPlayer();
        } catch (e) {
            console.log(e);
            // to-do handle error
        }
    };

static secondsToHHMMSS = (seconds) => {
    // credits - https://stackoverflow.com/a/37096512
    seconds = Number(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor((seconds % 3600) % 60);

    const hrs = h > 0 ? (h < 10 ? `0${h}:` : `${h}:`) : '';
    const mins = m > 0 ? (m < 10 ? `0${m}:` : `${m}:`) : '00:';
    const scnds = s > 0 ? (s < 10 ? `0${s}` : s) : '00';
    return `${hrs}${mins}${scnds}`;
};

static fromMMSSToSeconds = (mmss) => {
    // credits - https://stackoverflow.com/a/37096512
    const timeComponent  = mmss && mmss.split(":");
    const m = isNaN(timeComponent[0]) ? 0: Number(timeComponent[0]);
    const s = isNaN(timeComponent[1]) ? 0: Number(timeComponent[1]);
    return (m*60) + s;
};
}

export default AppPlayer;
