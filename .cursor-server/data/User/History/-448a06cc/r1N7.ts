import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase 配置
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ccvbot-8578.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ccvbot-8578",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ccvbot-8578.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "177257832546",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:177257832546:web:demo",
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化服務
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'asia-east1');

// 開發環境連接模擬器
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  try {
    // 連接 Firestore 模擬器
    if (!db._delegate._terminated) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
  } catch (error) {
    console.log('Firestore 模擬器已連接或無法連接');
  }

  try {
    // 連接 Auth 模擬器
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch (error) {
    console.log('Auth 模擬器已連接或無法連接');
  }

  try {
    // 連接 Storage 模擬器
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    console.log('Storage 模擬器已連接或無法連接');
  }

  try {
    // 連接 Functions 模擬器
    connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch (error) {
    console.log('Functions 模擬器已連接或無法連接');
  }
}

export default app;
