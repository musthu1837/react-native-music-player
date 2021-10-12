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
  Modal
} from 'react-native';

import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons';
import AntDesign from 'react-native-vector-icons/dist/AntDesign';
import AppPlayer from './utils/AppPlayer'
import Database from './utils/database'
import TrackPlayer from './components/TrackPlayer';
import RNFS from 'react-native-fs';
import {dirAudio, dirPictures} from './utils/dirStorage'

const CategoryListItem = ({ item, index, popStack, fetchNewCategory}) => {
  return (
    // <TouchableOpacity onPress={() => setSelectedCategory(item.key)} >
    <TouchableOpacity onPress={index === 0?popStack:() => fetchNewCategory(item)}  style={index === 0? {...styles.item, ...{backgroundColor: '#33cccc'}}: styles.item}>
      <Text style={styles.itemText}>{item.category_name}</Text>
    </TouchableOpacity>
  );
};

const ListItem = ({ track, setSelectedTrack , selectedTrack, treeId}) => {

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
      const dbTrack = await getRecord(treeId + item.scene_id);
      const track =  dbTrack && dbTrack.data && dbTrack.data.length ? dbTrack.data[0]: {};
      setItem({...item, ...track, fromDb: dbTrack && dbTrack.data && dbTrack.data.length})
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
      const fileName1 = treeId + item.scene_id + 0 + '.mp3';
      console.log("fileName1", fileName1)
      const audioPath = dirAudio + '/' + fileName1;
      RNFS.downloadFile({
        fromUrl: item.scene,
        toFile: audioPath,
        progressDivider: 10,
        background: true, 
        discretionary: true, 
        cacheable: true,
        progress: (res) => {
         //here you can calculate your progress for file download
          let progressPercent = (res.bytesWritten / res.contentLength)*100; // to calculate in percentage
          console.log("\n\nprogress===",progressPercent)
          setDownloadProgress(progressPercent/2)
          console.log(res);
        }
      }).promise.then(res => {
          console.log("res for saving file===", res);
          // return RNFS.readFile(downloadfilePath, "base64");



          RNFS.mkdir(dirPictures).then((res) => {      
            const fileName2 = treeId + item.scene_id + 1 + '.gif';
            const gifPath = dirPictures + '/' + fileName2;
            console.log("fileName2", fileName2)

            RNFS.downloadFile({
              fromUrl: item.bg_image,
              toFile: gifPath,
              progressDivider: 10,
              background: true, 
              discretionary: true, 
              cacheable: true,
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
                let record = {id: treeId + item.scene_id, title: item.title, url: 'file://' +  audioPath,img: 'file://' + gifPath, favorite: item.isFavorite};
                const rowsRes = await insertRecord(record);

                console.log("inserted", rowsRes, record)
                alert("Download completed")

                setIsDownloading(false)
            }).catch(err => {
              console.log(err)
              setIsDownloading(false)
              setDownloadProgress(0)
              alert("Download faild")
            })
          }).catch(err => {
            console.log(err)
            setIsDownloading(false)
            setDownloadProgress(0)
            alert("Download faild")
          })
      }).catch(err => {
        console.log(err)
        setIsDownloading(false)
        setDownloadProgress(0)
        alert("Download faild")
      })
    }).catch(err => {
      console.log(err)
      setIsDownloading(false)
      setDownloadProgress(0)
      alert("Download faild")
    })
  }

  
    return (
        <TouchableOpacity style={styles.itemImage} onPress={() => setSelectedTrack(item)}>
                      <Modal visible={selectedTrack && selectedTrack.id === item.id}>
                      <TrackPlayer 
                        selectedTrack={{...selectedTrack, fromDb: item.fromDb}} 
                        setSelectedTrack={setSelectedTrack}
                        setIsDownloading={setIsDownloading}
                        isDownloading={isDownloading}
                        downLoadFile={downLoadFile}
                        downloadprogress={downloadprogress}
                      />
            </Modal>
            <ImageBackground style={{height: '100%', width: '100%'}} imageStyle={styles.itemImageBackground} source={{uri: item.bg_image}}>
                <View style={styles.itemHeader}>
                    <View style={styles.itemHeaderDuration}>
                        <Text style={styles.itemHeaderDurationText}>
                            {AppPlayer.secondsToHHMMSS(Math.floor(item.scene_duration || 0))} MIN
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
    const [categoryStack, setCategoryStack] = useState([]);
    const [selectedTrack, setSelectedTrack] = useState(null);

  const fetchNewCategory = (item) => {
    const res = {
      "code": 200,
      "message": "successful",
      "total_records": 1,
      "total_pages": 1,
      "page": 1,
      "data": {
          "categories": [
              {
                  "category_id": "1",
                  "category_name": item.category_name + 1,
                  "parent_category_id": item.category_id,
              },
              {
                  "category_id": "2",
                  "category_name": item.category_name + 2,
                  "parent_category_id": item.category_id,
              }
          ],
          "records": [{
                "scene_id": item.category_name + 1,
                "title": "The Waterfall",
                "description": "Description for scene record male1",
                "bg_image": "http://booking.techcarrot.ae/wp-content/uploads/2021/09/Scenes.gif",
                "scene": "https://www.yogapoint.com/mantras/bhajans/bhajan1.mp3",
                "scene_download": "https://www.yogapoint.com/mantras/bhajans/bhajan1.mp3",
                "scene_duration": "149"
            },{
              "scene_id": item.category_name + 2,
              "title": "The Waterfall",
              "description": "Description for scene record male1",
              "bg_image": "http://booking.techcarrot.ae/wp-content/uploads/2021/09/Scenes.gif",
              "scene": "https://www.yogapoint.com/mantras/bhajans/bhajan1.mp3",
              "scene_download": "https://www.yogapoint.com/mantras/bhajans/bhajan1.mp3",
              "scene_duration": "149"
          }
          ]
      }
    }

    res.data.parent = {
      "category_id": item.category_id,
      "category_name": item.category_name,
    }

    const stackTop = getTopOfTheStack();
    
    res.data.treeId = stackTop.treeId + item.category_id;
    console.log("New track tree id::::::::", res.data.treeId)
    categoryStack.push(res.data);
    setCategoryStack([...categoryStack]);
  }

  const getTopOfTheStack = () => {
    const length = categoryStack.length;
    return length ? categoryStack[length - 1] :{}
  }

  const popStack = () => {
    categoryStack.pop();
    setCategoryStack([...categoryStack])
  }
  const stackTop = getTopOfTheStack();

  useEffect( () => {
    new Promise((resolve) => {
      Database.initDB(res => {
        resolve(res)
      })
    }).then(res1 => {
      const res = {
        "code": 200,
        "message": "successful",
        "total_records": 1,
        "total_pages": 1,
        "page": 1,
        "data": {
            "categories": [
                {
                    "category_id": "1",
                    "category_name": "Beach",
                    "parent_category_id": "0",
                },
                {
                    "category_id": "4",
                    "category_name": "Mountains",
                    "parent_category_id": "0",
                }
            ],
            "records": [
                {
                    "scene_id": "1",
                    "title": "scene record1",
                    "description": "Description for scene record male1",
                    "bg_image": "http://booking.techcarrot.ae/wp-content/uploads/2021/09/Meditation-Man.gif",
                    "scene": "http://booking.techcarrot.ae/wp-content/uploads/2021/10/test-audio.mp3",
                    "scene_download": "http://booking.techcarrot.ae/wp-content/uploads/2021/10/test-audio.mp3",
                    "scene_duration": "32"
                }
            ]
        }
      }

      res.data.parent = {
        "category_id": 0,
        "category_name": "All",
      }

      res.data.treeId = 0;
      categoryStack.push(res.data);
      setCategoryStack([...categoryStack]);
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
                <Text style={styles.menubarTitle}>Meditation</Text>
            </View>
            <View>
                <FlatList
                horizontal
                data={stackTop.parent && stackTop.categories ? [stackTop.parent, ...stackTop.categories]: []}
                renderItem={({ item, index }) => <CategoryListItem fetchNewCategory={fetchNewCategory} item={item} index={index} popStack={popStack}/>}
                showsHorizontalScrollIndicator={false}
                />
            </View>
            <View style={{ height: '60%', padding: 10, paddingRight: 0, paddingLeft: 0 }}>
                <FlatList
                horizontal
                data={stackTop.records ? [...stackTop.records]: []}
                renderItem={({  item, index }) => <ListItem selectedTrack={selectedTrack} setSelectedTrack={setSelectedTrack} track={item} treeId={stackTop.treeId}/>}
                showsHorizontalScrollIndicator={false}
                keyExtractor = {(item) => item.scene_id}
                contentContainerStyle={{marginTop: 0}}
                />
            </View>
      </SafeAreaView>
    </View>
        </>
    
  );
};

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