/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  PermissionsAndroid,
} from 'react-native';

import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons';
import AntDesign from 'react-native-vector-icons/dist/AntDesign';
import AppPlayer from './utils/AppPlayer'
import Database from './utils/database'
import TrackPlayer from './TrackPlayer';
import RNFS from 'react-native-fs';
import {dirAudio, dirPictures} from './utils/dirStorage'

const CategoryListItem = ({ item, selectedCategory, setSelectedCategory }) => {
  return (
    <TouchableOpacity onPress={() => setSelectedCategory(item.key)} style={item.key === selectedCategory? {...styles.item, ...{backgroundColor: '#33cccc'}}: styles.item}>
      <Text style={styles.itemText}>{item.text}</Text>
    </TouchableOpacity>
  );
};

const ListItem = ({ track, setSelectedTrack }) => {

  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadprogress, setDownloadProgress] = useState(0);
  const [item, setItem] = useState(track);
  const insertRecord = (record) => new Promise((resolve) => {
    Database.insertRecord(record, res => {
      resolve(res)
    })
  })



  const getRecord = (id) => new Promise((resolve) => {
    Database.getTrack(id, res => {
      resolve(res)
    })  
  })

  useEffect(() => {
    async function fetchData() {
      const dbTrack = await getRecord(item.id);
      console.log("tracktracktracktracktracktracktracktracktrack:",dbTrack)
      setItem({...item, ...dbTrack, fromDb: dbTrack && dbTrack.data && dbTrack.data.length})
    }
    fetchData();
    
  }, [isDownloading])
  
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
      const fileName1 = item.url.split('/');
      const audioPath = dirAudio + '/' + fileName1.pop();
      RNFS.downloadFile({
        fromUrl: item.url,
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
      
            const fileName2 = item.img.split('/');
            const gifPath = dirPictures + '/' + fileName2.pop();
            RNFS.downloadFile({
              fromUrl: item.img,
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
                const record = {id: item.id, title: item.title, url: 'file://' +  audioPath,img: 'file://' + gifPath, favorite: item.isFavorite};
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
        <TouchableOpacity style={styles.itemImage} onPress={() => setSelectedTrack(item)}>
            <ImageBackground style={{height: '100%', width: '100%'}} imageStyle={styles.itemImageBackground} source={{uri: item.img}}>
                <View style={styles.itemHeader}>
                    <View style={styles.itemHeaderDuration}>
                        <Text style={styles.itemHeaderDurationText}>
                            {AppPlayer.secondsToHHMMSS(Math.floor(item.duration || 0))} MIN
                        </Text>
                    </View>
                    <View style={styles.itemHeaderActions}>
                    {
                    item.isFavorite ? (
                        <AntDesign
                        name="heart"
                        size={24}
                        color="#FF0000"
                        style={styles.closeIcon}
                        />
                    ): (
                        <AntDesign
                        name="hearto"
                        size={24}
                        color="#e6e6e6"
                        style={styles.closeIcon}
                        />
                    )
                    }
                    {!item.fromDb ? <TouchableOpacity style={styles.downLoadIcon} onPress={!isDownloading ? downLoadFile: null}>
                      {
                        !isDownloading?(
                          <MaterialIcons
                          name="file-download"
                          size={24}
                          
                          color="#e6e6e6"
                      />
                        ): <Text styles={{fontSize: 10}}>{Math.round(downloadprogress)}%</Text>
                      }

                    </TouchableOpacity>: false}
                    </View>
                </View>
                <View style={styles.itemTitleContainer}>
                    <Text style={styles.itemTitle}>
                            {item.title}
                    </Text>
                </View>
            </ImageBackground>
         </TouchableOpacity>
    );
  };

export default () => {
    const [selectedCategory, setSelectedCategory] = useState('1');
    const [selectedTrack, setSelectedTrack] = useState(null);

    const selectedCategoryData = SECTIONS[0].data.filter(cat => cat.key === selectedCategory);

  useEffect( () => {
    new Promise((resolve) => {
      Database.initDB(res => {
        resolve(res)
      })
    }).then(res => {
      console.log(res)
    })
  }, [])
  return (
      
    <><View style={styles.container}>
      <SafeAreaView style={{ flex: 1, marginLeft: '3%',}}>
            <View style={styles.mainbar}>
                <AntDesign 
                    name="arrowleft" 
                    color="#e6e6e6" 
                    size={35} 
                    style={styles.closeIcon}
                />
                <Text style={styles.menubarTitle}>{SECTIONS[0].title}</Text>
            </View>
            <View>
                <FlatList
                horizontal
                data={SECTIONS[0].data}
                renderItem={({ item }) => <CategoryListItem item={item} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}/>}
                showsHorizontalScrollIndicator={false}
                />
            </View>
            <View style={{ height: '60%', padding: 10, paddingRight: 0, paddingLeft: 0 }}>
                <FlatList
                horizontal
                data={selectedCategoryData[0].tracks}
                renderItem={({ item }) => <ListItem setSelectedTrack={setSelectedTrack} track={item} />}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{marginTop: 0}}
                />
            </View>
      </SafeAreaView>
    </View>
        {selectedTrack ? <TrackPlayer selectedTrack={selectedTrack} setSelectedTrack={setSelectedTrack}/>: false}</>
    
  );
};

