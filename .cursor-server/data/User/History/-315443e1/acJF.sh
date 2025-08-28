#!/bin/bash

# 🚀 ShopBot VM 環境啟動腳本

echo "🖥️  啟動 ShopBot VM 環境..."

# 設置環境變數
export HOST=0.0.0.0
export PORT=3000

# 進入項目目錄
cd /home/a0928997578_gmail_com/偉大

echo "📊 檢查系統狀態..."
echo "Node.js 版本: $(node --version)"
echo "npm 版本: $(npm --version)"
echo "當前目錄: $(pwd)"

# 啟動 Firebase Functions (後台)
echo "🔥 啟動 Firebase Functions..."
cd functions
npm run build && firebase emulators:start --only functions --host 0.0.0.0 &
FUNCTIONS_PID=$!
echo "Functions PID: $FUNCTIONS_PID"

# 等待 Functions 啟動
sleep 5

# 啟動 Next.js 前端
echo "🌐 啟動 Next.js 前端..."
cd ../web
npm run dev &
NEXTJS_PID=$!
echo "Next.js PID: $NEXTJS_PID"

echo ""
echo "🎉 ShopBot VM 環境啟動完成!"
echo ""
echo "📡 服務地址:"
echo "  前端: http://10.140.0.2:3000"
echo "  Functions: http://10.140.0.2:5001"
echo "  本地: http://localhost:3000"
echo ""
echo "🛑 停止服務: kill $FUNCTIONS_PID $NEXTJS_PID"
echo ""

# 等待用戶中斷
wait
