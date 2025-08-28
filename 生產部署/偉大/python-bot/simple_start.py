#!/usr/bin/env python3
"""
CVV Python Bot 簡單啟動腳本
只啟動 FastAPI 服務器，不啟動 Telegram Bot
"""
import uvicorn
import logging

# 設置日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info("🚀 啟動 CVV Bot FastAPI 服務器...")
    logger.info("📡 服務地址: http://0.0.0.0:8000")
    logger.info("📊 管理後台: http://0.0.0.0:8000/admin")
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            log_level="info",
            reload=False
        )
    except KeyboardInterrupt:
        logger.info("🛑 收到停止信號，正在關閉服務...")
    except Exception as e:
        logger.error(f"❌ 服務啟動失敗: {e}")
        raise
