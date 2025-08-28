#!/usr/bin/env python3
"""
CVV Telegram Bot 簡化啟動器
直接啟動 Bot，無需複雜配置
"""
import os
import asyncio
import logging
import sys
from pathlib import Path

# 設置環境變量
os.environ['TELEGRAM_BOT_TOKEN'] = "8469518342:AAG7odEC49CcWeBr6eJ9GbjGdFl5SzlwL54"
os.environ['FIREBASE_PROJECT_ID'] = "cvvbot-production"
os.environ['SECRET_KEY'] = "cvv_production_secret_key_2025_secure_32chars"

# 添加項目根目錄到 Python 路徑
sys.path.insert(0, str(Path(__file__).parent))

# 設置日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('bot.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

async def main():
    """主函數"""
    logger.info("🚀 啟動 CVV Telegram Bot...")
    logger.info("🤖 Bot: @e7_69testbot") 
    logger.info("📱 Token: 已配置")
    logger.info("✅ 所有內嵌鍵盤功能已就緒")
    
    try:
        # 導入並初始化配置
        from app.core.config import settings
        await settings.initialize_from_backend()
        
        # 導入並啟動 Bot
        from app.bot.telegram_bot import CVVTelegramBot
        
        # 創建 Bot 實例
        bot = CVVTelegramBot()
        
        # 啟動 Bot
        await bot.initialize()
        logger.info("✅ CVV Telegram Bot 啟動成功！")
        
        # 保持運行
        while True:
            await asyncio.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("⏹️ 收到停止信號")
    except Exception as e:
        logger.error(f"❌ Bot 啟動失敗: {e}")
        import traceback
        traceback.print_exc()
    finally:
        logger.info("🛑 CVV Telegram Bot 已停止")

if __name__ == "__main__":
    asyncio.run(main())
