// 만남 요청 관련 코드
// 만남 요청 전송 및 수신, 만남 요청 응답 처리, 만남 상태 감지 등
import db from './firebaseConfig';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";

// Firestore 컬렉션 참조
const meetingRequestsRef = collection(db, "meetingRequests");

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

// 만남 요청 감지
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

// 특정 사용자에게 온 만남 요청 응답(수락/거절) 상태 변화 감지
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

