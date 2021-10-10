import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import appName from '../app.json'

export const dirHome = Platform.select({
    ios: `${RNFS.DocumentDirectoryPath}/${appName.name}`,
    android: `${RNFS.ExternalStorageDirectoryPath}`
});

export const dirPictures = `${dirHome}/${appName.name}/Pictures`;
export const dirAudio = `${dirHome}/${appName.name}/Audio`;