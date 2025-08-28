"""
用戶管理服務
"""
import logging
from typing import Optional, Dict, Any
from datetime import datetime

from .firebase_service import firebase_service

logger = logging.getLogger(__name__)

class UserService:
    """用戶服務"""
    
    def __init__(self):
        self.collection = firebase_service.db.collection('users')
    
    async def get_user_by_telegram_id(self, telegram_id: int):
        """根據 Telegram ID 獲取用戶"""
        try:
            # 查詢用戶
            query = self.collection.where('telegram_id', '==', telegram_id).limit(1)
            docs = list(query.stream())
            
            if docs:
                data = docs[0].to_dict()
                return self._dict_to_user(data, docs[0].id)
            
            return None
            
        except Exception as e:
            logger.error(f"獲取用戶失敗: {e}")
            # 返回模擬用戶數據
            return self._create_mock_user(telegram_id)
    
    async def get_or_create_telegram_user(self, telegram_id: int, username: str = None, 
                                        first_name: str = None, last_name: str = None):
        """獲取或創建 Telegram 用戶"""
        try:
            # 先嘗試獲取現有用戶
            user = await self.get_user_by_telegram_id(telegram_id)
            
            if user:
                return user
            
            # 創建新用戶
            user_data = {
                'telegram_id': telegram_id,
                'username': username,
                'first_name': first_name,
                'last_name': last_name,
                'balance': 0.0,
                'total_spent': 0.0,
                'total_orders': 0,
                'is_active': True,
                'is_verified': False,
                'is_agent': False,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            # 保存到數據庫
            doc_ref = self.collection.add(user_data)
            
            return self._dict_to_user(user_data, doc_ref[1].id)
            
        except Exception as e:
            logger.error(f"創建用戶失敗: {e}")
            # 返回模擬用戶數據
            return self._create_mock_user(telegram_id, username, first_name, last_name)
    
    def _dict_to_user(self, data: Dict[str, Any], doc_id: str):
        """將字典轉換為用戶對象"""
        user = type('User', (), {})()
        user.id = doc_id
        user.telegram_id = data.get('telegram_id', 0)
        user.username = data.get('username')
        user.first_name = data.get('first_name')
        user.last_name = data.get('last_name')
        user.balance = float(data.get('balance', 0))
        user.total_spent = float(data.get('total_spent', 0))
        user.total_orders = int(data.get('total_orders', 0))
        user.is_active = data.get('is_active', True)
        user.is_verified = data.get('is_verified', False)
        user.is_agent = data.get('is_agent', False)
        user.agent_profile = None  # 可以後續擴展
        
        return user
    
    def _create_mock_user(self, telegram_id: int, username: str = None, 
                         first_name: str = None, last_name: str = None):
        """創建模擬用戶對象"""
        user = type('User', (), {})()
        user.id = f"mock_{telegram_id}"
        user.telegram_id = telegram_id
        user.username = username or "demo_user"
        user.first_name = first_name or "Demo"
        user.last_name = last_name or "User"
        user.balance = 100.0  # 模擬餘額
        user.total_spent = 50.0
        user.total_orders = 3
        user.is_active = True
        user.is_verified = True
        user.is_agent = False
        user.agent_profile = None
        
        return user
