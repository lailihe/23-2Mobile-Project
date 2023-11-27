import { doc, setDoc } from 'firebase/firestore';
import db from './firebaseConfig';
import { v4 as uuidv4 } from 'uuid'; // UUID 생성을 위한 라이브러리

// 사용자 위치 정보 저장 함수
const saveUserLocation = async (latitude, longitude) => {
    const userId = uuidv4(); // 고유한 사용자 ID 생성

    try {
        await setDoc(doc(db, "usersLocation", userId), {
            latitude, //위도
            longitude, //경도
            timestamp: new Date().toISOString() // 업데이트 시간(현재시간)
        });
        console.log("사용자 위치 저장 완료"); // 성공 메시지 출력
        return userId; // 여기에서 userId 반환
    } catch (error) {
        console.error("Error updating location: ", error);
        return null; // 오류 발생 시 null 반환
    }
};

export { saveUserLocation };
