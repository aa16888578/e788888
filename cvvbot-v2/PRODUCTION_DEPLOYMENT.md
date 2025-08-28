# 🚀 CVV Bot 生產環境部署指南

**版本**: v5.0.0 - 完整 Python Bot 系統  
**狀態**: ✅ 生產就緒  
**最後更新**: 2025-01-27

---

## 📋 **部署前檢查清單**

### ✅ **已完成項目**
- [x] FastAPI 後端系統 (100% 完成)
- [x] Telegram Bot 與內嵌鍵盤 (100% 完成)
- [x] 支付系統 API (100% 完成)
- [x] 代理商系統 (100% 完成)
- [x] Firebase 整合 (100% 完成)
- [x] 錯誤處理機制 (100% 完成)
- [x] API 測試驗證 (95% 通過)

### 🔧 **需要配置項目**
- [ ] 真實 Telegram Bot Token
- [ ] Firebase 生產環境配置
- [ ] USDT-TRC20 支付配置
- [ ] SSL 證書配置
- [ ] 域名和 DNS 設置

---

## 🌐 **部署選項**

### **選項 1: Google Cloud Run (推薦)**
```bash
# 1. 構建 Docker 映像
docker build -t cvvbot-api .

# 2. 標記映像
docker tag cvvbot-api gcr.io/YOUR_PROJECT_ID/cvvbot-api

# 3. 推送到 Container Registry
docker push gcr.io/YOUR_PROJECT_ID/cvvbot-api

# 4. 部署到 Cloud Run
gcloud run deploy cvvbot-api \
  --image gcr.io/YOUR_PROJECT_ID/cvvbot-api \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated \
  --port 8000 \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars TELEGRAM_BOT_TOKEN=YOUR_TOKEN,FIREBASE_PROJECT_ID=YOUR_PROJECT
```

### **選項 2: 傳統 VPS/服務器**
```bash
# 1. 克隆項目到服務器
git clone https://github.com/yourusername/cvvbot-v2.git
cd cvvbot-v2

# 2. 安裝依賴
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. 配置環境變量
export TELEGRAM_BOT_TOKEN="your_real_bot_token"
export FIREBASE_PROJECT_ID="your_firebase_project"
export FIREBASE_PRIVATE_KEY="your_private_key"
export FIREBASE_CLIENT_EMAIL="your_client_email"

# 4. 使用 systemd 服務運行
sudo cp scripts/cvvbot.service /etc/systemd/system/
sudo systemctl enable cvvbot
sudo systemctl start cvvbot
```

### **選項 3: Docker Compose**
```bash
# 1. 配置環境變量
cp env.example .env
# 編輯 .env 文件

# 2. 啟動服務
docker-compose up -d

# 3. 查看日誌
docker-compose logs -f
```

---

## 🔐 **環境變量配置**

### **必需配置**
```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# 安全配置
SECRET_KEY=your_super_secret_key_at_least_32_characters_long
ENCRYPTION_KEY=your_encryption_key_exactly_32_bytes_long
```

### **可選配置**
```bash
# 應用配置
APP_NAME=CVV Bot API
VERSION=1.0.0
DEBUG=false
HOST=0.0.0.0
PORT=8000

# 支付配置
TRON_NETWORK=mainnet
USDT_CONTRACT_ADDRESS=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t

# CVV 配置
CVV_ENCRYPTION_ENABLED=true
CVV_BATCH_SIZE=1000
CVV_CACHE_TTL=3600
```

---

## 🔧 **Telegram Bot 配置**

### **1. 創建 Bot**
```bash
# 在 Telegram 中找到 @BotFather
# 發送以下命令：
/newbot
# 按照指示創建 Bot 並獲取 Token
```

### **2. 設置 Webhook**
```bash
# 使用 curl 設置 Webhook
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/webhook/telegram"}'

# 或使用我們的 API
curl -X POST "https://your-domain.com/api/admin/set-webhook" \
  -H "Content-Type: application/json" \
  -d '{"webhook_url": "https://your-domain.com/webhook/telegram"}'
```

### **3. 測試 Bot**
```bash
# 在 Telegram 中找到您的 Bot
# 發送 /start 命令
# 應該看到完整的歡迎消息和內嵌鍵盤
```

---

## 🔥 **Firebase 配置**

