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
                # 直接使用 JSON 檔案創建憑證
                import os
                json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'firebase-service-account.json')
                
                if os.path.exists(json_path):
                    try:
                        # 檢查JSON文件是否包含有效配置
                        with open(json_path, 'r') as f:
                            json_content = f.read()
                            if ("YOUR_PRIVATE_KEY_ID" in json_content or 
                                "YOUR_ACTUAL_PRIVATE_KEY_HERE" in json_content or
                                "firebase-adminsdk-xxxxx" in json_content):
                                logger.warning("⚠️ JSON文件包含模板值，跳過JSON初始化")
                                raise ValueError("Template values in JSON file")
                        
                        cred = credentials.Certificate(json_path)
                        firebase_admin.initialize_app(cred)
                        logger.info(f"Firebase 從 JSON 檔案初始化成功: {json_path}")
                    except Exception as json_error:
                        logger.warning(f"JSON檔案初始化失敗，嘗試環境變量: {json_error}")
                        # 繼續使用環境變量方案
                else:
                    # 備用方案：從環境變量創建憑證
                    cred_dict = {
                        "type": "service_account",
                        "project_id": settings.FIREBASE_PROJECT_ID,
                        "private_key": settings.FIREBASE_PRIVATE_KEY.replace('\\n', '\n'),
                        "client_email": settings.FIREBASE_CLIENT_EMAIL,
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                        "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{settings.FIREBASE_CLIENT_EMAIL}"
                    }
                    
                    # 檢查是否為示例配置
                    if (settings.FIREBASE_PROJECT_ID == "your_firebase_project_id" or 
                        "Your private key here" in settings.FIREBASE_PRIVATE_KEY or
                        "firebase-adminsdk-xxxxx" in settings.FIREBASE_CLIENT_EMAIL or
                        "test_token_for_local_development" in settings.TELEGRAM_BOT_TOKEN):
                        logger.warning("⚠️ 檢測到示例配置，系統將在模擬模式下運行")
                        logger.warning("請設置真實的配置以啟用完整功能")
                        self.db = None
                        return
                    
                    cred = credentials.Certificate(cred_dict)
                    firebase_admin.initialize_app(cred)
                    logger.info("Firebase 從環境變量初始化成功")
            
            self.db = firestore.client()
            logger.info("Firebase 初始化成功")
            
        except Exception as e:
            logger.warning(f"⚠️ Firebase 初始化失败: {e}")
            logger.warning("系統將在模擬模式下運行，某些功能可能受限")
            self.db = None
    
    # CVV 相關操作
    async def get_cvv_cards(self, filters: Dict[str, Any] = None) -> List[Dict]:
        """獲取 CVV 卡片列表"""
        if self.db is None:
            logger.warning("Firebase未初始化，返回空列表")
            return []
            
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
        if self.db is None:
            logger.warning("Firebase未初始化，返回None")
            return None
            
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
        if self.db is None:
            logger.warning("Firebase未初始化，返回模擬ID")
            return f"mock_{int(datetime.utcnow().timestamp())}"
            
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
        if self.db is None:
            logger.warning("Firebase未初始化，返回模擬ID")
            return f"mock_user_{int(datetime.utcnow().timestamp())}"
            
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
        if self.db is None:
            logger.warning("Firebase未初始化，返回False")
            return False
            
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
        if self.db is None:
            logger.warning("Firebase未初始化，返回None")
            return None
            
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
        if self.db is None:
            logger.warning("Firebase未初始化，返回模擬ID")
            return f"mock_agent_{int(datetime.utcnow().timestamp())}"
            
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
        if self.db is None:
            logger.warning("Firebase未初始化，返回模擬ID")
            return f"mock_order_{int(datetime.utcnow().timestamp())}"
            
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
        if self.db is None:
            logger.warning("Firebase未初始化，返回False")
            return False
            
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
