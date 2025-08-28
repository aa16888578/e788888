# 🔐 環境變數設置指南

## ⚠️ **重要安全提醒**

**環境變數文件包含敏感信息，絕對不要提交到 Git 倉庫！**

- ✅ 可以提交：`env.example`、`env.local.example`
- ❌ 絕對不要提交：`.env`、`.env.local`、`.env.production`

## 🚀 快速設置

### 1. 複製環境變數範例文件

```bash
# 在 admin 目錄下執行
cp env.local.example .env.local
```

### 2. 編輯 .env.local 文件

```bash
# 使用您喜歡的編輯器
nano .env.local
# 或
code .env.local
```

### 3. 填入您的實際配置

```env
# Firebase 配置
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_actual_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_actual_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id

# Telegram Bot 配置
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_actual_bot_token
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_actual_bot_username

# 應用配置
NEXT_PUBLIC_APP_NAME=ShopBot Admin
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=development
```

## 🔧 詳細配置說明

### Firebase 配置

1. **獲取 Firebase 配置**
   - 登入 [Firebase Console](https://console.firebase.google.com/)
   - 選擇您的項目
   - 點擊項目設置（齒輪圖標）
   - 在「一般」標籤下找到「您的應用程式」部分
   - 複製配置對象中的值

2. **API 金鑰安全**
   - Firebase API 金鑰是公開的，但應該限制使用範圍
   - 在 Firebase Console 中設置 API 金鑰限制
   - 限制只能從您的域名調用

### Telegram Bot 配置

1. **創建 Bot**
   - 在 Telegram 中與 [@BotFather](https://t.me/botfather) 對話
   - 發送 `/newbot` 命令
   - 按照指示設置 Bot 名稱和用戶名
   - 複製 Bot Token

2. **設置 Webhook**
   - 部署後設置 webhook 到您的 Firebase Functions
   - 確保 webhook 安全

## 🛡️ 安全最佳實踐

### 1. 環境變數管理

```bash
# 正確的做法
cp env.local.example .env.local
# 編輯 .env.local 填入實際值

# 錯誤的做法 - 絕對不要這樣做！
git add .env.local
git commit -m "Add environment variables"
```

### 2. 生產環境

```bash
# 生產環境使用不同的文件
cp env.local.example .env.production
# 編輯 .env.production 填入生產環境配置
```

### 3. 團隊協作

```bash
# 每個開發者都有自己的 .env.local
# 不要共享包含真實 API 金鑰的文件
# 只共享 env.example 範例文件
```

## 🔍 故障排除

### 常見問題

1. **環境變數未生效**
   ```bash
   # 重新啟動開發服務器
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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

# 在瀏覽器控制台中查看
# 注意：只有 NEXT_PUBLIC_ 開頭的變數會在客戶端可見
```

## 📁 文件結構

```
偉大/admin/
├── .env.local              # 本地環境變數 (不要提交到 Git)
├── .env.production         # 生產環境變數 (不要提交到 Git)
├── env.local.example       # 本地環境變數範例 (可以提交到 Git)
├── env.example             # 環境變數範例 (可以提交到 Git)
└── .gitignore              # Git 忽略文件 (保護敏感信息)
```

## 🚨 緊急情況

如果您意外提交了環境變數文件：

1. **立即撤銷提交**
   ```bash
   git reset --soft HEAD~1
   ```

2. **從 Git 歷史中移除**
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch .env.local' \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **強制推送**
   ```bash
   git push origin --force
   ```

4. **立即更換 API 金鑰**
   - 在 Firebase Console 中重新生成 API 金鑰
   - 在 Telegram BotFather 中重新生成 Bot Token

## 📞 需要幫助？

如果您在設置環境變數時遇到問題：

1. 檢查本文件中的配置說明
2. 確認所有必需的值都已填入
3. 重新啟動開發服務器
4. 檢查瀏覽器控制台的錯誤信息

---

**記住：安全第一！永遠不要將包含真實 API 金鑰的文件提交到 Git 倉庫。**
