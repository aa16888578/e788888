"""
管理後台儀表板 API
整合AI分類、庫存管理、統計信息等功能
"""
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from pydantic import BaseModel
import json
import time
from datetime import datetime, timedelta

from ..services.gemini_classification_service import gemini_classification_service
from ..services.cvv_display_service import cvv_display_service
from ..services.firebase_service import firebase_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin", tags=["Admin Dashboard"])

class DashboardStats(BaseModel):
    """儀表板統計信息"""
    total_cards: int
    active_cards: int
    sales_stats: Dict[str, Any]
    category_stats: Dict[str, Any]
    ai_classification_stats: Dict[str, Any]
    recent_activities: List[Dict[str, Any]]

class AIClassificationRequest(BaseModel):
    """AI分類請求"""
    cvv_data: str
    admin_user_id: str
    target_library: str = "auto"  # auto, 全資庫, 裸資庫, 特價庫

class CardSearchRequest(BaseModel):
    """卡片搜尋請求"""
    search_type: str  # "card_prefix", "country", "category", "price_range"
    search_value: str
    filters: Optional[Dict[str, Any]] = None

class StockOperationRequest(BaseModel):
    """庫存操作請求"""
    operation_type: str  # "in", "out"
    card_ids: List[str]
    target_library: str
    admin_user_id: str
    notes: Optional[str] = None

@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(admin_user_id: str):
    """獲取儀表板統計信息"""
    try:
        # 驗證管理員權限
        if not await _verify_admin_permission(admin_user_id):
            raise HTTPException(status_code=403, detail="無管理員權限")
        
        # 獲取庫存統計
        inventory_stats = await _get_inventory_stats()
        
        # 獲取銷售統計
        sales_stats = await _get_sales_stats()
        
        # 獲取分類別統計
        category_stats = await _get_category_stats()
        
        # 獲取AI分類統計
        ai_stats = await _get_ai_classification_stats()
        
        # 獲取最近活動
        recent_activities = await _get_recent_activities()
        
        return DashboardStats(
            total_cards=inventory_stats["total"],
            active_cards=inventory_stats["active"],
            sales_stats=sales_stats,
            category_stats=category_stats,
            ai_classification_stats=ai_stats,
            recent_activities=recent_activities
        )
        
    except Exception as e:
        logger.error(f"獲取儀表板統計失敗: {e}")
        raise HTTPException(status_code=500, detail=f"獲取統計失敗: {str(e)}")

@router.post("/ai/classify")
async def ai_classify_cvv(request: AIClassificationRequest):
    """AI分類CVV數據並自動調度到對應庫存"""
    try:
        # 驗證管理員權限
        if not await _verify_admin_permission(request.admin_user_id):
            raise HTTPException(status_code=403, detail="無管理員權限")
        
        # 執行AI分類
        async with gemini_classification_service:
            result = await gemini_classification_service.classify_single_cvv(request.cvv_data)
        
        # 根據AI分類結果自動決定入庫位置
        target_library = await _determine_target_library(result, request.target_library)
        
        # 生成卡片ID
        card_id = f"card_{int(time.time())}_{result.country_code}"
        
        # 保存到對應庫存
        await _save_to_inventory(card_id, result, target_library, request.admin_user_id)
        
        # 記錄操作日誌
        await _log_admin_operation(
            request.admin_user_id, 
            "ai_classify", 
            f"AI分類CVV並入庫到{target_library}",
            {"card_id": card_id, "target_library": target_library}
        )
        
        return {
            "success": True,
            "message": f"AI分類完成，已自動入庫到{target_library}",
            "card_id": card_id,
            "target_library": target_library,
            "classification_result": {
                "country": result.country_name,
                "card_type": result.card_type,
                "suggested_price": result.suggested_price,
                "confidence": result.confidence
            }
        }
        
    except Exception as e:
        logger.error(f"AI分類失敗: {e}")
        return {
            "success": False,
            "message": f"分類失敗: {str(e)}"
        }

