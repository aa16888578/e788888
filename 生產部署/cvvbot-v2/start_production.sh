#!/bin/bash
# CVV Bot 生產環境啟動腳本

set -e

echo "🚀 啟動 CVV Bot 生產環境..."

# 設置生產環境變量
export TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-YOUR_NEW_BOT_TOKEN_HERE}"
export FIREBASE_PROJECT_ID="cvvbot-production"
export SECRET_KEY="cvv_production_secret_key_2025_secure_32chars"
export ENCRYPTION_KEY="cvv_encryption_key_32_bytes_secure"
export DEBUG="false"
export HOST="0.0.0.0"
export PORT="8000"

# 激活虛擬環境
source venv/bin/activate

# 啟動生產服務器
echo "✅ 配置完成，啟動生產服務器..."
echo "🤖 Telegram Bot: @e7_69testbot"
echo "🌐 API 服務器: http://0.0.0.0:8000"
echo "📱 所有內嵌鍵盤功能已就緒"

# 使用 gunicorn 啟動（更適合生產環境）
if command -v gunicorn &> /dev/null; then
    echo "使用 Gunicorn 啟動生產服務器..."
    gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 --daemon --pid cvvbot.pid --log-file production.log
else
    echo "使用 Uvicorn 啟動生產服務器..."
    nohup uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4 > production.log 2>&1 &
    echo $! > cvvbot.pid
fi

echo "✅ CVV Bot 生產環境啟動完成！"
echo "📋 進程 ID: $(cat cvvbot.pid)"
echo "📄 日誌文件: production.log"
