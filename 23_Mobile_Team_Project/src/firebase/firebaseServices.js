//Firebase Firestore 데이터베이스와의 상호작용을 담당
//사용자 위치 정보 저장, 만남 요청 전송 및 수신 로직 포함
import db from './firebaseConfig';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";

// Firestore 컬렉션 참조
const meetingRequestsRef = collection(db, "meetingRequests");

// 사용자 위치 저장
export const saveUserLocation = async (userId, latitude, longitude) => {
    // Firestore에 사용자 위치 저장하는 로직 구현
};

// 만남 요청 전송
export const sendMeetingRequest = async (fromUserId, toUserId) => {
    const request = {
        fromUserId: fromUserId,
        toUserId: toUserId,
        status: 'pending',
        timestamp: new Date(),
    };

    await addDoc(meetingRequestsRef, request);
};

// 만남 요청 수신 리스너
// 만약 여러 만남 요청이 짧은 시간 안에 이루어졌다면, 각 요청에 대해 고유한 requestId가 생성됨
// 콜백 함수가 이를 수신하여 콘솔에 로그 남겨서 콘솔에 여러 개의 다른 requestId가 출력될 수 있음
export const listenForMeetingRequests = (userId, callback) => {
    const q = query(meetingRequestsRef, where('toUserId', '==', userId));
    return onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                // 여기서 doc.data()는 문서의 데이터를, doc.id는 문서의 ID를 가져옵니다.
                const request = { id: change.doc.id, ...change.doc.data() };
                callback(request);
            }
        });
    });
};

// 만남 요청 응답 처리
export const handleMeetingRequestResponse = async (requestId, response) => {
    if (!requestId || !response) {
        console.error("Invalid arguments passed to handleMeetingRequestResponse");
        return;
    }

    try {
        const requestRef = doc(db, "meetingRequests", requestId);
        await updateDoc(requestRef, { status: response });
    } catch (error) {
        console.error("Error handling meeting request response: ", error);
    }
};

// 만남 요청 수신 리스너 설정
export const listenForMeetingResponses = (userId, onResponse) => {
    const q = query(meetingRequestsRef, where('fromUserId', '==', userId), where('status', 'in', ['accepted', 'rejected']));
    return onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'modified') {
                const request = { id: change.doc.id, ...change.doc.data() };
                onResponse(request);
            }
        });
    });
};

// // 만남 요청의 상태 변경을 리스닝하는 함수
// export const listenToMeetingRequestStatus = (requestId, onStatusChange) => {
//     const requestRef = doc(db, "meetingRequests", requestId);

//     return onSnapshot(requestRef, (doc) => {
//         if (doc.exists()) {
//             const requestData = doc.data();
//             onStatusChange(requestData.status);
//         }
//     });
// };

// Firestore에서 특정 사용자가 보낸 만남 요청의 상태 변경을 감시
export const listenToMeetingRequestStatus = (userId, callback) => {
    const q = query(
        collection(db, "meetingRequests"),
        where("fromUserId", "==", userId),
        where("status", "in", ["accepted", "rejected"])
    );

    return onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added" || change.type === "modified") {
                const request = change.doc.data();
                callback(request.status, request.toUserId);
            }
        });
    });
};

