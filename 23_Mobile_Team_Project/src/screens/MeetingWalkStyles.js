// MeetingWalkStyles.js
import { StyleSheet, Dimensions } from 'react-native';

const screen = Dimensions.get('window');
const mapSize = screen.width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  titleContainer: {
    width: '90%',
    padding: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: screen.height / 50,
  },
  map: {
    width: mapSize,
    height: mapSize,
    marginBottom: 20,
  },
  meetButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 20,
  },
});

export default styles;
