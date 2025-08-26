# 🌍 ShopBot 環境配置說明

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

# 匯率 API 密鑰
EXCHANGE_RATE_API_KEY=your-exchange-rate-api-key
```

---

## 🛡️ **安全最佳實踐**

### 1. 環境變數管理
```bash
# 正確的做法
cp env.example .env
# 編輯 .env 填入實際值

# 錯誤的做法 - 絕對不要這樣做！
git add .env
git commit -m "Add environment variables"
```

### 2. 生產環境
```bash
# 生產環境使用不同的文件
cp env.example .env.production
# 編輯 .env.production 填入生產環境配置
```

### 3. 團隊協作
```bash
# 每個開發者都有自己的 .env
# 不要共享包含真實 API 金鑰的文件
# 只共享 env.example 範例文件
```

---

## 🔍 **故障排除**

### 常見問題

1. **環境變數未生效**
   ```bash
   # 重新啟動服務
   npm run dev
   ```

2. **Firebase 連接失敗**
   - 檢查 API 金鑰是否正確
   - 確認項目 ID 是否匹配
   - 檢查 Firebase 項目是否啟用

3. **Telegram Bot 無響應**
   - 檢查 Bot Token 是否正確
   - 確認 Bot 是否已啟動
   - 檢查 webhook 設置

### 調試技巧

```bash
# 檢查環境變數是否正確載入
console.log('Firebase Config:', {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
});

# 檢查 .env 文件是否被正確讀取
ls -la .env*
```

---

## 📁 **文件結構**

```
偉大/
├── .env                    # 環境變數 (不要提交到 Git)
├── .env.production         # 生產環境變數 (不要提交到 Git)
├── env.example             # 環境變數範例 (可以提交到 Git)
├── .gitignore              # Git 忽略文件 (保護敏感信息)
├── admin/
│   ├── .env.local          # 管理後台環境變數 (不要提交到 Git)
│   └── env.local.example   # 管理後台環境變數範例 (可以提交到 Git)
├── functions/
│   └── .env                # Functions 環境變數 (不要提交到 Git)
└── web/
    └── .env                # MiniWeb 環境變數 (不要提交到 Git)
```

---

## 🚨 **緊急情況**

如果您意外提交了環境變數文件：

1. **立即撤銷提交**
   ```bash
   git reset --soft HEAD~1
   ```

2. **從 Git 歷史中移除**
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch .env*' \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **強制推送**
   ```bash
   git push origin --force
   ```

4. **立即更換 API 金鑰**
   - 在 Firebase Console 中重新生成 API 金鑰
   - 在 Telegram BotFather 中重新生成 Bot Token

---

## 📞 **需要幫助？**

如果您在設置環境變數時遇到問題：

1. 檢查本文件中的配置說明
2. 確認所有必需的值都已填入
3. 重新啟動相關服務
4. 檢查錯誤日誌

---

**記住：安全第一！永遠不要將包含真實 API 金鑰的文件提交到 Git 倉庫。**
