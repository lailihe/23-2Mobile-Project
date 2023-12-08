// 파이어베이스 연결 코드
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore 가져오기

// Firebase 웹 앱 구성 설정
const firebaseConfig = {
    apiKey: "AIzaSyAuZCe3JQpP8TxHkLdmMxXyGNMOqduo_eU",
    authDomain: "ckdgmlek-6fbc9.firebaseapp.com",
    projectId: "ckdgmlek-6fbc9",
    storageBucket: "ckdgmlek-6fbc9.appspot.com",
    messagingSenderId: "382977187563",
    appId: "1:382977187563:web:c453ceedf8cb76732de8ae",
    measurementId: "G-BX2VZ04KL3"
  };

// 파이어베이스 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Firestore 인스턴스 생성
// Firebase Cloud Messaging 초기화 및 서비스 관련 참조
//const messaging = getMessaging(app);
console.log("파이어베이스 연동");

export default db;