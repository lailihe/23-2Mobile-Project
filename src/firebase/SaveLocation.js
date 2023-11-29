import { doc, setDoc } from 'firebase/firestore';
import db from './firebaseConfig';
import * as Crypto from 'expo-crypto'; // expo-crypto 모듈 사용
import { Buffer } from 'buffer';

// 사용자 위치 정보 저장 함수
const saveUserLocation = async (latitude, longitude) => {
    // expo-crypto를 사용하여 랜덤 바이트 생성
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    // Buffer를 사용하여 바이트 배열을 헥사 문자열로 변환
    const userId = Buffer.from(randomBytes).toString('hex'); 

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
