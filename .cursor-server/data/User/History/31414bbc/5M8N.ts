import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions';

// 導入路由
import agentRoutes from './routes/agent';
import mainRoutes from './routes/index';

// 設定全域選項
setGlobalOptions({
  maxInstances: 10,
  region: 'asia-east1'
});

const app = express();

// 中間件
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100 // 限制每個 IP 15 分鐘內最多 100 個請求
});
app.use(limiter);

// 路由
app.use('/api/agent', agentRoutes);
app.use('/api', mainRoutes);

// 健康檢查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'ShopBot Functions 運行正常'
  });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API 端點不存在' });
});

// 錯誤處理
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: '內部服務器錯誤' });
});

export const api = onRequest(app);

// 保留原有的健康檢查端點
export const healthCheck = onRequest((req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'ShopBot Functions 運行正常'
  });
});

// 保留原有的測試端點
export const test = onRequest((req, res) => {
  res.json({
    message: 'Hello from ShopBot!',
    timestamp: new Date().toISOString()
  });
});