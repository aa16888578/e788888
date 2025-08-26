# ShopBot 管理後台 - 第四階段

## 🎯 項目概述

這是 ShopBot 多平台電商系統的第四階段 - 管理後台。該階段建立了完整的 Next.js 15 + TypeScript 管理應用框架，提供全方位的電商管理功能。

## ✨ 已完成功能

### 🏗️ 基礎架構
- ✅ Next.js 15.5.0 應用框架
- ✅ TypeScript 5 類型系統
- ✅ Tailwind CSS 4 樣式框架
- ✅ Firebase 後端集成
- ✅ 響應式設計

### 🎨 用戶界面
- ✅ 側邊欄導航
- ✅ 頂部導航欄
- ✅ 儀表板組件
- ✅ 移動端適配

### 🔧 核心功能
- ✅ 用戶認證系統
- ✅ 數據庫服務層
- ✅ 自定義 Hooks
- ✅ 工具函數庫

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 環境配置

複製環境變數範例文件：

```bash
cp env.local.example .env.local
```

編輯 `.env.local` 文件，填入您的 Firebase 配置：

```env
# Firebase 配置
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Telegram Bot 配置
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_bot_token
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
```

### 3. 運行開發服務器

```bash
npm run dev
```

訪問 [http://localhost:3000](http://localhost:3000) 查看應用。

### 4. 構建生產版本

```bash
npm run build
npm start
```

## 📁 項目結構

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── layout.tsx         # 根佈局
│   ├── page.tsx           # 主頁面
│   └── globals.css        # 全局樣式
├── components/             # React 組件
│   ├── Sidebar.tsx        # 側邊欄
│   ├── Header.tsx          # 頂部導航
│   └── Dashboard.tsx      # 儀表板
├── hooks/                  # 自定義 Hooks
│   ├── useAuth.ts         # 認證 Hook
│   └── useData.ts         # 數據 Hook
├── lib/                    # 工具庫
│   ├── firebase.ts        # Firebase 配置
│   ├── database.ts        # 數據庫服務
│   └── utils.ts           # 通用工具
└── types/                  # TypeScript 類型
    └── index.ts           # 類型定義
```

## 🔌 主要依賴

- **Next.js 15.5.0** - React 全棧框架
- **TypeScript 5** - 類型安全的 JavaScript
- **Tailwind CSS 4** - 實用優先的 CSS 框架
- **Firebase 10.7.0** - 後端即服務
- **React Hook Form** - 表單處理
- **Recharts** - 圖表組件
- **Framer Motion** - 動畫庫

## 🎨 設計特色

### 響應式設計
- 移動端優先的設計理念
- 自適應側邊欄
- 觸控友好的界面

### 現代化 UI
- 清晰的視覺層次
- 一致的設計語言
- 流暢的交互動畫

### 可訪問性
- 語義化 HTML
- 鍵盤導航支持
- 高對比度設計

## 🔐 認證系統

### Telegram 集成
- 基於 Telegram 用戶 ID 的認證
- 無需密碼的登入體驗
- 安全的會話管理

### 權限控制
- 角色基礎的權限系統
- 功能級別的訪問控制
- 細粒度的權限管理

## 📊 數據管理

### 實時同步
- Firestore 實時數據庫
- 多平台數據一致性
- 離線數據支持

### 數據服務
- 用戶管理服務
- 商品管理服務
- 訂單管理服務
- 代理管理服務
- 支付管理服務

## 🚧 開發狀態

### 當前階段
- **第四階段：管理後台** ✅ 完成
- 進度：4/7 階段 (57.1%)

### 已完成功能
- 基礎架構設置
- 用戶界面框架
- 數據服務層
- 認證系統
- 儀表板組件

### 下一步計劃
- 第五階段：代理系統
- 第六階段：支付系統
- 第七階段：整合測試

## 🤝 貢獻指南

1. Fork 項目
2. 創建功能分支
3. 提交更改
4. 發起 Pull Request

## 📄 許可證

ISC License

## 📞 聯繫方式

- 項目團隊：GMS Team
- 項目名稱：ShopBot 多平台電商系統
- 版本：1.0.0

---

**第四階段已完成！** 🎉

管理後台已經建立了堅實的技術基礎，為後續的代理系統、支付系統和整合測試奠定了基礎。系統採用現代化的技術棧，具有良好的可擴展性、安全性和維護性。
