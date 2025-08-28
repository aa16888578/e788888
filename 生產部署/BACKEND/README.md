# 💎 USDT-TRC20 支付系統後端

## 🚀 快速開始

### 環境要求
- Node.js 18+
- npm 8+
- Firebase 項目
- Tron 網絡訪問

### 安裝依賴
```bash
npm install
```

### 環境配置
複製 `.env.example` 為 `.env` 並配置必要的環境變數：

```bash
cp .env.example .env
```

**必須配置的環境變數：**
- `JWT_SECRET`: JWT 簽名密鑰 (至少32字符)
- `ENCRYPTION_KEY`: 加密密鑰 (至少32字符)
- `FIREBASE_PROJECT_ID`: Firebase 項目ID
- `FIREBASE_PRIVATE_KEY`: Firebase 私鑰
- `FIREBASE_CLIENT_EMAIL`: Firebase 客戶端郵箱

### 開發模式運行
```bash
npm run dev
```

### 生產模式運行
```bash
npm run build
npm start
```

### 運行測試
```bash
npm test
npm run test:watch
```

## 📁 項目結構

```
src/
├── config/           # 配置管理
│   ├── index.ts     # 主配置
│   └── logger.ts    # 日誌配置
├── controllers/      # 控制器層
│   └── payment.ts   # 支付控制器
├── middleware/       # 中間件
│   ├── auth.ts      # 認證中間件
│   └── validation.ts # 驗證中間件
├── models/          # 數據模型
├── routes/          # 路由定義
│   └── payment.ts   # 支付路由
├── services/        # 業務邏輯層
│   ├── firebase.ts  # Firebase 服務
│   ├── payment.ts   # 支付服務
│   ├── tron.ts      # Tron 區塊鏈服務
│   └── exchange.ts  # 匯率服務
├── types/           # TypeScript 類型定義
│   └── index.ts     # 核心類型
└── index.ts         # 主應用入口
```

## 🔧 核心功能

### 1. 支付處理
- 創建支付訂單
- 檢查支付狀態
- 處理支付確認
- 支付歷史記錄

### 2. 區塊鏈集成
- Tron 網絡支持
- USDT-TRC20 合約交互
- 交易監控和確認
- 錢包餘額檢查

### 3. 匯率管理
- 多來源匯率獲取
- 實時匯率更新
- 匯率緩存機制
- 多貨幣支持

### 4. 安全特性
- JWT 認證
- 角色權限控制
- 請求頻率限制
- 數據加密

## 📡 API 端點

### 支付相關

#### 創建支付
```http
POST /api/v1/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "uuid",
  "amount": 100,
  "currency": "USD"
}
```

#### 檢查支付狀態
```http
GET /api/v1/payments/:paymentId
Authorization: Bearer <token>
```

#### 獲取支付歷史
```http
GET /api/v1/payments/history?page=1&limit=10
Authorization: Bearer <token>
```

#### 支付回調
```http
POST /api/v1/payments/callback
Content-Type: application/json

{
  "paymentId": "uuid",
  "transactionHash": "tx_hash",
  "status": "confirmed"
}
```

#### 支付統計
```http
GET /api/v1/payments/stats
Authorization: Bearer <token>
```

### 健康檢查
```http
GET /health
```

## 🔒 安全配置

### JWT 認證
所有支付相關的 API 都需要有效的 JWT 令牌：

```bash
# 生成測試令牌 (僅開發環境)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```

### 角色權限
- `user`: 基本支付功能
- `agent`: 代理功能 + 支付功能
- `admin`: 所有功能

## 🌐 區塊鏈配置

### 測試網 (Shasta)
```bash
TRON_NETWORK=shasta
TRON_API_KEY=your_api_key
USDT_CONTRACT_ADDRESS=your_testnet_usdt_address
```

### 主網
```bash
TRON_NETWORK=mainnet
TRON_API_KEY=your_api_key
USDT_CONTRACT_ADDRESS=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
```

## 💱 匯率配置

### CoinGecko
```bash
COINGECKO_API_KEY=your_api_key
```

### Binance
```bash
BINANCE_API_KEY=your_api_key
```

### Chainlink
```bash
CHAINLINK_API_KEY=your_api_key
```

## 📊 監控和日誌

### 日誌級別
- `error`: 錯誤信息
- `warn`: 警告信息
- `info`: 一般信息
- `debug`: 調試信息

### 日誌文件
- `logs/error.log`: 錯誤日誌
- `logs/combined.log`: 所有日誌

### 監控指標
- 請求響應時間
- 錯誤率
- 支付成功率
- 區塊鏈確認時間

## 🧪 測試

### 單元測試
```bash
npm test
```

### 監視模式
```bash
npm run test:watch
```

### 測試覆蓋率
```bash
npm run test:coverage
```

### 手動測試
```bash
# 運行測試腳本
npx tsx test-payment.ts
```

## 🚀 部署

### Docker 部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 環境變數檢查
部署前確保所有必要的環境變數都已配置：

```bash
# 檢查配置
npx tsx test-payment.ts
```

## 🔧 故障排除

### 常見問題

#### 1. Firebase 初始化失敗
- 檢查 Firebase 項目配置
- 確認私鑰格式正確
- 驗證項目ID

#### 2. Tron 網絡連接失敗
- 檢查網絡配置
- 確認 API 密鑰
- 驗證合約地址

#### 3. JWT 驗證失敗
- 檢查 JWT_SECRET 配置
- 確認令牌格式
- 驗證令牌過期時間

#### 4. 匯率獲取失敗
- 檢查 API 密鑰
- 確認網絡連接
- 查看日誌錯誤

### 日誌查看
```bash
# 查看實時日誌
tail -f logs/combined.log

# 查看錯誤日誌
tail -f logs/error.log
```

## 📞 支持

### 技術文檔
- [架構設計](./../ARCHITECTURE.md)
- [系統總結](./../DOCS/SYSTEM_SUMMARY.md)
- [測試指南](./../TESTING/README.md)

### 問題反饋
- 創建 GitHub Issue
- 查看錯誤日誌
- 檢查配置參數

---

**版本**: 1.0.0  
**最後更新**: 2025-08-28  
**維護者**: ShopBot 開發團隊
