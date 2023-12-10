// 사용자 위치 정보 저장
import { doc, setDoc } from 'firebase/firestore';
import db from './firebaseConfig';

// 사용자 위치 정보 저장 함수
// uniqueId 파라미터 추가 (사용자 고유 식별자)-DB 'profiles'테이블과 연결 위해
const saveUserLocation = async (uniqueId, latitude, longitude) => {
    try {
        await setDoc(doc(db, "usersLocation", uniqueId), {
            latitude, //위도
            longitude, //경도
            timestamp: new Date().toISOString() // 업데이트 시간(현재시간)
        });
        console.log("사용자 위치 저장 완료"); // 성공 메시지 출력
        return uniqueId; // 사용자의 고유 식별자 반환
    } catch (error) {
        console.error("Error updating location: ", error);
        return null; // 오류 발생 시 null 반환
    }
};

export { saveUserLocation };
