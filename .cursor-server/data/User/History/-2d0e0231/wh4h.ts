import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 智能路由 from './路由/智能';

const 應用 = express();
const 埠口 = process.env.PORT || 3001;

// 中間件設定
應用.use(helmet());
應用.use(cors({
  origin: true,
  credentials: true
}));
應用.use(express.json({ limit: '10mb' }));
應用.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 請求日誌
應用.use((請求, 回應, 下一步) => {
  console.log(`[${new Date().toISOString()}] ${請求.method} ${請求.path}`);
  下一步();
});

// 健康檢查
應用.get('/健康', (請求, 回應) => {
  回應.json({
    狀態: '正常',
    時間戳記: new Date().toISOString(),
    訊息: '智能助手開發服務運行中'
  });
});

// API 狀態
應用.get('/狀態', (請求, 回應) => {
  回應.json({
    狀態: '運行中',
    版本: '1.0.0',
    服務: [
      '程式碼生成',
      '程式碼審查',
      '程式碼解釋',
      '重構建議',
      '程式碼完成',
      '智能聊天'
    ],
    端點: {
      生成: '/api/智能/生成',
      審查: '/api/智能/審查',
      解釋: '/api/智能/解釋',
      重構: '/api/智能/重構',
      完成: '/api/智能/完成',
      聊天: '/api/智能/聊天'
    },
    時間戳記: new Date().toISOString()
  });
});

// 註冊路由
應用.use('/api/智能', 智能路由);

// 404 處理
應用.use((請求, 回應) => {
  回應.status(404).json({
    成功: false,
    錯誤: 'API端點不存在',
    路徑: 請求.path
  });
});

// 錯誤處理
應用.use((錯誤: any, 請求: express.Request, 回應: express.Response, 下一步: express.NextFunction) => {
  console.error('錯誤:', 錯誤);
  回應.status(錯誤.status || 500).json({
    成功: false,
    錯誤: 錯誤.message || '伺服器內部錯誤',
    時間戳記: new Date().toISOString()
  });
});

// 啟動伺服器
應用.listen(埠口, () => {
  console.log(`智能助手開發服務已啟動: http://localhost:${埠口}`);
});
