import { StyleSheet, Dimensions } from 'react-native';

// 화면의 전체 가로 길이를 구합니다.
const screenWidth = Dimensions.get('window').width;
// 가로 길이를 현재보다 0.5배 더 길게 설정합니다.
const listItemWidth = screenWidth * 0.8;

const styles = StyleSheet.create({
  item: {
    width: listItemWidth, // 여기에 새로운 가로 길이를 설정합니다.
    backgroundColor: '#fff', // 밝은 배경색
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderRadius: 10, // 둥근 모서리
    marginVertical: 5,
    shadowColor: "#000", // 그림자 효과
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    color: '#000', // 진한 텍스트 색상
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    color: '#666', // 날짜 텍스트 색상
    fontSize: 12,
    marginTop: 4,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  deleteIcon: {
    marginRight: -10, // 오른쪽 여백 추가
    padding: 10
  },
});

export default styles;
