# �� ShopBot 環境配置說明

## ⚠️ **重要安全提醒**

**環境變數文件包含敏感信息，絕對不要提交到 Git 倉庫！**

- ✅ 可以提交：`env.example`、`env.local.example`
- ❌ 絕對不要提交：`.env`、`.env.local`、`.env.production`

## 🔐 **安全檢查清單**

在開始配置之前，請確認：
- [ ] 項目根目錄有 `.gitignore` 文件
- [ ] `.gitignore` 包含 `.env*` 模式
- [ ] 沒有 `.env` 文件被意外提交到 Git
- [ ] 團隊成員都知道不要提交環境變數文件

## 📋 **概述**
本文檔詳細說明如何配置 ShopBot 多平台電商系統的環境變數，包括 Firebase、Telegram Bot、支付系統等所有必要配置。

## 🚀 **快速開始**

### 1. 複製環境配置文件
```bash
cp env.example .env
```

### 2. 編輯 .env 文件
根據您的實際配置填入相應的值。

### 3. 重啟服務
配置完成後重啟相關服務。

---

## 🔥 **Firebase 配置**

### 獲取 Firebase 配置
1. 訪問 [Firebase Console](https://console.firebase.google.com/)
2. 選擇您的項目
3. 點擊「項目設置」→「服務帳戶」
4. 點擊「生成新的私鑰」
5. 下載 JSON 文件

### 配置說明
```bash
# 項目 ID
FIREBASE_PROJECT_ID=your-project-id

# 私鑰 ID
FIREBASE_PRIVATE_KEY_ID=your-private-key-id

# 私鑰 (注意引號和換行符)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"

# 客戶端郵箱
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com

# 客戶端 ID
FIREBASE_CLIENT_ID=your-client-id

# 認證 URI
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth

# Token URI
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# 認證提供者證書 URL
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs

# 客戶端證書 URL
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com
```

---

## 🤖 **Telegram Bot 配置**

### 創建 Telegram Bot
1. 在 Telegram 中搜索 `@BotFather`
2. 發送 `/newbot` 命令
3. 按照提示設置 Bot 名稱和用戶名
4. 獲取 Bot Token

### 配置說明
```bash
# Bot Token
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Webhook 密鑰 (自定義)
TELEGRAM_WEBHOOK_SECRET=your-secret-key

# Webhook URL (部署後設置)
TELEGRAM_WEBHOOK_URL=https://your-project-id.cloudfunctions.net/telegramWebhook
```

### 設置 Webhook
```bash
curl -F "url=https://your-project-id.cloudfunctions.net/telegramWebhook" \
     https://api.telegram.org/bot<BOT_TOKEN>/setWebhook
```

---

## 💰 **支付系統配置**

### USDT-TRC20 配置
```bash
# Tron 錢包地址
TRON_WALLET_ADDRESS=TYourTronWalletAddressHere

# Tron 網絡 (mainnet/testnet)
TRON_NETWORK=mainnet

# Tron API 密鑰
TRON_API_KEY=your-tron-api-key

# Tron API URL
TRON_API_URL=https://api.trongrid.io
```

### USDT-ERC20 配置
```bash
# Ethereum 錢包地址
ETHEREUM_WALLET_ADDRESS=0xYourEthereumWalletAddressHere

# Ethereum 網絡 (mainnet/testnet)
ETHEREUM_NETWORK=mainnet

# Ethereum API 密鑰
ETHEREUM_API_KEY=your-ethereum-api-key

# Ethereum API URL
ETHEREUM_API_URL=https://api.etherscan.io
```

### 系統錢包配置
```bash
# 系統收款錢包地址
SYSTEM_WALLET_ADDRESS=TYourSystemWalletAddressHere
```

---

## 📊 **匯率 API 配置**

### CoinGecko API (推薦，免費)
1. 訪問 [CoinGecko](https://www.coingecko.com/en/api)
2. 註冊帳戶並獲取 API 密鑰
3. 配置環境變數

```bash
COINGECKO_API_KEY=your-coingecko-api-key
```

### Binance API (備用)
1. 訪問 [Binance](https://www.binance.com/en/my/settings/api-management)
2. 創建 API 密鑰
3. 配置環境變數

```bash
BINANCE_API_KEY=your-binance-api-key
BINANCE_SECRET_KEY=your-binance-secret-key
```

---

## 🔐 **安全配置**

### JWT 配置
```bash
# JWT 密鑰 (建議使用強密鑰)
JWT_SECRET=your-jwt-secret-key-here

# JWT 過期時間
JWT_EXPIRES_IN=24h
```

### CORS 配置
```bash
# 允許的域名
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### 訪問控制
```bash
# 允許的 Telegram 用戶 ID (可選)
ALLOWED_TELEGRAM_USERS=123456789,987654321
```

---

## 📧 **通知配置**

### 郵件配置
```bash
# SMTP 主機
SMTP_HOST=smtp.gmail.com

# SMTP 端口
SMTP_PORT=587

# SMTP 用戶名
SMTP_USER=your-email@gmail.com

# SMTP 密碼 (應用密碼)
SMTP_PASS=your-app-password
```

### 通知渠道
```bash
# 啟用通知
ENABLE_NOTIFICATIONS=true

# 通知渠道
NOTIFICATION_CHANNELS=telegram,email
```

---

## 🏢 **代理系統配置**

### 佣金比例
```bash
# 一級代理佣金比例 (%)
AGENT_COMMISSION_RATE_LEVEL1=15

# 二級代理佣金比例 (%)
AGENT_COMMISSION_RATE_LEVEL2=8

# 三級代理佣金比例 (%)
AGENT_COMMISSION_RATE_LEVEL3=5
```

### 推薦獎勵
```bash
# 一級代理推薦獎勵 (USDT)
AGENT_REFERRAL_BONUS_LEVEL1=50

# 二級代理推薦獎勵 (USDT)
AGENT_REFERRAL_BONUS_LEVEL2=30

# 三級代理推薦獎勵 (USDT)
AGENT_REFERRAL_BONUS_LEVEL3=20
```

---

## ⚙️ **應用配置**

### 基本配置
```bash
# 應用名稱
APP_NAME=ShopBot

# 應用版本
APP_VERSION=2.0.0

# 環境
NODE_ENV=production

# 端口
PORT=5000
```

### 開發配置
```bash
# 調試模式
DEBUG=false

# 開發者模式
DEVELOPER_MODE=false

# 使用測試網絡
USE_TESTNET=false
```

---

## 📈 **監控配置**

### 性能監控
```bash
# 啟用性能監控
ENABLE_PERFORMANCE_MONITORING=true

# 啟用錯誤追蹤
ENABLE_ERROR_TRACKING=true

# 啟用分析追蹤
ENABLE_ANALYTICS=true
```

### 日誌配置
```bash
# 日誌級別
LOG_LEVEL=info

# 日誌文件路徑
LOG_FILE_PATH=./logs/app.log
```

---

## 🔄 **備份配置**

### 自動備份
```bash
# 啟用自動備份
ENABLE_AUTO_BACKUP=true

# 備份頻率 (小時)
BACKUP_FREQUENCY_HOURS=24

# 備份保留天數
BACKUP_RETENTION_DAYS=30
```

---

## 🚦 **限流配置**

### API 限流
```bash
# 最大請求數
RATE_LIMIT_MAX_REQUESTS=1000

# 時間窗口 (毫秒)
RATE_LIMIT_WINDOW_MS=900000
```

### Telegram Bot 限流
```bash
# 最大請求數
TELEGRAM_RATE_LIMIT_MAX_REQUESTS=100

# 時間窗口 (毫秒)
TELEGRAM_RATE_LIMIT_WINDOW_MS=60000
```

---

## 📝 **配置檢查清單**

### 必要配置
- [ ] Firebase 項目配置
- [ ] Telegram Bot Token
- [ ] 支付錢包地址
- [ ] JWT 密鑰
- [ ] 系統錢包地址

### 推薦配置
- [ ] 匯率 API 密鑰
- [ ] 郵件 SMTP 配置
- [ ] 監控和日誌配置
- [ ] 備份配置
- [ ] 限流配置

### 可選配置
- [ ] Redis 緩存配置
- [ ] 第三方服務 API 密鑰
- [ ] 物流追蹤 API
- [ ] 客服系統配置

---

## 🚨 **安全注意事項**

### 1. 保護敏感信息
- 永遠不要將 `.env` 文件提交到版本控制
- 使用強密鑰和密碼
- 定期更換 API 密鑰

### 2. 環境隔離
- 開發、測試、生產環境使用不同的配置
- 生產環境使用專用的服務帳戶
- 限制 API 密鑰的權限範圍

### 3. 監控和日誌
- 啟用安全日誌記錄
- 監控異常訪問
- 定期審計配置

---

## 🔧 **故障排除**

### 常見問題

#### 1. Firebase 連接失敗
- 檢查項目 ID 是否正確
- 確認服務帳戶權限
- 檢查網絡連接

#### 2. Telegram Bot 無響應
- 檢查 Bot Token 是否正確
- 確認 Webhook 設置
- 檢查函數部署狀態

#### 3. 支付系統錯誤
- 檢查錢包地址格式
- 確認網絡配置
- 檢查 API 密鑰

#### 4. 環境變數未生效
- 重啟相關服務
- 檢查變數名稱拼寫
- 確認文件編碼格式

---

## 📚 **相關文檔**

- [Firebase 文檔](https://firebase.google.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Tron 開發文檔](https://developers.tron.network/)
- [Ethereum 開發文檔](https://ethereum.org/developers/)

---

## 📞 **支持**

如果您在配置過程中遇到問題，請：

1. 檢查本文檔的相關章節
2. 查看系統日誌
3. 聯繫技術支持團隊

**配置完成後，您的 ShopBot 系統就可以正常運行了！** 🎉
