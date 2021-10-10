import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  SafeAreaView,
  ImageBackground,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons';
import AntDesign from 'react-native-vector-icons/dist/AntDesign';
import AppPlayer from './utils/AppPlayer'
import TrackPlayer from './TrackPlayer';

const CategoryListItem = ({ item, selectedCategory, setSelectedCategory }) => {
  return (
    <TouchableOpacity onPress={() => setSelectedCategory(item.key)} style={item.key === selectedCategory? {...styles.item, ...{backgroundColor: '#33cccc'}}: styles.item}>
      <Text style={styles.itemText}>{item.text}</Text>
    </TouchableOpacity>
  );
};

const ListItem = ({ item, setSelectedTrack }) => {
    return (
        <TouchableOpacity style={styles.itemImage} onPress={() => setSelectedTrack(item)}>
            <ImageBackground style={{height: '100%', width: '100%'}} imageStyle={styles.itemImageBackground} source={require('./asserts/waterfall.gif')}>
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
                    <MaterialIcons
                        name="file-download"
                        size={24}
                        style={styles.downLoadIcon}
                        color="#e6e6e6"
                    />
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
  return (
      
    !selectedTrack ? <View style={styles.container}>
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
                renderItem={({ item }) => <ListItem setSelectedTrack={setSelectedTrack} item={item} />}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{marginTop: 0}}
                />
            </View>
      </SafeAreaView>
    </View>:(
        <TrackPlayer selectedTrack={selectedTrack} setSelectedTrack={setSelectedTrack}/>
    )
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
                url: 'https://www.chosic.com/wp-content/uploads/2021/07/The-Epic-Hero-Epic-Cinematic-Keys-of-Moon-Music.mp3',
                title: 'The Waterfall',
                album: 'My Album',
                artist: 'Rohan Bhatia',
                artwork: 'https://picsum.photos/100',
                duration: 148,
                isFavorite: true,
                img: './asserts/waterfall.gif'
            },
            {
                id: '2',
                url: 'https://www.chosic.com/wp-content/uploads/2021/07/The-Epic-Hero-Epic-Cinematic-Keys-of-Moon-Music.mp3',
                title: 'The Waterfall',
                album: 'My Album',
                artist: 'Rohan Bhatia',
                artwork: 'https://picsum.photos/100',
                duration: 148,
                isFavorite: false,
                img: './asserts/waterfall.gif'

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