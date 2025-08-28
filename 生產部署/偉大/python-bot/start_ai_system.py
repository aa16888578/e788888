#!/usr/bin/env python3
"""
AI分類系統啟動腳本
啟動包含AI分類功能的完整CVV Bot系統
"""
import asyncio
import logging
import os
import sys
from pathlib import Path

# 添加項目根目錄到Python路徑
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app.bot.telegram_bot import telegram_bot
from app.services.firebase_service import firebase_service
from app.services.gemini_classification_service import gemini_classification_service
from app.services.cvv_display_service import cvv_display_service
from app.core.config import settings

# 設置日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def initialize_services():
    """初始化所有服務"""
    print("🔧 正在初始化服務...")
    
    try:
        # 1. 初始化配置
        print("📋 初始化配置...")
        await settings.initialize_from_backend()
        
        # 2. 檢查Firebase連接
        print("🔥 檢查Firebase連接...")
        test_doc = firebase_service.db.collection('_health_check').document('startup')
        test_doc.set({'timestamp': 'startup', 'status': 'ok'})
        print("✅ Firebase連接成功")
        
        # 3. 初始化AI分類服務
        print("🤖 初始化AI分類服務...")
        # 注入依賴
        gemini_classification_service.config_service = settings
        cvv_display_service.firebase_service = firebase_service
        cvv_display_service.gemini_service = gemini_classification_service
        print("✅ AI分類服務初始化完成")
        
        # 4. 檢查Telegram Bot配置
        print("📱 檢查Telegram Bot配置...")
        telegram_token = await settings.get_config('TELEGRAM_BOT_TOKEN')
        if telegram_token:
            print("✅ Telegram Bot Token已配置")
        else:
            print("⚠️ Telegram Bot Token未配置，將使用測試模式")
        
        print("🎉 所有服務初始化完成！")
        return True
        
    except Exception as e:
        print(f"❌ 服務初始化失敗: {e}")
        logger.error(f"服務初始化失敗: {e}")
        return False

async def test_ai_features():
    """測試AI功能"""
    print("\n🧪 開始AI功能測試...")
    
    try:
        # 測試CVV分類
        test_data = "US_美國🇺🇸_全資庫_4111111111111111_12/26_123_John Smith_+1234567890_25.00_Test Address"
        print(f"📝 測試數據: {test_data}")
        
        async with gemini_classification_service:
            result = await gemini_classification_service.classify_single_cvv(test_data)
            
            print("✅ AI分類結果:")
            print(f"　　國家: {result.country_flag} {result.country_name}")
            print(f"　　庫別: {result.card_type}")
            print(f"　　建議售價: ${result.suggested_price:.2f}")
            print(f"　　置信度: {result.confidence*100:.1f}%")
        
        # 測試統計功能
        print("\n📊 測試統計功能...")
        stats = await gemini_classification_service.get_classification_stats()
        print(f"✅ 統計數據載入成功")
        print(f"　　總數據: {stats.get('total_classified', 0):,}")
        print(f"　　活性: {stats.get('activity_rate', 0):.1f}%")
        
        print("🎉 AI功能測試完成！")
        return True
        
    except Exception as e:
        print(f"❌ AI功能測試失敗: {e}")
        logger.error(f"AI功能測試失敗: {e}")
        return False

async def start_bot_with_ai():
    """啟動包含AI功能的Bot"""
    print("\n🚀 啟動CVV Bot (含AI分類功能)...")
    
    try:
        # 初始化Bot
        await telegram_bot.initialize()
        print("✅ Telegram Bot初始化完成")
        
        print("\n🎯 CVV Bot AI分類系統已就緒！")
        print("📋 可用功能:")
        print("　　• 全資庫/裸資庫/特價庫 (AI分類結果)")
        print("　　• 搜尋購買 (含卡頭搜尋)")
        print("　　• 全球卡頭庫存 (風趣統計)")
        print("　　• 代理系統")
        print("　　• 支付系統")
        print("　　• 幫助和語言")
        
        print("\n💡 使用方法:")
        print("　　1. 發送 /start 查看主選單")
        print("　　2. 點擊任何按鈕體驗功能")
        print("　　3. 直接輸入CVV數據進行AI分類")
        print("　　4. 輸入6位數字進行卡頭搜尋")
        
        print("\n🔥 開始Bot輪詢... (按Ctrl+C停止)")
        await telegram_bot.start_polling()
        
    except KeyboardInterrupt:
        print("\n🛑 Bot已停止")
    except Exception as e:
        print(f"❌ Bot啟動失敗: {e}")
        logger.error(f"Bot啟動失敗: {e}")

async def main():
    """主函數"""
    print("🎯 CVV Bot AI分類系統啟動器")
    print("=" * 60)
    
    # 1. 初始化服務
    if not await initialize_services():
        print("❌ 服務初始化失敗，退出")
        return
    
    # 2. 測試AI功能
    if not await test_ai_features():
        print("⚠️ AI功能測試失敗，但繼續啟動...")
    
    # 3. 啟動Bot
    await start_bot_with_ai()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 再見！")
    except Exception as e:
        print(f"❌ 啟動失敗: {e}")
        sys.exit(1)
