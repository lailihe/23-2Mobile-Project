import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20, // 모든 측면에 10의 패딩을 추가
    },
    recordingItem: {
        backgroundColor: '#fff', // 밝은 배경색
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        borderRadius: 10, // 둥근 모서리
        marginVertical: 5,
        marginHorizontal: 10,
        shadowColor: "#000", // 그림자 효과
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    text: {
        color: '#000', // 진한 텍스트 색상
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경
    },
    modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    alignItems: 'center',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    },
    audioTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
      },
      audioDate: {
        fontSize: 16,
        color: 'gray',
        marginBottom: 20,
      },
      progressBar: {
        height: 5,
        borderRadius: 5,
        backgroundColor: '#E0E0E0', // 회색 계열 배경
        marginVertical: 20,
      },      
      controlContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
      },
      controlButton: {
        padding: 10,
        borderRadius: 25, // 버튼의 모서리를 더 둥글게
        backgroundColor: '#FFFFFF', // 흰색 배경
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
      controlIcon: {
        color: '#007AFF', // iOS 기본 블루 색상
        fontSize: 30,
      },
      centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
      },
      modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
      modalText: {
        marginBottom: 15,
        textAlign: 'center',
      },
      modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
});

export default styles;

