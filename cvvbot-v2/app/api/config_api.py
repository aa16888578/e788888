"""
後台配置管理 API
提供環境變量的 CRUD 操作
"""
from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, Optional
from pydantic import BaseModel
import logging

from ..services.config_service import config_service
from ..core.config import settings

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)

# 請求/響應模型
class ConfigUpdateRequest(BaseModel):
    """配置更新請求"""
    key: str
    value: Any
    description: Optional[str] = None

class ConfigResponse(BaseModel):
    """配置響應"""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

class ConfigListResponse(BaseModel):
    """配置列表響應"""
    success: bool
    total: int
    configs: Dict[str, Any]

# 簡單的 API 密鑰驗證（生產環境應使用更安全的方法）
async def verify_admin_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """驗證管理員 Token"""
    # 這裡應該實現真正的 Token 驗證
    # 暫時使用簡單的密鑰檢查
    expected_token = await settings.get_config('ADMIN_API_TOKEN', 'admin_secret_token')
    
    if credentials.credentials != expected_token:
        raise HTTPException(
            status_code=401,
            detail="無效的 API Token"
        )
    
    return credentials.credentials

@router.get("/configs", response_model=ConfigListResponse)
async def get_all_configs(token: str = Depends(verify_admin_token)):
    """獲取所有配置"""
    try:
        configs = await config_service.get_all_configs()
        
        # 過濾敏感信息
        safe_configs = {}
        sensitive_keys = ['FIREBASE_PRIVATE_KEY', 'SECRET_KEY', 'ENCRYPTION_KEY', 'TELEGRAM_BOT_TOKEN']
        
        for key, value in configs.items():
            if key in sensitive_keys:
                safe_configs[key] = "***隱藏***" if value else ""
            else:
                safe_configs[key] = value
        
        return ConfigListResponse(
            success=True,
            total=len(safe_configs),
            configs=safe_configs
        )
        
    except Exception as e:
        logger.error(f"獲取配置失敗: {e}")
        raise HTTPException(status_code=500, detail="獲取配置失敗")

@router.get("/configs/{key}")
async def get_config(key: str, token: str = Depends(verify_admin_token)):
    """獲取單個配置"""
    try:
        value = await config_service.get_config(key)
        
        # 檢查是否為敏感信息
        sensitive_keys = ['FIREBASE_PRIVATE_KEY', 'SECRET_KEY', 'ENCRYPTION_KEY', 'TELEGRAM_BOT_TOKEN']
        if key in sensitive_keys and value:
            display_value = "***隱藏***"
        else:
            display_value = value
        
        return ConfigResponse(
            success=True,
            message=f"配置 {key} 獲取成功",
            data={key: display_value}
        )
        
    except Exception as e:
        logger.error(f"獲取配置 {key} 失敗: {e}")
        raise HTTPException(status_code=500, detail=f"獲取配置 {key} 失敗")

@router.post("/configs", response_model=ConfigResponse)
async def create_or_update_config(
    request: ConfigUpdateRequest,
    token: str = Depends(verify_admin_token)
):
    """創建或更新配置"""
    try:
        success = await config_service.set_config(request.key, request.value)
        
        if success:
            # 如果是關鍵配置，更新全局設置
            if hasattr(settings, request.key):
                await settings.set_config(request.key, request.value)
            
            return ConfigResponse(
                success=True,
                message=f"配置 {request.key} 更新成功",
                data={request.key: "已更新"}
            )
        else:
            raise HTTPException(status_code=500, detail="配置更新失敗")
            
    except Exception as e:
        logger.error(f"更新配置 {request.key} 失敗: {e}")
        raise HTTPException(status_code=500, detail=f"更新配置失敗: {str(e)}")

@router.put("/configs/{key}", response_model=ConfigResponse)
async def update_config(
    key: str,
    value: Any,
    token: str = Depends(verify_admin_token)
):
    """更新指定配置"""
    try:
        success = await config_service.set_config(key, value)
        
        if success:
            # 如果是關鍵配置，更新全局設置
            if hasattr(settings, key):
                await settings.set_config(key, value)
            
            return ConfigResponse(
                success=True,
                message=f"配置 {key} 更新成功"
            )
        else:
            raise HTTPException(status_code=500, detail="配置更新失敗")
            
    except Exception as e:
        logger.error(f"更新配置 {key} 失敗: {e}")
        raise HTTPException(status_code=500, detail=f"更新配置失敗: {str(e)}")

@router.post("/configs/batch", response_model=ConfigResponse)
async def batch_update_configs(
    configs: Dict[str, Any],
    token: str = Depends(verify_admin_token)
):
    """批量更新配置"""
    try:
        success_count = 0
        failed_configs = []
        
        for key, value in configs.items():
            try:
                success = await config_service.set_config(key, value)
                if success:
                    success_count += 1
                    # 如果是關鍵配置，更新全局設置
                    if hasattr(settings, key):
                        await settings.set_config(key, value)
                else:
                    failed_configs.append(key)
            except Exception as e:
                logger.error(f"批量更新配置 {key} 失敗: {e}")
                failed_configs.append(key)
        
        message = f"成功更新 {success_count} 個配置"
        if failed_configs:
            message += f"，失敗: {', '.join(failed_configs)}"
        
        return ConfigResponse(
            success=len(failed_configs) == 0,
            message=message,
            data={
                "success_count": success_count,
                "failed_configs": failed_configs
            }
        )
        
    except Exception as e:
        logger.error(f"批量更新配置失敗: {e}")
        raise HTTPException(status_code=500, detail="批量更新配置失敗")

@router.get("/configs/reload")
async def reload_configs(token: str = Depends(verify_admin_token)):
    """重新載入配置"""
    try:
        # 重新初始化配置
        await settings.initialize_from_backend()
        
        return ConfigResponse(
            success=True,
            message="配置重新載入成功"
        )
        
    except Exception as e:
        logger.error(f"重新載入配置失敗: {e}")
        raise HTTPException(status_code=500, detail="重新載入配置失敗")

@router.get("/configs/status")
async def get_config_status():
    """獲取配置狀態（無需認證）"""
    try:
        # 檢查關鍵配置是否存在
        telegram_token = bool(await settings.get_config('TELEGRAM_BOT_TOKEN'))
        firebase_project = bool(await settings.get_config('FIREBASE_PROJECT_ID'))
        
        return {
            "status": "operational",
            "config_source": "backend_firebase",
            "key_configs": {
                "telegram_bot_configured": telegram_token,
                "firebase_configured": firebase_project,
                "encryption_enabled": await settings.get_config('CVV_ENCRYPTION_ENABLED', True)
            },
            "last_updated": "dynamic"
        }
        
    except Exception as e:
        logger.error(f"獲取配置狀態失敗: {e}")
        return {
            "status": "error",
            "error": str(e)
        }
