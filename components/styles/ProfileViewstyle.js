import { StyleSheet } from 'react-native';

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff7f0', // 따뜻한 배경색
  },
  imageContainer: {
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 20,
  },
  profileImage: {
      width: 130,
      height: 130,
      borderRadius: 100, // 원형 이미지
      alignSelf: "center", // 가운데 정렬
      overflow: "hidden", // 이미지가 테두리를 넘지 않도록 처리
      marginBottom: 20,
  },
  noImageText: {
      fontSize: 16,
      color: "#666",
  },
  infoSection: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "white",
      borderBottomWidth: 1,
      borderBottomColor: "#cccccc",
      padding: 15,
      marginHorizontal: 20,
      borderRadius: 10,
      marginTop: 10,
  },
  infoText: {
      marginLeft: 10,
  },
  infoTitle: {
      fontSize: 16,
      fontWeight: "bold",
  },
  infoContent: {
      fontSize: 14,
      color: "#666",
  },
  deleteButton: {
      backgroundColor: '#f9a1bc',
      padding: 10,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
      margin: 20,
  },
  deleteButtonText: {
      color: "white",
      fontSize: 16,
  },
  // ... 나머지 스타일
});

export default styles