# 🚨 安全事故恢復指南

**事故時間**: 2025-01-27  
**事故類型**: Telegram Bot Token 意外上傳到 Git  
**狀態**: 🔒 已緊急處理

---

## ✅ **已完成的緊急措施**

### **1. 立即響應**
- [x] 停止所有使用舊 Token 的服務
- [x] 清理代碼中的硬編碼 Token
- [x] 更新所有腳本使用環境變量
- [x] 刪除包含敏感信息的文檔

### **2. 代碼清理**
- [x] `start_production.sh` - 使用環境變量
- [x] `start_telegram_bot.py` - 使用環境變量  
- [x] `setup_webhook.sh` - 使用環境變量
- [x] 刪除 `DEPLOYMENT_READY.md`

---

## 🚨 **您需要立即執行的步驟**

### **步驟 1: 撤銷舊 Token**
```
1. 在 Telegram 中找到 @BotFather
2. 發送 /revoke
3. 選擇您的 Bot (@e7_69testbot)
4. 確認撤銷舊 Token
```

### **步驟 2: 生成新 Token**
```
1. 在 @BotFather 中發送 /token
2. 選擇您的 Bot
3. 獲取新的 Token
4. 妥善保存（不要再上傳到 Git！）
```

### **步驟 3: 設置新環境變量**
```bash
# 設置新的 Token（請替換為您的新 Token）
export TELEGRAM_BOT_TOKEN="YOUR_NEW_BOT_TOKEN_HERE"

# 其他必要的環境變量
export FIREBASE_PROJECT_ID="your-firebase-project"
export SECRET_KEY="your_super_secret_key_32_chars"
```

---

## 🔒 **安全最佳實踐**

### **1. 環境變量管理**
```bash
# 創建安全的環境配置文件
cp env.production.example .env.local
# 編輯 .env.local 並填入真實值
# 確保 .env.local 在 .gitignore 中
```

### **2. Git 安全配置**
```bash
# 檢查 .gitignore
echo ".env*" >> .gitignore
echo "*.log" >> .gitignore
echo "secrets/" >> .gitignore

# 提交安全配置
git add .gitignore
git commit -m "🔒 加強 Git 安全配置"
```

### **3. 服務器安全**
```bash
# 使用安全的啟動方式
export TELEGRAM_BOT_TOKEN="your_new_token"
./start_production.sh

# 或使用配置文件
source .env.local
./start_production.sh
```

---

## 🛡️ **未來預防措施**

### **1. 代碼審查檢查清單**
- [ ] 沒有硬編碼的 API 密鑰
- [ ] 沒有硬編碼的數據庫密碼
- [ ] 沒有硬編碼的加密密鑰
- [ ] 所有敏感配置使用環境變量

### **2. Git 預提交鉤子**
```bash
# 安裝預提交鉤子檢查敏感信息
pip install pre-commit
pre-commit install
```

### **3. 環境分離**
```bash
# 開發環境
.env.development

# 測試環境  
.env.testing

# 生產環境
.env.production
```

---

## 🚀 **安全重啟系統**

### **獲得新 Token 後**
```bash
# 1. 設置新環境變量
export TELEGRAM_BOT_TOKEN="YOUR_NEW_BOT_TOKEN"

# 2. 啟動生產系統
./start_production.sh

# 3. 驗證系統運行
curl http://localhost:8000/health

# 4. 測試 Bot 功能
# 在 Telegram 中發送 /start 給您的 Bot
```

---

## 📞 **技術支持**

如果您需要協助：
1. 檢查系統日誌: `tail -f production.log`
2. 檢查 Bot 日誌: `tail -f telegram_bot.log`
3. 驗證環境變量: `env | grep TELEGRAM`

---

**🎯 記住**: 永遠不要將 API 密鑰、Token 或密碼硬編碼到代碼中！
