// Firebase Firestore 사용하여 만남 요청 및 상태 관리 기능 구현 코드
// 만남 요청 전송 및 수신, 만남 요청 응답 처리, 만남 상태 감지 등
import db from './firebaseConfig';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, setDoc, getDocs} from "firebase/firestore";

// Firestore의 'meetingRequests' 컬렉션에 대한 참조
const meetingRequestsRef = collection(db, "meetingRequests");

// 만남 요청을 Firestore에 전송
export const sendMeetingRequest = async (fromUserId, toUserId) => {
    // 여기서 fromUserId와 toUserId는 고유 식별자(uniqueId)를 사용
    const request = {
        fromUserId: fromUserId, // 요청을 보내는 사용자 ID
        toUserId: toUserId, // 요청을 받는 사용자 ID
        status: 'pending', // 요청 초기 상태='pending'
        timestamp: new Date(), // 요청 시각
    };

    await addDoc(meetingRequestsRef, request); // firestore에 문서 추가
};

// 만남 요청 감지(수정-처리된 요청 건은 다시 처리하지 않도록)
// 특정 사용자에게 온 만남 요청 감지하는 함수
export const listenForMeetingRequests = (userId, callback) => {
    // pending인 요청만 처리하도록 필터링
    const q = query(meetingRequestsRef, where('toUserId', '==', userId), where('status', '==', 'pending'));//pending 상태인 요청만 고려
    return onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                // 여기서 doc.data()는 문서의 데이터를, doc.id는 문서의 ID를 가져옴
                const request = { id: change.doc.id, ...change.doc.data() };
                callback(request); // 콜백 함수 호출로 변경 사항 처리
            }
        });
    });
};


// 만남 요청에 대한 응답 처리
export const handleMeetingRequestResponse = async (requestId, response) => {
    if (!requestId || !response) {
        console.error("Invalid arguments passed to handleMeetingRequestResponse");
        return;
    }

    try {
        const requestRef = doc(db, "meetingRequests", requestId);
        await updateDoc(requestRef, { status: response }); // 요청 상태 업데이트
        // 요청을 'processed' 상태로 업데이트-이미 처리된 만남 요청은 무시하는 조건
        await updateDoc(requestRef, { status: 'processed' });
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

// 특정 사용자가 보낸 만남 요청의 상태 변경을 감시
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

// Firestore에서 walkActive 상태 업데이트
export const updateWalkActiveStatus = async (userId, otherUserId, isActive) => {
    // 현재 사용자와 상대방 사용자의 문서 업데이트
    const q = query(meetingRequestsRef, where('fromUserId', 'in', [userId, otherUserId]));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
        updateDoc(doc.ref, { walkActive: isActive });
    });
};

// Firestore에서 walkActive 상태 변경 감지
export const listenToWalkActive = (userId, connectedUserId, callback) => {
    // 현재 사용자와 연결된 사용자의 모든 문서 감지
    const q = query(meetingRequestsRef, where('fromUserId', 'in', [userId, connectedUserId]));
    return onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'modified') {
                const data = change.doc.data();
                // 두 사용자 중 하나의 상태가 변경되었는지 확인
                if ((data.fromUserId === userId || data.fromUserId === connectedUserId) && data.walkActive !== undefined) {
                    callback(data.walkActive);
                }
            }
        });
    });
};