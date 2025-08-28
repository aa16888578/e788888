import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config';
import logger from './config/logger';
import paymentRoutes from './routes/payment';
import { errorHandler, requestLogger } from './middleware/validation';

// 初始化 Firebase
import './services/firebase';

const app = express();

// 安全中間件
app.use(helmet());

// CORS 配置
app.use(cors({
  origin: config.security.corsOrigin,
  credentials: true,
}));

// 請求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: config.security.rateLimit, // 限制每個IP的請求數
  message: {
    success: false,
    error: '請求過於頻繁，請稍後再試',
    timestamp: new Date().toISOString(),
    requestId: 'rate-limited',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// 請求日誌
app.use(requestLogger);

// 解析 JSON 請求體
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康檢查端點
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'USDT-TRC20 支付系統運行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.app.env,
  });
});

// API 路由
app.use(`/api/${config.app.apiVersion}/payments`, paymentRoutes);

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '端點不存在',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown',
  });
});

// 錯誤處理中間件
app.use(errorHandler);

// 啟動服務器
const PORT = config.app.port;

app.listen(PORT, () => {
  logger.info(`🚀 USDT-TRC20 支付系統啟動成功`);
  logger.info(`📍 服務器地址: http://localhost:${PORT}`);
  logger.info(`🌍 環境: ${config.app.env}`);
  logger.info(`🔗 API 版本: ${config.app.apiVersion}`);
  logger.info(`💰 支付範圍: ${config.payment.minAmount}-${config.payment.maxAmount} USDT`);
  logger.info(`⏱️  支付超時: ${config.payment.timeout} 秒`);
  logger.info(`🔒 確認數要求: ${config.payment.requiredConfirmations}`);
  logger.info(`🌐 區塊鏈網絡: ${config.blockchain.network}`);
});

// 優雅關閉
process.on('SIGTERM', () => {
  logger.info('收到 SIGTERM 信號，正在關閉服務器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到 SIGINT 信號，正在關閉服務器...');
  process.exit(0);
});

// 未捕獲的異常處理
process.on('uncaughtException', (error) => {
  logger.error('未捕獲的異常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未處理的 Promise 拒絕:', reason);
  process.exit(1);
});

export default app;
