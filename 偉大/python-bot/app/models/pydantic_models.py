"""
Pydantic 數據模型 - 用於 API 和 Firebase 交互
"""
from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field

class CVVCardResponse(BaseModel):
    """CVV 卡片響應模型 - 用於 API 返回"""
    id: Optional[str] = Field(None, alias="_id")
    
    # 顯示信息 (不包含敏感數據)
    country_code: str  # AR
    country_name: str  # 阿根廷
    country_flag: str  # 🇦🇷
    category: str = "全資"  # 全資、半資等
    
    # 成功率信息
    success_rate_display: str  # "40%-70%"
    success_rate_min: int  # 40
    success_rate_max: int  # 70
    
    # 商品信息
    stock: int  # 庫存數量
    price: float  # 單價 USDT
    card_type: str  # Visa, Mastercard
    
    # 狀態
    status: str = "available"
    
    @property
    def display_name(self) -> str:
        """生成顯示名稱：AR_阿根廷 🇦🇷_全資 40%-70% 【2417】"""
        return f"{self.country_code}_{self.country_name} {self.country_flag}_{self.category} {self.success_rate_display} 【{self.stock}】"
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "country_code": "AR",
                "country_name": "阿根廷",
                "country_flag": "🇦🇷",
                "category": "全資",
                "success_rate_display": "40%-70%",
                "success_rate_min": 40,
                "success_rate_max": 70,
                "stock": 2417,
                "price": 8.50,
                "card_type": "Visa",
                "status": "available"
            }
        }

class CVVCardCreate(BaseModel):
    """創建 CVV 卡片的請求模型"""
    # 基本信息
    country_code: str
    country_name: str
    country_flag: str
    category: str = "全資"
    
    # 卡片信息 (加密前)
    card_number: str
    expiry_date: str  # MM/YYYY
    cvv_code: str
    cardholder_name: Optional[str] = None
    
    # 銀行信息
    bank_name: Optional[str] = None
    card_type: str  # visa, mastercard, amex
    
    # 成功率
    success_rate_min: int
    success_rate_max: int
    
    # 價格
    price: float
    
    # 批次信息
    batch_id: Optional[str] = None
    source: str = "manual"

class UserResponse(BaseModel):
    """用戶響應模型"""
    id: Optional[str] = None
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    balance: float = 0.0
    is_admin: bool = False
    is_agent: bool = False
    created_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class AgentResponse(BaseModel):
    """代理商響應模型"""
    id: Optional[str] = None
    user_id: str
    telegram_id: int
    referral_code: str
    level: int
    level_name: str
    level_icon: str
    commission_rate: float
    status: str
    total_sales: float = 0.0
    total_commission: float = 0.0
    available_commission: float = 0.0
    team_size: int = 0
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user123",
                "telegram_id": 123456789,
                "referral_code": "AGENT123",
                "level": 1,
                "level_name": "銅牌代理",
                "level_icon": "🥉",
                "commission_rate": 0.05,
                "status": "active",
                "total_sales": 500.0,
                "total_commission": 25.0,
                "available_commission": 10.0,
                "team_size": 3
            }
        }

class OrderResponse(BaseModel):
    """訂單響應模型"""
    id: Optional[str] = None
    order_number: str
    user_id: str
    telegram_id: int
    
    # 商品信息
    cvv_card_info: Dict  # CVV 卡片的基本信息
    quantity: int
    unit_price: float
    total_amount: float
    
    # 狀態
    order_status: str
    payment_status: str
    
    # 時間
    created_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Telegram Bot 專用模型
class TelegramUser(BaseModel):
    """Telegram 用戶信息"""
    id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    language_code: Optional[str] = "zh-TW"

class InlineKeyboardButton(BaseModel):
    """內嵌鍵盤按鈕"""
    text: str
    callback_data: Optional[str] = None
    url: Optional[str] = None

class InlineKeyboardMarkup(BaseModel):
    """內嵌鍵盤"""
    inline_keyboard: List[List[InlineKeyboardButton]]

# API 請求/響應模型
class CVVPurchaseRequest(BaseModel):
    """購買 CVV 請求"""
    user_id: int
    cvv_card_id: str
    quantity: int = 1

class CVVPurchaseResponse(BaseModel):
    """購買 CVV 響應"""
    success: bool
    message: str
    order_id: Optional[str] = None
    payment_address: Optional[str] = None
    payment_amount: Optional[float] = None

class BalanceResponse(BaseModel):
    """餘額查詢響應"""
    user_id: int
    balance: float
    currency: str = "USDT"

class RechargeRequest(BaseModel):
    """充值請求"""
    user_id: int
    amount: float

class RechargeResponse(BaseModel):
    """充值響應"""
    success: bool
    message: str
    payment_address: str
    payment_amount: float
    order_id: str
