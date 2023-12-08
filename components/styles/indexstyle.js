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
    bottom: 20, // 하단에서 20px 떨어짐
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0, // marginTop을 0으로 수정
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
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  
});


export default styles