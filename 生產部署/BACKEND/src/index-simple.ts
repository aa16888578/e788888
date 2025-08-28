import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';

// 簡化配置
const config = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001'),
    apiVersion: process.env.API_VERSION || 'v1',
  },
  blockchain: {
    network: process.env.TRON_NETWORK || 'shasta',
    usdtContractAddress: process.env.USDT_CONTRACT_ADDRESS || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  },
  payment: {
    minAmount: parseInt(process.env.MIN_PAYMENT_AMOUNT || '1'),
    maxAmount: parseInt(process.env.MAX_PAYMENT_AMOUNT || '10000'),
    timeout: parseInt(process.env.PAYMENT_TIMEOUT || '1800'),
    requiredConfirmations: parseInt(process.env.REQUIRED_CONFIRMATIONS || '20'),
  },
  security: {
    rateLimit: parseInt(process.env.API_RATE_LIMIT || '1000'),
    corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001').split(','),
  },
};

const app = express();

// 安全中間件
app.use(helmet());

// CORS 配置
app.use(cors({
  origin: config.security.corsOrigin,
  credentials: true,
}));

// 請求日誌
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

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

// 模擬支付端點
app.post(`/api/${config.app.apiVersion}/payments`, (req, res) => {
  try {
    const { orderId, amount, currency } = req.body;

    if (!orderId || !amount || !currency) {
      return res.status(400).json({
        success: false,
        error: '缺少必要參數',
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // 驗證金額範圍
    if (amount < config.payment.minAmount || amount > config.payment.maxAmount) {
      return res.status(400).json({
        success: false,
        error: `金額超出限制範圍 (${config.payment.minAmount}-${config.payment.maxAmount} USDT)`,
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // 模擬支付創建
    const payment = {
      id: uuidv4(),
      orderId,
      amount,
      currency,
      status: 'pending',
      paymentAddress: config.blockchain.usdtContractAddress,
      expiresAt: new Date(Date.now() + config.payment.timeout * 1000),
      createdAt: new Date(),
    };

    console.log('✅ 支付創建成功:', { paymentId: payment.id, amount, currency });

    res.status(201).json({
      success: true,
      data: payment,
      message: '支付創建成功',
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });

  } catch (error) {
    console.error('❌ 創建支付失敗:', error);
    res.status(500).json({
      success: false,
      error: '創建支付失敗',
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// 檢查支付狀態端點
app.get(`/api/${config.app.apiVersion}/payments/:paymentId`, (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: '缺少支付ID',
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }

    // 模擬支付狀態
    const payment = {
      id: paymentId,
      status: 'pending',
      confirmations: 0,
      requiredConfirmations: config.payment.requiredConfirmations,
      updatedAt: new Date(),
    };

    res.status(200).json({
      success: true,
      data: payment,
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });

  } catch (error) {
    console.error('❌ 檢查支付狀態失敗:', error);
    res.status(500).json({
      success: false,
      error: '檢查支付狀態失敗',
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// 支付統計端點
app.get(`/api/${config.app.apiVersion}/payments/stats`, (req, res) => {
  try {
    const stats = {
      totalPayments: 0,
      totalAmount: 0,
      successRate: 0,
      averageConfirmationTime: 0,
    };

    res.status(200).json({
      success: true,
      data: stats,
      message: '支付統計獲取成功',
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });

  } catch (error) {
    console.error('❌ 獲取支付統計失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取支付統計失敗',
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '端點不存在',
    timestamp: new Date().toISOString(),
    requestId: uuidv4(),
  });
});

// 錯誤處理中間件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('錯誤處理中間件:', error);
  res.status(500).json({
    success: false,
    error: '內部服務器錯誤',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || uuidv4(),
  });
});

// 啟動服務器
const PORT = config.app.port;

app.listen(PORT, () => {
  console.log('🚀 USDT-TRC20 支付系統啟動成功');
  console.log(`📍 服務器地址: http://localhost:${PORT}`);
  console.log(`🌍 環境: ${config.app.env}`);
  console.log(`🔗 API 版本: ${config.app.apiVersion}`);
  console.log(`💰 支付範圍: ${config.payment.minAmount}-${config.payment.maxAmount} USDT`);
  console.log(`⏱️  支付超時: ${config.payment.timeout} 秒`);
  console.log(`🔒 確認數要求: ${config.payment.requiredConfirmations}`);
  console.log(`🌐 區塊鏈網絡: ${config.blockchain.network}`);
  console.log('\n📡 可用的 API 端點:');
  console.log(`   GET  /health`);
  console.log(`   POST /api/${config.app.apiVersion}/payments`);
  console.log(`   GET  /api/${config.app.apiVersion}/payments/:paymentId`);
  console.log(`   GET  /api/${config.app.apiVersion}/payments/stats`);
});

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信號，正在關閉服務器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信號，正在關閉服務器...');
  process.exit(0);
});

export default app;
