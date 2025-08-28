"""
支付 API 路由
處理支付相關的 API 請求
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import logging

from ..services.payment_service import payment_service
from ..services.firebase_service import firebase_service

router = APIRouter()
logger = logging.getLogger(__name__)

# 請求/響應模型
class CreatePaymentRequest(BaseModel):
    """創建支付請求"""
    user_id: str
    amount: float
    order_type: str = "recharge"
    metadata: Optional[Dict[str, Any]] = None

class PaymentStatusRequest(BaseModel):
    """支付狀態查詢請求"""
    order_id: str

class WithdrawalRequest(BaseModel):
    """提現請求"""
    user_id: str
    amount: float
    withdrawal_address: str
    note: Optional[str] = None

class PaymentResponse(BaseModel):
    """支付響應"""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

@router.post("/create", response_model=PaymentResponse)
async def create_payment_order(request: CreatePaymentRequest):
    """創建支付訂單"""
    try:
        # 驗證用戶存在
        user = await firebase_service.get_user_by_id(request.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="用戶不存在")
        
        # 驗證金額
        if request.amount < 10:
            raise HTTPException(status_code=400, detail="最低充值金額為 $10 USDT")
        
        if request.amount > 10000:
            raise HTTPException(status_code=400, detail="單次最高充值金額為 $10,000 USDT")
        
        # 創建支付訂單
        result = await payment_service.create_payment_order(
            user_id=request.user_id,
            amount=request.amount,
            order_type=request.order_type
        )
        
        if result['success']:
            return PaymentResponse(
                success=True,
                message="支付訂單創建成功",
                data=result
            )
        else:
            raise HTTPException(status_code=500, detail=result.get('error', '創建支付訂單失敗'))
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"創建支付訂單失敗: {e}")
        raise HTTPException(status_code=500, detail="系統錯誤")

@router.get("/status/{order_id}", response_model=PaymentResponse)
async def check_payment_status(order_id: str):
    """檢查支付狀態"""
    try:
        result = await payment_service.check_payment_status(order_id)
        
        if result['success']:
            return PaymentResponse(
                success=True,
                message="支付狀態查詢成功",
                data=result
            )
        else:
            raise HTTPException(status_code=404, detail=result.get('error', '訂單不存在'))
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"檢查支付狀態失敗: {e}")
        raise HTTPException(status_code=500, detail="系統錯誤")

@router.get("/history/{user_id}")
async def get_payment_history(user_id: str, limit: int = 10):
    """獲取支付歷史"""
    try:
        # 驗證用戶存在
        user = await firebase_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="用戶不存在")
        
        # 獲取支付歷史
        history = await payment_service.get_payment_history(user_id, limit)
        
        return PaymentResponse(
            success=True,
            message="支付歷史獲取成功",
            data={"history": history, "total": len(history)}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"獲取支付歷史失敗: {e}")
        raise HTTPException(status_code=500, detail="系統錯誤")

@router.post("/withdraw", response_model=PaymentResponse)
async def create_withdrawal(request: WithdrawalRequest):
    """創建提現請求"""
    try:
        # 驗證用戶存在
        user = await firebase_service.get_user_by_id(request.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="用戶不存在")
        
        # 驗證提現金額
        if request.amount < 50:
            raise HTTPException(status_code=400, detail="最低提現金額為 $50 USDT")
        
        # 驗證 TRON 地址格式
        if not request.withdrawal_address.startswith('T') or len(request.withdrawal_address) != 34:
            raise HTTPException(status_code=400, detail="無效的 TRON 地址格式")
        
        # 處理提現請求
        result = await payment_service.process_withdrawal(
            user_id=request.user_id,
            amount=request.amount,
            withdrawal_address=request.withdrawal_address
        )
        
        if result['success']:
            return PaymentResponse(
                success=True,
                message="提現請求已提交，等待處理",
                data=result
            )
        else:
            raise HTTPException(status_code=400, detail=result.get('error', '提現請求失敗'))
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"創建提現請求失敗: {e}")
        raise HTTPException(status_code=500, detail="系統錯誤")

@router.get("/methods")
async def get_payment_methods():
    """獲取支付方式"""
    try:
        methods = [
            {
                "id": "usdt_trc20",
                "name": "USDT-TRC20",
                "network": "TRON",
                "currency": "USDT",
                "min_amount": 10,
                "max_amount": 10000,
                "fee": 0,
                "confirmation_blocks": 1,
                "estimated_time": "1-3 分鐘",
                "icon": "💰",
                "description": "基於 TRON 網絡的 USDT，手續費低，到賬快速",
                "available": True
            }
        ]
        
        return PaymentResponse(
            success=True,
            message="支付方式獲取成功",
            data={"methods": methods}
        )
        
    except Exception as e:
        logger.error(f"獲取支付方式失敗: {e}")
        raise HTTPException(status_code=500, detail="系統錯誤")

@router.get("/rates")
async def get_exchange_rates():
    """獲取匯率信息"""
    try:
        # 這裡應該從實際的匯率 API 獲取數據
        rates = {
            "USDT": {
                "USD": 1.00,
                "CNY": 7.25,
                "TWD": 31.50,
                "EUR": 0.92,
                "JPY": 150.00
            },
            "last_updated": "2025-01-27T12:00:00Z"
        }
        
        return PaymentResponse(
            success=True,
            message="匯率信息獲取成功",
            data=rates
        )
        
    except Exception as e:
        logger.error(f"獲取匯率信息失敗: {e}")
        raise HTTPException(status_code=500, detail="系統錯誤")

@router.post("/callback/tron")
async def tron_payment_callback(callback_data: Dict[str, Any]):
    """TRON 支付回調處理"""
    try:
        # 這裡處理來自 TRON 網絡的支付確認回調
        # 實際實現需要驗證回調的真實性
        
        transaction_hash = callback_data.get('transaction_hash')
        to_address = callback_data.get('to_address')
        amount = callback_data.get('amount')
        confirmations = callback_data.get('confirmations', 0)
        
        if not all([transaction_hash, to_address, amount]):
            raise HTTPException(status_code=400, detail="回調數據不完整")
        
        # 查找對應的支付訂單
        orders_ref = firebase_service.db.collection('payment_orders')
        query = orders_ref.where('payment_address', '==', to_address).where('status', '==', 'pending')
        docs = list(query.stream())
        
        for doc in docs:
            order_data = doc.to_dict()
            if order_data['amount'] <= amount:
                # 更新訂單狀態
                await payment_service._update_order_status(doc.id, 'confirmed', {
                    'transaction_hash': transaction_hash,
                    'confirmed_at': datetime.utcnow(),
                    'actual_amount': amount,
                    'confirmations_received': confirmations
                })
                
                # 處理支付成功邏輯
                await payment_service._process_payment_success(order_data)
                
                logger.info(f"支付回調處理成功: {transaction_hash}")
                break
        
        return {"status": "success"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"處理支付回調失敗: {e}")
        raise HTTPException(status_code=500, detail="回調處理失敗")

@router.get("/statistics/{user_id}")
async def get_payment_statistics(user_id: str):
    """獲取用戶支付統計"""
    try:
        # 驗證用戶存在
        user = await firebase_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="用戶不存在")
        
        # 獲取支付統計
        orders_ref = firebase_service.db.collection('payment_orders')
        user_orders_query = orders_ref.where('user_id', '==', user_id)
        docs = list(user_orders_query.stream())
        
        total_orders = len(docs)
        total_amount = 0
        successful_orders = 0
        pending_orders = 0
        
        for doc in docs:
            order_data = doc.to_dict()
            if order_data['status'] == 'confirmed':
                successful_orders += 1
                total_amount += order_data['amount']
            elif order_data['status'] == 'pending':
                pending_orders += 1
        
        statistics = {
            "total_orders": total_orders,
            "successful_orders": successful_orders,
            "pending_orders": pending_orders,
            "total_amount": total_amount,
            "success_rate": (successful_orders / total_orders * 100) if total_orders > 0 else 0,
            "average_amount": total_amount / successful_orders if successful_orders > 0 else 0
        }
        
        return PaymentResponse(
            success=True,
            message="支付統計獲取成功",
            data=statistics
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"獲取支付統計失敗: {e}")
        raise HTTPException(status_code=500, detail="系統錯誤")
