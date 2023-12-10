// Firestore 데이터베이스에서 실시간으로 사용자 위치 데이터를 가져오고
// 특정 사용자의 프로필 이름, 프로필 전체 정보 조회 기능
import { getFirestore, collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import db from './firebaseConfig';

// 모든 사용자 위치 데이터 실시간으로 가져오는 함수
const getAllUserLocations = (updateLocations) => {
    // firestore의 'usersLocation' 컬렉션 대한 실시간 리스너 설정
    const unsub = onSnapshot(collection(db, "usersLocation"), (snapshot) => {
        const locations = []; // 위치 데이터 저장용
        snapshot.forEach((doc) => {
            const data = doc.data(); // 각 문서 데이터 가져오기
            locations.push({
                latitude: data.latitude,
                longitude: data.longitude,
                userId: doc.id
            });
        });
        updateLocations(locations); // 위치 데이터 업데이트 콜백 함수 호출
    });

    return unsub; // 나중에 리스너 해제할 수 있도록 함수 반환
};

// 특정 사용자 이름 조회 함수 (profiles 테이블에서)
const getProfileNameById = async (userId) => {
    try {
        const profileDoc = await getDoc(doc(db, "profiles", userId)); // 특정 사용자 프로필 문서 가져오기
        if (profileDoc.exists()) {
            return profileDoc.data().name; // 'name' 필드 값 반환
        } else {
            console.log("프로필을 찾을 수 없습니다.");
            return null;
        }
    } catch (error) {
        console.error("프로필 이름 조회 중 오류 발생: ", error);
        return null;
    }
};

// 특정 사용자의 프로필 정보 조회
const getProfileInfoById = async (userId) => {
    try {
        const profileDoc = await getDoc(doc(db, "profiles", userId));
        if (profileDoc.exists()) {
            return profileDoc.data(); // 프로필 전체 데이터 반환
        } else {
            console.log("프로필을 찾을 수 없습니다.");
            return null;
        }
    } catch (error) {
        console.error("프로필 정보 조회 중 오류 발생: ", error);
        return null;
    }
};

export { getAllUserLocations, getProfileNameById, getProfileInfoById };