import React from 'react';
import { StyleSheet, View } from 'react-native';
import RecordingWalk from '../../src/screens/RecordingWalk'; // ProxyWalk 컴포넌트를 import합니다.

export default function TabThreeScreen() {
  return (
    <View style={styles.container}>
      <RecordingWalk />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
