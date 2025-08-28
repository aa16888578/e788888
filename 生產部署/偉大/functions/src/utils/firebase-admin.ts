import * as admin from 'firebase-admin';

// 在部署環境中，Firebase Admin 會自動使用默認憑證
// 只在本地開發時檢查環境變數
const isProduction = process.env.FUNCTIONS_EMULATOR !== 'true';

if (!isProduction) {
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
  ];

  // 驗證環境變數
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`Missing environment variable: ${envVar}`);
    }
  }
}

// 檢查是否已經初始化過，避免重複初始化
if (!admin.apps.length) {
  try {
    if (isProduction) {
      // 在生產環境中使用默認憑證
      admin.initializeApp();
    } else {
      // 在開發環境中使用環境變數
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || 'ccvbot-8578',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        }),
        // 可選：設定其他 Firebase 服務
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    }
    
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
