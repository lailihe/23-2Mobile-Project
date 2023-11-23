import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import MeetingWalk from './src/screens/MeetingWalk';
import db from './src/firebase/firebaseConfig'
//import { db, auth, storage } from './src/firebase/firebaseConfig'

const App = () => {
  return (
    <View style={styles.container}>
      <MeetingWalk />
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;