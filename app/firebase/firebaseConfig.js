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
    apiKey: "AIzaSyAuZCe3JQpP8TxHkLdmMxXyGNMOqduo_eU",
    authDomain: "ckdgmlek-6fbc9.firebaseapp.com",
    projectId: "ckdgmlek-6fbc9",
    storageBucket: "ckdgmlek-6fbc9.appspot.com",
    messagingSenderId: "382977187563",
    appId: "1:382977187563:web:c453ceedf8cb76732de8ae",
    measurementId: "G-BX2VZ04KL3"
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
