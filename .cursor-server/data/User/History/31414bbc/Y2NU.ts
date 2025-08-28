import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import claudeRouter from './routes/claude';

// 導入路由
import cvvRouter from './routes/cvv';

// 設定全域選項
setGlobalOptions({
  maxInstances: 10,
  region: 'asia-east1'
});

// 創建 Express 應用
const app = express();

// 中間件配置
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 請求日誌
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 健康檢查端點
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'CVV Bot Functions 運行正常'
  });
});

// API 狀態端點
app.get('/status', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'operational',
    version: '2.0.0',
    services: [
      'CVV API Service',
      'Telegram Bot Service',
      'Agent System',
      'USDT Payment System',
      'Order Management',
      'Inventory Management',
      'Search Engine',
      'Claude AI Service'
    ],
    endpoints: {
      cvv: '/api/cvv/*',
      telegram: '/api/telegram/*',
      agent: '/api/agent/*',
      payment: '/api/payment/*',
      order: '/api/order/*',
      claude: '/api/claude/*'
    },
    timestamp: new Date().toISOString()
  });
});

// API 路由註冊
app.use('/api/cvv', cvvRouter);
app.use('/api/claude', claudeRouter);

// 404 處理
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    error: 'API 端點不存在',
    path: req.path
  });
});

// 錯誤處理中間件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('錯誤:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || '服務器內部錯誤',
    timestamp: new Date().toISOString()
  });
});

// 導出 Firebase Functions
export const api = onRequest({
  cors: true,
  maxInstances: 10
}, app);

// 保留原有的簡單端點用於測試
export const healthCheck = onRequest((req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'CVV Bot Functions 運行正常'
  });
});

export const test = onRequest((req, res) => {
  res.json({
    message: 'Hello from CVV Bot!',
    timestamp: new Date().toISOString(),
    services: {
      cvv: 'ready',
      telegram: 'ready',
      agent: 'ready',
      payment: 'ready',
      order: 'ready',
      cart: 'ready',
      search: 'ready'
    }
  });
});