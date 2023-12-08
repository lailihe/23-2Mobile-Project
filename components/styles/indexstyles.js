import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffaf0",
  },
  postActionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postContainer: {
    borderRadius: 15,
    backgroundColor: "#ffffff",
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginBottom: 8,
  },
  fab: {
    position: "absolute", // 절대 위치
    left: "50%", // 왼쪽에서 50% 위치
    bottom: 55, // 하단에서 20px 떨어짐
    backgroundColor: "#ff69b4",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    transform: [{ translateX: -28 }], // 버튼의 중심을 정확하게 가운데로 맞춤
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    borderColor: "#ff4500",
    padding: 10,
    width: "80%",
    backgroundColor: "#ffffff",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
    width: "80%",
  },
  buttonOpen: {
    backgroundColor: "#ff69b4",
  },
  buttonClose: {
    backgroundColor: "#ff4500",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  userProfileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  userProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // 원형 이미지
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  imagePreview: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 100, // 원형 이미지
    alignSelf: "center", // 가운데 정렬
    overflow: "hidden", // 이미지가 테두리를 넘지 않도록 처리
    marginBottom: 20,
},
inputText: {
  color: 'black', // 여기서 색상은 원하는 대로 조정할 수 있습니다.
},

centeredView: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)", // 반투명 배경
},
modalView: {
  margin: 20,
  backgroundColor: "white",
  borderRadius: 20,
  padding: 35,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2
  },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5
},
imageContainer: {
  marginBottom: 15,
},
profileImages: {
  width: 150,
  height: 150,
  borderRadius: 75, // 원형 이미지
},
noImageText: {
  color: "#888",
  fontSize: 18,
},
infoSection: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 10,
},
infoText: {
  marginLeft: 10,
},
infoTitle: {
  fontWeight: "bold",
  fontSize: 16,
},
infoContent: {
  fontSize: 15,
  color: "#555",
},
// '닫기' 버튼 스타일
closeButton: {
  backgroundColor: "#2196F3",
  borderRadius: 20,
  padding: 10,
  elevation: 2,
  marginTop: 15,
},
closeButtonText: {
  color: "white",
  fontWeight: "bold",
  textAlign: "center",
},
messageButton: {
  position: 'absolute', // 절대 위치
  right: 0, // 오른쪽에서 10픽셀 떨어진 위치
  top: 10,  // 위쪽에서 10픽셀 떨어진 위치
  padding: 8, // 버튼 주변의 여백
  // 추가적인 스타일링이 필요할 수 있음
},
postContainer: {
  flex: 1,
  flexDirection: 'column',
  margin: 10,
  width: '50%', // 화면 너비의 50%를 차지
},
postDeleteButton: {
  position: 'absolute',
  top: 10,
  right: 0,
  padding: 8,
  // 기존 스타일 속성들...
},
likeCount: {
  marginLeft: 8, // 좌측으로부터 5픽셀 간격
  // 기타 스타일 속성들...
},
crownIcon: {
  position: 'absolute', // 아이콘의 위치를 절대적으로 설정
  left: 11, // 오른쪽으로 10픽셀 이동
  top: -12, // 상단으로부터 10픽셀의 거리
},
recommendButton: {
  backgroundColor: '#4fc3f7', // 밝은 파란색 배경
  padding: 10, // 패딩
  borderRadius: 5, // 둥근 모서리
  alignItems: 'center', // 내용을 중앙에 정렬
  margin: 10, // 마진
  shadowColor: "#000", // 그림자 색상
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25, // 그림자 불투명도
  shadowRadius: 3.84, // 그림자 반경
  elevation: 5, // 안드로이드 전용 그림자 효과
},

recommendButtonText: {
  color: 'white', // 텍스트 색상
  fontWeight: 'bold', // 굵은 글씨
},
action: {
  flexDirection: 'row',
  marginTop: 10,
  marginBottom: 10,
  alignItems: 'center',
},
buttonGroup: {
  flexDirection: 'row',
  marginLeft: 10,
},
button: {
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 5,
  backgroundColor: '#f8f8f8',
  marginLeft: 5,
},
selected: {
  backgroundColor: '#4fc3f7',
},
buttonText: {
  color: '#333333',
  fontWeight: 'bold',
},
inputTouchable: {
  borderWidth: 1,
  borderColor: '#f9d5a7',
  borderRadius: 10,
  padding: 10,
  backgroundColor: '#fffcf7',
  width: 280,
},
walkApplicationButtons: {
  flexDirection: 'row', // 버튼들을 가로로 배열
  justifyContent: 'space-around', // 버튼 사이의 간격을 동일하게 조정
  marginTop: 10, // 버튼과 상단 텍스트 사이의 여백
  marginBottom: 10, // 버튼과 하단 컴포넌트 사이의 여백
},
textInput: {
  height: 40,
  borderColor: 'gray',
  borderWidth: 1,
  margin: 10,
  paddingHorizontal: 10,
},
neighborhoodText: {
  fontSize: 16,
  color: '#333',
  // 추가적인 스타일링
},
input: {
  height: 40,
  margin: 12,
  borderWidth: 1,
  padding: 10,
  // 추가적인 스타일링
},

});

export default styles