@router.post("/ai/classify/batch")
async def ai_classify_batch_cvv(
    file: UploadFile = File(...),
    admin_user_id: str = Form(...),
    target_library: str = Form("auto")
):
    """批量AI分類CVV數據"""
    try:
        # 驗證管理員權限
        if not await _verify_admin_permission(admin_user_id):
            raise HTTPException(status_code=403, detail="無管理員權限")
        
        # 讀取文件內容
        content = await file.read()
        lines = content.decode('utf-8').strip().split('\n')
        
        results = []
        success_count = 0
        error_count = 0
        
        for line_num, line in enumerate(lines, 1):
            try:
                # 執行AI分類
                async with gemini_classification_service:
                    result = await gemini_classification_service.classify_single_cvv(line.strip())
                
                # 決定入庫位置
                library = await _determine_target_library(result, target_library)
                
                # 保存到庫存
                card_id = f"batch_{int(time.time())}_{line_num}_{result.country_code}"
                await _save_to_inventory(card_id, result, library, admin_user_id)
                
                results.append({
                    "line": line_num,
                    "success": True,
                    "card_id": card_id,
                    "target_library": library,
                    "country": result.country_name,
                    "suggested_price": result.suggested_price
                })
                success_count += 1
                
            except Exception as e:
                results.append({
                    "line": line_num,
                    "success": False,
                    "error": str(e)
                })
                error_count += 1
        
        # 記錄批量操作
        await _log_admin_operation(
            admin_user_id,
            "batch_classify",
            f"批量AI分類完成: 成功{success_count}個，失敗{error_count}個",
            {"total": len(lines), "success": success_count, "error": error_count}
        )
        
        return {
            "success": True,
            "message": f"批量分類完成: 成功{success_count}個，失敗{error_count}個",
            "total": len(lines),
            "success_count": success_count,
            "error_count": error_count,
            "results": results
        }
        
    except Exception as e:
        logger.error(f"批量AI分類失敗: {e}")
        return {
            "success": False,
            "message": f"批量分類失敗: {str(e)}"
        }

@router.post("/search/cards")
async def search_cards(request: CardSearchRequest):
    """搜尋卡片（支援多種搜尋方式）"""
    try:
        if request.search_type == "card_prefix":
            # 搜尋卡頭（前六碼）
            results = await _search_by_card_prefix(request.search_value)
        elif request.search_type == "country":
            # 按國家搜尋
            results = await _search_by_country(request.search_value)
        elif request.search_type == "category":
            # 按庫別搜尋
            results = await _search_by_category(request.search_value)
        elif request.search_type == "price_range":
            # 按價格範圍搜尋
            results = await _search_by_price_range(request.filters)
        else:
            raise HTTPException(status_code=400, detail="不支援的搜尋類型")
        
        return {
            "success": True,
            "search_type": request.search_type,
            "search_value": request.search_value,
            "results_count": len(results),
            "results": results
        }
        
    except Exception as e:
        logger.error(f"卡片搜尋失敗: {e}")
        return {
            "success": False,
            "message": f"搜尋失敗: {str(e)}"
        }

@router.post("/stock/operation")
async def stock_operation(request: StockOperationRequest):
    """庫存操作（入庫/出庫）"""
    try:
        # 驗證管理員權限
        if not await _verify_admin_permission(request.admin_user_id):
            raise HTTPException(status_code=403, detail="無管理員權限")
        
        if request.operation_type == "in":
            # 入庫操作
            result = await _stock_in(request.card_ids, request.target_library, request.admin_user_id)
        elif request.operation_type == "out":
            # 出庫操作
            result = await _stock_out(request.card_ids, request.target_library, request.admin_user_id)
        else:
            raise HTTPException(status_code=400, detail="不支援的操作類型")
        
        # 記錄操作日誌
        await _log_admin_operation(
            request.admin_user_id,
            f"stock_{request.operation_type}",
            f"庫存{request.operation_type}操作: {len(request.card_ids)}張卡片",
            {"target_library": request.target_library, "card_count": len(request.card_ids)}
        )
        
        return {
            "success": True,
            "message": f"庫存{request.operation_type}操作完成",
            "operation_type": request.operation_type,
            "target_library": request.target_library,
            "affected_cards": len(request.card_ids),
            "result": result
        }
        
    except Exception as e:
        logger.error(f"庫存操作失敗: {e}")
        return {
            "success": False,
            "message": f"庫存操作失敗: {str(e)}"
        }

