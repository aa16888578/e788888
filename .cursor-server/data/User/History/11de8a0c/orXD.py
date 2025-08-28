#!/usr/bin/env python3
"""
CVV Python Bot 啟動腳本
同時運行 FastAPI 服務器和 Telegram Bot
"""
import asyncio
import logging
import signal
import sys
from concurrent.futures import ThreadPoolExecutor
import uvicorn

from app.core.config import settings
from app.bot.telegram_bot import telegram_bot

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

class CVVBotRunner:
    """CVV Bot 運行器"""
    
    def __init__(self):
        self.running = False
        self.tasks = []
    
    async def start_fastapi_server(self):
        """啟動 FastAPI 服務器"""
        logger.info("🚀 啟動 FastAPI 服務器...")
        
        config = uvicorn.Config(
            "main:app",
            host=settings.HOST,
            port=settings.PORT,
            log_level="info",
            reload=False  # 生產環境不使用重載
        )
        
        server = uvicorn.Server(config)
        await server.serve()
    
    async def start_telegram_bot(self):
        """啟動 Telegram Bot"""
        logger.info("🤖 啟動 Telegram Bot...")
        
        try:
            await telegram_bot.start_polling()
        except Exception as e:
            logger.error(f"Telegram Bot 啟動失敗: {e}")
            raise
    
    async def start_all_services(self):
        """啟動所有服務"""
        logger.info("🎯 CVV Python Bot 系統啟動中...")
        
        self.running = True
        
        # 創建任務
        fastapi_task = asyncio.create_task(
            self.start_fastapi_server(),
            name="FastAPI-Server"
        )
        
        telegram_task = asyncio.create_task(
            self.start_telegram_bot(),
            name="Telegram-Bot"
        )
        
        self.tasks = [fastapi_task, telegram_task]
        
        try:
            # 等待所有任務完成
            await asyncio.gather(*self.tasks)
        except asyncio.CancelledError:
            logger.info("📴 收到停止信號，正在關閉服務...")
        except Exception as e:
            logger.error(f"服務運行錯誤: {e}")
        finally:
            await self.stop_all_services()
    
    async def stop_all_services(self):
        """停止所有服務"""
        logger.info("🛑 正在停止所有服務...")
        
        self.running = False
        
        # 停止 Telegram Bot
        try:
            await telegram_bot.stop()
        except Exception as e:
            logger.error(f"停止 Telegram Bot 失敗: {e}")
        
        # 取消所有任務
        for task in self.tasks:
            if not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass
        
        logger.info("✅ 所有服務已停止")
    
    def setup_signal_handlers(self):
        """設置信號處理器"""
        def signal_handler(signum, frame):
            logger.info(f"收到信號 {signum}，準備停止...")
            # 創建新的事件循環來處理停止
            asyncio.create_task(self.stop_all_services())
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)

async def main():
    """主函數"""
    logger.info("=" * 60)
    logger.info("🎯 CVV Python Bot 系統")
    logger.info("=" * 60)
    logger.info(f"📋 配置信息:")
    logger.info(f"   • 應用名稱: {settings.APP_NAME}")
    logger.info(f"   • 版本: {settings.VERSION}")
    logger.info(f"   • 主機: {settings.HOST}")
    logger.info(f"   • 端口: {settings.PORT}")
    logger.info(f"   • 調試模式: {settings.DEBUG}")
    logger.info(f"   • Telegram Bot: {'已配置' if settings.TELEGRAM_BOT_TOKEN else '未配置'}")
    logger.info(f"   • Firebase: {'已配置' if settings.FIREBASE_PROJECT_ID else '未配置'}")
    logger.info("=" * 60)
    
    # 檢查必要配置
    if not settings.TELEGRAM_BOT_TOKEN:
        logger.error("❌ TELEGRAM_BOT_TOKEN 未設置")
        sys.exit(1)
    
    if not settings.FIREBASE_PROJECT_ID:
        logger.error("❌ Firebase 配置未完整設置")
        sys.exit(1)
    
    # 創建並啟動運行器
    runner = CVVBotRunner()
    runner.setup_signal_handlers()
    
    try:
        await runner.start_all_services()
    except KeyboardInterrupt:
        logger.info("📴 收到中斷信號")
    except Exception as e:
        logger.error(f"系統錯誤: {e}")
        sys.exit(1)
    
    logger.info("👋 系統已退出")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 再見！")
    except Exception as e:
        logger.error(f"啟動失敗: {e}")
        sys.exit(1)
