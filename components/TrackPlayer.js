/* eslint-disable no-console */
import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
  View,
  Image,
  TouchableOpacity,
  Modal
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient'
import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons';
import Entypo from 'react-native-vector-icons/dist/Entypo';
import Feather from 'react-native-vector-icons/dist/Feather';
import AntDesign from 'react-native-vector-icons/dist/AntDesign';
import TrackPlayer, {RepeatMode, TrackPlayerEvents, STATE_PLAYING} from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import {useTrackPlayerProgress, useTrackPlayerEvents} from 'react-native-track-player/lib/hooks';
import AppPlayer from '../utils/AppPlayer'

const Dev_Height = Dimensions.get('window').height;
const Dev_Width = Dimensions.get('window').width;

const LoopView = ({setShowRepeatModeOptions, setRepeatMode}) => {

  const PROP = [
    {
      key: 1,
      text: '15 Minutes',
      value: 900 * 1000
    },
    {
      key: 2,
      text: '30 Minutes',
      value: 1800 * 1000
    },
    {
      key: 3,
      text: '45 Minutes',
      value: 2700 * 1000
    },
    {
      key: 4,
      text: '60 Minutes',
      value: 3600 * 1000
    },
  ];
  const [duration, setDuration] = useState(900 * 1000);
  
  return (<View>
    <View style={styles.repeatOptionHeader}>
      <Text style={styles.loopText}>
        Loop
      </Text>
      <TouchableOpacity onPress={() => {
        setShowRepeatModeOptions(false)
        
        }}>
      <Entypo 
        name="cross" 
        color="white" 
        size={40} 
      />
    </TouchableOpacity>

    </View>
    <View>
    {PROP.map(res => {
        return (
            <View key={res.key} style={styles.optionsContainer}>
                
                <TouchableOpacity
                    style={styles.radioCircle}
                    onPress={() => {
                      setShowRepeatModeOptions(false)
                      setRepeatMode(duration)}}>
                      {duration === res.value && <View style={styles.selectedRb} />}
                </TouchableOpacity>
                <Text style={styles.radioText}>{res.text}</Text>
            </View>
        );
    })}
    </View>
  </View>)
}


