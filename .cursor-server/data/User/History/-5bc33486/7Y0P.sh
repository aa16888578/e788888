#!/bin/bash

# 顯示歡迎訊息
echo "🤖 智能助手開發工具啟動腳本"
echo "================================"

# 檢查 Node.js 環境
if ! command -v node &> /dev/null; then
    echo "❌ 找不到 Node.js，請先安裝 Node.js"
    exit 1
fi

# 檢查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 找不到 npm，請先安裝 npm"
    exit 1
fi

# 安裝依賴
echo "📦 安裝依賴中..."
npm install

# 啟動服務
echo "🚀 啟動開發服務..."
npm run 開發
