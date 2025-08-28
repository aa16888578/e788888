"""
CVV 服務模組
提供 CVV 卡片的管理和查詢功能
"""

import logging
from typing import List, Dict, Optional, Any
from datetime import datetime
from app.services.firebase_service import firebase_service

logger = logging.getLogger(__name__)


class CVVService:
    """CVV 服務類"""
    
    def __init__(self):
        self.firebase_service = firebase_service
    
    async def get_cvv_cards(self, filters: Dict[str, Any] = None) -> List[Dict]:
        """獲取 CVV 卡片列表"""
        try:
            return await self.firebase_service.get_cvv_cards(filters)
        except Exception as e:
            logger.error(f"獲取 CVV 卡片失敗: {e}")
            return []
    
    async def get_cvv_card_by_id(self, card_id: str) -> Optional[Dict]:
        """根據 ID 獲取單個 CVV 卡片"""
        try:
            return await self.firebase_service.get_cvv_card_by_id(card_id)
        except Exception as e:
            logger.error(f"獲取 CVV 卡片失敗: {e}")
            return None
    
    async def create_cvv_card(self, card_data: Dict) -> str:
        """創建新的 CVV 卡片"""
        try:
            return await self.firebase_service.create_cvv_card(card_data)
        except Exception as e:
            logger.error(f"創建 CVV 卡片失敗: {e}")
            raise
    
    async def update_cvv_card(self, card_id: str, updates: Dict) -> bool:
        """更新 CVV 卡片"""
        try:
            return await self.firebase_service.update_cvv_card(card_id, updates)
        except Exception as e:
            logger.error(f"更新 CVV 卡片失敗: {e}")
            return False
    
    async def delete_cvv_card(self, card_id: str) -> bool:
        """刪除 CVV 卡片"""
        try:
            return await self.firebase_service.delete_cvv_card(card_id)
        except Exception as e:
            logger.error(f"刪除 CVV 卡片失敗: {e}")
            return False
    
    async def search_cvv_cards(self, query: str, filters: Dict[str, Any] = None) -> List[Dict]:
        """搜索 CVV 卡片"""
        try:
            # 基本搜索實現
            all_cards = await self.get_cvv_cards(filters)
            if not query:
                return all_cards
            
            # 簡單的文本搜索
            query_lower = query.lower()
            results = []
            
            for card in all_cards:
                # 搜索卡片號、國家、類型等字段
                if (query_lower in str(card.get('card_number', '')).lower() or
                    query_lower in str(card.get('country', '')).lower() or
                    query_lower in str(card.get('card_type', '')).lower() or
                    query_lower in str(card.get('bank', '')).lower()):
                    results.append(card)
            
            return results
            
        except Exception as e:
            logger.error(f"搜索 CVV 卡片失敗: {e}")
            return []
    
    async def get_cvv_statistics(self) -> Dict[str, Any]:
        """獲取 CVV 統計信息"""
        try:
            all_cards = await self.get_cvv_cards()
            
            stats = {
                'total_cards': len(all_cards),
                'by_country': {},
                'by_type': {},
                'by_status': {},
                'total_value': 0
            }
            
            for card in all_cards:
                # 國家統計
                country = card.get('country', 'Unknown')
                stats['by_country'][country] = stats['by_country'].get(country, 0) + 1
                
                # 類型統計
                card_type = card.get('card_type', 'Unknown')
                stats['by_type'][card_type] = stats['by_type'].get(card_type, 0) + 1
                
                # 狀態統計
                status = card.get('status', 'Unknown')
                stats['by_status'][status] = stats['by_status'].get(status, 0) + 1
                
                # 總價值
                price = card.get('price', 0)
                if isinstance(price, (int, float)):
                    stats['total_value'] += price
            
            return stats
            
        except Exception as e:
            logger.error(f"獲取 CVV 統計失敗: {e}")
            return {
                'total_cards': 0,
                'by_country': {},
                'by_type': {},
                'by_status': {},
                'total_value': 0
            }


# 創建服務實例
cvv_service = CVVService()
