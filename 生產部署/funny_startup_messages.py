#!/usr/bin/env python3
"""
CVV Bot 風趣開場訊息集合
包含五種不同風格的開場，其中兩種是互動式的
"""

import random
import asyncio
from datetime import datetime

class FunnyStartupMessages:
    """風趣開場訊息管理器"""
    
    def __init__(self):
        self.startup_count = 0
        self.last_theme = None
    
    def get_random_startup_message(self, theme=None):
        """獲取隨機開場訊息"""
        if theme and theme in self.startup_themes:
            return self.startup_themes[theme]()
        
        # 隨機選擇主題，避免連續相同
        available_themes = [k for k in self.startup_themes.keys() if k != self.last_theme]
        if not available_themes:
            available_themes = list(self.startup_themes.keys())
        
        theme = random.choice(available_themes)
        self.last_theme = theme
        self.startup_count += 1
        
        return self.startup_themes[theme]()
    
    def get_interactive_startup(self):
        """獲取互動式開場"""
        return self.startup_themes['interactive']()
    
    def get_choose_your_startup(self):
        """獲取選擇式開場"""
        return self.startup_themes['choose_your_startup']()
    
    @property
    def startup_themes(self):
        """開場主題集合"""
        return {
            'rocket': self._rocket_launch,
            'circus': self._circus_show,
            'interactive': self._interactive_startup,
            'choose_your_startup': self._choose_your_startup,
            'dramatic': self._dramatic_startup
        }
    
    def _rocket_launch(self):
        """🚀 火箭發射風格"""
        messages = [
            "🚀 倒數計時開始... 3... 2... 1...",
            "🔥 點火！CVV Bot 正在升空！",
            "🌍 突破大氣層，進入軌道！",
            "⭐ 成功對接國際空間站！",
            "✅ CVV Bot 已成功部署到太空！",
            "🌌 現在可以從任何地方訪問我們的服務了！"
        ]
        return "\n".join(messages)
    
    def _circus_show(self):
        """🎪 馬戲團表演風格"""
        messages = [
            "🎪 歡迎來到 CVV Bot 馬戲團！",
            "🎭 讓我們開始今天的精彩表演！",
            "🤹 首先是我們的招牌節目：AI分類雜技！",
            "🎨 接下來是鍵盤魔術表演！",
            "🎪 最後是我們的壓軸好戲：CVV交易！",
            "👏 掌聲歡迎 CVV Bot 正式開幕！"
        ]
        return "\n".join(messages)
    
    def _interactive_startup(self):
        """🎮 互動式開場"""
        current_time = datetime.now()
        hour = current_time.hour
        
        # 根據時間給出不同問候
        if 6 <= hour < 12:
            time_greeting = "🌅 早安！準備好開始新的一天了嗎？"
        elif 12 <= hour < 18:
            time_greeting = "🌞 午安！休息時間也要保持活力！"
        elif 18 <= hour < 22:
            time_greeting = "🌆 晚安！讓我們一起度過美好的夜晚！"
        else:
            time_greeting = "🌙 夜深了！但CVV Bot永遠為你服務！"
        
        messages = [
            f"{time_greeting}",
            "🎮 今天想要什麼樣的開場體驗？",
            "🎲 擲骰子決定？還是讓AI為你選擇？",
            "🎯 或者... 你想要一個驚喜？",
            "💫 告訴我你的心情，我來為你量身定制！"
        ]
        return "\n".join(messages)
    
    def _choose_your_startup(self):
        """🎯 選擇式開場"""
        messages = [
            "🎯 選擇你的開場風格：",
            "",
            "1️⃣ 🚀 火箭發射 - 充滿能量的科技感",
            "2️⃣ 🎪 馬戲團表演 - 歡樂有趣的娛樂感", 
            "3️⃣ 🎭 戲劇化啟動 - 史詩般的英雄感",
            "4️⃣ 🎨 藝術家風格 - 優雅文藝的氣質感",
            "5️⃣ 🎲 隨機驚喜 - 讓命運決定一切！",
            "",
            "💬 回覆數字選擇，或說 '隨機' 讓我為你選擇！"
        ]
        return "\n".join(messages)
    
    def _dramatic_startup(self):
        """🎭 戲劇化啟動風格"""
        messages = [
            "🎭 燈光！攝影機！開始！",
            "🌟 在一個遙遠的數位世界裡...",
            "⚡ 一道閃電劃過天際！",
            "🌪️ 風起雲湧，數據如潮水般湧來！",
            "💫 突然，一個聲音響起：",
            "🎪 '歡迎來到 CVV Bot 的傳奇世界！'",
            "👑 在這裡，每個交易都是史詩！",
            "🎬 讓我們開始今天的傳奇故事！"
        ]
        return "\n".join(messages)
    
    def get_startup_stats(self):
        """獲取開場統計"""
        return f"📊 開場統計：已啟動 {self.startup_count} 次，最後主題：{self.last_theme or '無'}"

# 使用範例
if __name__ == "__main__":
    startup_messages = FunnyStartupMessages()
    
    print("🎭 CVV Bot 風趣開場展示：")
    print("=" * 50)
    
    # 展示所有開場
    themes = ['rocket', 'circus', 'interactive', 'choose_your_startup', 'dramatic']
    
    for theme in themes:
        print(f"\n🎨 {theme.upper()} 風格：")
        print("-" * 30)
        print(startup_messages.startup_themes[theme]())
        print()
    
    # 展示互動式開場
    print("🎮 互動式開場：")
    print("-" * 30)
    print(startup_messages.get_interactive_startup())
    print()
    
    # 展示選擇式開場
    print("🎯 選擇式開場：")
    print("-" * 30)
    print(startup_messages.get_choose_your_startup())
