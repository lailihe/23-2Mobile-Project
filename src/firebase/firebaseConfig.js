// 파이어베이스 연결 코드
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore 가져오기

// Firebase 웹 앱 구성 설정
const firebaseConfig = {
  apiKey: "AIzaSyBg_iDUJHUZOI2y6LdXXv_dlH6NSAaV0Hc",
  authDomain: "pet-meeting-61c0d.firebaseapp.com",
  projectId: "pet-meeting-61c0d",
  storageBucket: "pet-meeting-61c0d.appspot.com",
  messagingSenderId: "1077430799401",
  appId: "1:1077430799401:web:3c94b23abdafcb8b512038",
  measurementId: "G-0EXV3RNK4Y"
};

// 파이어베이스 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Firestore 인스턴스 생성
// Firebase Cloud Messaging 초기화 및 서비스 관련 참조
//const messaging = getMessaging(app);
console.log("파이어베이스 연동");

export default db;