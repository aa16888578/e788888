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
    message: 'CVV Bot Functions 運行正常'
  });
});

// 測試端點
export const test = onRequest((req, res) => {
  res.json({
    message: 'Hello from ShopBot!',
    timestamp: new Date().toISOString(),
    services: {
      telegram: 'ready',
      agent: 'ready',
      payment: 'ready',
      order: 'ready',
      cart: 'ready',
      search: 'ready'
    }
  });
});

// API 狀態端點
export const apiStatus = onRequest((req, res) => {
  res.json({
    status: 'operational',
    version: '1.0.0',
    services: [
      'Telegram Bot',
      'Agent System',
      'Payment System',
      'Order Management',
      'Shopping Cart',
      'Product Search'
    ],
    timestamp: new Date().toISOString()
  });
});