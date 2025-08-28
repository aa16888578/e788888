import admin from 'firebase-admin';
import config from '../config';
import logger from '../config/logger';

// 初始化 Firebase Admin SDK
const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.firebase.projectId,
          privateKey: config.firebase.privateKey.replace(/\\n/g, '\n'),
          clientEmail: config.firebase.clientEmail,
        }),
        databaseURL: `https://${config.firebase.projectId}-default-rtdb.firebaseio.com`,
      });
      
      logger.info('Firebase Admin SDK 初始化成功');
    }
    
    return admin;
  } catch (error) {
    logger.error('Firebase Admin SDK 初始化失敗:', error);
    throw error;
  }
};

// 獲取 Firestore 實例
export const getFirestore = () => {
  const app = initializeFirebase();
  return app.firestore();
};

// 獲取 Realtime Database 實例
export const getDatabase = () => {
  const app = initializeFirebase();
  return app.database();
};

// 獲取 Auth 實例
export const getAuth = () => {
  const app = initializeFirebase();
  return app.auth();
};

// 獲取 Storage 實例
export const getStorage = () => {
  const app = initializeFirebase();
  return app.storage();
};

// 導出 admin 實例
export { admin };
export default initializeFirebase;
