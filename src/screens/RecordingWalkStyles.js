// 메인 컴포넌트(스크린) 스타일 정의 코드
import { StyleSheet, Dimensions } from 'react-native';

const screen = Dimensions.get('window');
const mapSize = screen.width;

const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'stretch',
      //backgroundColor: 'black', // iOS 스타일 배경색
      backgroundColor: '#f5f5f7', // iOS 스타일 배경색
  },
  title: {
      fontSize: 24,
      fontWeight: 'bold',
      margin: 20,
      color: '#000', // 진한 텍스트 색상
  },
  recordingText: {
      color: 'red',
      marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    margin: 20,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    shadowOpacity: 0.3,
  },
  recordingTimer: {
    fontSize: 24,
    color: 'red',
    alignSelf: 'center',
    margin: 10,
  },
});

export default styles;
