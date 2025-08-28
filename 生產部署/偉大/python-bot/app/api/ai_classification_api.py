"""
AI 分類 API
提供後台管理的 AI 分類功能
"""
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
from pydantic import BaseModel
import json
import time
from datetime import datetime

from ..services.gemini_classification_service import gemini_classification_service
from ..services.cvv_display_service import cvv_display_service
from ..services.firebase_service import firebase_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ai", tags=["AI Classification"])

class CVVClassificationRequest(BaseModel):
    """CVV分類請求模型"""
    cvv_data: str
    admin_user_id: str
    classification_type: str = "single"  # single or batch

class CVVClassificationResponse(BaseModel):
    """CVV分類響應模型"""
    success: bool
    message: str
    result: Optional[Dict[str, Any]] = None
    result_id: Optional[str] = None
    suggested_price: Optional[float] = None

class PriceConfirmationRequest(BaseModel):
    """價格確認請求模型"""
    result_id: str
    final_price: float
    admin_user_id: str

class StockConfirmationRequest(BaseModel):
    """入庫確認請求模型"""
    result_id: str
    admin_user_id: str
    stock_location: str = "auto"  # auto, 全資庫, 裸資庫, 特價庫

@router.post("/classify/single", response_model=CVVClassificationResponse)
async def classify_single_cvv(request: CVVClassificationRequest):
    """單筆CVV數據分類"""
    try:
        logger.info(f"管理員 {request.admin_user_id} 請求單筆CVV分類")
        
        # 驗證管理員權限
        if not await _verify_admin_permission(request.admin_user_id):
            raise HTTPException(status_code=403, detail="無管理員權限")
        
        # 執行AI分類
        async with gemini_classification_service:
            result = await gemini_classification_service.classify_single_cvv(request.cvv_data)
        
        # 生成結果ID
        result_id = f"admin_{request.admin_user_id}_{int(time.time())}"
        
        # 暫存分類結果到數據庫
        await _save_classification_result(result_id, result, request.admin_user_id)
        
        # 格式化響應
        formatted_result = {
            "country_code": result.country_code,
            "country_name": result.country_name,
            "country_flag": result.country_flag,
            "card_type": result.card_type,
            "card_number_masked": f"{result.card_number[:4]}****{result.card_number[-4:] if len(result.card_number) >= 8 else '****'}",
            "expiry_date": result.expiry_date,
            "cardholder_name": result.cardholder_name,
            "phone_number": result.phone_number,
            "confidence": result.confidence,
            "additional_info": result.additional_info
        }
        
        return CVVClassificationResponse(
            success=True,
            message="AI分類完成，請確認售價",
            result=formatted_result,
            result_id=result_id,
            suggested_price=result.suggested_price
        )
        
    except Exception as e:
        logger.error(f"單筆CVV分類失敗: {e}")
        return CVVClassificationResponse(
            success=False,
            message=f"分類失敗: {str(e)}"
        )

@router.post("/classify/batch", response_model=Dict[str, Any])
async def classify_batch_cvv(file: UploadFile = File(...), admin_user_id: str = None):
    """批量CVV數據分類"""
    try:
        logger.info(f"管理員 {admin_user_id} 請求批量CVV分類")
        
        # 驗證管理員權限
        if not await _verify_admin_permission(admin_user_id):
            raise HTTPException(status_code=403, detail="無管理員權限")
        
        # 讀取上傳文件
        content = await file.read()
        text_content = content.decode('utf-8')
        
        # 解析CVV數據行
        cvv_lines = [line.strip() for line in text_content.split('\n') if line.strip()]
        
        if len(cvv_lines) > 100:
            raise HTTPException(status_code=400, detail="批量處理最多支持100條數據")
        
        # 執行批量分類
        async with gemini_classification_service:
            results = await gemini_classification_service.classify_batch_cvv(cvv_lines)
        
        # 生成批次ID
        batch_id = f"batch_{admin_user_id}_{int(time.time())}"
        
        # 保存批次結果
        await _save_batch_classification_results(batch_id, results, admin_user_id)
        
        # 統計結果
        success_count = len([r for r in results if r.confidence > 0.5])
        total_suggested_price = sum(r.suggested_price for r in results)
        
        return {
            "success": True,
            "message": "批量分類完成",
            "batch_id": batch_id,
            "total_processed": len(cvv_lines),
            "success_count": success_count,
            "total_suggested_value": round(total_suggested_price, 2),
            "results": [
                {
                    "index": i,
                    "country": f"{r.country_flag} {r.country_name}",
                    "card_type": r.card_type,
                    "suggested_price": r.suggested_price,
                    "confidence": r.confidence
                }
                for i, r in enumerate(results)
            ]
        }
        
    except Exception as e:
        logger.error(f"批量CVV分類失敗: {e}")
        raise HTTPException(status_code=500, detail=f"批量分類失敗: {str(e)}")

