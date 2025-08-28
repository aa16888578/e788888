import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions';

// 設定全域選項
setGlobalOptions({
  maxInstances: 10,
  region: 'asia-east1'
});

// 健康檢查端點
export const healthCheck = onRequest((req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'ShopBot Functions 運行正常'
  });
});

// 測試端點
export const test = onRequest((req, res) => {
  res.json({
    message: 'Hello from ShopBot!',
    timestamp: new Date().toISOString()
  });
});
