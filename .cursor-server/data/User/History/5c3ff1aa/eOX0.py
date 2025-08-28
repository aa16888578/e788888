"""
CVV Bot 核心配置
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # 應用配置
    APP_NAME: str = "CVV Bot API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # API 配置
    API_V1_STR: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Telegram Bot 配置
    TELEGRAM_BOT_TOKEN: str
    TELEGRAM_WEBHOOK_URL: Optional[str] = None
    TELEGRAM_WEBHOOK_SECRET: Optional[str] = None
    
    # Firebase 配置
    FIREBASE_PROJECT_ID: str
    FIREBASE_PRIVATE_KEY: str
    FIREBASE_CLIENT_EMAIL: str
    FIREBASE_DATABASE_URL: Optional[str] = None
    
    # 數據庫配置
    DATABASE_URL: str = "postgresql://user:password@localhost/cvvbot"
    REDIS_URL: str = "redis://localhost:6379"
    
    # 安全配置
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ENCRYPTION_KEY: str
    
    # 支付配置
    TRON_NETWORK: str = "mainnet"  # mainnet, testnet
    USDT_CONTRACT_ADDRESS: str = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
    
    # CVV 配置
    CVV_ENCRYPTION_ENABLED: bool = True
    CVV_BATCH_SIZE: int = 1000
    CVV_CACHE_TTL: int = 3600  # 1 hour
    
    # 代理系統配置
    AGENT_COMMISSION_RATES: dict = {
        1: 0.05,  # 5%
        2: 0.08,  # 8%
        3: 0.12,  # 12%
        4: 0.15,  # 15%
        5: 0.18,  # 18%
    }
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# 創建全局設置實例
settings = Settings()
