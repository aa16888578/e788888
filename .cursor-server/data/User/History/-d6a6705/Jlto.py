#!/usr/bin/env python3
"""
CVV Bot 簡化啟動腳本 - 專門運行 Telegram Bot 和 3x3 內嵌鍵盤
"""
import asyncio
import logging
import sys

# 設置日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def main():
    """主函數"""
    logger.info("🎯 啟動 CVV Bot - 3x3 內嵌鍵盤版")
    logger.info("=" * 50)
    
    try:
        # 導入 Bot
        from app.bot.telegram_bot import telegram_bot
        from app.core.config import settings
        
        # 檢查配置
        if not settings.TELEGRAM_BOT_TOKEN:
            logger.error("❌ TELEGRAM_BOT_TOKEN 未設置")
            return
            
        logger.info("✅ 配置檢查完成")
        logger.info(f"🤖 Bot Token: {settings.TELEGRAM_BOT_TOKEN[:20]}...")
        logger.info("✨ 支持 3x3 原生內嵌鍵盤")
        
        # 初始化 Bot
        await telegram_bot.initialize()
        logger.info("✅ Telegram Bot 初始化完成")
        
        # 啟動 Bot
        logger.info("🚀 開始 Telegram Bot 輪詢...")
        logger.info("💡 發送 /start 查看 3x3 內嵌鍵盤")
        logger.info("🔥 按 Ctrl+C 停止")
        logger.info("=" * 50)
        
        await telegram_bot.start_polling()
        
    except KeyboardInterrupt:
        logger.info("📴 收到停止信號")
    except Exception as e:
        logger.error(f"❌ Bot 啟動失敗: {e}")
        import traceback
        traceback.print_exc()
    finally:
        logger.info("👋 Bot 已停止")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 再見！")
