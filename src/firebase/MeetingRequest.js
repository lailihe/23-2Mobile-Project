// 만남 요청 관련 코드
// 만남 요청 전송 및 수신, 만남 요청 응답 처리, 만남 상태 감지 등
import db from './firebaseConfig';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, setDoc, getDocs} from "firebase/firestore";

// Firestore 컬렉션 참조
const meetingRequestsRef = collection(db, "meetingRequests");

// 만남 요청 전송
export const sendMeetingRequest = async (fromUserId, toUserId) => {
    // 여기서 fromUserId와 toUserId는 고유 식별자(uniqueId)를 사용해야 합니다.
    const request = {
        fromUserId: fromUserId, // 사용자의 고유 식별자
        toUserId: toUserId, // 대상 사용자의 고유 식별자
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
//---------------------------------------
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

//------------------------------------------------------

// Firestore에서 만남 상태 관리를 위한 컬렉션
const meetingStatusRef = collection(db, "meetingStatus");

// // 만남 상태 업데이트 함수
// export const updateMeetingStatus = async (meetingId, isActive) => {
//     if (!meetingId) {
//         console.error("Invalid meetingId provided");
//         return;
//     }

//     try {
//         const meetingDocRef = doc(meetingStatusRef, meetingId);
//         await updateDoc(meetingDocRef, { isActive });
//         console.log("Meeting status updated");
//     } catch (error) {
//         console.error("Error updating meeting status: ", error);
//     }
// };

// 만남 상태 변경 감지 함수
export const listenForMeetingStatusChange = (meetingId, callback) => {
    const meetingDocRef = doc(meetingStatusRef, meetingId);
    return onSnapshot(meetingDocRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            callback(data.isActive);
        }
    });
};

// 만남 상태 문서 생성 함수
export const createMeetingStatusDocument = async (isActive) => {
    try {
        // 문서를 생성하고 생성된 문서의 ID를 반환합니다.
        const docRef = await addDoc(meetingStatusRef, { isActive });
        console.log("Meeting status document created with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error creating meeting status document:", error);
        throw error;
    }
};