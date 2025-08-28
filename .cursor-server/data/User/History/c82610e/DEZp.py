"""
Firebase 服務層
負責與 Firebase Firestore 數據庫的所有交互
"""
import json
import logging
from typing import List, Dict, Optional, Any
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from ..core.config import settings

logger = logging.getLogger(__name__)

class FirebaseService:
    """Firebase 服務類"""
    
    def __init__(self):
        self.db = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """初始化 Firebase"""
        try:
            if not firebase_admin._apps:
                # 從環境變量創建憑證
                cred_dict = {
                    "type": "service_account",
                    "project_id": settings.FIREBASE_PROJECT_ID,
                    "private_key": settings.FIREBASE_PRIVATE_KEY.replace('\\n', '\n'),
                    "client_email": settings.FIREBASE_CLIENT_EMAIL,
                }
                
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
            
            self.db = firestore.client()
            logger.info("Firebase 初始化成功")
            
        except Exception as e:
            logger.error(f"Firebase 初始化失败: {e}")
            raise
    
    # CVV 相關操作
    async def get_cvv_cards(self, filters: Dict[str, Any] = None) -> List[Dict]:
        """獲取 CVV 卡片列表"""
        try:
            collection_ref = self.db.collection('cvv_cards')
            
            if filters:
                if 'country' in filters:
                    collection_ref = collection_ref.where('country', '==', filters['country'])
                if 'card_type' in filters:
                    collection_ref = collection_ref.where('card_type', '==', filters['card_type'])
                if 'status' in filters:
                    collection_ref = collection_ref.where('status', '==', filters['status'])
                if 'min_success_rate' in filters:
                    collection_ref = collection_ref.where('success_rate', '>=', filters['min_success_rate'])
            
            docs = collection_ref.stream()
            cards = []
            
            for doc in docs:
                card_data = doc.to_dict()
                card_data['id'] = doc.id
                cards.append(card_data)
            
            return cards
            
        except Exception as e:
            logger.error(f"獲取 CVV 卡片失败: {e}")
            return []
    
    async def get_cvv_card_by_id(self, card_id: str) -> Optional[Dict]:
        """根據 ID 獲取單個 CVV 卡片"""
        try:
            doc_ref = self.db.collection('cvv_cards').document(card_id)
            doc = doc_ref.get()
            
            if doc.exists:
                card_data = doc.to_dict()
                card_data['id'] = doc.id
                return card_data
            
            return None
            
        except Exception as e:
            logger.error(f"獲取 CVV 卡片失败: {e}")
            return None
    
    async def create_cvv_card(self, card_data: Dict) -> str:
        """創建新的 CVV 卡片"""
        try:
            card_data['created_at'] = datetime.utcnow()
            card_data['updated_at'] = datetime.utcnow()
            
            doc_ref = self.db.collection('cvv_cards').add(card_data)
            return doc_ref[1].id
            
        except Exception as e:
            logger.error(f"創建 CVV 卡片失败: {e}")
            raise
    
    async def update_cvv_card(self, card_id: str, updates: Dict) -> bool:
        """更新 CVV 卡片"""
        try:
            updates['updated_at'] = datetime.utcnow()
            
            doc_ref = self.db.collection('cvv_cards').document(card_id)
            doc_ref.update(updates)
            
            return True
            
        except Exception as e:
            logger.error(f"更新 CVV 卡片失败: {e}")
            return False
    
    async def delete_cvv_card(self, card_id: str) -> bool:
        """刪除 CVV 卡片"""
        try:
            doc_ref = self.db.collection('cvv_cards').document(card_id)
            doc_ref.delete()
            
            return True
            
        except Exception as e:
            logger.error(f"刪除 CVV 卡片失败: {e}")
            return False
    
    # 用戶相關操作
    async def get_user_by_telegram_id(self, telegram_id: int) -> Optional[Dict]:
        """根據 Telegram ID 獲取用戶"""
        try:
            docs = self.db.collection('users').where('telegram_id', '==', telegram_id).stream()
            
            for doc in docs:
                user_data = doc.to_dict()
                user_data['id'] = doc.id
                return user_data
            
            return None
            
        except Exception as e:
            logger.error(f"獲取用戶失败: {e}")
            return None
    
    async def create_user(self, user_data: Dict) -> str:
        """創建新用戶"""
        try:
            user_data['created_at'] = datetime.utcnow()
            user_data['updated_at'] = datetime.utcnow()
            user_data['balance'] = 0.0
            user_data['is_admin'] = False
            user_data['is_agent'] = False
            
            doc_ref = self.db.collection('users').add(user_data)
            return doc_ref[1].id
            
        except Exception as e:
            logger.error(f"創建用戶失败: {e}")
            raise
    
    async def update_user_balance(self, user_id: str, amount: float) -> bool:
        """更新用戶餘額"""
        try:
            doc_ref = self.db.collection('users').document(user_id)
            doc_ref.update({
                'balance': firestore.Increment(amount),
                'updated_at': datetime.utcnow()
            })
            
            return True
            
        except Exception as e:
            logger.error(f"更新用戶餘額失败: {e}")
            return False
    
    # 代理商相關操作
    async def get_agent_by_user_id(self, user_id: str) -> Optional[Dict]:
        """根據用戶 ID 獲取代理商信息"""
        try:
            docs = self.db.collection('agents').where('user_id', '==', user_id).stream()
            
            for doc in docs:
                agent_data = doc.to_dict()
                agent_data['id'] = doc.id
                return agent_data
            
            return None
            
        except Exception as e:
            logger.error(f"獲取代理商信息失败: {e}")
            return None
    
    async def create_agent(self, agent_data: Dict) -> str:
        """創建新代理商"""
        try:
            agent_data['created_at'] = datetime.utcnow()
            agent_data['updated_at'] = datetime.utcnow()
            agent_data['status'] = 'pending'
            agent_data['total_sales'] = 0.0
            agent_data['total_commission'] = 0.0
            agent_data['available_commission'] = 0.0
            agent_data['team_size'] = 0
            
            doc_ref = self.db.collection('agents').add(agent_data)
            return doc_ref[1].id
            
        except Exception as e:
            logger.error(f"創建代理商失败: {e}")
            raise
    
    # 訂單相關操作
    async def create_order(self, order_data: Dict) -> str:
        """創建新訂單"""
        try:
            order_data['created_at'] = datetime.utcnow()
            order_data['updated_at'] = datetime.utcnow()
            order_data['status'] = 'pending'
            
            doc_ref = self.db.collection('orders').add(order_data)
            return doc_ref[1].id
            
        except Exception as e:
            logger.error(f"創建訂單失败: {e}")
            raise
    
    async def update_order_status(self, order_id: str, status: str) -> bool:
        """更新訂單狀態"""
        try:
            doc_ref = self.db.collection('orders').document(order_id)
            doc_ref.update({
                'status': status,
                'updated_at': datetime.utcnow()
            })
            
            return True
            
        except Exception as e:
            logger.error(f"更新訂單狀態失败: {e}")
            return False

# 創建全局 Firebase 服務實例
firebase_service = FirebaseService()