@router.post("/confirm/price", response_model=Dict[str, Any])
async def confirm_price(request: PriceConfirmationRequest):
    """確認分類結果的售價"""
    try:
        logger.info(f"管理員 {request.admin_user_id} 確認售價 ${request.final_price}")
        
        # 驗證管理員權限
        if not await _verify_admin_permission(request.admin_user_id):
            raise HTTPException(status_code=403, detail="無管理員權限")
        
        # 獲取分類結果
        classification_result = await _get_classification_result(request.result_id)
        if not classification_result:
            raise HTTPException(status_code=404, detail="分類結果不存在")
        
        # 更新價格
        classification_result['final_price'] = request.final_price
        classification_result['price_confirmed'] = True
        classification_result['price_confirmed_at'] = datetime.now().isoformat()
        classification_result['confirmed_by'] = request.admin_user_id
        
        # 保存更新
        await _update_classification_result(request.result_id, classification_result)
        
        return {
            "success": True,
            "message": f"售價 ${request.final_price:.2f} 已確認",
            "result_id": request.result_id,
            "ready_for_stock": True
        }
        
    except Exception as e:
        logger.error(f"確認價格失敗: {e}")
        raise HTTPException(status_code=500, detail=f"確認價格失敗: {str(e)}")

@router.post("/confirm/stock", response_model=Dict[str, Any])
async def confirm_stock(request: StockConfirmationRequest):
    """確認入庫"""
    try:
        logger.info(f"管理員 {request.admin_user_id} 確認入庫到 {request.stock_location}")
        
        # 驗證管理員權限
        if not await _verify_admin_permission(request.admin_user_id):
            raise HTTPException(status_code=403, detail="無管理員權限")
        
        # 獲取分類結果
        classification_result = await _get_classification_result(request.result_id)
        if not classification_result:
            raise HTTPException(status_code=404, detail="分類結果不存在")
        
        if not classification_result.get('price_confirmed'):
            raise HTTPException(status_code=400, detail="請先確認售價")
        
        # 創建庫存記錄
        stock_data = {
            "id": f"stock_{request.result_id}",
            "country_code": classification_result.get('country_code'),
            "country_name": classification_result.get('country_name'),
            "country_flag": classification_result.get('country_flag'),
            "card_type": classification_result.get('card_type'),
            "card_number": classification_result.get('card_number'),
            "card_number_prefix": classification_result.get('card_number', '')[:6],
            "expiry_date": classification_result.get('expiry_date'),
            "security_code": classification_result.get('security_code'),
            "cardholder_name": classification_result.get('cardholder_name'),
            "phone_number": classification_result.get('phone_number'),
            "price": classification_result.get('final_price'),
            "suggested_price": classification_result.get('suggested_price'),
            "activity_rate": classification_result.get('confidence', 0) * 100,
            "stock_count": 1,
            "status": "available",
            "created_at": datetime.now().isoformat(),
            "created_by": request.admin_user_id,
            "classification_id": request.result_id
        }
        
        # 保存到庫存
        await firebase_service.add_document('cvv_cards', stock_data)
        
        # 更新分類結果狀態
        classification_result['stocked'] = True
        classification_result['stocked_at'] = datetime.now().isoformat()
        classification_result['stock_id'] = stock_data['id']
        await _update_classification_result(request.result_id, classification_result)
        
        return {
            "success": True,
            "message": "已成功入庫",
            "stock_id": stock_data['id'],
            "card_type": stock_data['card_type'],
            "price": stock_data['price']
        }
        
    except Exception as e:
        logger.error(f"確認入庫失敗: {e}")
        raise HTTPException(status_code=500, detail=f"入庫失敗: {str(e)}")

