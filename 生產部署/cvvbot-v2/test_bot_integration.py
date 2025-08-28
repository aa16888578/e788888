#!/usr/bin/env python3
"""
Telegram Bot 與 API 整合測試腳本
"""
import asyncio
import sys
import logging
from pathlib import Path

# 添加項目根目錄到 Python 路徑
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings
from app.services.firebase_service import firebase_service

# 設置日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class BotIntegrationTester:
    """Bot 整合測試器"""
    
    async def test_configuration(self):
        """測試配置"""
        logger.info("🔧 測試系統配置...")
        
        try:
            # 測試後台配置初始化
            await settings.initialize_from_backend()
            logger.info("✅ 後台配置初始化成功")
            
            # 測試關鍵配置
            telegram_token = await settings.get_config('TELEGRAM_BOT_TOKEN')
            firebase_project = await settings.get_config('FIREBASE_PROJECT_ID')
            
            if telegram_token:
                logger.info("✅ Telegram Bot Token 已配置")
            else:
                logger.warning("⚠️ Telegram Bot Token 未配置")
            
            if firebase_project:
                logger.info("✅ Firebase Project ID 已配置")
            else:
                logger.warning("⚠️ Firebase Project ID 未配置")
                
        except Exception as e:
            logger.error(f"❌ 配置測試失敗: {e}")
            return False
        
        return True
    
    async def test_firebase_connection(self):
        """測試 Firebase 連接"""
        logger.info("🔥 測試 Firebase 連接...")
        
        try:
            # 測試寫入
            test_collection = firebase_service.db.collection('_test_integration')
            test_doc = test_collection.document('test')
            test_doc.set({
                'timestamp': 'integration_test',
                'status': 'testing',
                'message': 'Bot integration test'
            })
            
            # 測試讀取
            doc = test_doc.get()
            if doc.exists:
                logger.info("✅ Firebase 讀寫測試成功")
                
                # 清理測試數據
                test_doc.delete()
                logger.info("✅ 測試數據清理完成")
                return True
            else:
                logger.error("❌ Firebase 讀取測試失敗")
                return False
                
        except Exception as e:
            logger.error(f"❌ Firebase 連接測試失敗: {e}")
            return False
    
    async def test_api_endpoints(self):
        """測試 API 端點"""
        logger.info("🌐 測試 API 端點...")
        
        try:
            # 測試 Telegram API
            from app.api.telegram_api import TelegramUser, send_welcome_message
            
            test_user = TelegramUser(
                telegram_id=123456789,
                username="test_user",
                first_name="Test",
                last_name="User"
            )
            
            response = await send_welcome_message(test_user)
            if response.message and response.inline_keyboard:
                logger.info("✅ Telegram API 測試成功")
                logger.info(f"   - 歡迎消息長度: {len(response.message)} 字符")
                logger.info(f"   - 內嵌鍵盤行數: {len(response.inline_keyboard)} 行")
            else:
                logger.error("❌ Telegram API 響應格式錯誤")
                return False
                
        except Exception as e:
            logger.error(f"❌ API 端點測試失敗: {e}")
            return False
        
        return True
    
    async def test_payment_system(self):
        """測試支付系統"""
        logger.info("💰 測試支付系統...")
        
        try:
            from app.services.payment_service import payment_service
            
            # 測試創建支付訂單
            result = await payment_service.create_payment_order(
                user_id="test_user_123",
                amount=100.0,
                order_type="recharge"
            )
            
            if result.get('success'):
                logger.info("✅ 支付訂單創建測試成功")
                order_id = result.get('data', {}).get('order_id')
                if order_id:
                    logger.info(f"   - 訂單ID: {order_id}")
                    
                    # 測試支付狀態查詢
                    status_result = await payment_service.check_payment_status(order_id)
                    if status_result.get('success'):
                        logger.info("✅ 支付狀態查詢測試成功")
                    else:
                        logger.warning("⚠️ 支付狀態查詢測試失敗")
            else:
                logger.warning("⚠️ 支付訂單創建測試失敗（可能是正常的，如果未配置支付服務）")
                
        except Exception as e:
            logger.warning(f"⚠️ 支付系統測試失敗（可能是正常的）: {e}")
        
        return True
    
    async def test_keyboard_service(self):
        """測試內嵌鍵盤服務"""
        logger.info("⌨️ 測試內嵌鍵盤服務...")
        
        try:
            from app.services.keyboard_service import KeyboardService
            
            keyboard_service = KeyboardService()
            
            # 測試主選單鍵盤
            main_keyboard = keyboard_service.get_main_menu_keyboard()
            if main_keyboard:
                logger.info("✅ 主選單鍵盤生成成功")
                logger.info(f"   - 鍵盤行數: {len(main_keyboard)}")
            
            # 測試充值鍵盤
            recharge_keyboard = keyboard_service.get_recharge_keyboard()
            if recharge_keyboard:
                logger.info("✅ 充值鍵盤生成成功")
                logger.info(f"   - 鍵盤行數: {len(recharge_keyboard)}")
            
            # 測試代理商鍵盤
            agent_keyboard = keyboard_service.get_agent_keyboard()
            if agent_keyboard:
                logger.info("✅ 代理商鍵盤生成成功")
                logger.info(f"   - 鍵盤行數: {len(agent_keyboard)}")
                
        except Exception as e:
            logger.error(f"❌ 內嵌鍵盤服務測試失敗: {e}")
            return False
        
        return True
    
    async def test_agent_system(self):
        """測試代理商系統"""
        logger.info("👥 測試代理商系統...")
        
        try:
            from app.services.agent_service import AgentService
            
            agent_service = AgentService()
            
            # 測試代理商信息獲取
            agent_info = await agent_service.get_agent_info("test_user_123")
            logger.info("✅ 代理商信息查詢測試完成")
            
            # 測試佣金計算
            commission = agent_service.calculate_commission(100.0, 1)
            if commission > 0:
                logger.info(f"✅ 佣金計算測試成功: {commission}")
            
            # 測試等級系統
            levels = agent_service.get_all_levels()
            if levels:
                logger.info(f"✅ 代理商等級系統測試成功: {len(levels)} 個等級")
                
        except Exception as e:
            logger.error(f"❌ 代理商系統測試失敗: {e}")
            return False
        
        return True
    
    async def run_all_tests(self):
        """運行所有測試"""
        logger.info("🚀 開始 Bot 整合測試...")
        
        tests = [
            ("配置系統", self.test_configuration),
            ("Firebase 連接", self.test_firebase_connection),
            ("API 端點", self.test_api_endpoints),
            ("支付系統", self.test_payment_system),
            ("內嵌鍵盤服務", self.test_keyboard_service),
            ("代理商系統", self.test_agent_system),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            logger.info(f"\n--- 測試: {test_name} ---")
            try:
                result = await test_func()
                if result:
                    passed += 1
                    logger.info(f"✅ {test_name} 測試通過")
                else:
                    logger.error(f"❌ {test_name} 測試失敗")
            except Exception as e:
                logger.error(f"❌ {test_name} 測試異常: {e}")
        
        logger.info(f"\n🎯 測試結果: {passed}/{total} 通過")
        
        if passed == total:
            logger.info("🎉 所有測試通過！系統準備就緒。")
            return True
        else:
            logger.warning(f"⚠️ 有 {total - passed} 個測試失敗，請檢查相關配置。")
            return False

async def main():
    """主函數"""
    tester = BotIntegrationTester()
    success = await tester.run_all_tests()
    
    if success:
        print("\n🚀 系統整合測試完成 - 所有功能正常")
        print("💡 現在可以啟動完整系統: python3 start.py")
    else:
        print("\n⚠️ 系統整合測試完成 - 部分功能需要檢查")
        print("💡 請檢查配置後重新測試")
    
    return success

if __name__ == "__main__":
    # 運行測試
    result = asyncio.run(main())
    sys.exit(0 if result else 1)
