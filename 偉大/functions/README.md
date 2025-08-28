# 🚀 CVV Bot Functions - 後端 API 服務

## 📋 項目概述

CVV Bot Functions 是一個基於 Firebase Functions 的後端 API 服務，專門處理 CVV 信用卡資料的交易和管理。系統提供完整的 CRUD 操作、批量導入、搜索統計等功能。

## 🏗️ 技術架構

- **運行時**: Node.js 20
- **框架**: Firebase Functions v6.4.0
- **語言**: TypeScript 5.3.0
- **數據庫**: Firestore
- **認證**: Firebase Auth
- **加密**: AES-256-CBC

## 🚀 快速開始

### 1. 安裝依賴
```bash
npm install
```

### 2. 環境配置
創建 `.env` 文件並配置以下變數：
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
CVV_ENCRYPTION_KEY=your-encryption-key
```

### 3. 本地開發
```bash
# 啟動開發服務器
npm run dev

# 測試 CVV 服務
npm run test:cvv

# 啟動 Firebase 模擬器
npm run serve
```

### 4. 部署
```bash
npm run deploy
```

## 📚 API 端點

### CVV 卡片管理

#### 批量導入
```http
POST /api/cvv/import
Content-Type: application/json

{
  "format": "csv|json|txt",
  "data": "cardNumber,cvv,expiryMonth,expiryYear,country,price\n4111111111111111,123,12,2026,US,15.99",
  "options": {
    "skipDuplicates": true,
    "autoPrice": true,
    "defaultCountry": "US",
    "defaultPrice": 10,
    "tags": ["test", "import"]
  }
}
```

#### 搜索卡片
```http
GET /api/cvv/search?status=available&cardType=VISA&minPrice=10&maxPrice=50&limit=20
```

#### 獲取單卡詳情
```http
GET /api/cvv/cards/{cardId}?decrypt=true
```

#### 更新卡片狀態
```http
PATCH /api/cvv/cards/{cardId}/status
Content-Type: application/json

{
  "status": "sold"
}
```

#### 批量更新狀態
```http
PATCH /api/cvv/cards/batch-status
Content-Type: application/json

{
  "cardIds": ["card1", "card2", "card3"],
  "status": "reserved"
}
```

#### 刪除卡片
```http
DELETE /api/cvv/cards/{cardId}
```

#### 庫存統計
```http
GET /api/cvv/stats/inventory
```

#### 檢查餘額
```http
POST /api/cvv/cards/{cardId}/check-balance
```

#### 獲取配置
```http
GET /api/cvv/config
```

## 🔐 安全特性

### 數據加密
- 所有敏感數據（卡號、CVV）使用 AES-256-CBC 加密存儲
- 加密密鑰通過環境變數配置
- 支持數據解密（僅限授權用戶）

### 訪問控制
- 基於 Firebase Auth 的用戶認證
- 角色權限管理
- API 訪問日誌記錄

## 📊 數據模型

### CVV 卡片結構
```typescript
interface CVVCard {
  id?: string;
  cardNumber: string;          // 加密存儲
  cvv: string;                 // 加密存儲
  expiryMonth: string;
  expiryYear: string;
  cardType: CVVType;
  cardLevel: CVVLevel;
  country: string;
  bank?: string;
  price: number;
  status: CVVStatus;
  quality: number;
  balance?: number;
  // ... 更多字段
}
```

### 支持狀態
- `available`: 可用
- `sold`: 已售出
- `reserved`: 保留中
- `invalid`: 無效
- `expired`: 已過期

### 支持類型
- `VISA`: Visa 卡
- `MASTERCARD`: Mastercard
- `AMEX`: American Express
- `DISCOVER`: Discover
- `UNIONPAY`: 銀聯卡
- `JCB`: JCB 卡

## 🧪 測試

### 運行測試
```bash
# 測試 CVV 服務
npm run test:cvv

# 運行所有測試
npm test
```

### 測試覆蓋
- 服務層邏輯測試
- API 路由測試
- 數據驗證測試
- 錯誤處理測試

## 📈 性能優化

### 數據庫優化
- 使用 Firestore 索引優化查詢
- 批量操作減少數據庫請求
- 分頁查詢支持大量數據

### 緩存策略
- 統計數據緩存
- 配置信息緩存
- 用戶權限緩存

## 🚨 錯誤處理

### 統一錯誤格式
```typescript
interface CVVApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: Date;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 常見錯誤碼
- `400`: 請求參數錯誤
- `401`: 未授權訪問
- `403`: 權限不足
- `404`: 資源不存在
- `500`: 服務器內部錯誤

## 🔧 開發指南

### 添加新端點
1. 在 `src/routes/cvv.ts` 中添加路由
2. 在 `src/services/cvv.ts` 中實現業務邏輯
3. 更新類型定義 `src/types/cvv.ts`
4. 添加測試用例

### 數據庫操作
```typescript
// 查詢
const snapshot = await this.db.collection('cvv_cards')
  .where('status', '==', CVVStatus.AVAILABLE)
  .limit(10)
  .get();

// 更新
await this.db.collection('cvv_cards').doc(cardId).update({
  status: CVVStatus.SOLD,
  soldDate: new Date()
});

// 批量操作
const batch = this.db.batch();
cardIds.forEach(id => {
  const ref = this.db.collection('cvv_cards').doc(id);
  batch.update(ref, { status: CVVStatus.RESERVED });
});
await batch.commit();
```

## 📝 更新日誌

### v2.0.0 (2025-12-28)
- ✅ 完成 CVV 完整類型定義
- ✅ 實現 CVV 服務層（加密、導入、搜索、統計）
- ✅ 創建 CVV API 路由（9個端點）
- ✅ 集成 Express 應用
- 🔄 TypeScript 錯誤修復中

### v1.0.0 (2025-08-26)
- ✅ 基礎 Firebase Functions 架構
- ✅ 基本服務層實現
- ✅ 簡單 API 端點

## 🤝 貢獻指南

1. Fork 項目
2. 創建功能分支
3. 提交更改
4. 發起 Pull Request

## 📄 許可證

本項目僅供學習和研究使用，請遵守相關法律法規。

## 🆘 支持

如有問題，請：
1. 查看本文檔
2. 檢查錯誤日誌
3. 提交 Issue
4. 聯繫開發團隊

---

**CVV Bot Functions** - 專業的 CVV 交易後端服務 🚀
