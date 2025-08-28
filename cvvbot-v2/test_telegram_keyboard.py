#!/usr/bin/env python3
"""
Telegram 內嵌鍵盤功能測試腳本
測試所有 Bot 按鈕和 API 端點
"""
import asyncio
import json
import requests
import sys
from typing import Dict, Any

BASE_URL = "http://localhost:8000"

class TelegramKeyboardTester:
    """Telegram 內嵌鍵盤測試器"""
    
    def __init__(self):
        self.base_url = BASE_URL
        self.test_user = {
            "telegram_id": 123456789,
            "username": "test_user",
            "first_name": "測試",
            "last_name": "用戶"
        }
    
    def test_api_endpoint(self, method: str, endpoint: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
        """測試 API 端點"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, timeout=10)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, timeout=10)
            else:
                return {"error": f"不支援的方法: {method}"}
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"HTTP {response.status_code}: {response.text}"}
                
        except Exception as e:
            return {"error": str(e)}
    
    def test_welcome_message(self):
        """測試歡迎消息和主選單"""
        print("🎉 測試歡迎消息和主選單...")
        
        result = self.test_api_endpoint("POST", "/api/telegram/welcome", self.test_user)
        
        if "error" in result:
            print(f"❌ 錯誤: {result['error']}")
            return False
        
        # 檢查響應格式
        if "message" in result and "inline_keyboard" in result:
            print("✅ 歡迎消息格式正確")
            keyboard = result["inline_keyboard"]
            print(f"✅ 內嵌鍵盤: {len(keyboard)} 行")
            
            # 檢查主要按鈕
            buttons = []
            for row in keyboard:
                for btn in row:
                    buttons.append(btn["callback_data"])
            
            expected_buttons = ["all_cards", "course_cards", "special_cards", 
                              "global_inventory", "search_buy", "merchant_base", 
                              "recharge", "balance_check"]
            
            found_buttons = [btn for btn in expected_buttons if btn in buttons]
            print(f"✅ 主要按鈕: {len(found_buttons)}/{len(expected_buttons)} 個")
            
            return len(found_buttons) >= 6
        else:
            print("❌ 響應格式錯誤")
            return False
    
    def test_card_listings(self):
        """測試卡片列表功能"""
        print("\n🃏 測試卡片列表功能...")
        
        # 測試全資庫
        result = self.test_api_endpoint("GET", f"/api/telegram/all_cards?telegram_id={self.test_user['telegram_id']}")
        if "error" not in result and "inline_keyboard" in result:
            print("✅ 全資庫 API 正常")
        else:
            print("❌ 全資庫 API 失敗")
            return False
        
        # 測試特價庫
        result = self.test_api_endpoint("GET", f"/api/telegram/special_cards?telegram_id={self.test_user['telegram_id']}")
        if "error" not in result and "inline_keyboard" in result:
            print("✅ 特價庫 API 正常")
        else:
            print("❌ 特價庫 API 失敗")
            return False
        
        # 測試庫存統計
        result = self.test_api_endpoint("GET", f"/api/telegram/global_inventory?telegram_id={self.test_user['telegram_id']}")
        if "error" not in result and "inline_keyboard" in result:
            print("✅ 庫存統計 API 正常")
        else:
            print("❌ 庫存統計 API 失敗")
            return False
        
        return True
    
    def test_search_functionality(self):
        """測試搜索功能"""
        print("\n🔍 測試搜索功能...")
        
        result = self.test_api_endpoint("GET", f"/api/telegram/search_buy?telegram_id={self.test_user['telegram_id']}")
        if "error" not in result and "inline_keyboard" in result:
            keyboard = result["inline_keyboard"]
            search_buttons = []
            for row in keyboard:
                for btn in row:
                    if "search_" in btn["callback_data"]:
                        search_buttons.append(btn["callback_data"])
            
            print(f"✅ 搜索界面 API 正常，搜索選項: {len(search_buttons)} 個")
            return True
        else:
            print("❌ 搜索界面 API 失敗")
            return False
    
    def test_merchant_system(self):
        """測試商家/代理商系統"""
        print("\n🏢 測試商家/代理商系統...")
        
        result = self.test_api_endpoint("GET", f"/api/telegram/merchant_base?telegram_id={self.test_user['telegram_id']}")
        if "error" not in result and "inline_keyboard" in result:
            print("✅ 商家基地 API 正常")
            return True
        else:
            print("❌ 商家基地 API 失敗")
            return False
    
    def test_payment_system(self):
        """測試支付系統"""
        print("\n💰 測試支付系統...")
        
        # 測試充值界面
        result = self.test_api_endpoint("GET", f"/api/telegram/recharge?telegram_id={self.test_user['telegram_id']}")
        if "error" not in result and "inline_keyboard" in result:
            keyboard = result["inline_keyboard"]
            recharge_buttons = []
            for row in keyboard:
                for btn in row:
                    if "recharge_" in btn["callback_data"]:
                        recharge_buttons.append(btn["callback_data"])
            
            print(f"✅ 充值界面 API 正常，充值選項: {len(recharge_buttons)} 個")
        else:
            print("❌ 充值界面 API 失敗")
            return False
        
        # 測試餘額查詢
        result = self.test_api_endpoint("GET", f"/api/telegram/balance_check?telegram_id={self.test_user['telegram_id']}")
        if "error" not in result and "inline_keyboard" in result:
            print("✅ 餘額查詢 API 正常")
        else:
            print("❌ 餘額查詢 API 失敗")
            return False
        
        # 測試支付方式查詢
        result = self.test_api_endpoint("GET", "/api/payment/methods")
        if "error" not in result and "success" in result and result["success"]:
            print("✅ 支付方式查詢 API 正常")
        else:
            print("❌ 支付方式查詢 API 失敗")
            return False
        
        return True
    
    def test_purchase_flow(self):
        """測試購買流程"""
        print("\n🛒 測試購買流程...")
        
        # 測試購買卡片 API
        result = self.test_api_endpoint("POST", "/api/telegram/buy_card", 
                                      {"telegram_id": self.test_user["telegram_id"], "card_id": 1})
        if "error" not in result and "inline_keyboard" in result:
            print("✅ 購買卡片 API 正常")
            return True
        else:
            print("❌ 購買卡片 API 失敗")
            return False
    
    def run_all_tests(self):
        """運行所有測試"""
        print("🚀 開始 Telegram 內嵌鍵盤功能測試...")
        print("=" * 60)
        
        tests = [
            ("歡迎消息和主選單", self.test_welcome_message),
            ("卡片列表功能", self.test_card_listings),
            ("搜索功能", self.test_search_functionality),
            ("商家/代理商系統", self.test_merchant_system),
            ("支付系統", self.test_payment_system),
            ("購買流程", self.test_purchase_flow),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                result = test_func()
                if result:
                    passed += 1
                    print(f"✅ {test_name}: 通過")
                else:
                    print(f"❌ {test_name}: 失敗")
            except Exception as e:
                print(f"❌ {test_name}: 異常 - {str(e)}")
        
        print("=" * 60)
        print(f"🎯 測試結果: {passed}/{total} 通過")
        
        if passed == total:
            print("🎉 所有內嵌鍵盤功能測試通過！")
            print("✅ Telegram Bot 已準備好使用")
        else:
            print(f"⚠️ 有 {total - passed} 個測試失敗")
        
        return passed == total

def main():
    """主函數"""
    tester = TelegramKeyboardTester()
    
    # 首先檢查服務器是否運行
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code != 200:
            print("❌ 服務器未運行或無法訪問")
            print("請先啟動服務器: python main.py")
            sys.exit(1)
    except Exception as e:
        print(f"❌ 無法連接到服務器: {e}")
        print("請先啟動服務器: python main.py")
        sys.exit(1)
    
    # 運行測試
    success = tester.run_all_tests()
    
    if success:
        print("\n🚀 下一步:")
        print("1. 設置真實的 TELEGRAM_BOT_TOKEN")
        print("2. 配置 Telegram Webhook")
        print("3. 測試真實的 Telegram Bot")
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
