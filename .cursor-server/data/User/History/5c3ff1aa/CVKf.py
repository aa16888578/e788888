"""
CVV Bot 核心配置
支持從後台 Firebase 動態載入配置
"""
import os
import asyncio
from typing import Optional, Dict, Any
import logging
from dotenv import load_dotenv

# 載入 .env 檔案
load_dotenv()

logger = logging.getLogger(__name__)

class DynamicSettings:
    """動態配置類 - 從後台載入配置"""
    
    def __init__(self):
        # 基礎配置（不依賴外部服務）
        self.APP_NAME: str = "CVV Bot API"
        self.VERSION: str = "1.0.0"
        self.DEBUG: bool = True
        self.API_V1_STR: str = "/api/v1"
        self.HOST: str = "0.0.0.0"
        self.PORT: int = 8000
        
        # 初始 Firebase 配置（部署後設置）
        self.FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
        self.FIREBASE_PRIVATE_KEY: str = os.getenv("FIREBASE_PRIVATE_KEY", "")
        self.FIREBASE_CLIENT_EMAIL: str = os.getenv("FIREBASE_CLIENT_EMAIL", "")
        self.FIREBASE_DATABASE_URL: Optional[str] = os.getenv("FIREBASE_DATABASE_URL")
        
        # Telegram 配置
        self.TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
        self.TELEGRAM_WEBHOOK_URL: Optional[str] = os.getenv("TELEGRAM_WEBHOOK_URL")
        self.TELEGRAM_WEBHOOK_SECRET: Optional[str] = os.getenv("TELEGRAM_WEBHOOK_SECRET")
        
        # 安全配置
        self.SECRET_KEY: str = os.getenv("SECRET_KEY", "cvv_bot_secret_key_change_in_production")
        self.ALGORITHM: str = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
        self.ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "cvv_encryption_key_32_bytes_long")
        
        # 支付配置
        self.TRON_NETWORK: str = "mainnet"
        self.USDT_CONTRACT_ADDRESS: str = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
        
        # CVV 配置
        self.CVV_ENCRYPTION_ENABLED: bool = True
        self.CVV_BATCH_SIZE: int = 1000
        self.CVV_CACHE_TTL: int = 3600
        
        # 代理商佣金配置
        self.AGENT_COMMISSION_RATES: Dict[int, float] = {
            1: 0.05, 2: 0.08, 3: 0.12, 4: 0.15, 5: 0.18
        }
        
        # 部署狀態標記
        self.DEPLOYMENT_READY: bool = bool(self.FIREBASE_PROJECT_ID and self.FIREBASE_PRIVATE_KEY)
        
        # 默認配置
        self._config_cache: Dict[str, Any] = {}
        self._initialized = False
    
    async def initialize_from_backend(self):
        """從後台載入配置"""
        if self._initialized:
            return
        
        try:
            # 延遲導入避免循環依賴
            from ..services.config_service import config_service
            
            # 初始化配置服務
            await config_service.initialize()
            
            # 載入所有配置
            backend_config = await config_service.get_all_configs()
            
            # 更新屬性
            for key, value in backend_config.items():
                if hasattr(self, key) or key.isupper():
                    setattr(self, key, value)
                    self._config_cache[key] = value
            
            self._initialized = True
            logger.info("✅ 配置已從後台載入")
            
        except Exception as e:
            logger.warning(f"⚠️ 從後台載入配置失敗，使用默認配置: {e}")
            self._set_default_config()
    
    def _set_default_config(self):
        """設置默認配置"""
        self.TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
        self.TELEGRAM_WEBHOOK_URL = os.getenv("TELEGRAM_WEBHOOK_URL")
        self.TELEGRAM_WEBHOOK_SECRET = os.getenv("TELEGRAM_WEBHOOK_SECRET")
        
        self.SECRET_KEY = os.getenv("SECRET_KEY", "cvv_bot_secret_key_change_in_production")
        self.ALGORITHM = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES = 30
        self.ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "cvv_encryption_key_32_bytes_long")
        
        self.TRON_NETWORK = "mainnet"
        self.USDT_CONTRACT_ADDRESS = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
        
        self.CVV_ENCRYPTION_ENABLED = True
        self.CVV_BATCH_SIZE = 1000
        self.CVV_CACHE_TTL = 3600
        
        self.AGENT_COMMISSION_RATES = {
            1: 0.05, 2: 0.08, 3: 0.12, 4: 0.15, 5: 0.18
        }
        
        self._initialized = True
    
    async def get_config(self, key: str, default: Any = None) -> Any:
        """動態獲取配置值"""
        if not self._initialized:
            await self.initialize_from_backend()
        
        # 優先從緩存獲取
        if key in self._config_cache:
            return self._config_cache[key]
        
        # 從屬性獲取
        if hasattr(self, key):
            return getattr(self, key)
        
        # 嘗試從後台服務獲取
        try:
            from ..services.config_service import config_service
            value = await config_service.get_config(key, default)
            self._config_cache[key] = value
            return value
        except:
            return default
    
    async def set_config(self, key: str, value: Any) -> bool:
        """動態設置配置值"""
        try:
            from ..services.config_service import config_service
            
            # 保存到後台
            success = await config_service.set_config(key, value)
            
            if success:
                # 更新本地屬性和緩存
                setattr(self, key, value)
                self._config_cache[key] = value
                
            return success
        except Exception as e:
            logger.error(f"設置配置 {key} 失敗: {e}")
            return False
    
    def get_sync(self, key: str, default: Any = None) -> Any:
        """同步獲取配置（用於非異步上下文）"""
        # 優先從緩存或屬性獲取
        if key in self._config_cache:
            return self._config_cache[key]
        
        if hasattr(self, key):
            return getattr(self, key)
        
        # 從環境變量獲取
        return os.getenv(key, default)

# 創建全局設置實例
settings = DynamicSettings()

# 為了向後兼容，提供同步訪問方式
def get_setting(key: str, default: Any = None) -> Any:
    """獲取配置的同步方法"""
    return settings.get_sync(key, default)
