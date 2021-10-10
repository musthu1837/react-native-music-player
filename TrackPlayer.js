/* eslint-disable no-console */
import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  Dimensions,
  Text,
  ImageBackground,
  View,
  Image,
  PermissionsAndroid,
  TouchableOpacity,
} from 'react-native';

import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons';
import Entypo from 'react-native-vector-icons/dist/Entypo';
import Feather from 'react-native-vector-icons/dist/Feather';
import AntDesign from 'react-native-vector-icons/dist/AntDesign';
import TrackPlayer, {RepeatMode} from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import {useProgress} from 'react-native-track-player/lib/hooks';
import AppPlayer from './utils/AppPlayer'
import Database from './utils/database'
import RNFS from 'react-native-fs';
import {dirAudio, dirPictures} from './utils/dirStorage'

const Dev_Height = Dimensions.get('window').height;
const Dev_Width = Dimensions.get('window').width;

const TrackPlayerView = ({selectedTrack, setSelectedTrack}) => {

  console.log("Inside TrackPlayerView", selectedTrack)
  const track = selectedTrack;
  const trackPlayerInit = async () => {
    await TrackPlayer.updateOptions({
      stopWithApp: true, // false=> music continues in background even when app is closed
      // Media controls capabilities
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

  //the value of the slider should be between 0 and 1
  const [sliderValue, setSliderValue] = useState(0);
  
  //flag to check whether the use is sliding the seekbar or not
  const [isSeeking, setIsSeeking] = useState(false);

  //useTrackPlayerProgress is a hook which provides the current position and duration of the track player.
  //These values will update every 250ms 
  const {position, duration} = useProgress(250);
  
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

  const setRepeatMode = async () => {
    if (isPlayingInRepeatMode) {
      setIsPlayingInRepeatMode(false);
      await TrackPlayer.setRepeatMode(RepeatMode.Off);
      clearTimeout(repeatModeInterval);
    } else {
      setIsPlayingInRepeatMode(true);
      setRepeatModeInterval(setTimeout(async () => {
        setIsPlayingInRepeatMode(false);
        await TrackPlayer.setRepeatMode(RepeatMode.Off);
      }, 5000))
      await TrackPlayer.setRepeatMode(RepeatMode.Track);
    }
  };

  const handleClose = async () => {
    await TrackPlayer.stop();
    await TrackPlayer.destroy();
    clearTimeout(repeatModeInterval);
    setSelectedTrack(null);
  }

  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadprogress, setDownloadProgress] = useState(0);

  const insertRecord = (record) => new Promise((resolve) => {
    Database.insertRecord(record, res => {
      resolve(res)
    })
  })

  const downLoadFile = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
    } catch (err) {
      console.warn(err);
    }
    const readGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE); 
    const writeGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    if(!readGranted || !writeGranted) {
      console.log('Read and write permissions have not been granted');
      return;
    }

    setIsDownloading(true);
    RNFS.mkdir(dirAudio).then((res) => {
      console.log(" RNFS.mkdir Response \n", res);
      const fileName1 = track.url.split('/');
      const audioPath = dirAudio + '/' + fileName1.pop();
      RNFS.downloadFile({
        fromUrl: track.url,
        toFile: audioPath,
        progressDivider: 10,
        background: true, 
        discretionary: true, 
        cacheable: true, 
        begin: (res) => {
          console.log("Response begin ===\n\n");
          console.log(res);
        },
        progress: (res) => {
         //here you can calculate your progress for file download
          console.log("Response written ===\n\n");
          let progressPercent = (res.bytesWritten / res.contentLength)*100; // to calculate in percentage
          console.log("\n\nprogress===",progressPercent)
          setDownloadProgress(progressPercent/2)
          console.log(res);
        }
      }).promise.then(res => {
          console.log("res for saving file===", res);
          // return RNFS.readFile(downloadfilePath, "base64");



          RNFS.mkdir(dirPictures).then((res) => {
            console.log(" RNFS.mkdir Response \n", res);
      
            const fileName2 = track.img.split('/');
            const gifPath = dirPictures + '/' + fileName2.pop();
            RNFS.downloadFile({
              fromUrl: track.img,
              toFile: gifPath,
              progressDivider: 10,
              background: true, 
              discretionary: true, 
              cacheable: true, 
              begin: (res) => {
                console.log("Response begin ===\n\n");
                console.log(res);
              },
              progress: (res) => {
               //here you can calculate your progress for file download
                console.log("Response written ===\n\n");
                let progressPercent = (res.bytesWritten / res.contentLength)*100; // to calculate in percentage
                console.log("\n\nprogress===",progressPercent)
                // this.setState({ progress: progressPercent.toString() });
                setDownloadProgress((progressPercent/2) + 50)
              }
            }).promise.then(async res => {
                console.log("res for saving file===", res);
                // return RNFS.readFile(downloadfilePath, "base64");
                const record = {id: track.id, title: track.title, url: 'file://' + audioPath,img: 'file://' + gifPath, favorite: track.isFavorite};
                const rowsRes = await insertRecord(record);

                console.log("inserted", rowsRes, record)
                alert("Download completed")

                setIsDownloading(false)
            }).catch(err => {
              console.log(err)
              setIsDownloading(false)
            })
          }).catch(err => {
            console.log(err)
            setIsDownloading(false)
          })
      }).catch(err => {
        console.log(err)
        setIsDownloading(false)
      })
    }).catch(err => {
      console.log(err)
      setIsDownloading(false)
    })
  }

  return (
    <SafeAreaView style={styles.contanier}>
      <ImageBackground
        source={{uri: track.img}}
        style={styles.background}>
        <View style={styles.mainbar}>
          <TouchableOpacity onPress={handleClose} style={styles.closeIcon}>
            <Entypo 
              name="cross" 
              color="#e6e6e6" 
              size={40} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.downLoadIcon} onPress={!isDownloading ? downLoadFile: null}>
          {!isDownloading ?(<MaterialIcons
              name="file-download"
              size={40}
              color="#e6e6e6"
            />): <Text styles={{fontSize: 10}}>{Math.round(downloadprogress)}%</Text>}
          </TouchableOpacity>
        </View>
        <View style={styles.trackActions}>
        <View style={styles.name_of_song_View}>
          <Text style={styles.name_of_song_Text1}>{track.title}</Text>
          <Text style={styles.name_of_song_Text2}>7 Oct 2021 11:39 PM</Text>
        </View>
        <View style={styles.slider_view}>
          <Slider
            style={styles.slider_style}
            minimumTrackTintColor="#33cccc"
            maximumTrackTintColor="#e6e6e6"
            onSlidingStart={slidingStarted}
            thumbTintColor="#33cccc"
            onSlidingComplete={slidingCompleted}
            value={sliderValue}
          />
          <View style={styles.slider_time_view}>
            <Text style={styles.slider_time}> {AppPlayer.secondsToHHMMSS(Math.floor(position || 0))}  </Text>
            <Text style={styles.slider_time}> {AppPlayer.secondsToHHMMSS(track.duration || 0)}</Text>
          </View>
        </View>

        <View style={styles.functions_view}>
          <TouchableOpacity style={{flex: 1}} onPress={isTrackPlayerInit? setRepeatMode :null}>
            <Feather
              name="repeat"
              size={24}
              color= {isPlayingInRepeatMode ? "#FF0000":"#e6e6e6"}/>
          </TouchableOpacity>
          <TouchableOpacity style={{flex: 1, marginLeft: 10}} onPress={isTrackPlayerInit? jumpBackward :null}>
            <AntDesign
              name="stepbackward"
              size={24}
              color="#e6e6e6"
              />
          </TouchableOpacity>
          <TouchableOpacity
            style={{flex: 1, flex: 1, marginRight: 50, backgroundColor: '#33cccc', borderRadius: 100, height: 70, width: 80, alignItems: 'center', justifyContent: 'center'}}
            onPress={isTrackPlayerInit? handlePlayAndPause :null}>
              {
                isPlaying ? (
                  <Entypo
                  name="controller-paus"
                  size={40}
                  color="#e6e6e6"
                  />
                ) : (
                  <Entypo
                  name="controller-play"
                  size={45}
                  color="#e6e6e6"
                  />
                )
              }
          </TouchableOpacity>
          <TouchableOpacity style={{flex: 1, marginRight: 10}} onPress={isTrackPlayerInit? jumpForward :null}>
            <AntDesign
              name="stepforward"
              size={24}
              color="#e6e6e6"
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
                color="#e6e6e6"
                />
              )
            }
          </TouchableOpacity>
        </View>
        </View>
      </ImageBackground>
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
    height: '10%',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeIcon: {
    marginLeft: '3%',
  },
  downLoadIcon: {
    marginRight: '3%',
  },
  music_logo_view: {
    height: '30%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image_view: {
    height: '100%',
    width: '50%',
    borderRadius: 10,
  },
  trackActions: {
    backgroundColor:  'rgba(128,128,128,0.5)',
    marginTop: '60%',
    height: '100%',
    borderTopEndRadius: 10,
    borderTopStartRadius: 10
  },  
  name_of_song_View: {
    height: '15%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name_of_song_Text1: {
    color: '#e6e6e6',
    fontSize: 30,
    fontWeight: '500',
  },
  name_of_song_Text2: {
    color: '#e6e6e6',
    fontSize: 15,
    marginTop: '4%',
  },
  slider_view: {
    height: '10%',
    width: '100%',
    alignItems: 'center',
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
    color: '#e6e6e6',
  },
  slider_style: {
    height: '70%',
    width: '90%',
    transform: [{scaleX: 1}, {scaleY: 1}],
  },
  functions_view: {
    flexDirection: 'row',
    height: '20%',
    width: '100%',
    alignItems: 'center',
    margin: '5%',
    // backgroundColor: 'red'
  },
  recently_played_view: {
    height: '25%',
    width: '100%',
  },
  recently_played_text: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#808080',
    marginLeft: '5%',
    marginTop: '6%',
  },
  recently_played_list: {
    backgroundColor: '#FFE3E3',
    height: '50%',
    width: '90%',
    borderRadius: 10,
    marginLeft: '5%',
    marginTop: '5%',
    alignItems: 'center',
    flexDirection: 'row'
  },
  recently_played_image: {
    height: '80%',
    width: '20%',
    borderRadius: 10,
  },
  recently_played_list_text: {
    height: '100%',
    width: '60%',
    justifyContent: 'center',
  },
  recently_played_list_text1: {
    fontSize: 15,
    marginLeft: '8%',
  },
  recently_played_list_text2: {
    fontSize: 16,
    color: '#808080',
    marginLeft: '8%',
  },
});

export default TrackPlayerView;
