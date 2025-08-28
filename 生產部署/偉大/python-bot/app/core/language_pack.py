#!/usr/bin/env python3
"""
CVV Bot 多語言包系統
支援繁體中文、簡體中文、英文
"""
import locale
import os
from typing import Dict, Any, Optional
from enum import Enum

class Language(Enum):
    """支援的語言枚舉"""
    TRADITIONAL_CHINESE = "zh-tw"  # 繁體中文
    SIMPLIFIED_CHINESE = "zh-cn"   # 簡體中文
    ENGLISH = "en"                 # 英文

class LanguagePack:
    """多語言包管理器"""
    
    def __init__(self, default_language: str = None):
        # 自動檢測系統語言
        if default_language is None:
            default_language = self._detect_system_language()
        
        self.current_language = default_language
        self.language_packs = self._load_language_packs()
    
    def _detect_system_language(self) -> str:
        """自動檢測系統語言"""
        try:
            # 嘗試獲取系統語言環境變數
            system_lang = os.environ.get('LANG') or os.environ.get('LANGUAGE') or os.environ.get('LC_ALL')
            
            if system_lang:
                # 解析語言代碼
                lang_code = system_lang.split('_')[0].lower()
                
                # 支援的語言映射
                if lang_code in ['zh', 'zh-tw', 'zh-hk', 'zh-mo']:
                    return "zh-tw"  # 繁體中文
                elif lang_code in ['zh-cn', 'zh-sg']:
                    return "zh-cn"  # 簡體中文
                elif lang_code in ['en', 'en-us', 'en-gb', 'en-ca', 'en-au']:
                    return "en"     # 英文
                else:
                    # 非中文、英文語言，預設為簡體中文
                    return "zh-cn"
            
            # 如果無法獲取環境變數，嘗試使用locale模組
            try:
                system_locale = locale.getdefaultlocale()[0]
                if system_locale:
                    lang_code = system_locale.split('_')[0].lower()
                    
                    if lang_code in ['zh', 'zh-tw', 'zh-hk', 'zh-mo']:
                        return "zh-tw"
                    elif lang_code in ['zh-cn', 'zh-sg']:
                        return "zh-cn"
                    elif lang_code in ['en', 'en-us', 'en-gb', 'en-ca', 'en-au']:
                        return "en"
                    else:
                        return "zh-cn"
            except:
                pass
            
        except Exception as e:
            print(f"語言檢測錯誤: {e}")
        
        # 預設為簡體中文
        return "zh-cn"
    
    def _load_language_packs(self) -> Dict[str, Dict[str, Any]]:
        """載入所有語言包"""
        return {
            "zh-tw": self._traditional_chinese(),
            "zh-cn": self._simplified_chinese(),
            "en": self._english()
        }
    
    def set_language(self, language: str):
        """設定當前語言"""
        if language in self.language_packs:
            self.current_language = language
        else:
            self.current_language = "zh-tw"  # 預設繁體中文
    
    def get_text(self, key: str, **kwargs) -> str:
        """獲取指定語言的文字"""
        try:
            text = self.language_packs[self.current_language][key]
            if kwargs:
                text = text.format(**kwargs)
            return text
        except (KeyError, TypeError):
            # 如果找不到文字，返回繁體中文版本
            try:
                text = self.language_packs["zh-tw"][key]
                if kwargs:
                    text = text.format(**kwargs)
                return text
            except (KeyError, TypeError):
                return f"[Missing: {key}]"
    
    def get_language_name(self, language_code: str) -> str:
        """獲取語言名稱"""
        language_names = {
            "zh-tw": "繁體中文",
            "zh-cn": "简体中文", 
            "en": "English"
        }
        return language_names.get(language_code, "繁體中文")
    
    def _traditional_chinese(self) -> Dict[str, Any]:
        """繁體中文語言包"""
        return {
            # 主選單
            "main_menu_title": "🎯 CVV Bot 主選單",
            "all_cards": "💎 全資庫",
            "naked_cards": "🎓 裸資庫", 
            "special_cards": "🔥 特價庫",
            "global_inventory": "🌍 全球卡頭庫存",
            "search_buy": "🔍 搜尋購買",
            "merchant_base": "🏪 代理系統",
            "recharge": "💰 支付系統",
            "balance_check": "💳 幫助",
            "language": "🌐 語言",
            
            # 搜尋選單
            "search_menu_title": "🔍 搜尋選項",
            "search_by_country": "🌍 按國家查詢",
            "search_by_price": "💰 按價格查詢",
            "search_by_rate": "🎯 按成功率查詢",
            "search_hot": "🔥 熱門推薦",
            "search_card_prefix": "🔍 搜尋卡頭",
            "advanced_search": "💎 高級篩選",
            "back_main_menu": "🔙 返回主選單",
            
            # AI分類
            "ai_classification": "🤖 AI分類系統",
            "ai_classify_single": "📝 單筆分類",
            "ai_classify_batch": "📁 批量分類",
            "ai_view_results": "👀 查看結果",
            "ai_stats": "📊 分類統計",
            
            # 管理員功能
            "admin_set_price": "💰 設定售價",
            "admin_confirm_stock": "✅ 確認入庫",
            "admin_batch_import": "📥 批量導入",
            "admin_batch_export": "📤 批量導出",
            
            # 通用按鈕
            "confirm": "✅ 確認",
            "cancel": "❌ 取消",
            "back": "🔙 返回",
            "next": "➡️ 下一頁",
            "previous": "⬅️ 上一頁",
            "refresh": "🔄 刷新",
            "settings": "⚙️ 設定",
            "help": "❓ 幫助",
            
            # 狀態訊息
            "loading": "⏳ 載入中...",
            "success": "✅ 操作成功！",
            "error": "❌ 操作失敗！",
            "processing": "🔄 處理中...",
            "completed": "🎉 完成！",
            
            # 時間問候
            "good_morning": "🌅 早安！",
            "good_afternoon": "🌞 午安！",
            "good_evening": "🌆 晚安！",
            "good_night": "🌙 夜深了！",
            
            # 風趣開場
            "startup_rocket": "🚀 倒數計時開始... 3... 2... 1...\n🔥 點火！CVV Bot 正在升空！\n🌍 突破大氣層，進入軌道！\n⭐ 成功對接國際空間站！\n✅ CVV Bot 已成功部署到太空！\n🌌 現在可以從任何地方訪問我們的服務了！",
            "startup_circus": "🎪 歡迎來到 CVV Bot 馬戲團！\n🎭 讓我們開始今天的精彩表演！\n🤹 首先是我們的招牌節目：AI分類雜技！\n🎨 接下來是鍵盤魔術表演！\n🎪 最後是我們的壓軸好戲：CVV交易！\n👏 掌聲歡迎 CVV Bot 正式開幕！",
            "startup_dramatic": "🎭 燈光！攝影機！開始！\n🌟 在一個遙遠的數位世界裡...\n⚡ 一道閃電劃過天際！\n🌪️ 風起雲湧，數據如潮水般湧來！\n💫 突然，一個聲音響起：\n🎪 '歡迎來到 CVV Bot 的傳奇世界！'\n👑 在這裡，每個交易都是史詩！\n🎬 讓我們開始今天的傳奇故事！",
            "startup_artist": "🎨 藝術家風格啟動中...\n🎭 優雅的代碼在舞動\n💫 每個函數都是詩篇\n🌟 每個API都是畫作\n🎪 CVV Bot 藝術展正式開幕！\n👑 讓我們用創意點亮數位世界！",
            "startup_random": "🎲 命運之輪開始轉動...\n🎯 隨機選擇啟動模式\n🌟 今天的主題是：驚喜！\n💫 準備好接受意外的美好嗎？\n🎪 CVV Bot 隨機模式啟動！\n🎭 讓我們一起探索未知的可能！",
            
            # 互動開場
            "interactive_startup": "🎮 今天想要什麼樣的開場體驗？\n🎲 擲骰子決定？還是讓AI為你選擇？\n🎯 或者... 你想要一個驚喜？\n💫 告訴我你的心情，我來為你量身定制！",
            
            # 選擇開場
            "choose_startup": "🎯 選擇你的開場風格：\n\n1️⃣ 🚀 火箭發射 - 充滿能量的科技感\n2️⃣ 🎪 馬戲團表演 - 歡樂有趣的娛樂感\n3️⃣ 🎭 戲劇化啟動 - 史詩般的英雄感\n4️⃣ 🎨 藝術家風格 - 優雅文藝的氣質感\n5️⃣ 🎲 隨機驚喜 - 讓命運決定一切！\n\n💬 回覆數字選擇，或說 '隨機' 讓我為你選擇！",
            
            # 統計訊息
            "startup_stats": "📊 開場統計：已啟動 {count} 次，最後主題：{theme}",
            "bot_status": "🤖 Bot狀態：{status}",
            "user_count": "👥 用戶數量：{count}",
            "transaction_count": "💳 交易數量：{count}",
            
            # 錯誤訊息
            "error_network": "🌐 網路連接錯誤，請稍後再試",
            "error_permission": "🚫 權限不足，無法執行此操作",
            "error_invalid_input": "❌ 輸入格式錯誤，請檢查後重試",
            "error_service_unavailable": "🔧 服務暫時不可用，請稍後再試",
            
            # 成功訊息
            "success_operation": "✅ 操作成功完成！",
            "success_saved": "💾 資料已成功儲存！",
            "success_updated": "🔄 資料已成功更新！",
            "success_deleted": "🗑️ 資料已成功刪除！",
            
            # 提示訊息
            "tip_usage": "💡 使用提示：點擊按鈕或輸入指令來操作",
            "tip_support": "📞 需要幫助？請聯繫客服",
            "tip_feedback": "💬 有建議？歡迎提供反饋",
            "tip_update": "🆕 新功能上線！敬請期待"
        }
    
    def _simplified_chinese(self) -> Dict[str, Any]:
        """简体中文语言包"""
        return {
            # 主选单
            "main_menu_title": "🎯 CVV Bot 主选单",
            "all_cards": "💎 全资库",
            "naked_cards": "🎓 裸资库", 
            "special_cards": "🔥 特价库",
            "global_inventory": "🌍 全球卡头库存",
            "search_buy": "🔍 搜索购买",
            "merchant_base": "🏪 代理系统",
            "recharge": "💰 支付系统",
            "balance_check": "💳 帮助",
            "language": "🌐 语言",
            
            # 搜索选单
            "search_menu_title": "🔍 搜索选项",
            "search_by_country": "🌍 按国家查询",
            "search_by_price": "💰 按价格查询",
            "search_by_rate": "🎯 按成功率查询",
            "search_hot": "🔥 热门推荐",
            "search_card_prefix": "🔍 搜索卡头",
            "advanced_search": "💎 高级筛选",
            "back_main_menu": "🔙 返回主选单",
            
            # AI分类
            "ai_classification": "🤖 AI分类系统",
            "ai_classify_single": "📝 单笔分类",
            "ai_classify_batch": "📁 批量分类",
            "ai_view_results": "👀 查看结果",
            "ai_stats": "📊 分类统计",
            
            # 管理员功能
            "admin_set_price": "💰 设定售价",
            "admin_confirm_stock": "✅ 确认入库",
            "admin_batch_import": "📥 批量导入",
            "admin_batch_export": "📤 批量导出",
            
            # 通用按钮
            "confirm": "✅ 确认",
            "cancel": "❌ 取消",
            "back": "🔙 返回",
            "next": "➡️ 下一页",
            "previous": "⬅️ 上一页",
            "refresh": "🔄 刷新",
            "settings": "⚙️ 设置",
            "help": "❓ 帮助",
            
            # 状态消息
            "loading": "⏳ 加载中...",
            "success": "✅ 操作成功！",
            "error": "❌ 操作失败！",
            "processing": "🔄 处理中...",
            "completed": "🎉 完成！",
            
            # 时间问候
            "good_morning": "🌅 早安！",
            "good_afternoon": "🌞 午安！",
            "good_evening": "🌆 晚安！",
            "good_night": "🌙 夜深了！",
            
            # 风趣开场
            "startup_rocket": "🚀 倒数计时开始... 3... 2... 1...\n🔥 点火！CVV Bot 正在升空！\n🌍 突破大气层，进入轨道！\n⭐ 成功对接国际空间站！\n✅ CVV Bot 已成功部署到太空！\n🌌 现在可以从任何地方访问我们的服务了！",
            "startup_circus": "🎪 欢迎来到 CVV Bot 马戏团！\n🎭 让我们开始今天的精彩表演！\n🤹 首先是我们的招牌节目：AI分类杂技！\n🎨 接下来是键盘魔术表演！\n🎪 最后是我们的压轴好戏：CVV交易！\n👏 掌声欢迎 CVV Bot 正式开幕！",
            "startup_dramatic": "🎭 灯光！摄影机！开始！\n🌟 在一个遥远的数字世界里...\n⚡ 一道闪电划过天际！\n🌪️ 风起云涌，数据如潮水般涌来！\n💫 突然，一个声音响起：\n🎪 '欢迎来到 CVV Bot 的传奇世界！'\n👑 在这里，每个交易都是史诗！\n🎬 让我们开始今天的传奇故事！",
            "startup_artist": "🎨 艺术家风格启动中...\n🎭 优雅的代码在舞动\n💫 每个函数都是诗篇\n🌟 每个API都是画作\n🎪 CVV Bot 艺术展正式开幕！\n👑 让我们用创意点亮数字世界！",
            "startup_random": "🎲 命运之轮开始转动...\n🎯 随机选择启动模式\n🌟 今天的主题是：惊喜！\n💫 准备好接受意外的美好吗？\n🎪 CVV Bot 随机模式启动！\n🎭 让我们一起探索未知的可能！",
            
            # 互动开场
            "interactive_startup": "🎮 今天想要什么样的开场体验？\n🎲 掷骰子决定？还是让AI为你选择？\n🎯 或者... 你想要一个惊喜？\n💫 告诉我你的心情，我来为你量身定制！",
            
            # 选择开场
            "choose_startup": "🎯 选择你的开场风格：\n\n1️⃣ 🚀 火箭发射 - 充满能量的科技感\n2️⃣ 🎪 马戏团表演 - 欢乐有趣的娱乐感\n3️⃣ 🎭 戏剧化启动 - 史诗般的英雄感\n4️⃣ 🎨 艺术家风格 - 优雅文艺的气质感\n5️⃣ 🎲 随机惊喜 - 让命运决定一切！\n\n💬 回复数字选择，或说 '随机' 让我为你选择！",
            
            # 统计消息
            "startup_stats": "📊 开场统计：已启动 {count} 次，最后主题：{theme}",
            "bot_status": "🤖 Bot状态：{status}",
            "user_count": "👥 用户数量：{count}",
            "transaction_count": "💳 交易数量：{count}",
            
            # 错误消息
            "error_network": "🌐 网络连接错误，请稍后再试",
            "error_permission": "🚫 权限不足，无法执行此操作",
            "error_invalid_input": "❌ 输入格式错误，请检查后重试",
            "error_service_unavailable": "🔧 服务暂时不可用，请稍后再试",
            
            # 成功消息
            "success_operation": "✅ 操作成功完成！",
            "success_saved": "💾 资料已成功保存！",
            "success_updated": "🔄 资料已成功更新！",
            "success_deleted": "🗑️ 资料已成功删除！",
            
            # 提示消息
            "tip_usage": "💡 使用提示：点击按钮或输入指令来操作",
            "tip_support": "📞 需要帮助？请联系客服",
            "tip_feedback": "💬 有建议？欢迎提供反馈",
            "tip_update": "🆕 新功能上线！敬请期待"
        }
    
    def _english(self) -> Dict[str, Any]:
        """English language pack"""
        return {
            # Main Menu
            "main_menu_title": "🎯 CVV Bot Main Menu",
            "all_cards": "💎 All Cards",
            "naked_cards": "🎓 Naked Cards", 
            "special_cards": "🔥 Special Cards",
            "global_inventory": "🌍 Global Inventory",
            "search_buy": "🔍 Search & Buy",
            "merchant_base": "🏪 Agent System",
            "recharge": "💰 Payment System",
            "balance_check": "💳 Help",
            "language": "🌐 Language",
            
            # Search Menu
            "search_menu_title": "🔍 Search Options",
            "search_by_country": "🌍 Search by Country",
            "search_by_price": "💰 Search by Price",
            "search_by_rate": "🎯 Search by Success Rate",
            "search_hot": "🔥 Hot Recommendations",
            "search_card_prefix": "🔍 Search Card Prefix",
            "advanced_search": "💎 Advanced Search",
            "back_main_menu": "🔙 Back to Main Menu",
            
            # AI Classification
            "ai_classification": "🤖 AI Classification System",
            "ai_classify_single": "📝 Single Classification",
            "ai_classify_batch": "📁 Batch Classification",
            "ai_view_results": "👀 View Results",
            "ai_stats": "📊 Classification Stats",
            
            # Admin Functions
            "admin_set_price": "💰 Set Price",
            "admin_confirm_stock": "✅ Confirm Stock",
            "admin_batch_import": "📥 Batch Import",
            "admin_batch_export": "📤 Batch Export",
            
            # Common Buttons
            "confirm": "✅ Confirm",
            "cancel": "❌ Cancel",
            "back": "🔙 Back",
            "next": "➡️ Next",
            "previous": "⬅️ Previous",
            "refresh": "🔄 Refresh",
            "settings": "⚙️ Settings",
            "help": "❓ Help",
            
            # Status Messages
            "loading": "⏳ Loading...",
            "success": "✅ Operation Successful!",
            "error": "❌ Operation Failed!",
            "processing": "🔄 Processing...",
            "completed": "🎉 Completed!",
            
            # Time Greetings
            "good_morning": "🌅 Good Morning!",
            "good_afternoon": "🌞 Good Afternoon!",
            "good_evening": "🌆 Good Evening!",
            "good_night": "🌙 Late Night!",
            
            # Funny Startup Messages
            "startup_rocket": "🚀 Countdown begins... 3... 2... 1...\n🔥 Ignition! CVV Bot is launching!\n🌍 Breaking through atmosphere, entering orbit!\n⭐ Successfully docking with ISS!\n✅ CVV Bot has been deployed to space!\n🌌 Now accessible from anywhere in the universe!",
            "startup_circus": "🎪 Welcome to CVV Bot Circus!\n🎭 Let's begin today's amazing performance!\n🤹 First, our signature act: AI Classification Acrobatics!\n🎨 Next, Keyboard Magic Show!\n🎪 Finally, our grand finale: CVV Trading!\n👏 Let's give a round of applause for CVV Bot Grand Opening!",
            "startup_dramatic": "🎭 Lights! Camera! Action!\n🌟 In a distant digital world...\n⚡ A lightning bolt strikes across the sky!\n🌪️ Winds rise, clouds gather, data flows like tidal waves!\n💫 Suddenly, a voice echoes:\n🎪 'Welcome to CVV Bot's Legendary World!'\n👑 Here, every transaction is an epic!\n🎬 Let's begin today's legendary story!",
            "startup_artist": "🎨 Artist Style Starting Up...\n🎭 Elegant code is dancing\n💫 Every function is a poem\n🌟 Every API is a masterpiece\n🎪 CVV Bot Art Exhibition is officially open!\n👑 Let's illuminate the digital world with creativity!",
            "startup_random": "🎲 Wheel of Fortune starts spinning...\n🎯 Random startup mode selection\n🌟 Today's theme is: Surprise!\n💫 Ready to accept unexpected beauty?\n🎪 CVV Bot Random Mode activated!\n🎭 Let's explore unknown possibilities together!",
            
            # Interactive Startup
            "interactive_startup": "🎮 What kind of startup experience do you want today?\n🎲 Roll the dice to decide? Or let AI choose for you?\n🎯 Or... do you want a surprise?\n💫 Tell me your mood, I'll customize it for you!",
            
            # Choose Startup
            "choose_startup": "🎯 Choose your startup style:\n\n1️⃣ 🚀 Rocket Launch - Energetic tech vibe\n2️⃣ 🎪 Circus Show - Fun and entertaining\n3️⃣ 🎭 Dramatic Startup - Epic hero feeling\n4️⃣ 🎨 Artist Style - Elegant and artistic\n5️⃣ 🎲 Random Surprise - Let fate decide!\n\n💬 Reply with number choice, or say 'random' for me to choose!",
            
            # Statistics Messages
            "startup_stats": "📊 Startup Stats: Launched {count} times, Last theme: {theme}",
            "bot_status": "🤖 Bot Status: {status}",
            "user_count": "👥 User Count: {count}",
            "transaction_count": "💳 Transaction Count: {count}",
            
            # Error Messages
            "error_network": "🌐 Network connection error, please try again later",
            "error_permission": "🚫 Insufficient permissions, cannot execute this operation",
            "error_invalid_input": "❌ Invalid input format, please check and try again",
            "error_service_unavailable": "🔧 Service temporarily unavailable, please try again later",
            
            # Success Messages
            "success_operation": "✅ Operation completed successfully!",
            "success_saved": "💾 Data saved successfully!",
            "success_updated": "🔄 Data updated successfully!",
            "success_deleted": "🗑️ Data deleted successfully!",
            
            # Tip Messages
            "tip_usage": "💡 Usage Tip: Click buttons or enter commands to operate",
            "tip_support": "📞 Need help? Please contact customer service",
            "tip_feedback": "💬 Have suggestions? Welcome to provide feedback",
            "tip_update": "🆕 New features online! Stay tuned"
        }
    
    def get_available_languages(self) -> Dict[str, str]:
        """獲取可用的語言列表"""
        return {
            "zh-tw": "繁體中文",
            "zh-cn": "简体中文",
            "en": "English"
        }
    
    def get_current_language(self) -> str:
        """獲取當前語言"""
        return self.current_language
    
    def switch_language(self, language: str) -> bool:
        """切換語言"""
        if language in self.language_packs:
            self.current_language = language
            return True
        return False

# 使用範例
if __name__ == "__main__":
    # 創建語言包管理器
    lang_pack = LanguagePack("zh-tw")
    
    # 測試繁體中文
    print("繁體中文測試:")
    print(lang_pack.get_text("main_menu_title"))
    print(lang_pack.get_text("startup_rocket"))
    print()
    
    # 切換到簡體中文
    lang_pack.set_language("zh-cn")
    print("简体中文测试:")
    print(lang_pack.get_text("main_menu_title"))
    print(lang_pack.get_text("startup_rocket"))
    print()
    
    # 切換到英文
    lang_pack.set_language("en")
    print("English Test:")
    print(lang_pack.get_text("main_menu_title"))
    print(lang_pack.get_text("startup_rocket"))
    print()
    
    # 顯示可用語言
    print("可用語言:")
    for code, name in lang_pack.get_available_languages().items():
        print(f"{code}: {name}")
