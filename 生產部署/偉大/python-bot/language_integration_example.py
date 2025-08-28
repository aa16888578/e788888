#!/usr/bin/env python3
"""
CVV Bot 語言包整合範例
展示如何在Bot中使用多語言系統
"""
from app.core.language_pack import LanguagePack
from app.bot.language_keyboards import LanguageKeyboards

class CVVBotLanguageExample:
    """CVV Bot 語言整合範例"""
    
    def __init__(self):
        self.language_pack = LanguagePack()  # 自動檢測系統語言
        self.language_keyboards = LanguageKeyboards()
    
    def get_welcome_message(self, user_language: str = None) -> str:
        """獲取歡迎訊息"""
        if user_language:
            self.language_pack.set_language(user_language)
        
        # 根據時間獲取問候語
        from datetime import datetime
        hour = datetime.now().hour
        
        if 6 <= hour < 12:
            greeting = self.language_pack.get_text("good_morning")
        elif 12 <= hour < 18:
            greeting = self.language_pack.get_text("good_afternoon")
        elif 18 <= hour < 22:
            greeting = self.language_pack.get_text("good_evening")
        else:
            greeting = self.language_pack.get_text("good_night")
        
        # 獲取風趣開場
        startup_message = self.language_pack.get_text("startup_rocket")
        
        # 組合歡迎訊息
        welcome = f"{greeting}\n\n{startup_message}\n\n{self.language_pack.get_text('tip_usage')}"
        
        return welcome
    
    def get_main_menu_text(self, user_language: str = None) -> str:
        """獲取主選單文字"""
        if user_language:
            self.language_pack.set_language(user_language)
        
        return self.language_pack.get_text("main_menu_title")
    
    def get_language_selection_text(self, user_language: str = None) -> str:
        """獲取語言選擇文字"""
        if user_language:
            self.language_pack.set_language(user_language)
        
        current_lang = self.language_pack.get_current_language()
        lang_name = self.language_pack.get_language_name(current_lang)
        
        return f"🌐 當前語言：{lang_name}\n\n請選擇您想要的語言："
    
    def get_language_keyboard(self, user_language: str = None):
        """獲取語言選擇鍵盤"""
        if user_language:
            self.language_pack.set_language(user_language)
        
        current_lang = self.language_pack.get_current_language()
        return self.language_keyboards.get_language_keyboard_by_current_lang(current_lang)
    
    def get_startup_stats(self, user_language: str = None) -> str:
        """獲取開場統計"""
        if user_language:
            self.language_pack.set_language(user_language)
        
        return self.language_pack.get_text("startup_stats", count=5, theme="火箭發射")
    
    def demo_all_languages(self):
        """演示所有語言"""
        print("🎭 CVV Bot 多語言系統演示")
        print("=" * 50)
        
        languages = ["zh-tw", "zh-cn", "en"]
        language_names = ["繁體中文", "简体中文", "English"]
        
        for lang, name in zip(languages, language_names):
            print(f"\n🌐 {name} 演示:")
            print("-" * 30)
            
            # 設定語言
            self.language_pack.set_language(lang)
            
            # 顯示歡迎訊息
            welcome = self.get_welcome_message(lang)
            print("歡迎訊息:")
            print(welcome[:100] + "..." if len(welcome) > 100 else welcome)
            
            # 顯示主選單文字
            main_menu = self.get_main_menu_text(lang)
            print(f"\n主選單: {main_menu}")
            
            # 顯示統計
            stats = self.get_startup_stats(lang)
            print(f"統計: {stats}")
            
            print()

# 使用範例
if __name__ == "__main__":
    # 創建語言整合範例
    bot_lang = CVVBotLanguageExample()
    
    # 演示所有語言
    bot_lang.demo_all_languages()
    
    print("\n🎯 語言鍵盤演示:")
    print("=" * 30)
    
    # 測試不同語言的鍵盤
    for lang in ["zh-tw", "zh-cn", "en"]:
        print(f"\n{lang} 語言鍵盤:")
        keyboard = bot_lang.get_language_keyboard(lang)
        print(keyboard)