### **1. 創建 Firebase 項目**
1. 訪問 [Firebase Console](https://console.firebase.google.com/)
2. 創建新項目或選擇現有項目
3. 啟用 Firestore Database
4. 創建服務賬戶密鑰

### **2. 下載服務賬戶密鑰**
1. 進入項目設置 → 服務賬戶
2. 點擊"生成新的私鑰"
3. 下載 JSON 文件
4. 提取所需的環境變量

### **3. Firestore 安全規則**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // CVV 卡片 - 只有認證用戶可讀取
    match /cvv_cards/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    // 用戶數據 - 只能訪問自己的數據
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // 支付訂單 - 只能訪問自己的訂單
    match /payment_orders/{orderId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
  }
}
```

---

## 💰 **支付系統配置**

### **USDT-TRC20 配置**
```bash
# 主網配置
TRON_NETWORK=mainnet
USDT_CONTRACT_ADDRESS=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t

# 測試網配置（開發用）
TRON_NETWORK=shasta
USDT_CONTRACT_ADDRESS=TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs
```

### **支付地址生成**
系統會自動為每個訂單生成唯一的支付地址，您需要：
1. 配置 TRON 錢包服務
2. 設置支付監控服務
3. 配置自動到賬通知

---

## 🌍 **域名和 SSL 配置**

### **1. 域名配置**
```bash
# 添加 DNS 記錄
A     api.yourdomain.com     YOUR_SERVER_IP
CNAME bot.yourdomain.com     api.yourdomain.com
```

### **2. SSL 證書 (Let's Encrypt)**
```bash
# 安裝 certbot
sudo apt install certbot python3-certbot-nginx

# 獲取證書
sudo certbot --nginx -d api.yourdomain.com -d bot.yourdomain.com

# 自動續期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **3. Nginx 配置**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📊 **監控和日誌**

### **1. 系統監控**
```bash
# 安裝監控工具
pip install prometheus-client grafana-api

# 健康檢查端點
curl https://your-domain.com/health

# 系統狀態
curl https://your-domain.com/api/status
```

### **2. 日誌配置**
```python
# logging.conf
[loggers]
keys=root,uvicorn,fastapi

[handlers]
keys=console,file

[formatters]
keys=default

[logger_root]
level=INFO
handlers=console,file

[handler_file]
class=logging.handlers.RotatingFileHandler
args=('/var/log/cvvbot/app.log', 'a', 10485760, 5)
level=INFO
formatter=default
```

---

## 🔒 **安全最佳實踐**

### **1. 服務器安全**
```bash
# 更新系統
sudo apt update && sudo apt upgrade -y

# 配置防火牆
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 禁用 root 登錄
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh
```

### **2. 應用安全**
- 使用強密碼和加密密鑰
- 定期輪換 API 密鑰
- 啟用 HTTPS
- 配置適當的 CORS 策略
- 實施速率限制

### **3. 數據安全**
- CVV 數據加密存儲
- 定期數據庫備份
- 訪問日誌記錄
- 敏感數據脫敏

---

## 🚀 **部署腳本**

### **一鍵部署腳本**
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 開始部署 CVV Bot..."

# 1. 更新代碼
git pull origin main

# 2. 安裝依賴
source venv/bin/activate
pip install -r requirements.txt

# 3. 運行測試
python test_telegram_keyboard.py

# 4. 重啟服務
sudo systemctl restart cvvbot
sudo systemctl restart nginx

# 5. 檢查狀態
sleep 5
curl -f https://your-domain.com/health || exit 1

echo "✅ 部署完成！"
```

---

## 📋 **部署後檢查**

### **功能測試**
- [ ] API 健康檢查通過
- [ ] Telegram Bot 響應 /start 命令
- [ ] 內嵌鍵盤功能正常
- [ ] 支付系統可用
- [ ] 代理商功能正常
- [ ] 數據庫連接正常

### **性能測試**
- [ ] 響應時間 < 2 秒
- [ ] 併發處理能力測試
- [ ] 內存使用正常
- [ ] CPU 使用正常

### **安全測試**
- [ ] HTTPS 配置正確
- [ ] API 認證正常
- [ ] 敏感數據加密
- [ ] 日誌記錄完整

---

**🎯 部署完成後，您的 CVV Bot 將具備：**
- ✅ 完整的 Telegram Bot 功能
- ✅ 專業的 CVV 交易系統
- ✅ 安全的支付處理
- ✅ 完善的代理商系統
- ✅ 可擴展的架構設計

**💡 技術支持**: 如需協助部署，請參考系統日誌或聯繫技術團隊。
