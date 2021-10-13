import TrackPlayer from 'react-native-track-player';

module.exports = async function () {
  TrackPlayer.addEventListener('remote-play', () => TrackPlayer.play());
  TrackPlayer.addEventListener('remote-pause', () => TrackPlayer.pause());
  TrackPlayer.addEventListener('remote-stop', () => TrackPlayer.destroy());
  TrackPlayer.addEventListener('remote-duck', (event) =>  {
    if(event.paused){
      TrackPlayer.pause()
    } else {
      TrackPlayer.play()
    }

    console.log('addEventListener remote-duck::::::::::::::::::::::', event)
  } );
};
