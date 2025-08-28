"""
AI 分類系統服務
支援多AI提供商、智能分類規則、成本優化等功能
"""
import asyncio
import json
import logging
import time
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import aiohttp
import hashlib
import hmac
import base64
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class AIProvider(Enum):
    """AI提供商枚舉"""
    OPENAI = "openai"
    CLAUDE = "claude"
    GEMINI = "gemini"
    MISTRAL = "mistral"
    ANTHROPIC = "anthropic"

@dataclass
class ClassificationRule:
    """分類規則數據類"""
    id: str
    name: str
    description: str
    prompt: str
    categories: List[str]
    confidence_threshold: float = 0.8
    max_retries: int = 3
    cost_optimization: bool = True
    fallback_provider: Optional[AIProvider] = None
    created_at: datetime = None
    updated_at: datetime = None

@dataclass
class ClassificationResult:
    """分類結果數據類"""
    text: str
    classification: str
    confidence: float
    provider: AIProvider
    cost: float
    processing_time: float
    categories: List[str]
    metadata: Dict[str, Any]
    timestamp: datetime

class AIClassificationService:
    """AI分類服務主類"""
    
    def __init__(self, config_service):
        self.config_service = config_service
        self.provider_configs = self._load_provider_configs()
        self.rules_cache = {}
        self.performance_stats = {}
        self.cost_tracker = {}
        self.session = None
        
    def _load_provider_configs(self) -> Dict[str, Dict]:
        """載入AI提供商配置"""
        return {
            AIProvider.OPENAI.value: {
                "name": "OpenAI GPT-4",
                "models": ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
                "base_url": "https://api.openai.com/v1",
                "cost_per_token": 0.00003,
                "max_tokens": 8000,
                "rate_limit_per_minute": 60
            },
            AIProvider.CLAUDE.value: {
                "name": "Claude Sonnet",
                "models": ["claude-3-sonnet-20240229", "claude-3-haiku"],
                "base_url": "https://api.anthropic.com/v1",
                "cost_per_token": 0.000015,
                "max_tokens": 200000,
                "rate_limit_per_minute": 50
            },
            AIProvider.GEMINI.value: {
                "name": "Google Gemini",
                "models": ["gemini-pro", "gemini-pro-vision"],
                "base_url": "https://generativelanguage.googleapis.com/v1",
                "cost_per_token": 0.000001,
                "max_tokens": 30000,
                "rate_limit_per_minute": 60
            },
            AIProvider.MISTRAL.value: {
                "name": "Mistral AI",
                "models": ["mistral-large", "mistral-medium"],
                "base_url": "https://api.mistral.ai/v1",
                "cost_per_token": 0.000007,
                "max_tokens": 32000,
                "rate_limit_per_minute": 40
            }
        }
    
    async def __aenter__(self):
        """異步上下文管理器入口"""
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """異步上下文管理器出口"""
        if self.session:
            await self.session.close()
    
    async def classify_text(self, text: str, rule_id: str, 
                          preferred_provider: Optional[AIProvider] = None) -> ClassificationResult:
        """分類單個文本"""
        start_time = time.time()
        
        try:
            # 獲取分類規則
            rule = await self.get_classification_rule(rule_id)
            if not rule:
                raise ValueError(f"分類規則 {rule_id} 不存在")
            
            # 選擇AI提供商
            provider = await self._select_optimal_provider(
                text, rule, preferred_provider
            )
            
            # 執行分類
            result = await self._classify_with_provider(text, rule, provider)
            
            # 計算成本
            cost = self._calculate_cost(text, provider)
            
            # 更新統計
            await self._update_stats(provider, result, cost, time.time() - start_time)
            
            return ClassificationResult(
                text=text,
                classification=result["classification"],
                confidence=result["confidence"],
                provider=provider,
                cost=cost,
                processing_time=time.time() - start_time,
                categories=rule.categories,
                metadata=result.get("metadata", {}),
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"分類文本失敗: {e}")
            # 嘗試使用備用提供商
            if rule and rule.fallback_provider:
                return await self._classify_with_fallback(text, rule, e)
            raise
    
    async def classify_batch(self, texts: List[str], rule_id: str,
                           batch_size: int = 10, 
                           max_cost: Optional[float] = None) -> List[ClassificationResult]:
        """批量分類文本"""
        results = []
        total_cost = 0
        
        # 分批處理
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            
            # 檢查成本限制
            if max_cost and total_cost >= max_cost:
                logger.warning(f"達到成本限制 {max_cost}，停止處理")
                break
            
            # 並行處理批次
            batch_results = await asyncio.gather(
                *[self.classify_text(text, rule_id) for text in batch],
                return_exceptions=True
            )
            
            # 處理結果
            for result in batch_results:
                if isinstance(result, Exception):
                    logger.error(f"批次處理失敗: {result}")
                    continue
                results.append(result)
                total_cost += result.cost
            
            # 批次間延遲，避免速率限制
            if i + batch_size < len(texts):
                await asyncio.sleep(1)
        
        return results
    
    async def get_classification_rule(self, rule_id: str) -> Optional[ClassificationRule]:
        """獲取分類規則"""
        # 檢查緩存
        if rule_id in self.rules_cache:
            return self.rules_cache[rule_id]
        
        # 從配置服務獲取
        rule_data = await self.config_service.get_ai_rule(rule_id)
        if rule_data:
            rule = ClassificationRule(**rule_data)
            self.rules_cache[rule_id] = rule
            return rule
        
        return None
    
    async def create_classification_rule(self, rule_data: Dict[str, Any]) -> str:
        """創建新的分類規則"""
        rule_id = hashlib.md5(
            f"{rule_data['name']}_{time.time()}".encode()
        ).hexdigest()[:8]
        
        rule = ClassificationRule(
            id=rule_id,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            **rule_data
        )
        
        # 保存到配置服務
        await self.config_service.save_ai_rule(rule_id, rule.__dict__)
        self.rules_cache[rule_id] = rule
        
        return rule_id
    
    async def _select_optimal_provider(self, text: str, rule: ClassificationRule,
                                     preferred_provider: Optional[AIProvider]) -> AIProvider:
        """選擇最優AI提供商"""
        if preferred_provider and preferred_provider.value in self.provider_configs:
            return preferred_provider
        
        # 基於成本和性能選擇
        available_providers = []
        for provider_name, config in self.provider_configs.items():
            if await self._is_provider_available(provider_name):
                cost_estimate = self._estimate_cost(text, provider_name)
                performance_score = self._get_performance_score(provider_name)
                
                available_providers.append({
                    "provider": AIProvider(provider_name),
                    "cost": cost_estimate,
                    "performance": performance_score,
                    "score": performance_score / cost_estimate if cost_estimate > 0 else 0
                })
        
        if not available_providers:
            raise Exception("沒有可用的AI提供商")
        
        # 選擇最高分數的提供商
        best_provider = max(available_providers, key=lambda x: x["score"])
        return best_provider["provider"]
    
    async def _classify_with_provider(self, text: str, rule: ClassificationRule,
                                    provider: AIProvider) -> Dict[str, Any]:
        """使用指定提供商進行分類"""
        config = self.provider_configs[provider.value]
        api_key = await self.config_service.get_ai_api_key(provider.value)
        
        if not api_key:
            raise Exception(f"未配置 {provider.value} 的API金鑰")
        
        # 構建請求
        headers, payload = self._build_request(text, rule, provider, config)
        
        # 發送請求
        async with self.session.post(
            f"{config['base_url']}/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        ) as response:
            if response.status != 200:
                error_text = await response.text()
                raise Exception(f"API請求失敗: {response.status} - {error_text}")
            
            result = await response.json()
            return self._parse_response(result, provider)
    
    def _build_request(self, text: str, rule: ClassificationRule, 
                      provider: AIProvider, config: Dict) -> Tuple[Dict, Dict]:
        """構建API請求"""
        if provider == AIProvider.OPENAI:
            return self._build_openai_request(text, rule, config)
        elif provider == AIProvider.CLAUDE:
            return self._build_claude_request(text, rule, config)
        elif provider == AIProvider.GEMINI:
            return self._build_gemini_request(text, rule, config)
        elif provider == AIProvider.MISTRAL:
            return self._build_mistral_request(text, rule, config)
        else:
            raise Exception(f"不支援的提供商: {provider}")
    
    def _build_openai_request(self, text: str, rule: ClassificationRule, 
                             config: Dict) -> Tuple[Dict, Dict]:
        """構建OpenAI請求"""
        headers = {
            "Authorization": f"Bearer {await self.config_service.get_ai_api_key('openai')}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": config["models"][0],
            "messages": [
                {"role": "system", "content": rule.prompt},
                {"role": "user", "content": text}
            ],
            "max_tokens": min(config["max_tokens"], 1000),
            "temperature": 0.3,
            "response_format": {"type": "json_object"}
        }
        
        return headers, payload
    
    def _build_claude_request(self, text: str, rule: ClassificationRule,
                             config: Dict) -> Tuple[Dict, Dict]:
        """構建Claude請求"""
        headers = {
            "x-api-key": await self.config_service.get_ai_api_key('claude'),
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }
        
        payload = {
            "model": config["models"][0],
            "max_tokens": min(config["max_tokens"], 1000),
            "messages": [
                {"role": "user", "content": f"{rule.prompt}\n\n文本內容：{text}"}
            ]
        }
        
        return headers, payload
    
    def _build_gemini_request(self, text: str, rule: ClassificationRule,
                             config: Dict) -> Tuple[Dict, Dict]:
        """構建Gemini請求"""
        api_key = await self.config_service.get_ai_api_key('gemini')
        headers = {"Content-Type": "application/json"}
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": f"{rule.prompt}\n\n文本內容：{text}"
                }]
            }],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": min(config["max_tokens"], 1000)
            }
        }
        
        return headers, payload
    
    def _build_mistral_request(self, text: str, rule: ClassificationRule,
                              config: Dict) -> Tuple[Dict, Dict]:
        """構建Mistral請求"""
        headers = {
            "Authorization": f"Bearer {await self.config_service.get_ai_api_key('mistral')}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": config["models"][0],
            "messages": [
                {"role": "user", "content": f"{rule.prompt}\n\n文本內容：{text}"}
            ],
            "max_tokens": min(config["max_tokens"], 1000),
            "temperature": 0.3
        }
        
        return headers, payload
    
    def _parse_response(self, response: Dict, provider: AIProvider) -> Dict[str, Any]:
        """解析API響應"""
        try:
            if provider == AIProvider.OPENAI:
                content = response["choices"][0]["message"]["content"]
                return self._parse_json_response(content)
            elif provider == AIProvider.CLAUDE:
                content = response["content"][0]["text"]
                return self._parse_json_response(content)
            elif provider == AIProvider.GEMINI:
                content = response["candidates"][0]["content"]["parts"][0]["text"]
                return self._parse_json_response(content)
            elif provider == AIProvider.MISTRAL:
                content = response["choices"][0]["message"]["content"]
                return self._parse_json_response(content)
            else:
                raise Exception(f"不支援的提供商響應格式: {provider}")
        except Exception as e:
            logger.error(f"解析響應失敗: {e}")
            return {"classification": "未知", "confidence": 0.0}
    
    def _parse_json_response(self, content: str) -> Dict[str, Any]:
        """解析JSON響應"""
        try:
            # 嘗試直接解析JSON
            if content.strip().startswith("{"):
                return json.loads(content)
            
            # 嘗試提取JSON部分
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            
            # 嘗試解析純文本分類
            lines = content.strip().split('\n')
            for line in lines:
                line = line.strip()
                if line and not line.startswith('#'):
                    return {"classification": line, "confidence": 0.8}
            
            return {"classification": "未知", "confidence": 0.0}
            
        except json.JSONDecodeError:
            logger.warning(f"JSON解析失敗，使用文本解析: {content}")
            return {"classification": content.strip(), "confidence": 0.7}
    
    def _calculate_cost(self, text: str, provider: AIProvider) -> float:
        """計算處理成本"""
        config = self.provider_configs[provider.value]
        # 簡單的token估算 (1個中文字符約等於1.5個token)
        estimated_tokens = len(text) * 1.5
        return estimated_tokens * config["cost_per_token"]
    
    def _estimate_cost(self, text: str, provider_name: str) -> float:
        """估算處理成本"""
        config = self.provider_configs[provider_name]
        estimated_tokens = len(text) * 1.5
        return estimated_tokens * config["cost_per_token"]
    
    async def _is_provider_available(self, provider_name: str) -> bool:
        """檢查提供商是否可用"""
        # 檢查速率限制
        current_time = time.time()
        if provider_name in self.performance_stats:
            last_request = self.performance_stats[provider_name].get("last_request", 0)
            if current_time - last_request < 60:  # 1分鐘內
                return False
        
        # 檢查API金鑰
        api_key = await self.config_service.get_ai_api_key(provider_name)
        return bool(api_key)
    
    def _get_performance_score(self, provider_name: str) -> float:
        """獲取提供商性能分數"""
        if provider_name not in self.performance_stats:
            return 1.0
        
        stats = self.performance_stats[provider_name]
        success_rate = stats.get("success_rate", 1.0)
        avg_response_time = stats.get("avg_response_time", 5.0)
        
        # 綜合評分 (成功率 * 響應時間倒數)
        return success_rate * (1.0 / max(avg_response_time, 0.1))
    
    async def _update_stats(self, provider: AIProvider, result: Dict, 
                           cost: float, processing_time: float):
        """更新性能統計"""
        provider_name = provider.value
        
        if provider_name not in self.performance_stats:
            self.performance_stats[provider_name] = {
                "total_requests": 0,
                "successful_requests": 0,
                "total_cost": 0.0,
                "total_time": 0.0,
                "last_request": time.time()
            }
        
        stats = self.performance_stats[provider_name]
        stats["total_requests"] += 1
        stats["total_cost"] += cost
        stats["total_time"] += processing_time
        stats["last_request"] = time.time()
        
        if result.get("classification"):
            stats["successful_requests"] += 1
        
        # 計算平均值
        stats["success_rate"] = stats["successful_requests"] / stats["total_requests"]
        stats["avg_response_time"] = stats["total_time"] / stats["total_requests"]
        stats["avg_cost"] = stats["total_cost"] / stats["total_requests"]
    
    async def _classify_with_fallback(self, text: str, rule: ClassificationRule,
                                    original_error: Exception) -> ClassificationResult:
        """使用備用提供商進行分類"""
        logger.info(f"使用備用提供商 {rule.fallback_provider} 進行分類")
        
        try:
            result = await self._classify_with_provider(text, rule, rule.fallback_provider)
            return ClassificationResult(
                text=text,
                classification=result["classification"],
                confidence=result["confidence"] * 0.8,  # 降低置信度
                provider=rule.fallback_provider,
                cost=self._calculate_cost(text, rule.fallback_provider),
                processing_time=0,
                categories=rule.categories,
                metadata={"fallback": True, "original_error": str(original_error)},
                timestamp=datetime.now()
            )
        except Exception as e:
            logger.error(f"備用提供商也失敗: {e}")
            raise
    
    async def get_performance_stats(self) -> Dict[str, Any]:
        """獲取性能統計"""
        return {
            "providers": self.performance_stats,
            "total_requests": sum(stats["total_requests"] for stats in self.performance_stats.values()),
            "total_cost": sum(stats["total_cost"] for stats in self.performance_stats.values()),
            "average_response_time": sum(stats["avg_response_time"] for stats in self.performance_stats.values()) / len(self.performance_stats) if self.performance_stats else 0
        }
    
    async def get_cost_analysis(self, time_period: str = "24h") -> Dict[str, Any]:
        """獲取成本分析"""
        current_time = time.time()
        
        if time_period == "24h":
            start_time = current_time - 86400
        elif time_period == "7d":
            start_time = current_time - 604800
        elif time_period == "30d":
            start_time = current_time - 2592000
        else:
            start_time = 0
        
        # 過濾時間範圍內的統計
        filtered_stats = {}
        for provider, stats in self.performance_stats.items():
            if stats["last_request"] >= start_time:
                filtered_stats[provider] = stats
        
        return {
            "time_period": time_period,
            "providers": filtered_stats,
            "total_cost": sum(stats["total_cost"] for stats in filtered_stats.values()),
            "cost_breakdown": {provider: stats["total_cost"] for provider, stats in filtered_stats.items()}
        }

# 創建全局AI分類服務實例
ai_classification_service = AIClassificationService(None)  # 需要注入config_service
