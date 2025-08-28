#!/usr/bin/env python3
"""
CVV Bot 語言切換鍵盤
提供多語言選擇介面
"""
from telegram import InlineKeyboardButton, InlineKeyboardMarkup
from app.core.language_pack import LanguagePack

class LanguageKeyboards:
    """語言切換鍵盤管理器"""
    
    @staticmethod
    def create_language_selection_keyboard() -> InlineKeyboardMarkup:
        """創建語言選擇鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("🇹🇼 繁體中文", callback_data="lang_zh_tw"),
                InlineKeyboardButton("🇨🇳 简体中文", callback_data="lang_zh_cn")
            ],
            [
                InlineKeyboardButton("🇺🇸 English", callback_data="lang_en")
            ],
            [
                InlineKeyboardButton("🔙 返回主選單", callback_data="back_main")
            ]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_language_selection_keyboard_zh_cn() -> InlineKeyboardMarkup:
        """創建簡體中文語言選擇鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("🇹🇼 繁體中文", callback_data="lang_zh_tw"),
                InlineKeyboardButton("🇨🇳 简体中文", callback_data="lang_zh_cn")
            ],
            [
                InlineKeyboardButton("🇺🇸 English", callback_data="lang_en")
            ],
            [
                InlineKeyboardButton("🔙 返回主选单", callback_data="back_main")
            ]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_language_selection_keyboard_en() -> InlineKeyboardMarkup:
        """創建英文語言選擇鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("🇹🇼 Traditional Chinese", callback_data="lang_zh_tw"),
                InlineKeyboardButton("🇨🇳 Simplified Chinese", callback_data="lang_zh_cn")
            ],
            [
                InlineKeyboardButton("🇺🇸 English", callback_data="lang_en")
            ],
            [
                InlineKeyboardButton("🔙 Back to Main Menu", callback_data="back_main")
            ]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_language_confirmation_keyboard(language_code: str) -> InlineKeyboardMarkup:
        """創建語言確認鍵盤"""
        lang_pack = LanguagePack(language_code)
        
        if language_code == "zh-tw":
            confirm_text = "✅ 確認使用繁體中文"
            back_text = "🔙 重新選擇"
        elif language_code == "zh-cn":
            confirm_text = "✅ 确认使用简体中文"
            back_text = "🔙 重新选择"
        else:  # en
            confirm_text = "✅ Confirm English"
            back_text = "🔙 Choose Again"
        
        keyboard = [
            [
                InlineKeyboardButton(confirm_text, callback_data=f"confirm_lang_{language_code}")
            ],
            [
                InlineKeyboardButton(back_text, callback_data="lang_selection")
            ]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def get_language_keyboard_by_current_lang(current_language: str) -> InlineKeyboardMarkup:
        """根據當前語言獲取對應的語言選擇鍵盤"""
        if current_language == "zh-cn":
            return LanguageKeyboards.create_language_selection_keyboard_zh_cn()
        elif current_language == "en":
            return LanguageKeyboards.create_language_selection_keyboard_en()
        else:  # zh-tw 或其他
            return LanguageKeyboards.create_language_selection_keyboard()

# 使用範例
if __name__ == "__main__":
    # 測試語言鍵盤
    print("=== 繁體中文語言選擇鍵盤 ===")
    kb_tw = LanguageKeyboards.create_language_selection_keyboard()
    print(kb_tw)
    
    print("\n=== 簡體中文語言選擇鍵盤 ===")
    kb_cn = LanguageKeyboards.create_language_selection_keyboard_zh_cn()
    print(kb_cn)
    
    print("\n=== 英文語言選擇鍵盤 ===")
    kb_en = LanguageKeyboards.create_language_selection_keyboard_en()
    print(kb_en)
    
    print("\n=== 語言確認鍵盤 ===")
    kb_confirm = LanguageKeyboards.create_language_confirmation_keyboard("zh-tw")
    print(kb_confirm)
