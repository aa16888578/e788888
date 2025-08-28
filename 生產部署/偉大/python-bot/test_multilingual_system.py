#!/usr/bin/env python3
"""
CVV Bot 多語言系統測試腳本
測試所有語言和功能是否正常工作
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

def test_language_pack():
    """測試語言包"""
    print("🌐 測試語言包系統...")
    try:
        from app.core.language_pack import LanguagePack
        
        # 測試繁體中文
        lang_tw = LanguagePack("zh-tw")
        print("✅ 繁體中文語言包載入成功")
        print(f"   當前語言: {lang_tw.get_current_language()}")
        print(f"   主選單標題: {lang_tw.get_text('main_menu_title')}")
        
        # 測試簡體中文
        lang_cn = LanguagePack("zh-cn")
        print("✅ 简体中文语言包加载成功")
        print(f"   当前语言: {lang_cn.get_current_language()}")
        print(f"   主选单标题: {lang_cn.get_text('main_menu_title')}")
        
        # 測試英文
        lang_en = LanguagePack("en")
        print("✅ English language pack loaded successfully")
        print(f"   Current language: {lang_en.get_current_language()}")
        print(f"   Main menu title: {lang_en.get_text('main_menu_title')}")
        
        return True
    except Exception as e:
        print(f"❌ 語言包測試失敗: {e}")
        return False

def test_keyboards():
    """測試鍵盤系統"""
    print("\n⌨️ 測試鍵盤系統...")
    try:
        from app.bot.keyboards import CVVKeyboards
        
        # 測試繁體中文鍵盤
        kb_tw = CVVKeyboards("zh-tw")
        main_menu_tw = kb_tw.create_main_menu()
        print("✅ 繁體中文鍵盤創建成功")
        
        # 測試簡體中文鍵盤
        kb_cn = CVVKeyboards("zh-cn")
        main_menu_cn = kb_cn.create_main_menu()
        print("✅ 简体中文键盘创建成功")
        
        # 測試英文鍵盤
        kb_en = CVVKeyboards("en")
        main_menu_en = kb_en.create_main_menu()
        print("✅ English keyboard created successfully")
        
        return True
    except Exception as e:
        print(f"❌ 鍵盤測試失敗: {e}")
        return False

def test_funny_startup():
    """測試風趣開場系統"""
    print("\n🎭 測試風趣開場系統...")
    try:
        from app.core.funny_startup_integrator import FunnyStartupIntegrator
        
        # 測試繁體中文開場
        startup_tw = FunnyStartupIntegrator("zh-tw")
        welcome_tw = startup_tw.get_welcome_message()
        print("✅ 繁體中文風趣開場生成成功")
        print(f"   開場長度: {len(welcome_tw)} 字符")
        
        # 測試簡體中文開場
        startup_cn = FunnyStartupIntegrator("zh-cn")
        welcome_cn = startup_cn.get_welcome_message()
        print("✅ 简体中文风趣开场生成成功")
        print(f"   开场长度: {len(welcome_cn)} 字符")
        
        # 測試英文開場
        startup_en = FunnyStartupIntegrator("en")
        welcome_en = startup_en.get_welcome_message()
        print("✅ English funny startup generated successfully")
        print(f"   Startup length: {len(welcome_en)} characters")
        
        return True
    except Exception as e:
        print(f"❌ 風趣開場測試失敗: {e}")
        return False

def test_language_keyboards():
    """測試語言選擇鍵盤"""
    print("\n🌍 測試語言選擇鍵盤...")
    try:
        from app.bot.language_keyboards import LanguageKeyboards
        
        # 測試不同語言的語言選擇鍵盤
        lang_kb = LanguageKeyboards()
        
        kb_tw = lang_kb.get_language_keyboard_by_current_lang("zh-tw")
        print("✅ 繁體中文語言選擇鍵盤創建成功")
        
        kb_cn = lang_kb.get_language_keyboard_by_current_lang("zh-cn")
        print("✅ 简体中文语言选择键盘创建成功")
        
        kb_en = lang_kb.get_language_keyboard_by_current_lang("en")
        print("✅ English language selection keyboard created successfully")
        
        return True
    except Exception as e:
        print(f"❌ 語言選擇鍵盤測試失敗: {e}")
        return False

def main():
    """主測試函數"""
    print("🚀 CVV Bot 多語言系統測試開始")
    print("=" * 50)
    
    tests = [
        ("語言包系統", test_language_pack),
        ("鍵盤系統", test_keyboards),
        ("風趣開場系統", test_funny_startup),
        ("語言選擇鍵盤", test_language_keyboards)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
                print(f"✅ {test_name} 測試通過")
            else:
                print(f"❌ {test_name} 測試失敗")
        except Exception as e:
            print(f"❌ {test_name} 測試異常: {e}")
    
    print("\n" + "=" * 50)
    print(f"🎯 測試結果: {passed}/{total} 通過")
    
    if passed == total:
        print("🎉 所有測試通過！多語言系統運行正常！")
        return True
    else:
        print("⚠️ 部分測試失敗，請檢查錯誤信息")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
