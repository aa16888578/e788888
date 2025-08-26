import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes';

// 設置全局選項
setGlobalOptions({
  maxInstances: 10,
  memory: '256MiB',
  timeoutSeconds: 60,
  region: 'asia-east1'
});

// 創建 Express 應用
const app = express();

// 安全中間件
app.use(helmet());

// CORS 配置
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Token']
}));

// 請求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 限制每個 IP 15 分鐘內最多 100 個請求
  message: {
    success: false,
    error: 'Too many requests',
    message: '請求過於頻繁，請稍後再試'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// 解析 JSON 請求體
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 請求日誌中間件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API 路由
app.use('/api', apiRoutes);

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: '請求的端點不存在'
  });
});

// 錯誤處理中間件
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Error:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: '服務器內部錯誤',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服務運行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 導出 HTTP 函數
export const api = onRequest({
  cors: true,
  maxInstances: 10
}, app);

// 導出健康檢查函數
export const healthCheck = onRequest((req, res) => {
  res.json({
    success: true,
    message: 'Cloud Function 運行正常',
    timestamp: new Date().toISOString(),
    function: 'healthCheck',
    region: 'asia-east1'
  });
});