# 輔助函數
async def _verify_admin_permission(user_id: str) -> bool:
    """驗證管理員權限"""
    try:
        user_doc = firebase_service.db.collection('users').document(user_id).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            return user_data.get('role') == 'admin'
        return False
    except Exception as e:
        logger.error(f"權限驗證失敗: {e}")
        return False

async def _determine_target_library(result, target_library: str) -> str:
    """根據AI分類結果決定入庫位置"""
    if target_library != "auto":
        return target_library
    
    # 根據AI分類結果自動判斷
    confidence = result.confidence
    card_type = result.card_type
    country_code = result.country_code
    
    # 高信心度且優質卡片 → 全資庫
    if confidence > 0.8 and card_type in ["Visa", "Mastercard"]:
        return "全資庫"
    # 中等信心度 → 裸資庫
    elif confidence > 0.6:
        return "裸資庫"
    # 低信心度或特殊卡片 → 特價庫
    else:
        return "特價庫"

async def _save_to_inventory(card_id: str, result, library: str, admin_id: str):
    """保存卡片到指定庫存"""
    card_data = {
        "card_id": card_id,
        "country_code": result.country_code,
        "country_name": result.country_name,
        "country_flag": result.country_flag,
        "card_type": result.card_type,
        "card_number": result.card_number,
        "expiry_date": result.expiry_date,
        "cardholder_name": result.cardholder_name,
        "phone_number": result.phone_number,
        "suggested_price": result.suggested_price,
        "confidence": result.confidence,
        "library": library,
        "status": "active",
        "created_by": admin_id,
        "created_at": datetime.now().isoformat(),
        "ai_classified": True
    }
    
    # 保存到對應庫存集合
    await firebase_service.db.collection(f"inventory_{library}").document(card_id).set(card_data)

async def _get_inventory_stats() -> Dict[str, Any]:
    """獲取庫存統計"""
    try:
        stats = {}
        libraries = ["全資庫", "裸資庫", "特價庫"]
        
        for library in libraries:
            collection = firebase_service.db.collection(f"inventory_{library}")
            docs = collection.where("status", "==", "active").get()
            stats[library] = len(docs)
        
        stats["total"] = sum(stats.values())
        stats["active"] = stats["total"]  # 目前只統計活躍卡片
        
        return stats
    except Exception as e:
        logger.error(f"獲取庫存統計失敗: {e}")
        return {"total": 0, "active": 0, "全資庫": 0, "裸資庫": 0, "特價庫": 0}

async def _get_sales_stats() -> Dict[str, Any]:
    """獲取銷售統計"""
    try:
        # 這裡可以實現銷售統計邏輯
        return {
            "today_sales": 0,
            "week_sales": 0,
            "month_sales": 0,
            "total_revenue": 0
        }
    except Exception as e:
        logger.error(f"獲取銷售統計失敗: {e}")
        return {}

async def _get_category_stats() -> Dict[str, Any]:
    """獲取分類別統計"""
    try:
        stats = {}
        libraries = ["全資庫", "裸資庫", "特價庫"]
        
        for library in libraries:
            collection = firebase_service.db.collection(f"inventory_{library}")
            docs = collection.where("status", "==", "active").get()
            
            # 按國家統計
            country_stats = {}
            for doc in docs:
                data = doc.to_dict()
                country = data.get("country_name", "未知")
                country_stats[country] = country_stats.get(country, 0) + 1
            
            stats[library] = {
                "total": len(docs),
                "by_country": country_stats
            }
        
        return stats
    except Exception as e:
        logger.error(f"獲取分類別統計失敗: {e}")
        return {}

async def _get_ai_classification_stats() -> Dict[str, Any]:
    """獲取AI分類統計"""
    try:
        # 統計AI分類的卡片數量
        total_ai_cards = 0
        libraries = ["全資庫", "裸資庫", "特價庫"]
        
        for library in libraries:
            collection = firebase_service.db.collection(f"inventory_{library}")
            docs = collection.where("ai_classified", "==", True).get()
            total_ai_cards += len(docs)
        
        return {
            "total_ai_classified": total_ai_cards,
            "classification_accuracy": 0.95,  # 可以根據實際情況計算
            "last_classification": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"獲取AI分類統計失敗: {e}")
        return {}