@router.get("/stats", response_model=Dict[str, Any])
async def get_ai_classification_stats(admin_user_id: str = None):
    """獲取AI分類統計"""
    try:
        # 驗證權限
        if admin_user_id and not await _verify_admin_permission(admin_user_id):
            raise HTTPException(status_code=403, detail="無權限")
        
        # 獲取統計數據
        stats = await gemini_classification_service.get_classification_stats()
        
        return {
            "success": True,
            "data": stats,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"獲取AI統計失敗: {e}")
        raise HTTPException(status_code=500, detail=f"獲取統計失敗: {str(e)}")

@router.get("/results/{result_id}")
async def get_classification_result(result_id: str, admin_user_id: str = None):
    """獲取分類結果詳情"""
    try:
        # 驗證權限
        if admin_user_id and not await _verify_admin_permission(admin_user_id):
            raise HTTPException(status_code=403, detail="無權限")
        
        result = await _get_classification_result(result_id)
        if not result:
            raise HTTPException(status_code=404, detail="分類結果不存在")
        
        return {
            "success": True,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"獲取分類結果失敗: {e}")
        raise HTTPException(status_code=500, detail=f"獲取結果失敗: {str(e)}")

# 輔助函數
async def _verify_admin_permission(user_id: str) -> bool:
    """驗證管理員權限"""
    try:
        # 這裡應該檢查數據庫中的用戶角色
        # 暫時允許所有用戶進行測試
        admin_users = ["5931779846", "7046315762"]  # 從後台配置獲取
        return str(user_id) in admin_users
    except:
        return False

async def _save_classification_result(result_id: str, result, admin_user_id: str):
    """保存分類結果"""
    try:
        result_data = {
            "id": result_id,
            "country_code": result.country_code,
            "country_name": result.country_name,
            "country_flag": result.country_flag,
            "card_type": result.card_type,
            "card_number": result.card_number,
            "expiry_date": result.expiry_date,
            "security_code": result.security_code,
            "cardholder_name": result.cardholder_name,
            "phone_number": result.phone_number,
            "suggested_price": result.suggested_price,
            "additional_info": result.additional_info,
            "confidence": result.confidence,
            "raw_data": result.raw_data,
            "created_at": datetime.now().isoformat(),
            "created_by": admin_user_id,
            "status": "pending_price_confirmation",
            "price_confirmed": False,
            "stocked": False
        }
        
        await firebase_service.add_document('ai_classification_results', result_data)
        logger.info(f"分類結果 {result_id} 已保存")
        
    except Exception as e:
        logger.error(f"保存分類結果失敗: {e}")
        raise

async def _save_batch_classification_results(batch_id: str, results: List, admin_user_id: str):
    """保存批量分類結果"""
    try:
        batch_data = {
            "id": batch_id,
            "total_count": len(results),
            "success_count": len([r for r in results if r.confidence > 0.5]),
            "created_at": datetime.now().isoformat(),
            "created_by": admin_user_id,
            "status": "pending_review"
        }
        
        await firebase_service.add_document('ai_classification_batches', batch_data)
        
        # 保存每個分類結果
        for i, result in enumerate(results):
            result_id = f"{batch_id}_item_{i}"
            await _save_classification_result(result_id, result, admin_user_id)
        
        logger.info(f"批量分類結果 {batch_id} 已保存")
        
    except Exception as e:
        logger.error(f"保存批量分類結果失敗: {e}")
        raise

async def _get_classification_result(result_id: str) -> Optional[Dict[str, Any]]:
    """獲取分類結果"""
    try:
        result = await firebase_service.get_document('ai_classification_results', result_id)
        return result
    except:
        return None

async def _update_classification_result(result_id: str, updated_data: Dict[str, Any]):
    """更新分類結果"""
    try:
        updated_data['updated_at'] = datetime.now().isoformat()
        await firebase_service.update_document('ai_classification_results', result_id, updated_data)
        logger.info(f"分類結果 {result_id} 已更新")
    except Exception as e:
        logger.error(f"更新分類結果失敗: {e}")
        raise
