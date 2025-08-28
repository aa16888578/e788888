# 🔥 Firebase 配置設置指南

## 📋 **項目信息**
- **項目名稱**: CVV Bot V2
- **項目ID**: `cvvbot-v2`
- **項目編號**: `99131695635`

## 🚀 **獲取服務帳戶密鑰的步驟**

### **步驟1：訪問Firebase控制台**
1. 打開瀏覽器，訪問 [Firebase Console](https://console.firebase.google.com/)
2. 選擇項目 `cvvbot-v2`

### **步驟2：創建服務帳戶**
1. 點擊左側齒輪圖標 ⚙️
2. 選擇 "項目設置" (Project settings)
3. 點擊 "服務帳戶" (Service accounts) 標籤
4. 點擊 "生成新的私鑰" (Generate new private key)
5. 下載 JSON 文件

### **步驟3：配置服務帳戶**
1. 將下載的 JSON 文件重命名為 `firebase-service-account.json`
2. 放在項目根目錄：`偉大/python-bot/firebase-service-account.json`

### **步驟4：更新環境變量**
編輯 `.env` 文件，設置真實的Firebase配置：

```bash
# Firebase 配置
FIREBASE_PROJECT_ID=cvvbot-v2
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n你的真實私鑰\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@cvvbot-v2.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://cvvbot-v2-default-rtdb.firebaseio.com/
```

## 🔑 **服務帳戶權限要求**

確保服務帳戶具有以下權限：
- **Firestore**: 讀取/寫入權限
- **Authentication**: 用戶管理權限
- **Storage**: 文件存儲權限

## 📁 **文件結構**
```
偉大/python-bot/
├── firebase-service-account.json  # 服務帳戶密鑰
├── .env                          # 環境變量
├── firebase.json                 # Firebase配置
├── .firebaserc                   # Firebase項目關聯
└── firestore.rules              # Firestore安全規則
```

## ✅ **驗證配置**

配置完成後，運行以下命令驗證：

```bash
# 測試Firebase配置
python3 test_firebase_config.py

# 啟動系統
python3 main.py
```

## 🚨 **安全注意事項**

1. **永遠不要提交** `firebase-service-account.json` 到版本控制
2. 將 `firebase-service-account.json` 添加到 `.gitignore`
3. 定期輪換服務帳戶密鑰
4. 限制服務帳戶權限到最小必要範圍

## 🔧 **故障排除**

### **常見問題**
1. **權限錯誤**: 檢查服務帳戶權限
2. **項目ID不匹配**: 確認項目ID正確
3. **私鑰格式錯誤**: 確保私鑰包含換行符 `\n`

### **測試命令**
```bash
# 檢查Firebase項目
firebase projects:list

# 檢查Firestore狀態
firebase firestore:indexes

# 檢查認證狀態
firebase login:list
```

---

## 🎯 **下一步**

1. 按照上述步驟獲取服務帳戶密鑰
2. 更新配置文件
3. 測試系統啟動
4. 開始使用AI分類功能！

**需要幫助？** 檢查Firebase控制台或查看錯誤日誌。
