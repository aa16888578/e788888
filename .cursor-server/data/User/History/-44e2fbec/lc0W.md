# 智能助手開發工具

## 📝 說明
這是一個專門用於開發階段的智能助手工具，整合了 Codestral AI 的功能。

## 🚀 功能
- 程式碼生成
- 程式碼審查
- 程式碼解釋
- 重構建議
- 程式碼完成
- 智能聊天

## 🛠️ 安裝
```bash
cd 開發工具/智能助手
npm install
```

## 📦 啟動
```bash
# 開發模式
npm run 開發

# 正式啟動
npm run 啟動
```

## 🌐 API 使用方式

### 1. 生成程式碼
```http
POST /api/智能/生成
Content-Type: application/json

{
  "提示": "生成一個簡單的 React 組件"
}
```

### 2. 程式碼完成
```http
POST /api/智能/完成
Content-Type: application/json

{
  "程式碼": "function 你好() {"
}
```

### 3. 程式碼審查
```http
POST /api/智能/審查
Content-Type: application/json

{
  "程式碼": "// 您的程式碼"
}
```

### 4. 程式碼解釋
```http
POST /api/智能/解釋
Content-Type: application/json

{
  "程式碼": "// 您的程式碼"
}
```

### 5. 重構建議
```http
POST /api/智能/重構
Content-Type: application/json

{
  "程式碼": "// 您的程式碼"
}
```

### 6. 智能聊天
```http
POST /api/智能/聊天
Content-Type: application/json

{
  "訊息列表": [
    {
      "角色": "user",
      "內容": "如何優化這段程式碼？"
    }
  ]
}
```

## ⚙️ 環境設定
服務預設運行在 3001 埠口，可以通過環境變數更改：
```bash
PORT=3001
```

## 🔒 安全性
- 僅用於開發環境
- 不要在生產環境中使用
- API 金鑰已內建，僅供開發使用

## 📋 注意事項
1. 這是開發工具，不要用於生產環境
2. 所有回應都是繁體中文
3. 程式碼生成有字數限制
4. 請合理使用 API 配額
