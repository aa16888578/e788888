# 🚀 CVV Python Bot - 設置說明

## 📋 部署後配置步驟

### 1. 環境變數設置

部署系統後，請按照以下步驟設置環境變數：

#### 方式一：使用環境變數文件
```bash
# 複製範例文件
cp env.example .env

# 編輯環境變數
nano .env
```

#### 方式二：使用後台配置 API
```bash
# 獲取配置狀態
curl http://your-domain:8000/api/admin/configs/status

# 設置 Firebase 配置
curl -X POST http://your-domain:8000/api/admin/configs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin_secret_token" \
  -d '{
    "key": "FIREBASE_PROJECT_ID",
    "value": "your_project_id"
  }'

curl -X POST http://your-domain:8000/api/admin/configs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin_secret_token" \
  -d '{
    "key": "FIREBASE_PRIVATE_KEY", 
    "value": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  }'

curl -X POST http://your-domain:8000/api/admin/configs \
  -H "Content-Type: application/json"
  -H "Authorization: Bearer admin_secret_token" \
  -d '{
    "key": "FIREBASE_CLIENT_EMAIL",
    "value": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
  }'
```

### 2. 必需的環境變數

```bash
# Firebase 配置 (部署後您會提供)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Telegram Bot 配置 (部署後您會提供)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username

# 安全配置
SECRET_KEY=your_secure_secret_key
ENCRYPTION_KEY=your_32_byte_encryption_key
ADMIN_API_TOKEN=your_admin_api_token
```

### 3. 系統啟動

```bash
# 安裝依賴
pip install -r requirements.txt

# 啟動系統
python3 start.py

# 或僅啟動 API 服務器
python3 main.py
```

### 4. 驗證部署

#### 檢查系統狀態
```bash
# 健康檢查
curl http://localhost:8000/health

# 系統狀態
curl http://localhost:8000/api/status

# 配置狀態
curl http://localhost:8000/api/admin/configs/status
```

#### 測試 Telegram Bot
```bash
# 設置 Webhook (替換為您的域名和 Bot Token)
curl -F "url=https://your-domain.com/webhook/telegram" \
     https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook

# 測試 Bot 響應
# 在 Telegram 中搜索您的 Bot 並發送 /start
```

### 5. 系統功能測試

#### API 端點測試
```bash
# Telegram Bot API
curl http://localhost:8000/api/telegram/welcome \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": 123456789,
    "first_name": "測試用戶"
  }'

# 支付系統 API
curl http://localhost:8000/api/payment/methods

# 配置管理 API
curl http://localhost:8000/api/admin/configs \
  -H "Authorization: Bearer your_admin_token"
```

## 🔧 系統架構概覽

### 核心組件
- **FastAPI 主應用** - REST API 服務器
- **Telegram Bot 處理器** - 處理 Bot 消息和回調
- **Firebase 服務** - 數據庫和配置管理
- **支付服務** - USDT-TRC20 支付處理
- **代理商系統** - 多級代理權限管理

### 主要功能
- 🤖 **15+ 種內嵌鍵盤** - 豐富的用戶交互
- 👑 **5級代理系統** - 銅牌到鑽石的完整等級
- 💰 **完整支付系統** - USDT-TRC20 自動處理
- 🔥 **後台配置管理** - 動態環境變數管理
- 📱 **響應式前端** - 現代化支付介面

### API 路由
- `/api/telegram/*` - Telegram Bot 相關 API
- `/api/payment/*` - 支付系統 API  
- `/api/admin/*` - 後台管理 API
- `/health` - 健康檢查
- `/api/status` - 系統狀態

## 📞 部署後聯繫

部署完成後，請提供以下信息：

1. **Firebase 服務帳號配置**
   - Project ID
   - Private Key
   - Client Email

2. **Telegram Bot 配置**
   - Bot Token
   - Bot Username
   - Webhook URL

3. **部署環境信息**
   - 服務器 URL
   - 部署方式 (Docker/直接部署)
   - 網絡配置

我將協助您完成最終的配置和測試！ 🚀

---

**系統狀態**: ✅ 部署就緒，等待配置  
**版本**: v5.0.0 - 完整 Python Bot 生態系統  
**最後更新**: 2025-01-27
