import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  action: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    paddingBottom: 5,
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
    padding: 20,
    backgroundColor: "#F9FAFB", // 부드러운 배경색
    flex: 1,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 100, // 원형 이미지
    alignSelf: "center", // 가운데 정렬
    overflow: "hidden", // 이미지가 테두리를 넘지 않도록 처리
    marginBottom: 20,
  },
  input: {
    borderColor: "#D1D5DB", // 부드러운 테두리 색상
    borderWidth: 1,
    borderRadius: 8, // 입력 필드 모서리 둥글게
    marginBottom: 12,
    padding: 10,
    backgroundColor: "white", // 입력 필드 배경색
    fontSize: 16, // 텍스트 크기
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
    color: "#9CA3AF", // 글씨 색상
    fontWeight: "bold", // 글씨 굵게
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
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
    paddingTop: 0,
    height: 100, // 높이를 주어 멀티라인 입력 가능하게 함
  },
  // 추가적인 스타일 ...
});

export default styles