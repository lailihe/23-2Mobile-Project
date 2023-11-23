import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore 가져오기

// Firebase 웹 앱 구성 설정
const firebaseConfig = {
    apiKey: "AIzaSyAPf3xEzoHNLuUkaUfZ8XXEqtWzcjzcEuY",
    authDomain: "petmeeting-ef249.firebaseapp.com",
    projectId: "petmeeting-ef249",
    storageBucket: "petmeeting-ef249.appspot.com",
    messagingSenderId: "928625243035",
    appId: "1:928625243035:web:6c03d9d1fdfad835b4673e",
    measurementId: "G-B11VK2KNZQ"
};

// 파이어베이스 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Firestore 인스턴스 생성
// Firebase Cloud Messaging 초기화 및 서비스 관련 참조
//const messaging = getMessaging(app);
console.log("파이어베이스 연동");

export default db;