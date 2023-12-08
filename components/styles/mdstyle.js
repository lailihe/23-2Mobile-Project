import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff7f0', // 따뜻한 배경색
  },
  contentContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100, // 원형 이미지
    borderWidth: 3,
    borderColor: '#f9d5a7', // 이미지 테두리 색상
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#333333', // 따뜻한 텍스트 색상
    textAlign: 'center',
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: 'grey',
    textAlign: 'center',
    marginVertical: 20,
  },
  deleteButton: {
    backgroundColor: '#f9a1bc', // 버튼 배경색
    padding: 10,
    borderRadius: 20,
    marginVertical: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  infoSection: {
    flexDirection: 'row', // 아이콘과 텍스트를 가로로 배열
    alignItems: 'center', // 세로축 중앙 정렬
    backgroundColor: '#f9f9f9', // 섹션의 배경색
    padding: 10, // 섹션 내부 여백
    marginVertical: 5, // 섹션 간 수직 여백
    borderRadius: 10, // 섹션의 모서리 둥글게
    shadowColor: '#000', // 그림자 색
    shadowOffset: { width: 0, height: 2 }, // 그림자 위치
    shadowOpacity: 0.2, // 그림자 투명도
    shadowRadius: 2, // 그림자 블러 반경
    elevation: 2, // 안드로이드에서의 그림자 효과
  },
  infoText: {
    flex: 1, // 부모 컨테이너의 남은 공간을 모두 사용
    marginLeft: 10, // 아이콘과 텍스트 사이의 여백
  },
  infoTitle: {
    fontSize: 16, // 제목 폰트 크기
    fontWeight: 'bold', // 제목 폰트 굵기
    color: '#333', // 제목 폰트 색상
  },
  infoContent: {
    fontSize: 14, // 내용 폰트 크기
    color: '#666', // 내용 폰트 색상
    marginTop: 3, // 제목과 내용 사이의 여백
  },
  customText: {
    fontSize: 20, // Sets the font size
    color: '#333', // Sets the text color
    textAlign: 'center', // Centers the text
    marginVertical: 10, // Adds vertical margin
    fontWeight: 'bold', // Makes the font bold
},
});

export default styles