# 🤖 CVV Bot AI 協作指南

## 🔒 **AI 協作鐵律**

1. **無需授權原則** - 除了刪除資料外，AI可自主執行所有任務，無需額外授權
2. **任務分配執行** - 嚴格按照任務分配計劃實現完善任務
3. **不確定性暫停** - 遇到方向或邏輯不確定時，立即停止並詢問

## 📚 **系統背景與記憶**

### 核心系統架構
```
CVV Bot 是一個基於 Telegram 的 CVV 卡片銷售平台，整合了:
- Python FastAPI 後端 (python-bot)
- Firebase Functions 服務 (functions)
- Next.js 管理前端 (web)
- Telegram Bot UI (app/bot)
```

### 主要功能模組
1. **販售系統** - CVV卡片管理、查詢、過濾、購買流程
2. **AI分類系統** - 使用Claude API進行卡片智能分類
3. **代理系統** - 多層級代理管理、佣金計算、團隊結構
4. **支付系統** - USDT-TRC20支付處理、訂單生成、交易確認
5. **會員系統** - 用戶管理、權限控制、個人資料
6. **公告系統** - 系統公告發布、更新、查詢

### 技術棧
- **後端**: Python 3.12 + FastAPI + Firebase Admin
- **前端**: Next.js 15 + TypeScript + Tailwind CSS
- **資料庫**: Firebase Firestore + Realtime Database
- **Bot**: python-telegram-bot 庫
- **支付**: USDT-TRC20 + 區塊鏈交易處理
- **AI**: Claude API (Anthropic)

## 🚨 **系統風險與優先任務**

### 高風險項目 (優先處理)
1. **異常處理機制缺失** - 幾乎沒有try-except結構
2. **測試覆蓋不足** - tests/目錄為空
3. **支付安全性不足** - 缺乏交易驗證和異常處理
4. **用戶認證機制薄弱** - 缺乏多因素認證和敏感操作確認
5. **數據驗證缺失** - 缺乏輸入驗證，可能導致數據不一致

### 中風險項目
1. **系統耦合過緊** - Python Bot與Firebase Functions間依賴關係複雜
2. **日誌記錄不完善** - 雖有日誌記錄，但缺乏結構化錯誤追蹤
3. **擴展性限制** - 部分模組設計未考慮未來擴展需求

### 低風險項目
1. **配置硬編碼** - 部分配置直接寫入代碼，不利於環境切換

## 📋 **任務優先級表**

### 🔥 最高優先級 (立即實施)
| 任務ID | 任務描述 | 風險等級 | 預估工作量 | 所屬模組 |
|-------|---------|---------|----------|---------|
| TASK-01 | 添加全面的異常處理機制 | 高 | 3天 | 全系統 |
| TASK-02 | 實現支付流程數據驗證和安全檢查 | 高 | 4天 | 支付系統 |
| TASK-03 | 加強用戶認證機制 | 高 | 2天 | 會員系統 |
| TASK-04 | 實現基本的單元測試框架 | 高 | 5天 | 全系統 |
| TASK-05 | 添加輸入數據驗證層 | 高 | 3天 | 全系統 |

### ⚡ 高優先級 (短期計劃)
| 任務ID | 任務描述 | 風險等級 | 預估工作量 | 所屬模組 |
|-------|---------|---------|----------|---------|
| TASK-06 | 完善AI分類系統的錯誤處理 | 高 | 3天 | AI分類系統 |
| TASK-07 | 實現代理統計功能 | 中 | 2天 | 代理系統 |
| TASK-08 | 改進日誌記錄系統 | 中 | 2天 | 全系統 |
| TASK-09 | 優化系統耦合度 | 中 | 4天 | 架構 |
| TASK-10 | 實現卡片有效性驗證機制 | 高 | 3天 | 販售系統 |

### 📊 中優先級 (中期規劃)
| 任務ID | 任務描述 | 風險等級 | 預估工作量 | 所屬模組 |
|-------|---------|---------|----------|---------|
| TASK-11 | 建立完整的測試套件 | 中 | 7天 | 全系統 |
| TASK-12 | 實現系統監控和警報機制 | 中 | 5天 | 全系統 |
| TASK-13 | 優化數據庫查詢和索引 | 中 | 3天 | 資料庫 |
| TASK-14 | 實現配置外部化 | 低 | 2天 | 架構 |
| TASK-15 | 多語言支持 | 低 | 3天 | UI |

## 🛠️ **任務實現指南**

