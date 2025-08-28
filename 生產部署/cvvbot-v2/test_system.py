#!/usr/bin/env python3
"""
CVV Python Bot 系統測試腳本
"""
import asyncio
import logging
import sys
import os

# 添加項目根目錄到 Python 路徑
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.services.firebase_service import firebase_service
from app.services.config_service import config_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_firebase_connection():
    """測試 Firebase 連接"""
    logger.info("🔥 測試 Firebase 連接...")
    
    try:
        # 測試寫入
        test_collection = firebase_service.db.collection('_test')
        test_doc = test_collection.document('connection_test')
        test_doc.set({
            'timestamp': '2025-01-27T12:00:00Z',
            'status': 'test_success',
            'message': 'Firebase 連接測試成功'
        })
        
        # 測試讀取
        doc = test_doc.get()
        if doc.exists:
            data = doc.to_dict()
            logger.info(f"✅ Firebase 連接成功: {data['message']}")
            
            # 清理測試數據
            test_doc.delete()
            return True
        else:
            logger.error("❌ Firebase 讀取失敗")
            return False
            
    except Exception as e:
        logger.error(f"❌ Firebase 連接失敗: {e}")
        return False

async def test_config_service():
    """測試配置服務"""
    logger.info("📋 測試配置服務...")
    
    try:
        # 初始化配置服務
        await config_service.initialize()
        
        # 測試設置配置
        test_key = "TEST_CONFIG_KEY"
        test_value = "test_value_123"
        
        success = await config_service.set_config(test_key, test_value)
        if not success:
            logger.error("❌ 配置設置失敗")
            return False
        
        # 測試獲取配置
        retrieved_value = await config_service.get_config(test_key)
        if retrieved_value == test_value:
            logger.info("✅ 配置服務測試成功")
            
            # 清理測試配置
            await config_service.set_config(test_key, None)
            return True
        else:
            logger.error(f"❌ 配置值不匹配: 期望 {test_value}, 實際 {retrieved_value}")
            return False
            
    except Exception as e:
        logger.error(f"❌ 配置服務測試失敗: {e}")
        return False

async def test_dynamic_settings():
    """測試動態設置"""
    logger.info("⚙️ 測試動態設置...")
    
    try:
        # 初始化設置
        await settings.initialize_from_backend()
        
        # 測試獲取配置
        app_name = await settings.get_config('APP_NAME')
        version = await settings.get_config('VERSION')
        
        logger.info(f"✅ 應用名稱: {app_name}")
        logger.info(f"✅ 版本: {version}")
        
        # 測試設置配置
        test_key = "TEST_DYNAMIC_CONFIG"
        test_value = "dynamic_test_value"
        
        success = await settings.set_config(test_key, test_value)
        if success:
            # 驗證配置
            retrieved_value = await settings.get_config(test_key)
            if retrieved_value == test_value:
                logger.info("✅ 動態設置測試成功")
                return True
            else:
                logger.error("❌ 動態設置值不匹配")
                return False
        else:
            logger.error("❌ 動態設置失敗")
            return False
            
    except Exception as e:
        logger.error(f"❌ 動態設置測試失敗: {e}")
        return False

async def test_environment_variables():
    """測試環境變量"""
    logger.info("🌍 測試環境變量...")
    
    # 檢查關鍵環境變量
    required_vars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL'
    ]
    
    missing_vars = []
    for var in required_vars:
        value = os.getenv(var)
        if not value:
            missing_vars.append(var)
        else:
            logger.info(f"✅ {var}: {'已設置' if len(value) > 10 else value}")
    
    if missing_vars:
        logger.warning(f"⚠️ 缺少環境變量: {', '.join(missing_vars)}")
        logger.info("💡 這些變量將從後台配置載入")
    
    return True

async def main():
    """主測試函數"""
    logger.info("=" * 60)
    logger.info("🧪 CVV Python Bot 系統測試")
    logger.info("=" * 60)
    
    tests = [
        ("環境變量檢查", test_environment_variables),
        ("Firebase 連接", test_firebase_connection),
        ("配置服務", test_config_service),
        ("動態設置", test_dynamic_settings)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        logger.info(f"\n🔍 執行測試: {test_name}")
        try:
            result = await test_func()
            results[test_name] = result
            if result:
                logger.info(f"✅ {test_name} - 通過")
            else:
                logger.error(f"❌ {test_name} - 失敗")
        except Exception as e:
            logger.error(f"❌ {test_name} - 異常: {e}")
            results[test_name] = False
    
    # 總結
    logger.info("\n" + "=" * 60)
    logger.info("📊 測試結果總結")
    logger.info("=" * 60)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ 通過" if result else "❌ 失敗"
        logger.info(f"  {test_name}: {status}")
    
    logger.info(f"\n🎯 總計: {passed}/{total} 個測試通過")
    
    if passed == total:
        logger.info("🎉 所有測試通過！系統準備就緒。")
        return True
    else:
        logger.error("⚠️ 部分測試失敗，請檢查配置。")
        return False

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        logger.info("\n👋 測試被中斷")
        sys.exit(1)
    except Exception as e:
        logger.error(f"測試執行失敗: {e}")
        sys.exit(1)
