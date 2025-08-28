"""
CVV Python Bot 主應用程序
"""
import logging
import uvicorn
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api import telegram_api, config_api, payment_api, ai_classification_api, admin_dashboard_api
from app.services.firebase_service import firebase_service

# 設置日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """應用程序生命週期管理"""
    # 啟動時初始化
    logger.info("🚀 CVV Python Bot 正在啟動...")
    
    try:
        # 1. 初始化後台配置
        logger.info("📋 正在初始化後台配置...")
        await settings.initialize_from_backend()
        
        # 2. 檢查 Firebase 連接
        logger.info("🔥 正在檢查 Firebase 連接...")
        test_collection = firebase_service.db.collection('_health_check')
        test_doc = test_collection.document('test')
        test_doc.set({'timestamp': 'startup', 'status': 'ok'})
        logger.info("✅ Firebase 連接成功")
        
        # 3. 驗證關鍵配置
        telegram_token = await settings.get_config('TELEGRAM_BOT_TOKEN')
        if telegram_token:
            logger.info("✅ Telegram Bot Token 已配置")
        else:
            logger.warning("⚠️ Telegram Bot Token 未配置")
        
        logger.info("🎯 CVV Python Bot 啟動完成")
        
    except Exception as e:
        logger.error(f"❌ 啟動失敗: {e}")
        raise
    
    yield
    
    # 關閉時清理
    logger.info("🛑 CVV Python Bot 正在關閉...")

# 創建 FastAPI 應用程序
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="CVV Bot 多平台信用卡交易系統 Python 後端",
    lifespan=lifespan
)

# 添加 CORS 中間件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生產環境中應該限制來源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 掛載靜態文件
app.mount("/static", StaticFiles(directory="static"), name="static")

# 全局異常處理器
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局異常處理"""
    logger.error(f"未處理的異常: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "內部服務器錯誤",
            "message": "請稍後再試或聯繫管理員",
            "request_id": str(id(request))
        }
    )

# 健康檢查端點
@app.get("/")
async def root():
    """根端點"""
    return {
        "message": "CVV Python Bot API",
        "version": settings.VERSION,
        "status": "operational"
    }

# 管理後台入口
@app.get("/admin")
async def admin_dashboard():
    """管理後台入口"""
    return {
        "message": "CVV Bot 管理後台",
        "dashboard_url": "/static/admin_dashboard.html",
        "api_endpoints": {
            "dashboard_stats": "/api/admin/dashboard/stats",
            "ai_classify": "/api/admin/ai/classify",
            "ai_batch_classify": "/api/admin/ai/classify/batch",
            "search_cards": "/api/admin/search/cards",
            "stock_operation": "/api/admin/stock/operation"
        }
    }

@app.get("/health")
async def health_check():
    """健康檢查"""
    try:
        # 檢查 Firebase 連接
        test_collection = firebase_service.db.collection('_health_check')
        test_doc = test_collection.document('health')
        test_doc.set({'timestamp': 'health_check', 'status': 'ok'})
        
        return {
            "status": "healthy",
            "timestamp": "2025-01-27T12:00:00Z",
            "services": {
                "firebase": "connected",
                "telegram_api": "ready"
            },
            "version": settings.VERSION
        }
    except Exception as e:
        logger.error(f"健康檢查失敗: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )

# API 狀態端點
@app.get("/api/status")
async def api_status():
    """API 狀態"""
    return {
        "status": "operational",
        "version": settings.VERSION,
        "services": [
            "Telegram Bot API",
            "Firebase Database",
            "CVV 管理系統",
            "用戶管理系統",
            "代理商系統",
            "支付系統"
        ],
        "endpoints": {
            "telegram": "/api/telegram/*",
            "health": "/health",
            "status": "/api/status"
        },
        "environment": {
            "debug": settings.DEBUG,
            "host": settings.HOST,
            "port": settings.PORT
        }
    }

# 註冊路由
app.include_router(
    telegram_api.router,
    prefix="/api",
    tags=["Telegram Bot"]
)

app.include_router(
    config_api.router,
    prefix="/api/admin",
    tags=["Configuration Management"]
)

app.include_router(
    payment_api.router,
    prefix="/api/payment",
    tags=["Payment System"]
)

app.include_router(
    ai_classification_api.router,
    prefix="/api",
    tags=["AI Classification"]
)

app.include_router(
    admin_dashboard_api.router,
    tags=["Admin Dashboard"]
)

# Webhook 端點（用於 Telegram Bot）
@app.post("/webhook/telegram")
async def telegram_webhook(request: Request):
    """Telegram Webhook 端點"""
    try:
        update_data = await request.json()
        logger.info(f"收到 Telegram 更新: {update_data}")
        
        # 這裡會處理 Telegram 的更新
        # 實際的處理邏輯會在 Telegram Bot 處理器中實現
        
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"處理 Telegram webhook 失敗: {e}")
        raise HTTPException(status_code=400, detail="Invalid webhook data")

if __name__ == "__main__":
    # 運行應用程序
    logger.info(f"🚀 啟動 CVV Python Bot 在 {settings.HOST}:{settings.PORT}")
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
