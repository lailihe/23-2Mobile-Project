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

// 주어진 'userID'를 사용하여 Firestore 데이터베이스에서 해당 사용자의 이름을 조회하는 역할
// 유저1이 마커 클릭->대화상자 'OK'버튼 클릭하여 해당 마커 유저2에게 만남 요청을 한 상태에서
// 이 함수를 사용하여 요청을 받은 유저2 화면에 요청수락거절 대화상자 띄우기
const getUsernameById = async (userId) => {
    // 이 함수는 사용자 ID를 받아 사용자의 이름을 문자열로 반환
    // 반환 값이 객체일 경우, JavaScript는 객체를 문자열로 변환하여 'object Object'로 표시
    try {
        const userDoc = await getDoc(doc(db, "users", userId)); // 'users'는 사용자 이름이 저장된 컬렉션 이름
        if (userDoc.exists()) {
            const userData = userDoc.data();
            return userData.name; // 'name'은 사용자 이름이 저장된 필드 이름
        } else {
            console.log("No such user found!");
            return null;
        }
    } catch (error) {
        console.error("Error getting user's name: ", error);
        return null;
    }
};

export { getAllUserLocations, getUsernameById };