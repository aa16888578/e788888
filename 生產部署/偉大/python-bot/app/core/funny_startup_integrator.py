#!/usr/bin/env python3
"""
CVV Bot 風趣開場整合器
整合多語言風趣開場到現有Bot系統
"""
import random
from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from app.core.language_pack import LanguagePack

class FunnyStartupIntegrator:
    """風趣開場整合器"""
    
    def __init__(self, language: str = "zh-tw"):
        self.language_pack = LanguagePack(language)
        self.startup_count = 0
        self.last_theme = None
    
    def get_random_startup_message(self) -> str:
        """獲取隨機風趣開場訊息"""
        startup_themes = [
            "startup_rocket",
            "startup_circus", 
            "startup_dramatic",
            "startup_artist",
            "startup_random"
        ]
        
        # 避免連續相同主題
        available_themes = [t for t in startup_themes if t != self.last_theme]
        if not available_themes:
            available_themes = startup_themes
        
        theme = random.choice(available_themes)
        self.last_theme = theme
        self.startup_count += 1
        
        return self.language_pack.get_text(theme)
    
    def get_interactive_startup(self) -> str:
        """獲取互動式開場"""
        # 根據時間獲取問候語
        hour = datetime.now().hour
        
        if 6 <= hour < 12:
            greeting = self.language_pack.get_text("good_morning")
        elif 12 <= hour < 18:
            greeting = self.language_pack.get_text("good_afternoon")
        elif 18 <= hour < 22:
            greeting = self.language_pack.get_text("good_evening")
        else:
            greeting = self.language_pack.get_text("good_night")
        
        interactive_msg = self.language_pack.get_text("interactive_startup")
        
        return f"{greeting}\n\n{interactive_msg}"
    
    def get_choose_your_startup(self) -> str:
        """獲取選擇式開場"""
        return self.language_pack.get_text("choose_startup")
    
    def get_startup_stats(self) -> str:
        """獲取開場統計"""
        theme_name = self.last_theme.replace("startup_", "") if self.last_theme else "無"
        
        # 根據語言獲取主題名稱
        theme_names = {
            "startup_rocket": {
                "zh-tw": "火箭發射",
                "zh-cn": "火箭发射", 
                "en": "Rocket Launch"
            },
            "startup_circus": {
                "zh-tw": "馬戲團表演",
                "zh-cn": "马戏团表演",
                "en": "Circus Show"
            },
            "startup_dramatic": {
                "zh-tw": "戲劇化啟動",
                "zh-cn": "戏剧化启动",
                "en": "Dramatic Startup"
            },
            "startup_artist": {
                "zh-tw": "藝術家風格",
                "zh-cn": "艺术家风格",
                "en": "Artist Style"
            },
            "startup_random": {
                "zh-tw": "隨機驚喜",
                "zh-cn": "随机惊喜",
                "en": "Random Surprise"
            }
        }
        
        current_lang = self.language_pack.get_current_language()
        theme_display = theme_names.get(self.last_theme, {}).get(current_lang, theme_name)
        
        return self.language_pack.get_text("startup_stats", count=self.startup_count, theme=theme_display)
    
    def get_bot_status_message(self, status: str = "運行中") -> str:
        """獲取Bot狀態訊息"""
        return self.language_pack.get_text("bot_status", status=status)
    
    def get_welcome_message(self, include_startup: bool = True) -> str:
        """獲取完整歡迎訊息"""
        # 根據時間獲取問候語
        hour = datetime.now().hour
        
        if 6 <= hour < 12:
            greeting = self.language_pack.get_text("good_morning")
        elif 12 <= hour < 18:
            greeting = self.language_pack.get_text("good_afternoon")
        elif 18 <= hour < 22:
            greeting = self.language_pack.get_text("good_evening")
        else:
            greeting = self.language_pack.get_text("good_night")
        
        welcome_parts = [greeting]
        
        if include_startup:
            startup_msg = self.get_random_startup_message()
            welcome_parts.append(startup_msg)
        
        # 添加使用提示
        tip = self.language_pack.get_text("tip_usage")
        welcome_parts.append(tip)
        
        return "\n\n".join(welcome_parts)
    
    def set_language(self, language: str):
        """設定語言"""
        self.language_pack.set_language(language)
    
    def get_current_language(self) -> str:
        """獲取當前語言"""
        return self.language_pack.get_current_language()

# 使用範例
if __name__ == "__main__":
    # 測試繁體中文
    print("=== 繁體中文風趣開場 ===")
    integrator_tw = FunnyStartupIntegrator("zh-tw")
    print(integrator_tw.get_welcome_message())
    print("\n統計:", integrator_tw.get_startup_stats())
    
    print("\n" + "="*50 + "\n")
    
    # 測試簡體中文
    print("=== 简体中文风趣开场 ===")
    integrator_cn = FunnyStartupIntegrator("zh-cn")
    print(integrator_cn.get_welcome_message())
    print("\n统计:", integrator_cn.get_startup_stats())
    
    print("\n" + "="*50 + "\n")
    
    # 測試英文
    print("=== English Funny Startup ===")
    integrator_en = FunnyStartupIntegrator("en")
    print(integrator_en.get_welcome_message())
    print("\nStats:", integrator_en.get_startup_stats())
    
    print("\n" + "="*50 + "\n")
    
    # 測試互動開場
    print("=== 互動開場測試 ===")
    print("繁體中文:", integrator_tw.get_interactive_startup())
    print("\n简体中文:", integrator_cn.get_interactive_startup())
    print("\nEnglish:", integrator_en.get_interactive_startup())
