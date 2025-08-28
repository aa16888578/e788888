"""
後台配置管理服務
從 Firebase 動態載入環境變量配置
"""
import logging
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime
import json

from ..services.firebase_service import firebase_service

logger = logging.getLogger(__name__)

class ConfigService:
    """配置管理服務"""
    
    def __init__(self):
        self._config_cache: Dict[str, Any] = {}
        self._last_update: Optional[datetime] = None
        self._cache_ttl = 300  # 5分鐘緩存
    
    async def get_config(self, key: str, default: Any = None) -> Any:
        """獲取配置值"""
        try:
            # 檢查緩存是否過期
            if self._should_refresh_cache():
                await self._refresh_config_cache()
            
            return self._config_cache.get(key, default)
            
        except Exception as e:
            logger.error(f"獲取配置 {key} 失敗: {e}")
            return default
    
    async def set_config(self, key: str, value: Any) -> bool:
        """設置配置值"""
        try:
            # 保存到 Firebase
            config_ref = firebase_service.db.collection('system_config').document('environment')
            
            # 獲取現有配置
            doc = config_ref.get()
            current_config = doc.to_dict() if doc.exists else {}
            
            # 更新配置
            current_config[key] = value
            current_config['updated_at'] = datetime.utcnow()
            current_config['updated_by'] = 'python_bot_system'
            
            # 保存到 Firebase
            config_ref.set(current_config)
            
            # 更新本地緩存
            self._config_cache[key] = value
            
            logger.info(f"配置 {key} 已更新")
            return True
            
        except Exception as e:
            logger.error(f"設置配置 {key} 失敗: {e}")
            return False
    
    async def get_all_configs(self) -> Dict[str, Any]:
        """獲取所有配置"""
        try:
            if self._should_refresh_cache():
                await self._refresh_config_cache()
            
            return self._config_cache.copy()
            
        except Exception as e:
            logger.error(f"獲取所有配置失敗: {e}")
            return {}
    
    async def _refresh_config_cache(self):
        """刷新配置緩存"""
        try:
            config_ref = firebase_service.db.collection('system_config').document('environment')
            doc = config_ref.get()
            
            if doc.exists:
                config_data = doc.to_dict()
                
                # 移除元數據
                config_data.pop('updated_at', None)
                config_data.pop('updated_by', None)
                
                self._config_cache = config_data
                self._last_update = datetime.utcnow()
                
                logger.info("配置緩存已刷新")
            else:
                # 如果配置不存在，創建默認配置
                await self._create_default_config()
                
        except Exception as e:
            logger.error(f"刷新配置緩存失敗: {e}")
    
    def _should_refresh_cache(self) -> bool:
        """檢查是否需要刷新緩存"""
        if not self._last_update:
            return True
        
        elapsed = (datetime.utcnow() - self._last_update).total_seconds()
        return elapsed > self._cache_ttl
    
    async def _create_default_config(self):
        """創建默認配置"""
        default_config = {
            # Telegram Bot 配置
            'TELEGRAM_BOT_TOKEN': '',
            'TELEGRAM_WEBHOOK_URL': '',
            'TELEGRAM_WEBHOOK_SECRET': '',
            
            # Firebase 配置
            'FIREBASE_PROJECT_ID': '',
            'FIREBASE_PRIVATE_KEY': '',
            'FIREBASE_CLIENT_EMAIL': '',
            'FIREBASE_DATABASE_URL': '',
            
            # 安全配置
            'SECRET_KEY': 'cvv_bot_secret_key_please_change_in_production',
            'ALGORITHM': 'HS256',
            'ACCESS_TOKEN_EXPIRE_MINUTES': 30,
            'ENCRYPTION_KEY': 'cvv_encryption_key_32_bytes_long',
            
            # 支付配置
            'TRON_NETWORK': 'mainnet',
            'USDT_CONTRACT_ADDRESS': 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
            
            # CVV 配置
            'CVV_ENCRYPTION_ENABLED': True,
            'CVV_BATCH_SIZE': 1000,
            'CVV_CACHE_TTL': 3600,
            
            # 代理商配置
            'AGENT_COMMISSION_RATES': {
                1: 0.05,  # 5%
                2: 0.08,  # 8%
                3: 0.12,  # 12%
                4: 0.15,  # 15%
                5: 0.18,  # 18%
            },
            
            # 系統配置
            'APP_NAME': 'CVV Bot API',
            'VERSION': '1.0.0',
            'DEBUG': True,
            'HOST': '0.0.0.0',
            'PORT': 8000,
            
            # 元數據
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'updated_by': 'system_init'
        }
        
        try:
            config_ref = firebase_service.db.collection('system_config').document('environment')
            config_ref.set(default_config)
            
            # 更新本地緩存
            self._config_cache = {k: v for k, v in default_config.items() 
                                if k not in ['created_at', 'updated_at', 'updated_by']}
            self._last_update = datetime.utcnow()
            
            logger.info("默認配置已創建")
            
        except Exception as e:
            logger.error(f"創建默認配置失敗: {e}")
    
    async def initialize(self):
        """初始化配置服務"""
        try:
            await self._refresh_config_cache()
            logger.info("✅ 配置服務初始化完成")
        except Exception as e:
            logger.error(f"❌ 配置服務初始化失敗: {e}")
            raise

# 創建全局配置服務實例
config_service = ConfigService()
