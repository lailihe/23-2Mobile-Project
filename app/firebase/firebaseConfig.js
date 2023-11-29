import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { 
  getAuth, 
  initializeAuth, 
  getReactNativePersistence 
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPf3xEzoHNLuUkaUfZ8XXEqtWzcjzcEuY",
  authDomain: "petmeeting-ef249.firebaseapp.com",
  projectId: "petmeeting-ef249",
  storageBucket: "petmeeting-ef249.appspot.com",
  messagingSenderId: "928625243035",
  appId: "1:928625243035:web:6c03d9d1fdfad835b4673e",
  measurementId: "G-B11VK2KNZQ"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firestore 및 Storage 초기화
const db = getFirestore(app);
const storage = getStorage(app);

// Auth 초기화 및 AsyncStorage를 사용한 영구적인 로그인 상태 유지
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});


export { db, auth, storage };