const TrackPlayerView = ({selectedTrack, setSelectedTrack, isDownloading, downLoadFile, downloadprogress}) => {

  console.log("Inside TrackPlayerView", selectedTrack);
  
  const track = {
    id: selectedTrack.scene_id,
    url: selectedTrack.scene,
    title: selectedTrack.title,
    duration: Number(selectedTrack.scene_duration),
    img: selectedTrack.bg_image,
    fromDb: selectedTrack.fromDb,
    artwork: selectedTrack.bg_image
  };
  const trackPlayerInit = async () => {
    await TrackPlayer.updateOptions({
      stopWithApp: true, // false=> music continues in background even when app is closed
      // Media controls capabilities
      capabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
      ],
   
  });
    await TrackPlayer.setupPlayer();
    await TrackPlayer.add(track);
    return true;
  };

  const [isTrackPlayerInit, setIsTrackPlayerInit] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);  
  const [isPlayingInRepeatMode, setIsPlayingInRepeatMode] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [repeatModeInterval, setRepeatModeInterval] = useState(null);
  const [showRepeatModeOptions, setShowRepeatModeOptions] = useState(false);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);


  //the value of the slider should be between 0 and 1
  const [sliderValue, setSliderValue] = useState(0);
  
  //flag to check whether the use is sliding the seekbar or not
  const [isSeeking, setIsSeeking] = useState(false);

  //useTrackPlayerProgress is a hook which provides the current position and duration of the track player.
  //These values will update every 250ms 
  const {position, duration} = useTrackPlayerProgress(250);
  
   //initialize the TrackPlayer when the App component is mounted
  useEffect(() => {
    const startPlayer = async () => {
      let isInit =  await trackPlayerInit();
      setIsTrackPlayerInit(isInit);
    }
    startPlayer();
  }, []);

   //this hook updates the value of the slider whenever the current position of the song changes
  useEffect(() => {
    if (!isSeeking && position && duration) {
      setSliderValue(position / duration);
    } else if(!isSeeking && position === 0) {
      setSliderValue(0);
    }
  }, [position, duration]);

  useTrackPlayerEvents([TrackPlayerEvents.REMOTE_DUCK], event => {
    console.log("TrackPlayerEvents.REMOTE_DUCK::::::::::::::::::::;", event)
    if (event.paused) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  });


    useTrackPlayerEvents([TrackPlayerEvents.REMOTE_PLAY], event => setIsPlaying(true));
    useTrackPlayerEvents([TrackPlayerEvents.REMOTE_PAUSE], event => setIsPlaying(false));


  // useTrackPlayerEvents([TrackPlayerEvents.PLAYBACK_STATE], event => {
  //   if (event.state === STATE_PLAYING) {
  //     setIsPlaying(true);
  //   } else {
  //     setIsPlaying(false);
  //   }
  // });

  //this function is called when the user starts to slide the seekbar
  const slidingStarted = () => {
    setIsSeeking(true);
  };
  //this function is called when the user stops sliding the seekbar
  const slidingCompleted = async value => {
    await TrackPlayer.seekTo(value * duration);
    setSliderValue(value);
    setIsSeeking(false);
  };

  const jumpForward = async () => {
    setIsSeeking(true);
    const nextPosition = position + 10;
    if (nextPosition <= track.duration) {
      await TrackPlayer.seekTo(nextPosition);
    } else {
      await TrackPlayer.seekTo(0);
      handlePlayAndPause();
    }
    setIsSeeking(false);
  };

  const jumpBackward = async () => {
    setIsSeeking(true);
    const nextPosition = position - 10;
    if (nextPosition <= 0) {
      handlePlayAndPause();
      await TrackPlayer.seekTo(0)
    } else {
      await TrackPlayer.seekTo(position - 10);
    }
    setIsSeeking(false);
  };

  //start playing the TrackPlayer when the button is pressed 

  const handlePlayAndPause = async () => {
    if (!isPlaying) {
      if (position === track.duration) {
        setIsSeeking(true);
        await TrackPlayer.seekTo(0);
        setIsSeeking(false);
      }
      await TrackPlayer.play();
      setIsPlaying(true);
    } else {
      await TrackPlayer.pause();
      setIsPlaying(false);
    }
  };

  const setRepeatMode = async (duration) => {
    if (isPlayingInRepeatMode) {
      setIsPlayingInRepeatMode(false);
      await TrackPlayer.setRepeatMode(RepeatMode.Off);
      clearTimeout(repeatModeInterval);
    } else {
      setIsPlayingInRepeatMode(true);
      setRepeatModeInterval(setTimeout(async () => {
        setIsPlayingInRepeatMode(false);
        await TrackPlayer.setRepeatMode(RepeatMode.Off);
      }, duration))
      await TrackPlayer.setRepeatMode(RepeatMode.Track);
    }
  };

  const handleClose = async () => {
    await TrackPlayer.stop();
    await TrackPlayer.destroy();
    clearTimeout(repeatModeInterval);
    setSelectedTrack(null);
  }

  const getTime = () => {
    const dateArray = new Date().toString().split(" ")
    return `${dateArray[2]} ${dateArray[1]} ${dateArray[3]} ${AppPlayer.tConv24(dateArray[4])}`
  }

  return (
    <SafeAreaView style={styles.contanier}>
      {/* <ImageBackground
        source={{uri: track.img}}
        style={styles.background}> */}
        <Modal  animationType="slide" visible={showRepeatModeOptions} style={{zIndex: 10}} transparent={true}>
          <View style={styles.repeatOptions}>
          <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.repeatOptionsGradient} colors={['#345DA7', '#3B8AC4', '#4BB4DE' ]}>

            <LoopView 
              setRepeatMode={setRepeatMode}
              setShowRepeatModeOptions={setShowRepeatModeOptions}
            />
          </LinearGradient>
          </View>
        </Modal>
        <Image blurRadius={10} style={styles.background} source={{uri: track.img}} onLoad={() => setIsBackgroundLoaded(true)}></Image>
        {!isBackgroundLoaded ? <ActivityIndicator size="large" style={{position: 'absolute',top: '48%', left: '45%'}}/>: false}
        <View style={styles.mainbar}>
          <TouchableOpacity onPress={handleClose} style={styles.closeIcon}>
            <Entypo 
              name="cross" 
              color="white" 
              size={40} 
            />
          </TouchableOpacity>
{   !track.fromDb ? <TouchableOpacity style={styles.downLoadIcon} onPress={!isDownloading ? downLoadFile: null}>
          {!isDownloading ?(<MaterialIcons
              name="file-download"
              size={40}
              color="white"
            />): <Text styles={{fontSize: 10}}>{Math.round(downloadprogress)}%</Text>}
          </TouchableOpacity>: (false)}
        </View>
        <View style={styles.trackActions}>
        <View style={styles.name_of_song_View}>
          <Text style={styles.name_of_song_Text1}>{track.title}</Text>
          <Text style={styles.name_of_song_Text2}>{getTime()}</Text>
        </View>
        <View style={styles.slider_view}>
          <Slider
            style={styles.slider_style}
            minimumTrackTintColor="#4BB4DE"
            maximumTrackTintColor="white"
            onSlidingStart={slidingStarted}
            thumbTintColor="#4BB4DE"
            onSlidingComplete={slidingCompleted}
            value={sliderValue}
          />
          <View style={styles.slider_time_view}>
            <Text style={styles.slider_time}> {AppPlayer.secondsToHHMMSS(Math.floor(position || 0))}  </Text>
            <Text style={styles.slider_time}> {AppPlayer.secondsToHHMMSS(track.duration || 0)}</Text>
          </View>
        </View>

        <View style={styles.functions_view}>
          <TouchableOpacity style={{flex: 1}} onPress={isTrackPlayerInit? isPlayingInRepeatMode ? setRepeatMode :() => setShowRepeatModeOptions(true) :null}>
            <Feather
              name="repeat"
              size={24}
              color= {isPlayingInRepeatMode ? "#FF0000":"white"}/>
          </TouchableOpacity>
          <TouchableOpacity style={{flex: 1, marginLeft: 10}} onPress={isTrackPlayerInit? jumpBackward :null}>
            <AntDesign
              name="stepbackward"
              size={24}
              color="white"
              />
          </TouchableOpacity>
          <TouchableOpacity
            style={{marginRight: 50, backgroundColor: '#4BB4DE', alignItems: 'center', justifyContent: 'center', height: 70, width: 70, borderRadius: 100}}
            onPress={isTrackPlayerInit? handlePlayAndPause :null}>
              {
                isPlaying ? (
                  <Entypo
                  name="controller-paus"
                  size={40}
                  color="white"
                  />
                ) : (
                  <Entypo
                  name="controller-play"
                  size={45}
                  color="white"
                  style={{marginLeft: '10%'}}
                  />
                )
              }
          </TouchableOpacity>
          <TouchableOpacity style={{flex: 1, marginRight: 10}} onPress={isTrackPlayerInit? jumpForward :null}>
            <AntDesign
              name="stepforward"
              size={24}
              color="white"
              />
          </TouchableOpacity>
          <TouchableOpacity style={{flex: 1}} onPress={() => setIsFavorite(!isFavorite)}>
            {
              isFavorite ? (
                <AntDesign
                name="heart"
                size={24}
                color="#FF0000"
                />
              ): (
                <AntDesign
                name="hearto"
                size={24}
                color="white"
                />
              )
            }
          </TouchableOpacity>
        </View>
        </View>
      {/* </ImageBackground> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: '100%',
  },
  contanier: {
    height: Dev_Height,
    width: Dev_Width,
    position: 'absolute'
  },
  mainbar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 20
  },
  closeIcon: {
    marginLeft: '3%',
  },
  downLoadIcon: {
    marginRight: '3%',
  },
  image_view: {
    height: '100%',
    width: '50%',
    borderRadius: 10,
  },
  trackActions: {
    backgroundColor:  'rgba(128,128,128,0.5)',
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
    position: 'absolute',
    top: '50%',
    width: '100%',
    height: '51%'
  }, 
  name_of_song_View: {
    height: '15%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '5%'
  },
  name_of_song_Text1: {
    color: 'white',
    fontSize: 30,
    fontWeight: '500',
  },
  name_of_song_Text2: {
    color: 'white',
    fontSize: 15,
    marginTop: '4%',
  },
  slider_view: {
    height: '10%',
    width: '100%',
    alignItems: 'center',
    marginTop: '10%'
  },
  slider_time_view: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  slider_time: {
    fontSize: 15,
    marginLeft: '7%',
    marginRight: '7%',
    color: 'white',
  },
  slider_style: {
    height: '70%',
    width: '90%',
    transform: [{scaleX: 1}, {scaleY: 1}],
  },
  functions_view: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    margin: '5%',
    marginTop: '15%'
  },
  repeatOptions: {
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.26,
    elevation: 2,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: '33%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    bottom: 0
    },
    repeatOptionsGradient: {
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      height: '100%',
      width: '100%',
    },
    repeatOptionHeader: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 10
    },
    loopText: {
      fontSize: 15,
      color: 'white'
    }, 
    radioText: {
      marginLeft: 10,
      fontSize: 15,
      color: 'white',
      fontWeight: '700'
  },
  optionsContainer: {
    marginBottom: 20,
    alignItems: 'center',
    flexDirection: 'row',
},
radioCircle: {
  height: 20,
  width: 20,
  borderRadius: 100,
  borderWidth: 2,
  borderColor: 'white',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 10
},
selectedRb: {
  width: 10,
  height: 10,
  borderRadius: 50,
  backgroundColor: 'white',
  },
  result: {
      marginTop: 20,
      color: 'white',
      fontWeight: '600',
      backgroundColor: '#F3FBFE',
  },
    
});

export default TrackPlayerView;
