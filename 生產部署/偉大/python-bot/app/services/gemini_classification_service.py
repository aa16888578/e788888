"""
Gemini AI 分類服務
使用 Google Gemini 快速模型進行 CVV 數據分類
"""
import asyncio
import json
import logging
import time
import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime

try:
    import aiohttp
except ImportError:
    aiohttp = None

logger = logging.getLogger(__name__)

@dataclass
class CVVClassificationResult:
    """CVV分類結果數據類"""
    country_code: str
    country_name: str
    country_flag: str
    card_type: str  # 庫別 (全資庫/裸資庫/特價庫)
    card_number: str
    expiry_date: str
    security_code: str
    cardholder_name: str
    phone_number: str
    suggested_price: float  # AI建議售價
    additional_info: Dict[str, Any]
    confidence: float
    classification_time: datetime
    raw_data: str

class GeminiClassificationService:
    """Gemini AI 分類服務"""
    
    def __init__(self, config_service):
        self.config_service = config_service
        self.api_key = "AIzaSyCXKEnubLRvtR3JIb2qfZJ2EaXcAPxi6DQ"
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
        self.session = None
        self.classification_rules = self._load_classification_rules()
        
    async def __aenter__(self):
        """異步上下文管理器入口"""
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """異步上下文管理器出口"""
        if self.session:
            await self.session.close()
    
    def _load_classification_rules(self) -> str:
        """載入CVV分類規則"""
        return """
        你是一個專業的CVV信用卡數據分類專家。請根據以下格式解析CVV數據：
        
        輸入格式：國家代碼_國家（國旗圖）_庫別_卡號_有效日期_安全碼_姓名_電話_售價_剩下信息
        
        解析規則：
        1. 國家代碼：如 US, GB, CA, AR, BR, DE 等 ISO 2字母代碼
        2. 國家名稱：完整國家名稱，如 美國, 英國, 加拿大, 阿根廷, 巴西, 德國
        3. 國旗圖案：對應的 Unicode 國旗符號，如 🇺🇸🇬🇧🇨🇦🇦🇷🇧🇷🇩🇪
        4. 庫別分類：
           - 全資庫：完整信息的高品質卡片
           - 裸資庫：基本信息的標準卡片  
           - 特價庫：促銷價格的卡片
        5. 卡號：16位信用卡號碼
        6. 有效日期：MM/YY 格式
        7. 安全碼：3-4位CVV碼
        8. 姓名：持卡人姓名
        9. 電話：聯繫電話
        10. 建議售價：根據國家等級、卡片品質、市場稀缺度建議價格(USD)
        11. 其他信息：地址、郵編等額外信息
        
        定價參考：
        - 頂級國家(US,UK,CA,AU): $15-50
        - 歐洲國家(DE,FR,IT,ES): $8-25  
        - 南美國家(AR,BR,CL): $3-15
        - 其他國家: $1-8
        
        請以JSON格式返回結果，包含所有解析的欄位和置信度評分。
        """
    
    async def classify_single_cvv(self, cvv_data: str) -> CVVClassificationResult:
        """分類單個CVV數據"""
        try:
            start_time = time.time()
            
            # 構建請求
            prompt = f"{self._load_classification_rules()}\n\n請解析以下CVV數據：\n{cvv_data}\n\n請以JSON格式返回結果。"
            
            headers = {
                "Content-Type": "application/json"
            }
            
            payload = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 1000,
                    "topP": 0.8,
                    "topK": 10
                }
            }
            
            # 發送請求
            url = f"{self.base_url}?key={self.api_key}"
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Gemini API請求失敗: {response.status} - {error_text}")
                    raise Exception(f"API請求失敗: {response.status}")
                
                result = await response.json()
                
                # 解析響應
                classification_result = self._parse_gemini_response(result, cvv_data)
                classification_result.classification_time = datetime.now()
                
                # 記錄處理時間
                processing_time = time.time() - start_time
                logger.info(f"CVV分類完成，處理時間: {processing_time:.2f}秒")
                
                return classification_result
                
        except Exception as e:
            logger.error(f"CVV分類失敗: {e}")
            # 返回錯誤結果
            return CVVClassificationResult(
                country_code="UNKNOWN",
                country_name="未知",
                country_flag="🏳️",
                card_type="未分類",
                card_number="****",
                expiry_date="**/**",
                security_code="***",
                cardholder_name="未知",
                phone_number="未知",
                suggested_price=0.0,
                additional_info={"error": str(e)},
                confidence=0.0,
                classification_time=datetime.now(),
                raw_data=cvv_data
            )
    
    async def classify_batch_cvv(self, cvv_data_list: List[str], 
                               batch_size: int = 5) -> List[CVVClassificationResult]:
        """批量分類CVV數據"""
        results = []
        
        # 分批處理，避免API速率限制
        for i in range(0, len(cvv_data_list), batch_size):
            batch = cvv_data_list[i:i + batch_size]
            
            # 並行處理批次
            batch_tasks = [self.classify_single_cvv(cvv_data) for cvv_data in batch]
            batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
            
            # 處理結果
            for result in batch_results:
                if isinstance(result, Exception):
                    logger.error(f"批次分類失敗: {result}")
                    continue
                results.append(result)
            
            # 批次間延遲
            if i + batch_size < len(cvv_data_list):
                await asyncio.sleep(1)
        
        return results
    
    def _parse_gemini_response(self, response: Dict, raw_data: str) -> CVVClassificationResult:
        """解析Gemini API響應"""
        try:
            # 獲取生成的文本
            content = response["candidates"][0]["content"]["parts"][0]["text"]
            
            # 嘗試提取JSON
            json_data = self._extract_json_from_text(content)
            
            if json_data:
                return CVVClassificationResult(
                    country_code=json_data.get("country_code", "UNKNOWN"),
                    country_name=json_data.get("country_name", "未知"),
                    country_flag=json_data.get("country_flag", "🏳️"),
                    card_type=json_data.get("card_type", "未分類"),
                    card_number=json_data.get("card_number", "****"),
                    expiry_date=json_data.get("expiry_date", "**/**"),
                    security_code=json_data.get("security_code", "***"),
                    cardholder_name=json_data.get("cardholder_name", "未知"),
                    phone_number=json_data.get("phone_number", "未知"),
                    suggested_price=float(json_data.get("suggested_price", 0.0)),
                    additional_info=json_data.get("additional_info", {}),
                    confidence=float(json_data.get("confidence", 0.8)),
                    classification_time=datetime.now(),
                    raw_data=raw_data
                )
            else:
                # 如果無法解析JSON，嘗試文本解析
                return self._parse_text_response(content, raw_data)
                
        except Exception as e:
            logger.error(f"解析Gemini響應失敗: {e}")
            return self._create_fallback_result(raw_data, str(e))
    
    def _extract_json_from_text(self, text: str) -> Optional[Dict]:
        """從文本中提取JSON"""
        try:
            # 嘗試直接解析
            if text.strip().startswith("{"):
                return json.loads(text)
            
            # 嘗試提取JSON部分
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            
            # 嘗試提取代碼塊中的JSON
            code_match = re.search(r'```(?:json)?\n?(\{.*?\})\n?```', text, re.DOTALL)
            if code_match:
                return json.loads(code_match.group(1))
            
            return None
            
        except json.JSONDecodeError:
            return None
    
    def _parse_text_response(self, text: str, raw_data: str) -> CVVClassificationResult:
        """解析純文本響應"""
        # 簡單的文本解析邏輯
        lines = text.split('\n')
        result_data = {}
        
        for line in lines:
            line = line.strip()
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip().lower().replace(' ', '_')
                value = value.strip()
                result_data[key] = value
        
        return CVVClassificationResult(
            country_code=result_data.get("country_code", "UNKNOWN"),
            country_name=result_data.get("country_name", "未知"),
            country_flag=result_data.get("country_flag", "🏳️"),
            card_type=result_data.get("card_type", "未分類"),
            card_number=result_data.get("card_number", "****"),
            expiry_date=result_data.get("expiry_date", "**/**"),
            security_code=result_data.get("security_code", "***"),
            cardholder_name=result_data.get("cardholder_name", "未知"),
            phone_number=result_data.get("phone_number", "未知"),
            suggested_price=float(result_data.get("suggested_price", 0.0)),
            additional_info={"parsed_from": "text"},
            confidence=0.6,
            classification_time=datetime.now(),
            raw_data=raw_data
        )
    
    def _create_fallback_result(self, raw_data: str, error: str) -> CVVClassificationResult:
        """創建備用分類結果"""
        return CVVClassificationResult(
            country_code="ERROR",
            country_name="解析失敗",
            country_flag="❌",
            card_type="錯誤",
            card_number="****",
            expiry_date="**/**",
            security_code="***",
            cardholder_name="未知",
            phone_number="未知",
            suggested_price=0.0,
            additional_info={"error": error},
            confidence=0.0,
            classification_time=datetime.now(),
            raw_data=raw_data
        )
    
    async def get_classification_stats(self) -> Dict[str, Any]:
        """獲取分類統計信息"""
        # 這裡應該從數據庫獲取實際統計
        # 暫時返回模擬數據
        return {
            "total_classified": 15847,
            "activity_rate": 87.3,
            "daily_growth": 127,
            "growth_percentage": 15.2,
            "category_breakdown": {
                "全資庫": {"count": 8500, "percentage": 53.6},
                "裸資庫": {"count": 5200, "percentage": 32.8},
                "特價庫": {"count": 2147, "percentage": 13.6}
            },
            "country_breakdown": {
                "US": {"count": 5000, "activity": 90.5},
                "GB": {"count": 3000, "activity": 88.2},
                "DE": {"count": 2000, "activity": 85.7},
                "AR": {"count": 1500, "activity": 82.1},
                "BR": {"count": 1200, "activity": 79.3}
            },
            "revenue_stats": {
                "total_revenue": 89320,
                "daily_revenue": 1273,
                "average_price": 12.5
            }
        }
    
    async def search_by_card_prefix(self, prefix: str) -> List[Dict[str, Any]]:
        """根據卡號前六碼搜尋"""
        # 這裡應該從數據庫搜尋實際數據
        # 暫時返回模擬數據
        return [
            {
                "id": f"cvv_{prefix}_001",
                "country_code": "US",
                "country_name": "美國",
                "country_flag": "🇺🇸",
                "card_type": "全資庫",
                "card_prefix": prefix,
                "price": 25.0,
                "activity_rate": 92.5,
                "stock_count": 15
            },
            {
                "id": f"cvv_{prefix}_002", 
                "country_code": "GB",
                "country_name": "英國",
                "country_flag": "🇬🇧",
                "card_type": "裸資庫",
                "card_prefix": prefix,
                "price": 18.0,
                "activity_rate": 88.2,
                "stock_count": 8
            }
        ]
    
    def format_classification_result_for_display(self, result: CVVClassificationResult) -> str:
        """格式化分類結果用於顯示"""
        return f"""
🎯 **AI分類結果**

🌍 **國家信息**
　　國家: {result.country_flag} {result.country_name} ({result.country_code})
　　庫別: {result.card_type}

💳 **卡片信息**  
　　卡號: {result.card_number[:4]}****{result.card_number[-4:] if len(result.card_number) >= 8 else '****'}
　　有效期: {result.expiry_date}
　　安全碼: ***

👤 **持卡人信息**
　　姓名: {result.cardholder_name}
　　電話: {result.phone_number}

💰 **建議售價**: ${result.suggested_price:.2f} USD

🎯 **置信度**: {result.confidence*100:.1f}%
⏰ **分類時間**: {result.classification_time.strftime('%Y-%m-%d %H:%M:%S')}

💡 **需要管理員確認售價並入庫**
        """

# 創建全局Gemini分類服務實例
gemini_classification_service = GeminiClassificationService(None)
