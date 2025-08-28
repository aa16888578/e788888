"""
支付服務
處理 USDT-TRC20 支付相關功能
"""
import logging
import hashlib
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import requests
import asyncio

from ..services.firebase_service import firebase_service
from ..core.config import settings

logger = logging.getLogger(__name__)

class PaymentService:
    """支付服務類"""
    
    def __init__(self):
        self.tron_api_base = "https://api.trongrid.io"
        self.usdt_contract = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"  # USDT-TRC20 合約地址
        
    async def create_payment_order(self, user_id: str, amount: float, order_type: str = "recharge") -> Dict[str, Any]:
        """創建支付訂單"""
        try:
            # 生成唯一訂單號
            order_id = f"PAY_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8].upper()}"
            
            # 生成支付地址（這裡使用固定地址，實際應該為每個用戶生成唯一地址）
            payment_address = await self._generate_payment_address(user_id)
            
            # 創建訂單記錄
            order_data = {
                "order_id": order_id,
                "user_id": user_id,
                "amount": amount,
                "currency": "USDT",
                "order_type": order_type,
                "payment_address": payment_address,
                "status": "pending",
                "created_at": datetime.utcnow(),
                "expires_at": datetime.utcnow() + timedelta(hours=2),  # 2小時過期
                "payment_method": "USDT-TRC20",
                "network": "TRON",
                "confirmations_required": 1,
                "confirmations_received": 0,
                "transaction_hash": None,
                "confirmed_at": None,
                "metadata": {
                    "user_agent": "CVV Bot",
                    "ip_address": "unknown"
                }
            }
            
            # 保存到 Firebase
            doc_ref = firebase_service.db.collection('payment_orders').add(order_data)
            payment_id = doc_ref[1].id
            
            logger.info(f"創建支付訂單成功: {order_id}")
            
            return {
                "success": True,
                "payment_id": payment_id,
                "order_id": order_id,
                "amount": amount,
                "currency": "USDT",
                "payment_address": payment_address,
                "network": "TRC20",
                "expires_at": order_data["expires_at"].isoformat(),
                "qr_code_data": f"tron:{payment_address}?amount={amount}&token=USDT"
            }
            
        except Exception as e:
            logger.error(f"創建支付訂單失敗: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def check_payment_status(self, order_id: str) -> Dict[str, Any]:
        """檢查支付狀態"""
        try:
            # 從數據庫獲取訂單
            orders_ref = firebase_service.db.collection('payment_orders')
            query = orders_ref.where('order_id', '==', order_id)
            docs = list(query.stream())
            
            if not docs:
                return {"success": False, "error": "訂單不存在"}
            
            order_data = docs[0].to_dict()
            order_doc_id = docs[0].id
            
            # 如果已確認，直接返回狀態
            if order_data['status'] == 'confirmed':
                return {
                    "success": True,
                    "status": "confirmed",
                    "amount": order_data['amount'],
                    "transaction_hash": order_data.get('transaction_hash'),
                    "confirmed_at": order_data.get('confirmed_at')
                }
            
            # 檢查是否過期
            if datetime.utcnow() > order_data['expires_at']:
                await self._update_order_status(order_doc_id, 'expired')
                return {"success": True, "status": "expired"}
            
            # 查詢區塊鏈交易
            payment_address = order_data['payment_address']
            expected_amount = order_data['amount']
            
            transactions = await self._check_tron_transactions(payment_address, expected_amount)
            
            if transactions:
                # 找到匹配的交易
                for tx in transactions:
                    if tx['amount'] >= expected_amount:
                        # 更新訂單狀態
                        await self._update_order_status(order_doc_id, 'confirmed', {
                            'transaction_hash': tx['hash'],
                            'confirmed_at': datetime.utcnow(),
                            'actual_amount': tx['amount'],
                            'confirmations_received': tx['confirmations']
                        })
                        
                        # 處理支付成功邏輯
                        await self._process_payment_success(order_data)
                        
                        return {
                            "success": True,
                            "status": "confirmed",
                            "amount": tx['amount'],
                            "transaction_hash": tx['hash'],
                            "confirmed_at": datetime.utcnow().isoformat()
                        }
            
            return {
                "success": True,
                "status": "pending",
                "amount": expected_amount,
                "payment_address": payment_address
            }
            
        except Exception as e:
            logger.error(f"檢查支付狀態失敗: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_payment_history(self, user_id: str, limit: int = 10) -> List[Dict]:
        """獲取用戶支付歷史"""
        try:
            orders_ref = firebase_service.db.collection('payment_orders')
            query = orders_ref.where('user_id', '==', user_id).order_by('created_at', direction='DESCENDING').limit(limit)
            docs = query.stream()
            
            history = []
            for doc in docs:
                order_data = doc.to_dict()
                history.append({
                    "order_id": order_data['order_id'],
                    "amount": order_data['amount'],
                    "currency": order_data['currency'],
                    "status": order_data['status'],
                    "order_type": order_data['order_type'],
                    "created_at": order_data['created_at'].isoformat() if order_data['created_at'] else None,
                    "confirmed_at": order_data.get('confirmed_at').isoformat() if order_data.get('confirmed_at') else None,
                    "transaction_hash": order_data.get('transaction_hash')
                })
            
            return history
            
        except Exception as e:
            logger.error(f"獲取支付歷史失敗: {e}")
            return []
    
    async def process_withdrawal(self, user_id: str, amount: float, withdrawal_address: str) -> Dict[str, Any]:
        """處理提現請求"""
        try:
            # 檢查用戶餘額
            user_ref = firebase_service.db.collection('users').document(user_id)
            user_doc = user_ref.get()
            
            if not user_doc.exists:
                return {"success": False, "error": "用戶不存在"}
            
            user_data = user_doc.to_dict()
            current_balance = user_data.get('balance', 0)
            
            if current_balance < amount:
                return {"success": False, "error": "餘額不足"}
            
            # 創建提現訂單
            withdrawal_id = f"WD_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8].upper()}"
            
            withdrawal_data = {
                "withdrawal_id": withdrawal_id,
                "user_id": user_id,
                "amount": amount,
                "withdrawal_address": withdrawal_address,
                "status": "pending",
                "created_at": datetime.utcnow(),
                "processed_at": None,
                "transaction_hash": None,
                "fee": amount * 0.01,  # 1% 手續費
                "net_amount": amount * 0.99,
                "network": "TRC20"
            }
            
            # 保存提現記錄
            firebase_service.db.collection('withdrawals').add(withdrawal_data)
            
            # 凍結用戶餘額
            user_ref.update({
                "balance": current_balance - amount,
                "frozen_balance": user_data.get('frozen_balance', 0) + amount,
                "updated_at": datetime.utcnow()
            })
            
            logger.info(f"創建提現訂單: {withdrawal_id}, 金額: {amount}")
            
            return {
                "success": True,
                "withdrawal_id": withdrawal_id,
                "amount": amount,
                "fee": withdrawal_data["fee"],
                "net_amount": withdrawal_data["net_amount"],
                "status": "pending"
            }
            
        except Exception as e:
            logger.error(f"處理提現請求失敗: {e}")
            return {"success": False, "error": str(e)}
    
    async def _generate_payment_address(self, user_id: str) -> str:
        """生成支付地址"""
        # 這裡應該實現真正的地址生成邏輯
        # 暫時返回固定地址
        return "TQn9Y2khEsLMWtWxG8rWXcZKMnFmZKZdKj"
    
    async def _check_tron_transactions(self, address: str, expected_amount: float) -> List[Dict]:
        """檢查 TRON 地址的 USDT 交易"""
        try:
            # 這裡應該實現真正的區塊鏈查詢邏輯
            # 暫時返回模擬數據
            
            # 實際實現應該調用 TRON API
            url = f"{self.tron_api_base}/v1/accounts/{address}/transactions/trc20"
            params = {
                "limit": 20,
                "contract_address": self.usdt_contract
            }
            
            # 模擬 API 調用
            # response = requests.get(url, params=params)
            # 暫時返回空列表
            
            return []
            
        except Exception as e:
            logger.error(f"檢查 TRON 交易失敗: {e}")
            return []
    
    async def _update_order_status(self, order_doc_id: str, status: str, additional_data: Dict = None):
        """更新訂單狀態"""
        try:
            order_ref = firebase_service.db.collection('payment_orders').document(order_doc_id)
            
            updates = {
                "status": status,
                "updated_at": datetime.utcnow()
            }
            
            if additional_data:
                updates.update(additional_data)
            
            order_ref.update(updates)
            
        except Exception as e:
            logger.error(f"更新訂單狀態失敗: {e}")
    
    async def _process_payment_success(self, order_data: Dict):
        """處理支付成功邏輯"""
        try:
            user_id = order_data['user_id']
            amount = order_data['amount']
            order_type = order_data['order_type']
            
            if order_type == "recharge":
                # 充值到用戶餘額
                await self._add_user_balance(user_id, amount)
                
            elif order_type == "purchase":
                # 購買商品的邏輯
                await self._process_purchase(user_id, order_data)
            
            logger.info(f"支付成功處理完成: 用戶={user_id}, 金額={amount}, 類型={order_type}")
            
        except Exception as e:
            logger.error(f"處理支付成功邏輯失敗: {e}")
    
    async def _add_user_balance(self, user_id: str, amount: float):
        """增加用戶餘額"""
        try:
            user_ref = firebase_service.db.collection('users').document(user_id)
            
            user_ref.update({
                "balance": firebase_service.db.FieldValue.increment(amount),
                "total_recharged": firebase_service.db.FieldValue.increment(amount),
                "updated_at": datetime.utcnow()
            })
            
            # 記錄餘額變動
            balance_record = {
                "user_id": user_id,
                "amount": amount,
                "type": "recharge",
                "description": f"USDT 充值 {amount}",
                "created_at": datetime.utcnow()
            }
            
            firebase_service.db.collection('balance_records').add(balance_record)
            
        except Exception as e:
            logger.error(f"增加用戶餘額失敗: {e}")
    
    async def _process_purchase(self, user_id: str, order_data: Dict):
        """處理購買邏輯"""
        try:
            # 這裡實現購買商品的邏輯
            # 例如：扣除庫存、發送商品等
            pass
            
        except Exception as e:
            logger.error(f"處理購買邏輯失敗: {e}")

# 創建全局支付服務實例
payment_service = PaymentService()
