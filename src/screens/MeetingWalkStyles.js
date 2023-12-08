// 메인 컴포넌트(스크린) 스타일 정의 코드
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
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
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
});

export default styles;