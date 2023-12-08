// Firestore 데이터베이스에서 실시간으로 사용자 위치 데이터를 가져오는 기능
import { getFirestore, collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import db from './firebaseConfig';

const getAllUserLocations = (updateLocations) => {
    const unsub = onSnapshot(collection(db, "usersLocation"), (snapshot) => {
        const locations = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            locations.push({
                latitude: data.latitude,
                longitude: data.longitude,
                userId: doc.id
            });
        });
        updateLocations(locations);
    });

    return unsub; // 리스너 해제를 위한 함수 반환
};

// 사용자 이름 조회 함수 (profiles 테이블에서)
const getProfileNameById = async (userId) => {
    try {
        const profileDoc = await getDoc(doc(db, "profiles", userId));
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

// 사용자의 프로필 정보 조회
const getProfileInfoById = async (userId) => {
    try {
        const profileDoc = await getDoc(doc(db, "profiles", userId));
        if (profileDoc.exists()) {
            return profileDoc.data(); // 프로필 데이터 반환
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