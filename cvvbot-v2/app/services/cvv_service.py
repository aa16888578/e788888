"""
CVV 卡片管理服務
"""
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime

from ..models.cvv import CVVCard, CVVStatus, CVVType
from .firebase_service import firebase_service

logger = logging.getLogger(__name__)

class CVVService:
    """CVV 卡片服務"""
    
    def __init__(self):
        self.collection = firebase_service.db.collection('cvv_cards')
    
    async def get_card_by_id(self, card_id: int) -> Optional[CVVCard]:
        """根據 ID 獲取卡片"""
        try:
            doc = self.collection.document(str(card_id)).get()
            if doc.exists:
                data = doc.to_dict()
                return self._dict_to_cvv_card(data, doc.id)
            return None
        except Exception as e:
            logger.error(f"獲取卡片失敗: {e}")
            return None
    
    async def get_active_cards(self, page: int = 1, limit: int = 20, card_type: Optional[str] = None) -> List[CVVCard]:
        """獲取活躍卡片列表"""
        try:
            # 模擬數據，實際應該從 Firebase 獲取
            mock_cards = [
                {
                    'id': 1,
                    'country_code': 'US',
                    'country_name': '美國',
                    'flag': '🇺🇸',
                    'price': 15.0,
                    'success_rate': '85%',
                    'stock': 156,
                    'cvv_type': 'VISA',
                    'status': 'ACTIVE'
                },
                {
                    'id': 2,
                    'country_code': 'CA',
                    'country_name': '加拿大',
                    'flag': '🇨🇦',
                    'price': 12.0,
                    'success_rate': '82%',
                    'stock': 89,
                    'cvv_type': 'MASTERCARD',
                    'status': 'ACTIVE'
                },
                {
                    'id': 3,
                    'country_code': 'GB',
                    'country_name': '英國',
                    'flag': '🇬🇧',
                    'price': 18.0,
                    'success_rate': '88%',
                    'stock': 234,
                    'cvv_type': 'VISA',
                    'status': 'ACTIVE'
                },
                {
                    'id': 4,
                    'country_code': 'AU',
                    'country_name': '澳洲',
                    'flag': '🇦🇺',
                    'price': 14.0,
                    'success_rate': '80%',
                    'stock': 67,
                    'cvv_type': 'AMEX',
                    'status': 'ACTIVE'
                },
                {
                    'id': 5,
                    'country_code': 'AR',
                    'country_name': '阿根廷',
                    'flag': '🇦🇷',
                    'price': 8.0,
                    'success_rate': '65%',
                    'stock': 445,
                    'cvv_type': 'VISA',
                    'status': 'ACTIVE'
                }
            ]
            
            # 分頁處理
            start = (page - 1) * limit
            end = start + limit
            
            return [self._dict_to_cvv_card(card, str(card['id'])) for card in mock_cards[start:end]]
            
        except Exception as e:
            logger.error(f"獲取活躍卡片失敗: {e}")
            return []
    
    async def get_special_price_cards(self, limit: int = 10) -> List[CVVCard]:
        """獲取特價卡片"""
        try:
            # 模擬特價卡片數據
            special_cards = [
                {
                    'id': 101,
                    'country_code': 'US',
                    'country_name': '美國',
                    'flag': '🇺🇸',
                    'price': 10.0,  # 特價
                    'success_rate': '85%',
                    'stock': 45,
                    'cvv_type': 'VISA',
                    'status': 'ACTIVE'
                },
                {
                    'id': 102,
                    'country_code': 'DE',
                    'country_name': '德國',
                    'flag': '🇩🇪',
                    'price': 12.0,  # 特價
                    'success_rate': '90%',
                    'stock': 23,
                    'cvv_type': 'MASTERCARD',
                    'status': 'ACTIVE'
                }
            ]
            
            return [self._dict_to_cvv_card(card, str(card['id'])) for card in special_cards[:limit]]
            
        except Exception as e:
            logger.error(f"獲取特價卡片失敗: {e}")
            return []
    
    async def get_inventory_stats(self) -> Dict[str, Any]:
        """獲取庫存統計"""
        try:
            # 模擬庫存統計數據
            return {
                'total_cards': 1456,
                'active_cards': 1234,
                'countries': 25,
                'top_countries': [
                    {'name': '美國', 'flag': '🇺🇸', 'count': 234},
                    {'name': '加拿大', 'flag': '🇨🇦', 'count': 189},
                    {'name': '英國', 'flag': '🇬🇧', 'count': 156},
                    {'name': '德國', 'flag': '🇩🇪', 'count': 134},
                    {'name': '澳洲', 'flag': '🇦🇺', 'count': 98}
                ]
            }
        except Exception as e:
            logger.error(f"獲取庫存統計失敗: {e}")
            return {
                'total_cards': 0,
                'active_cards': 0,
                'countries': 0,
                'top_countries': []
            }
    
    def _dict_to_cvv_card(self, data: Dict[str, Any], doc_id: str) -> CVVCard:
        """將字典轉換為 CVVCard 對象"""
        # 創建一個簡單的 CVVCard 對象
        card = type('CVVCard', (), {})()
        card.id = int(doc_id) if doc_id.isdigit() else data.get('id', 0)
        card.country_code = data.get('country_code', '')
        card.country_name = data.get('country_name', '')
        card.flag = data.get('flag', '')
        card.price = float(data.get('price', 0))
        card.success_rate = data.get('success_rate', '0%')
        card.stock = int(data.get('stock', 0))
        card.cvv_type = type('CVVType', (), {'value': data.get('cvv_type', 'VISA')})()
        card.status = data.get('status', 'ACTIVE')
        
        return card
