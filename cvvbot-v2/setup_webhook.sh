#!/bin/bash
# Telegram Webhook 設置腳本

BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-YOUR_NEW_BOT_TOKEN_HERE}"

echo "🔗 設置 Telegram Webhook..."

# 如果您有域名，請替換下面的 URL
# WEBHOOK_URL="https://your-domain.com/webhook/telegram"

# 暫時使用 ngrok 或類似服務來暴露本地服務器
echo "⚠️  注意：生產環境需要公開的 HTTPS URL"
echo "📋 請選擇以下方案之一："
echo ""
echo "方案 1: 使用 ngrok (推薦用於測試)"
echo "  1. 安裝 ngrok: https://ngrok.com/"
echo "  2. 運行: ngrok http 8000"
echo "  3. 複製 HTTPS URL 並設置 webhook"
echo ""
echo "方案 2: 使用雲服務器 (生產推薦)"
echo "  1. 部署到 Google Cloud Run / AWS / Azure"
echo "  2. 配置 SSL 證書"
echo "  3. 設置域名"
echo ""
echo "方案 3: 使用 Telegram Bot 長輪詢模式"
echo "  1. 不需要 webhook"
echo "  2. Bot 主動拉取消息"
echo "  3. 適合開發和小規模使用"

# 檢查當前 webhook 狀態
echo ""
echo "📋 當前 Webhook 狀態:"
curl -s "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo" | python3 -m json.tool

echo ""
echo "🔧 如果您有公開的 HTTPS URL，請運行："
echo "curl -X POST \"https://api.telegram.org/bot$BOT_TOKEN/setWebhook\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"url\": \"https://your-domain.com/webhook/telegram\"}'"