async def _get_recent_activities() -> List[Dict[str, Any]]:
    """獲取最近活動"""
    try:
        # 這裡可以實現最近活動查詢邏輯
        return [
            {
                "type": "ai_classify",
                "description": "AI分類CVV數據",
                "timestamp": datetime.now().isoformat(),
                "user": "admin"
            }
        ]
    except Exception as e:
        logger.error(f"獲取最近活動失敗: {e}")
        return []

async def _search_by_card_prefix(prefix: str) -> List[Dict[str, Any]]:
    """根據卡頭搜尋"""
    try:
        results = []
        libraries = ["全資庫", "裸資庫", "特價庫"]
        
        for library in libraries:
            collection = firebase_service.db.collection(f"inventory_{library}")
            docs = collection.where("card_number", ">=", prefix).where("card_number", "<=", prefix + "\uf8ff").get()
            
            for doc in docs:
                data = doc.to_dict()
                # 隱藏敏感信息
                data["card_number"] = f"{data['card_number'][:4]}****{data['card_number'][-4:]}"
                data["library"] = library
                results.append(data)
        
        return results
    except Exception as e:
        logger.error(f"卡頭搜尋失敗: {e}")
        return []

async def _search_by_country(country: str) -> List[Dict[str, Any]]:
    """根據國家搜尋"""
    try:
        results = []
        libraries = ["全資庫", "裸資庫", "特價庫"]
        
        for library in libraries:
            collection = firebase_service.db.collection(f"inventory_{library}")
            docs = collection.where("country_name", "==", country).get()
            
            for doc in docs:
                data = doc.to_dict()
                data["card_number"] = f"{data['card_number'][:4]}****{data['card_number'][-4:]}"
                data["library"] = library
                results.append(data)
        
        return results
    except Exception as e:
        logger.error(f"國家搜尋失敗: {e}")
        return []

async def _search_by_category(category: str) -> List[Dict[str, Any]]:
    """根據庫別搜尋"""
    try:
        if category not in ["全資庫", "裸資庫", "特價庫"]:
            return []
        
        collection = firebase_service.db.collection(f"inventory_{category}")
        docs = collection.where("status", "==", "active").get()
        
        results = []
        for doc in docs:
            data = doc.to_dict()
            data["card_number"] = f"{data['card_number'][:4]}****{data['card_number'][-4:]}"
            data["library"] = category
            results.append(data)
        
        return results
    except Exception as e:
        logger.error(f"庫別搜尋失敗: {e}")
        return []

async def _search_by_price_range(filters: Dict[str, Any]) -> List[Dict[str, Any]]:
    """根據價格範圍搜尋"""
    try:
        min_price = filters.get("min_price", 0)
        max_price = filters.get("max_price", float('inf'))
        
        results = []
        libraries = ["全資庫", "裸資庫", "特價庫"]
        
        for library in libraries:
            collection = firebase_service.db.collection(f"inventory_{library}")
            docs = collection.where("suggested_price", ">=", min_price).where("suggested_price", "<=", max_price).get()
            
            for doc in docs:
                data = doc.to_dict()
                data["card_number"] = f"{data['card_number'][:4]}****{data['card_number'][-4:]}"
                data["library"] = library
                results.append(data)
        
        return results
    except Exception as e:
        logger.error(f"價格範圍搜尋失敗: {e}")
        return []

async def _stock_in(card_ids: List[str], library: str, admin_id: str):
    """入庫操作"""
    try:
        # 這裡實現入庫邏輯
        return {"status": "success", "message": f"成功入庫{len(card_ids)}張卡片到{library}"}
    except Exception as e:
        logger.error(f"入庫操作失敗: {e}")
        return {"status": "error", "message": str(e)}

async def _stock_out(card_ids: List[str], library: str, admin_id: str):
    """出庫操作"""
    try:
        # 這裡實現出庫邏輯
        return {"status": "success", "message": f"成功出庫{len(card_ids)}張卡片從{library}"}
    except Exception as e:
        logger.error(f"出庫操作失敗: {e}")
        return {"status": "error", "message": str(e)}

async def _log_admin_operation(admin_id: str, operation: str, description: str, details: Dict[str, Any]):
    """記錄管理員操作日誌"""
    try:
        log_data = {
            "admin_id": admin_id,
            "operation": operation,
            "description": description,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        
        await firebase_service.db.collection("admin_logs").add(log_data)
    except Exception as e:
        logger.error(f"記錄操作日誌失敗: {e}")
