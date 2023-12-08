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
  apiKey: "AIzaSyBg_iDUJHUZOI2y6LdXXv_dlH6NSAaV0Hc",
  authDomain: "pet-meeting-61c0d.firebaseapp.com",
  projectId: "pet-meeting-61c0d",
  storageBucket: "pet-meeting-61c0d.appspot.com",
  messagingSenderId: "1077430799401",
  appId: "1:1077430799401:web:3c94b23abdafcb8b512038",
  measurementId: "G-0EXV3RNK4Y"
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
