#!/usr/bin/env python3
"""
CVV Telegram Bot 獨立啟動器
使用長輪詢模式，無需 Webhook
"""
import asyncio
import logging
import os
import sys
from pathlib import Path

# 添加項目根目錄到 Python 路徑
sys.path.insert(0, str(Path(__file__).parent))

from app.bot.telegram_bot import telegram_bot

# 設置日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('telegram_bot.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

async def main():
    """主函數"""
    # 設置環境變量
    token = os.getenv('TELEGRAM_BOT_TOKEN', '8469518342:AAG7odEC49CcWeBr6eJ9GbjGdFl5SzlwL54')
    os.environ['TELEGRAM_BOT_TOKEN'] = token
    os.environ['FIREBASE_PROJECT_ID'] = "cvvbot-production"
    os.environ['SECRET_KEY'] = "cvv_production_secret_key_2025_secure_32chars"
    
    # 確保配置正確載入
    from app.core.config import settings
    await settings.initialize_from_backend()
    
    logger.info("🚀 啟動 CVV Telegram Bot...")
    logger.info("🤖 Bot: @e7_69testbot")
    logger.info("📱 模式: 長輪詢（無需 Webhook）")
    logger.info("✅ 所有內嵌鍵盤功能已就緒")
    
    try:
        # 啟動 Telegram Bot
        await telegram_bot.start_polling()
    except KeyboardInterrupt:
        logger.info("👋 收到停止信號")
    except Exception as e:
        logger.error(f"❌ Bot 運行錯誤: {e}")
    finally:
        await telegram_bot.stop()
        logger.info("🛑 CVV Telegram Bot 已停止")

if __name__ == "__main__":
    # 運行 Bot
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 CVV Telegram Bot 已停止")
    except Exception as e:
        print(f"\n❌ 啟動失敗: {e}")
        sys.exit(1)