### TASK-01: 添加全面的異常處理機制
```python
# 實現方式: 在所有關鍵函數中添加try-except結構
async def get_cvv_cards(self, filters: Dict[str, Any] = None) -> List[Dict]:
    try:
        # 原有代碼
        result = await self.firebase_service.get_collection_data('cvv_cards', filters)
        return result
    except FirebaseError as e:
        logger.error(f"Firebase錯誤: {e}")
        raise CVVServiceError(f"獲取CVV卡片失敗: {str(e)}")
    except Exception as e:
        logger.error(f"未知錯誤: {e}")
        raise CVVServiceError(f"獲取CVV卡片時發生未知錯誤: {str(e)}")
```

### TASK-02: 實現支付流程數據驗證和安全檢查
```python
# 實現方式: 添加交易驗證和異常處理
async def verify_payment(self, payment_data: Dict[str, Any]) -> bool:
    try:
        # 1. 驗證基本數據
        self._validate_payment_data(payment_data)
        
        # 2. 驗證交易哈希
        tx_hash = payment_data.get('tx_hash')
        if not tx_hash:
            raise PaymentValidationError("缺少交易哈希")
            
        # 3. 區塊鏈驗證
        verification_result = await self._verify_blockchain_transaction(tx_hash)
        if not verification_result['valid']:
            logger.warning(f"交易驗證失敗: {verification_result['reason']}")
            return False
            
        # 4. 金額驗證
        if not self._verify_payment_amount(payment_data, verification_result):
            logger.warning("支付金額不匹配")
            return False
            
        return True
    except PaymentValidationError as e:
        logger.error(f"支付驗證錯誤: {e}")
        return False
    except Exception as e:
        logger.error(f"支付驗證未知錯誤: {e}")
        return False
```

### TASK-03: 加強用戶認證機制
```python
# 實現方式: 添加多因素認證和敏感操作確認
async def authenticate_user(self, user_id: str, auth_code: str = None) -> bool:
    try:
        # 1. 基本認證
        user = await self.get_user_by_id(user_id)
        if not user:
            return False
            
        # 2. 敏感操作需要二次驗證
        if self._is_sensitive_operation() and not auth_code:
            await self._send_auth_code(user)
            return False
            
        # 3. 驗證二次認證碼
        if auth_code:
            return await self._verify_auth_code(user, auth_code)
            
        return True
    except Exception as e:
        logger.error(f"用戶認證錯誤: {e}")
        return False
```

### TASK-04: 實現基本的單元測試框架
```python
# 實現方式: 創建測試文件和基本測試案例
# 文件: tests/services/test_cvv_service.py
import pytest
from app.services.cvv_service import CVVService
from unittest.mock import MagicMock, patch

class TestCVVService:
    @pytest.fixture
    def cvv_service(self):
        service = CVVService()
        service.firebase_service = MagicMock()
        return service
        
    async def test_get_cvv_cards_success(self, cvv_service):
        # 準備測試數據
        mock_cards = [{"id": "1", "number": "4111111111111111"}]
        cvv_service.firebase_service.get_collection_data.return_value = mock_cards
        
        # 執行測試
        result = await cvv_service.get_cvv_cards()
        
        # 驗證結果
        assert result == mock_cards
        cvv_service.firebase_service.get_collection_data.assert_called_once_with('cvv_cards', None)
        
    async def test_get_cvv_cards_error(self, cvv_service):
        # 模擬錯誤
        cvv_service.firebase_service.get_collection_data.side_effect = Exception("測試錯誤")
        
        # 執行測試並驗證異常
        with pytest.raises(CVVServiceError):
            await cvv_service.get_cvv_cards()
```

## 📖 **關鍵文件與資源**

### 核心代碼文件
- `python-bot/app/bot/telegram_bot.py` - Telegram Bot 核心
- `python-bot/app/services/cvv_service.py` - CVV 卡片服務
- `python-bot/app/services/payment_service.py` - 支付處理服務
- `python-bot/app/services/agent_service.py` - 代理商管理服務
- `functions/src/services/cvv.ts` - Firebase CVV 服務
- `functions/src/services/claude.ts` - AI 分類服務

### 文檔與藍圖
- `對話/AI協作藍圖/ARCHITECTURE_BLUEPRINT.md` - 系統架構藍圖
- `對話/AI協作藍圖/AI_CLASSIFICATION_GUIDE.md` - AI 分類指南
- `程序結構與風險評估報告.md` - 風險評估報告

## 🔄 **工作流程**

1. **任務選擇** - 從任務優先級表中選擇待實現任務
2. **代碼分析** - 閱讀相關文件，理解當前實現
3. **實現方案** - 按照指南實現功能，遵循鐵律
4. **測試驗證** - 確保功能正常工作
5. **提交報告** - 報告任務完成情況

---

*最後更新時間: 2025-08-27*
