"""
CVV 數據展示服務
整合 AI 分類結果到各個庫存展示
"""
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class CVVDisplayService:
    """CVV數據展示服務"""
    
    def __init__(self, firebase_service, gemini_service):
        self.firebase_service = firebase_service
        self.gemini_service = gemini_service
    
    async def get_card_library_display(self, library_type: str, page: int = 1, 
                                     page_size: int = 10) -> Dict[str, Any]:
        """獲取卡片庫展示數據"""
        try:
            # 根據庫別獲取卡片
            filters = {"card_type": library_type, "status": "available"}
            cards = await self.firebase_service.get_collection_data(
                'cvv_cards', filters, limit=page_size, offset=(page-1)*page_size
            )
            
            # 格式化卡片顯示
            formatted_cards = []
            for card in cards:
                formatted_card = self._format_card_for_display(card)
                formatted_cards.append(formatted_card)
            
            # 獲取統計信息
            total_count = await self._get_library_total_count(library_type)
            stats = await self._get_library_stats(library_type)
            
            return {
                "library_type": library_type,
                "cards": formatted_cards,
                "pagination": {
                    "current_page": page,
                    "total_pages": (total_count + page_size - 1) // page_size,
                    "total_count": total_count
                },
                "stats": stats
            }
            
        except Exception as e:
            logger.error(f"獲取{library_type}展示數據失敗: {e}")
            return {"error": str(e)}
    
    def _format_card_for_display(self, card: Dict[str, Any]) -> Dict[str, Any]:
        """格式化卡片用於顯示"""
        return {
            "id": card.get("id"),
            "display_text": f"{card.get('country_flag', '🏳️')} {card.get('country_name', '未知')} - ${card.get('price', 0):.2f} USDT",
            "country_info": f"{card.get('country_code', 'XX')}_{card.get('country_name', '未知')}{card.get('country_flag', '')}",
            "card_type": card.get('card_type', '未分類'),
            "price": card.get('price', 0),
            "activity_rate": card.get('activity_rate', 0),
            "stock_status": "✅ 有庫存" if card.get('stock_count', 0) > 0 else "❌ 缺貨",
            "quality_indicator": self._get_quality_indicator(card)
        }
    
    def _get_quality_indicator(self, card: Dict[str, Any]) -> str:
        """獲取品質指標"""
        activity_rate = card.get('activity_rate', 0)
        card_type = card.get('card_type', '')
        
        if activity_rate >= 90:
            return "🔥"  # 熱門
        elif activity_rate >= 80:
            return "💎"  # 高品質
        elif "頂級" in card_type:
            return "⭐"  # 頂級
        elif "特價" in card_type:
            return "💰"  # 特價
        else:
            return "📋"  # 普通
    
    async def _get_library_total_count(self, library_type: str) -> int:
        """獲取庫別總數量"""
        try:
            result = await self.firebase_service.count_documents(
                'cvv_cards', {"card_type": library_type, "status": "available"}
            )
            return result
        except:
            return 0
    
    async def _get_library_stats(self, library_type: str) -> Dict[str, Any]:
        """獲取庫別統計信息"""
        try:
            # 獲取統計數據
            cards = await self.firebase_service.get_collection_data(
                'cvv_cards', {"card_type": library_type, "status": "available"}
            )
            
            if not cards:
                return {"total": 0, "avg_price": 0, "avg_activity": 0}
            
            total_count = len(cards)
            total_price = sum(card.get('price', 0) for card in cards)
            total_activity = sum(card.get('activity_rate', 0) for card in cards)
            
            return {
                "total": total_count,
                "avg_price": round(total_price / total_count, 2) if total_count > 0 else 0,
                "avg_activity": round(total_activity / total_count, 1) if total_count > 0 else 0,
                "price_range": f"${min(card.get('price', 0) for card in cards):.1f}-${max(card.get('price', 0) for card in cards):.1f}"
            }
            
        except Exception as e:
            logger.error(f"獲取{library_type}統計失敗: {e}")
            return {"total": 0, "avg_price": 0, "avg_activity": 0}
    
    async def search_cards_by_filters(self, filters: Dict[str, Any], 
                                    page: int = 1, page_size: int = 10) -> Dict[str, Any]:
        """根據篩選條件搜尋卡片"""
        try:
            # 構建查詢條件
            query_filters = {"status": "available"}
            query_filters.update(filters)
            
            # 獲取搜尋結果
            cards = await self.firebase_service.get_collection_data(
                'cvv_cards', query_filters, limit=page_size, offset=(page-1)*page_size
            )
            
            # 格式化結果
            formatted_cards = []
            for card in cards:
                formatted_card = self._format_card_for_display(card)
                formatted_cards.append(formatted_card)
            
            # 獲取搜尋統計
            total_count = await self.firebase_service.count_documents('cvv_cards', query_filters)
            
            return {
                "cards": formatted_cards,
                "filters": filters,
                "pagination": {
                    "current_page": page,
                    "total_pages": (total_count + page_size - 1) // page_size,
                    "total_count": total_count
                },
                "search_summary": self._generate_search_summary(filters, total_count)
            }
            
        except Exception as e:
            logger.error(f"搜尋卡片失敗: {e}")
            return {"error": str(e)}
    
    async def search_by_card_prefix(self, prefix: str) -> Dict[str, Any]:
        """根據卡號前六碼搜尋"""
        try:
            # 搜尋匹配的卡片
            filters = {"card_number_prefix": prefix}
            cards = await self.firebase_service.get_collection_data('cvv_cards', filters)
            
            if not cards:
                return {
                    "prefix": prefix,
                    "found": False,
                    "message": f"🔍 未找到卡頭 {prefix} 的相關卡片",
                    "suggestions": await self._get_similar_prefixes(prefix)
                }
            
            # 分組統計
            country_stats = {}
            total_value = 0
            
            for card in cards:
                country = card.get('country_code', 'XX')
                if country not in country_stats:
                    country_stats[country] = {
                        "count": 0,
                        "total_value": 0,
                        "avg_activity": 0,
                        "country_name": card.get('country_name', '未知'),
                        "country_flag": card.get('country_flag', '🏳️')
                    }
                
                country_stats[country]["count"] += 1
                country_stats[country]["total_value"] += card.get('price', 0)
                country_stats[country]["avg_activity"] += card.get('activity_rate', 0)
                total_value += card.get('price', 0)
            
            # 計算平均活性
            for country_data in country_stats.values():
                if country_data["count"] > 0:
                    country_data["avg_activity"] = round(
                        country_data["avg_activity"] / country_data["count"], 1
                    )
                    country_data["avg_price"] = round(
                        country_data["total_value"] / country_data["count"], 2
                    )
            
            return {
                "prefix": prefix,
                "found": True,
                "total_cards": len(cards),
                "total_value": round(total_value, 2),
                "country_stats": country_stats,
                "summary": self._generate_prefix_summary(prefix, cards)
            }
            
        except Exception as e:
            logger.error(f"搜尋卡頭{prefix}失敗: {e}")
            return {"error": str(e)}
    
    async def get_global_inventory_stats(self) -> str:
        """獲取全球卡頭庫存統計 - 風趣風格"""
        try:
            # 獲取統計數據
            stats = await self.gemini_service.get_classification_stats()
            
            # 生成風趣的統計報告
            total = stats.get('total_classified', 0)
            activity = stats.get('activity_rate', 0)
            daily_growth = stats.get('daily_growth', 0)
            growth_percentage = stats.get('growth_percentage', 0)
            
            # 風趣的統計描述
            activity_emoji = "🔥" if activity >= 90 else "💎" if activity >= 80 else "📈" if activity >= 70 else "😅"
            growth_emoji = "🚀" if growth_percentage >= 20 else "📈" if growth_percentage >= 10 else "🐌"
            
            funny_comments = [
                "今天的卡片們很活躍呢！",
                "數據庫正在茁壯成長中~",
                "卡片活性比我的社交生活還高！",
                "這些數字看起來很有希望！",
                "庫存充足，老闆開心！"
            ]
            
            import random
            comment = random.choice(funny_comments)
            
            report = f"""
🌍 **全球卡頭庫存報告** 

📊 **基本數據**
　　總卡片數: {total:,} 張
　　活性指標: {activity}% {activity_emoji}
　　今日新增: {daily_growth} 張 ({growth_percentage:+.1f}% {growth_emoji})

💬 **AI小助手說**: {comment}

📈 **庫別分布**
"""
            
            # 添加庫別統計
            category_breakdown = stats.get('category_breakdown', {})
            for category, data in category_breakdown.items():
                count = data.get('count', 0)
                percentage = data.get('percentage', 0)
                report += f"　　{category}: {count:,} 張 ({percentage:.1f}%)\n"
            
            report += f"""
🌎 **熱門國家 TOP 5**
"""
            
            # 添加國家統計
            country_breakdown = stats.get('country_breakdown', {})
            sorted_countries = sorted(
                country_breakdown.items(), 
                key=lambda x: x[1].get('count', 0), 
                reverse=True
            )[:5]
            
            for i, (country, data) in enumerate(sorted_countries, 1):
                count = data.get('count', 0)
                activity = data.get('activity', 0)
                report += f"　　{i}. {country}: {count:,} 張 (活性 {activity}%)\n"
            
            report += f"""
💰 **收益概況**
　　總價值: ${stats.get('revenue_stats', {}).get('total_revenue', 0):,}
　　日收益: ${stats.get('revenue_stats', {}).get('daily_revenue', 0):,}
　　平均價格: ${stats.get('revenue_stats', {}).get('average_price', 0):.2f}

🎯 **更新時間**: {datetime.now().strftime('%H:%M:%S')}
"""
            
            return report
            
        except Exception as e:
            logger.error(f"獲取全球庫存統計失敗: {e}")
            return f"❌ 統計數據載入失敗: {str(e)}"
    
    def _generate_search_summary(self, filters: Dict[str, Any], total_count: int) -> str:
        """生成搜尋摘要"""
        filter_descriptions = []
        
        if 'country_code' in filters:
            filter_descriptions.append(f"國家: {filters['country_code']}")
        if 'price_min' in filters or 'price_max' in filters:
            price_min = filters.get('price_min', 0)
            price_max = filters.get('price_max', 999)
            filter_descriptions.append(f"價格: ${price_min}-${price_max}")
        if 'activity_rate_min' in filters:
            filter_descriptions.append(f"活性: {filters['activity_rate_min']}%+")
        
        filter_text = ", ".join(filter_descriptions) if filter_descriptions else "全部"
        
        return f"🔍 搜尋條件: {filter_text} | 找到 {total_count} 張卡片"
    
    def _generate_prefix_summary(self, prefix: str, cards: List[Dict]) -> str:
        """生成卡頭搜尋摘要"""
        if not cards:
            return f"🔍 卡頭 {prefix} 暫無庫存"
        
        countries = set(card.get('country_code') for card in cards)
        avg_price = sum(card.get('price', 0) for card in cards) / len(cards)
        avg_activity = sum(card.get('activity_rate', 0) for card in cards) / len(cards)
        
        return f"""
🔍 **卡頭 {prefix} 搜尋結果**

📊 **基本信息**
　　找到卡片: {len(cards)} 張
　　涵蓋國家: {len(countries)} 個
　　平均價格: ${avg_price:.2f} USD
　　平均活性: {avg_activity:.1f}%

💡 **建議**: {"值得購買！" if avg_activity >= 85 else "品質一般" if avg_activity >= 70 else "需謹慎考慮"}
        """
    
    async def _get_similar_prefixes(self, prefix: str) -> List[str]:
        """獲取相似的卡頭建議"""
        try:
            # 獲取所有可用的卡頭前綴
            all_cards = await self.firebase_service.get_collection_data(
                'cvv_cards', {"status": "available"}, limit=1000
            )
            
            # 提取前綴並找相似的
            available_prefixes = set()
            for card in all_cards:
                card_number = card.get('card_number', '')
                if len(card_number) >= 6:
                    available_prefixes.add(card_number[:6])
            
            # 找相似前綴 (前4位相同)
            similar = []
            prefix_start = prefix[:4] if len(prefix) >= 4 else prefix[:2]
            
            for available_prefix in available_prefixes:
                if available_prefix.startswith(prefix_start) and available_prefix != prefix:
                    similar.append(available_prefix)
            
            return sorted(similar)[:5]  # 最多返回5個建議
            
        except:
            return []
    
    async def format_ai_classification_for_admin(self, result) -> str:
        """格式化AI分類結果供管理員確認"""
        return f"""
🤖 **AI分類完成！**

📋 **解析結果**
　　國家: {result.country_flag} {result.country_name} ({result.country_code})
　　庫別: {result.card_type}
　　卡號: {result.card_number[:4]}****{result.card_number[-4:] if len(result.card_number) >= 8 else '****'}
　　有效期: {result.expiry_date}
　　持卡人: {result.cardholder_name}
　　電話: {result.phone_number}

💰 **AI建議售價**: ${result.suggested_price:.2f} USD

🎯 **置信度**: {result.confidence*100:.1f}%

💡 **請確認信息並設置最終售價**

📝 **其他信息**:
{json.dumps(result.additional_info, ensure_ascii=False, indent=2) if result.additional_info else '無'}
        """

# 創建全局CVV展示服務實例
cvv_display_service = CVVDisplayService(None, None)  # 需要注入依賴
