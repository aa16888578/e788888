"""
用戶服務模組
提供用戶管理和認證功能
"""

import logging
from typing import List, Dict, Optional, Any
from datetime import datetime
from app.services.firebase_service import firebase_service

logger = logging.getLogger(__name__)


class UserService:
    """用戶服務類"""
    
    def __init__(self):
        self.firebase_service = firebase_service
    
    async def get_user_by_telegram_id(self, telegram_id: int) -> Optional[Dict]:
        """根據 Telegram ID 獲取用戶"""
        try:
            return await self.firebase_service.get_user_by_telegram_id(telegram_id)
        except Exception as e:
            logger.error(f"獲取用戶失敗: {e}")
            return None
    
    async def create_user(self, user_data: Dict) -> str:
        """創建新用戶"""
        try:
            return await self.firebase_service.create_user(user_data)
        except Exception as e:
            logger.error(f"創建用戶失敗: {e}")
            raise
    
    async def update_user(self, user_id: str, updates: Dict) -> bool:
        """更新用戶信息"""
        try:
            return await self.firebase_service.update_user(user_id, updates)
        except Exception as e:
            logger.error(f"更新用戶失敗: {e}")
            return False
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """根據用戶 ID 獲取用戶"""
        try:
            return await self.firebase_service.get_user_by_id(user_id)
        except Exception as e:
            logger.error(f"獲取用戶失敗: {e}")
            return None
    
    async def get_all_users(self, filters: Dict[str, Any] = None) -> List[Dict]:
        """獲取所有用戶"""
        try:
            # 這裡需要實現獲取所有用戶的邏輯
            # 暫時返回空列表，等待 Firebase 服務實現
            return []
        except Exception as e:
            logger.error(f"獲取所有用戶失敗: {e}")
            return []
    
    async def delete_user(self, user_id: str) -> bool:
        """刪除用戶"""
        try:
            # 這裡需要實現刪除用戶的邏輯
            # 暫時返回 False，等待 Firebase 服務實現
            logger.warning(f"刪除用戶功能尚未實現: {user_id}")
            return False
        except Exception as e:
            logger.error(f"刪除用戶失敗: {e}")
            return False
    
    async def get_user_statistics(self) -> Dict[str, Any]:
        """獲取用戶統計信息"""
        try:
            # 這裡需要實現用戶統計邏輯
            # 暫時返回基本統計
            return {
                'total_users': 0,
                'active_users': 0,
                'new_users_today': 0,
                'users_by_status': {}
            }
        except Exception as e:
            logger.error(f"獲取用戶統計失敗: {e}")
            return {
                'total_users': 0,
                'active_users': 0,
                'new_users_today': 0,
                'users_by_status': {}
            }
    
    async def authenticate_user(self, telegram_id: int, token: str = None) -> Optional[Dict]:
        """用戶認證"""
        try:
            user = await self.get_user_by_telegram_id(telegram_id)
            if user:
                # 基本認證邏輯
                if user.get('status') == 'active':
                    return user
                else:
                    logger.warning(f"用戶狀態非活躍: {telegram_id}")
                    return None
            else:
                logger.warning(f"用戶不存在: {telegram_id}")
                return None
        except Exception as e:
            logger.error(f"用戶認證失敗: {e}")
            return None
    
    async def update_user_last_activity(self, user_id: str) -> bool:
        """更新用戶最後活動時間"""
        try:
            updates = {
                'last_activity': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            return await self.update_user(user_id, updates)
        except Exception as e:
            logger.error(f"更新用戶活動時間失敗: {e}")
            return False


# 創建服務實例
user_service = UserService()
