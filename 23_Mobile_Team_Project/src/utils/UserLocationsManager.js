// Firestore 데이터베이스에서 실시간으로 사용자 위치 데이터를 가져오는 기능
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import db from '../firebase/firebaseConfig';

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

export { getAllUserLocations };
