#!/bin/bash

# 🚀 ShopBot 簡化啟動腳本 (VM 環境)

echo "🖥️  啟動 ShopBot (簡化版本)..."

# 進入 web 目錄
cd /home/a0928997578_gmail_com/偉大/web

echo "🌐 啟動 Next.js 前端 (VM 模式)..."
echo "📡 訪問地址:"
echo "  - 本地: http://localhost:3000"
echo "  - VM 內部: http://10.140.0.2:3000"
echo ""

# 設置 VM 環境變數並啟動
HOST=0.0.0.0 PORT=3000 npm run dev
