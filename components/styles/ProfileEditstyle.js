import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  
  button: {
    backgroundColor: "white",
    padding: 10,
    borderWidth: 1,
    borderColor: "orange",
    borderRadius: 5,
  },
  selected: {
    backgroundColor: "orange",
  },
  buttonText: {
    color: "black",
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff7f0', // 따뜻한 배경색
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 100, 
    alignSelf: "center", 
    overflow: "hidden", 
    marginBottom: 20,
  },
  
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateInput: {
    width: "32%",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "white",
    textAlign: "center", // 텍스트 가운데 정렬
  },
  imagePicker: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E7EB", // 이미지 선택기 배경색
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    alignSelf: "center",
  },

  imagePickerText: {
    color: "black", // 글씨 색상
    fontWeight: "bold", // 글씨 굵게
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    
  },
  action: {
    flexDirection: "row",
      alignItems: "center",
      backgroundColor: "white",
      borderBottomWidth: 1,
      borderBottomColor: "#cccccc",
      padding: 15,
      marginHorizontal: 20,
      borderRadius: 10,
      marginTop: 10
  },
  multilineInput: {
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "white",
    textAlignVertical: "top", // 안드로이드에서 멀티라인 정렬
    marginBottom: 12,
    paddingTop: 5,
    height: 80, // 높이를 주어 멀티라인 입력 가능하게 함
  },
  saveButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
},
saveButtonText: {
    color: "white",
    fontSize: 16,
},
input: {
  borderWidth: 1,
  borderColor: '#f9d5a7',
  borderRadius: 10,
  padding: 10,
  backgroundColor: '#fffcf7',
  width: 280, // 칸의 너비를 200픽셀로 고정
},


inputTouchable: {
  borderWidth: 1,
  borderColor: '#f9d5a7',
  borderRadius: 10,
  padding: 10,
  backgroundColor: '#fffcf7',
  width: 280,
},
inputText: {
  color: 'black', // 여기서 색상은 원하는 대로 조정할 수 있습니다.
},


});
  // 추가적인 스타일 ...


export default styles

