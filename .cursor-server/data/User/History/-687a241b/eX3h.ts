import * as admin from 'firebase-admin';

// 檢查必要的環境變數
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

// 驗證環境變數
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// 檢查是否已經初始化過，避免重複初始化
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
      // 可選：設定其他 Firebase 服務
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw error;
  }
}

// 導出 Firestore 和 FieldValue
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// 導出其他常用的 Firebase 服務
const auth = admin.auth();
const storage = admin.storage();
const messaging = admin.messaging();

export { 
  db, 
  FieldValue, 
  auth, 
  storage, 
  messaging,
  admin 
};

// 預設導出
export default admin;
