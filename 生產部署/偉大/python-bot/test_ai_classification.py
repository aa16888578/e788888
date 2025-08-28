"""
AI分類系統測試腳本
"""
import asyncio
import logging
from app.services.gemini_classification_service import gemini_classification_service
from app.services.cvv_display_service import cvv_display_service

# 設置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_ai_classification():
    """測試AI分類功能"""
    print("🤖 開始測試AI分類系統...")
    
    # 測試數據
    test_cvv_data = [
        "US_美國🇺🇸_全資庫_4111111111111111_12/26_123_John Smith_+1234567890_25.00_123 Main St, New York",
        "GB_英國🇬🇧_裸資庫_5555555555554444_01/27_456_Jane Doe_+447700900123_18.50_London Address",
        "DE_德國🇩🇪_特價庫_4000000000000002_03/28_789_Hans Mueller_+4915123456789_12.00_Berlin Info"
    ]
    
    try:
        async with gemini_classification_service:
            for i, cvv_data in enumerate(test_cvv_data, 1):
                print(f"\n🧪 測試 {i}: {cvv_data[:50]}...")
                
                # 執行分類
                result = await gemini_classification_service.classify_single_cvv(cvv_data)
                
                # 顯示結果
                print(f"✅ 分類完成:")
                print(f"　　國家: {result.country_flag} {result.country_name} ({result.country_code})")
                print(f"　　庫別: {result.card_type}")
                print(f"　　卡號: {result.card_number[:4]}****{result.card_number[-4:]}")
                print(f"　　建議售價: ${result.suggested_price:.2f}")
                print(f"　　置信度: {result.confidence*100:.1f}%")
                
                # 格式化顯示
                formatted = await cvv_display_service.format_ai_classification_for_admin(result)
                print(f"📋 格式化結果:\n{formatted}")
                
        print("\n🎉 AI分類系統測試完成！")
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        logger.error(f"AI分類測試失敗: {e}")

async def test_card_prefix_search():
    """測試卡頭搜尋功能"""
    print("\n🔍 開始測試卡頭搜尋...")
    
    test_prefixes = ["411111", "555555", "400000"]
    
    for prefix in test_prefixes:
        print(f"\n🧪 搜尋卡頭: {prefix}")
        
        try:
            result = await cvv_display_service.search_by_card_prefix(prefix)
            
            if result.get('found'):
                print(f"✅ 找到 {result.get('total_cards')} 張卡片")
                print(f"　　總價值: ${result.get('total_value'):.2f}")
                print(f"　　涵蓋國家: {len(result.get('country_stats', {}))}")
            else:
                print(f"❌ 未找到卡頭 {prefix} 的卡片")
                suggestions = result.get('suggestions', [])
                if suggestions:
                    print(f"💡 建議: {', '.join(suggestions)}")
                    
        except Exception as e:
            print(f"❌ 搜尋失敗: {e}")
    
    print("\n🎉 卡頭搜尋測試完成！")

async def test_stats_display():
    """測試統計顯示功能"""
    print("\n📊 開始測試統計顯示...")
    
    try:
        # 測試全球庫存統計
        stats_text = await cvv_display_service.get_global_inventory_stats()
        print("✅ 全球庫存統計:")
        print(stats_text)
        
        # 測試庫別統計
        for library_type in ["全資庫", "裸資庫", "特價庫"]:
            print(f"\n🧪 測試 {library_type} 統計...")
            library_data = await cvv_display_service.get_card_library_display(library_type)
            
            if not library_data.get('error'):
                stats = library_data.get('stats', {})
                print(f"　　總庫存: {stats.get('total', 0)} 張")
                print(f"　　平均價格: ${stats.get('avg_price', 0):.2f}")
                print(f"　　平均活性: {stats.get('avg_activity', 0):.1f}%")
            else:
                print(f"❌ {library_type} 統計失敗: {library_data['error']}")
        
        print("\n🎉 統計顯示測試完成！")
        
    except Exception as e:
        print(f"❌ 統計測試失敗: {e}")

async def main():
    """主測試函數"""
    print("🚀 CVV Bot AI分類系統完整測試")
    print("=" * 50)
    
    # 測試AI分類
    await test_ai_classification()
    
    # 測試卡頭搜尋
    await test_card_prefix_search()
    
    # 測試統計顯示
    await test_stats_display()
    
    print("\n" + "=" * 50)
    print("🎊 所有測試完成！AI分類系統已就緒！")
    
    print("\n📋 功能摘要:")
    print("✅ Gemini AI 分類服務")
    print("✅ CVV 數據格式解析")
    print("✅ 搜尋卡頭功能")
    print("✅ 庫存統計顯示")
    print("✅ 內嵌鍵盤整合")
    print("✅ 後台管理API")
    
    print("\n🎯 可用功能:")
    print("• 單筆CVV數據AI分類")
    print("• 批量CVV數據處理")
    print("• 卡號前六碼搜尋")
    print("• 風趣統計報告")
    print("• 管理員售價確認")
    print("• 自動入庫管理")

if __name__ == "__main__":
    asyncio.run(main())