const SECTIONS = [
  {
    title: 'Meditation',
    data: [
      {
        key: '1',
        text: 'All',
        uri: 'https://picsum.photos/id/1/200',
        tracks: [
            {
                id: '1',
                url: 'https://www.yogapoint.com/mantras/bhajans/bhajan1.mp3',
                title: 'The Waterfall',
                album: 'My Album',
                artist: 'Rohan Bhatia',
                artwork: 'https://picsum.photos/100',
                duration: 142,
                isFavorite: true,
                img: "http://booking.techcarrot.ae/wp-content/uploads/2021/09/Scenes.gif"
            },
            {
                id: '2',
                url: 'https://www.yogapoint.com/mantras/bhajans/bhajan1.mp3',
                title: 'The Waterfall',
                album: 'My Album',
                artist: 'Rohan Bhatia',
                artwork: 'https://picsum.photos/100',
                duration: 142,
                isFavorite: false,
                img: "http://booking.techcarrot.ae/wp-content/uploads/2021/09/Scenes.gif"

            }
        ]
      },
      {
        key: '2',
        text: 'Sleep',
        uri: 'https://picsum.photos/id/10/200',
      },

      {
        key: '3',
        text: 'Anxiety',
        uri: 'https://picsum.photos/id/1002/200',
      },
      {
        key: '4',
        text: 'Stress',
        uri: 'https://picsum.photos/id/1006/200',
      },
      {
        key: '5',
        text: 'Relief',
        uri: 'https://picsum.photos/id/1008/200',
      },
    ],
  }
];

const styles = StyleSheet.create({
    mainbar: {
        height: '10%',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
    },
      menubarTitle: {
        color: '#e6e6e6',
        fontWeight: 'bold',
        fontSize: 25,
        marginLeft: '25%'
      },
      closeIcon: {
        marginLeft: '3%',
      },
      downLoadIcon: {
        marginRight: '3%',
      },
  container: {
    flex: 1,
    backgroundColor: '#8080ff',
  },
  categoryListContainer: {
      flex: 1,
  },
  sectionHeader: {
    fontWeight: '800',
    fontSize: 188,
    color: '#f4f4f4',
    marginTop: 20,
    marginBottom: 5,
  },
  item: {
    margin: 10,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.26,
    elevation: 2,
    backgroundColor: '#1a1aff',
    borderRadius: 30,
    height: 50,
    minWidth: 100,
    padding: 12,
    alignItems:'center'
  },
  itemText: {
    color: '#e6e6e6',
    fontWeight: 'bold',
    fontSize: 15
  },
  itemImage: {
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.26,
    elevation: 2,
    borderRadius: 30,
    width: 350,
    marginLeft: 10
  },
  itemImageBackground: {
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.26,
    borderRadius: 25,
    width: 350, 
    overlayColor: '#8080ff',
    
  },
  itemHeader: {
    width: '100%',
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemHeaderDuration: { 
    color: 'white',
    padding: 6,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    height: 31,
    width: 75,
    margin: 10,
  },
  itemHeaderDurationText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13
  },
  itemHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 15
  },
  itemTitleContainer: {
      marginTop: '80%'
  },
  itemTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 20,
    fontSize: 25
  }
});