#!/usr/bin/env python3
"""
🤖 CVVMAX - 終極 CVV Bot 系統
集成兩個 Bot 的所有優點：多語言、風趣開場、專業鍵盤、自建服務架構
"""
import asyncio
import logging
import os
import random
import json
from datetime import datetime
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup

# 設置日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('cvvmax.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

# 獲取 Bot Token
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

if not TELEGRAM_BOT_TOKEN:
    logger.error("❌ TELEGRAM_BOT_TOKEN 環境變量未設置！")
    exit(1)

class CVVMAXLanguagePack:
    """CVVMAX 多語言包系統"""
    
    def __init__(self, default_language: str = "zh-tw"):
        self.current_language = default_language
        self.language_packs = self._load_language_packs()
    
    def _load_language_packs(self):
        """載入所有語言包"""
        return {
            "zh-tw": {
                # 主選單
                "main_menu_title": "🎯 CVVMAX 主選單",
                "all_cards": "💎 全資庫",
                "naked_cards": "🎓 裸資庫", 
                "special_cards": "🔥 特價庫",
                "global_inventory": "🌍 全球卡頭庫存",
                "search_buy": "🔍 搜尋購買",
                "merchant_base": "🏪 代理系統",
                "recharge": "💰 支付系統",
                "balance_check": "💳 幫助",
                "language": "🌐 語言",
                "ai_system": "🤖 AI 分類系統",
                "admin_panel": "👑 管理員面板",
                
                # 搜尋選單
                "search_menu_title": "🔍 搜尋選項",
                "search_by_country": "🌍 按國家查詢",
                "search_by_price": "💰 按價格查詢",
                "search_by_rate": "🎯 按成功率查詢",
                "search_hot": "🔥 熱門推薦",
                "search_card_prefix": "🔍 搜尋卡頭",
                "advanced_search": "💎 高級篩選",
                "back_main_menu": "🔙 返回主選單",
                
                # AI 分類
                "ai_classification": "🤖 AI 分類系統",
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
                "back": "🔙 返回",
                "confirm": "✅ 確認",
                "cancel": "❌ 取消",
                "refresh": "🔄 刷新",
                "settings": "⚙️ 設置",
                
                # 問候語
                "good_morning": "🌅 早安！",
                "good_afternoon": "☀️ 午安！",
                "good_evening": "🌆 晚安！",
                "good_night": "🌙 晚安！",
                "welcome_message": "🎉 歡迎使用 CVVMAX！",
                "choose_language": "🌐 請選擇您的語言：",
                
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
            },
            "zh-cn": {
                # 主选单
                "main_menu_title": "🎯 CVVMAX 主选单",
                "all_cards": "💎 全资库",
                "naked_cards": "🎓 裸资库", 
                "special_cards": "🔥 特价库",
                "global_inventory": "🌍 全球卡头库存",
                "search_buy": "🔍 搜索购买",
                "merchant_base": "🏪 代理系统",
                "recharge": "💰 支付系统",
                "balance_check": "💳 帮助",
                "language": "🌐 语言",
                "ai_system": "🤖 AI 分类系统",
                "admin_panel": "👑 管理员面板",
                
                # 搜索选单
                "search_menu_title": "🔍 搜索选项",
                "search_by_country": "🌍 按国家查询",
                "search_by_price": "💰 按价格查询",
                "search_by_rate": "🎯 按成功率查询",
                "search_hot": "🔥 热门推荐",
                "search_card_prefix": "🔍 搜索卡头",
                "advanced_search": "💎 高级筛选",
                "back_main_menu": "🔙 返回主选单",
                
                # AI 分类
                "ai_classification": "🤖 AI 分类系统",
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
                "back": "🔙 返回",
                "confirm": "✅ 确认",
                "cancel": "❌ 取消",
                "refresh": "🔄 刷新",
                "settings": "⚙️ 设置",
                
                # 问候语
                "good_morning": "🌅 早安！",
                "good_afternoon": "☀️ 午安！",
                "good_evening": "🌆 晚安！",
                "good_night": "🌙 晚安！",
                "welcome_message": "🎉 欢迎使用 CVVMAX！",
                "choose_language": "🌐 请选择您的语言：",
                
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
            },
            "en": {
                # Main Menu
                "main_menu_title": "🎯 CVVMAX Main Menu",
                "all_cards": "💎 All Cards",
                "naked_cards": "🎓 Naked Cards", 
                "special_cards": "🔥 Special Cards",
                "global_inventory": "🌍 Global BIN Inventory",
                "search_buy": "🔍 Search & Buy",
                "merchant_base": "🏪 Merchant Base",
                "recharge": "💰 Payment System",
                "balance_check": "💳 Help",
                "language": "🌐 Language",
                "ai_system": "🤖 AI Classification",
                "admin_panel": "👑 Admin Panel",
                
                # Search Menu
                "search_menu_title": "🔍 Search Options",
                "search_by_country": "🌍 Search by Country",
                "search_by_price": "�� Search by Price",
                "search_by_rate": "🎯 Search by Success Rate",
                "search_hot": "🔥 Hot Recommendations",
                "search_card_prefix": "�� Search Card Prefix",
                "advanced_search": "�� Advanced Filter",
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
                "back": "🔙 Back",
                "confirm": "✅ Confirm",
                "cancel": "❌ Cancel",
                "refresh": "🔄 Refresh",
                "settings": "⚙️ Settings",
                
                # Greetings
                "good_morning": "🌅 Good Morning!",
                "good_afternoon": "☀️ Good Afternoon!",
                "good_evening": "🌆 Good Evening!",
                "good_night": "🌙 Good Night!",
                "welcome_message": "�� Welcome to CVVMAX!",
                "choose_language": "�� Please choose your language:",
                
                # Success Messages
                "success_operation": "✅ Operation completed successfully!",
                "success_saved": "💾 Data saved successfully!",
                "success_updated": "🔄 Data updated successfully!",
                "success_deleted": "🗑️ Data deleted successfully!",
                
                # Tips
                "tip_usage": "💡 Usage tip: Click buttons or input commands to operate",
                "tip_support": "📞 Need help? Please contact customer service",
                "tip_feedback": "💬 Have suggestions? Welcome to provide feedback",
                "tip_update": "🆕 New features online! Stay tuned"
            }
        }
    
    def set_language(self, language: str):
        """設定當前語言"""
        if language in self.language_packs:
            self.current_language = language
    
    def get_text(self, key: str) -> str:
        """獲取指定語言的文字"""
        return self.language_packs[self.current_language].get(key, f"[{key}]")

class CVVMAXFunnyStartup:
    """CVVMAX 風趣開場系統"""
    
    def __init__(self, language: str = "zh-tw"):
        self.language_pack = CVVMAXLanguagePack(language)
        self.startup_count = 0
        self.last_theme = None
        self.startup_themes = {
            "startup_rocket": {
                "zh-tw": "🚀 火箭發射模式啟動！",
                "zh-cn": "🚀 火箭发射模式启动！",
                "en": "�� Rocket Launch Mode Activated!"
            },
            "startup_circus": {
                "zh-tw": "🎪 馬戲團表演開始！",
                "zh-cn": "🎪 马戏团表演开始！",
                "en": "�� Circus Show Begins!"
            },
            "startup_dramatic": {
                "zh-tw": "🎭 戲劇化啟動模式！",
                "zh-cn": "🎭 戏剧化启动模式！",
                "en": "🎭 Dramatic Startup Mode!"
            },
            "startup_artist": {
                "zh-tw": "🎨 藝術家風格啟動！",
                "zh-cn": "🎨 艺术家风格启动！",
                "en": "🎨 Artist Style Startup!"
            },
            "startup_random": {
                "zh-tw": "🎲 隨機驚喜模式！",
                "zh-cn": "🎲 随机惊喜模式！",
                "en": "🎲 Random Surprise Mode!"
            }
        }
    
    def get_time_based_greeting(self) -> str:
        """獲取基於時間的問候語"""
        hour = datetime.now().hour
        if 5 <= hour < 12:
            return self.language_pack.get_text("good_morning")
        elif 12 <= hour < 18:
            return self.language_pack.get_text("good_afternoon")
        elif 18 <= hour < 22:
            return self.language_pack.get_text("good_evening")
        else:
            return self.language_pack.get_text("good_night")
    
    def get_random_startup_message(self) -> str:
        """獲取隨機風趣開場訊息"""
        theme_key = random.choice(list(self.startup_themes.keys()))
        self.last_theme = theme_key
        self.startup_count += 1
        
        current_lang = self.language_pack.current_language
        theme_text = self.startup_themes[theme_key][current_lang]
        
        return f"{theme_text}\n🎯 這是第 {self.startup_count} 次啟動！"

class CVVMAXKeyboards:
    """CVVMAX 專業鍵盤系統"""
    
    def __init__(self, language_pack: CVVMAXLanguagePack):
        self.language_pack = language_pack
    
    def create_main_menu(self) -> InlineKeyboardMarkup:
        """創建主選單 3x3 內嵌鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton(self.language_pack.get_text("all_cards"), callback_data="main_all_cards"),
                InlineKeyboardButton(self.language_pack.get_text("naked_cards"), callback_data="main_naked_cards"),
                InlineKeyboardButton(self.language_pack.get_text("special_cards"), callback_data="main_special_cards")
            ],
            [
                InlineKeyboardButton(self.language_pack.get_text("global_inventory"), callback_data="main_global_bin"),
                InlineKeyboardButton(self.language_pack.get_text("search_buy"), callback_data="main_bin_search"),
                InlineKeyboardButton(self.language_pack.get_text("merchant_base"), callback_data="main_merchant_base")
            ],
            [
                InlineKeyboardButton(self.language_pack.get_text("recharge"), callback_data="main_recharge"),
                InlineKeyboardButton(self.language_pack.get_text("ai_system"), callback_data="main_ai_system"),
                InlineKeyboardButton(self.language_pack.get_text("language"), callback_data="main_language")
            ]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    def create_search_menu(self) -> InlineKeyboardMarkup:
        """創建搜尋選單鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton(self.language_pack.get_text("search_by_country"), callback_data="search_country"),
                InlineKeyboardButton(self.language_pack.get_text("search_by_price"), callback_data="search_price")
            ],
            [
                InlineKeyboardButton(self.language_pack.get_text("search_by_rate"), callback_data="search_rate"),
                InlineKeyboardButton(self.language_pack.get_text("search_hot"), callback_data="search_hot")
            ],
            [
                InlineKeyboardButton(self.language_pack.get_text("search_card_prefix"), callback_data="search_prefix"),
                InlineKeyboardButton(self.language_pack.get_text("advanced_search"), callback_data="search_advanced")
            ],
            [
                InlineKeyboardButton(self.language_pack.get_text("back_main_menu"), callback_data="back_main")
            ]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    def create_ai_menu(self) -> InlineKeyboardMarkup:
        """創建 AI 分類選單鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton(self.language_pack.get_text("ai_classify_single"), callback_data="ai_single"),
                InlineKeyboardButton(self.language_pack.get_text("ai_classify_batch"), callback_data="ai_batch")
            ],
            [
                InlineKeyboardButton(self.language_pack.get_text("ai_view_results"), callback_data="ai_results"),
                InlineKeyboardButton(self.language_pack.get_text("ai_stats"), callback_data="ai_stats")
            ],
            [
                InlineKeyboardButton(self.language_pack.get_text("back_main_menu"), callback_data="back_main")
            ]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    def create_language_menu(self) -> InlineKeyboardMarkup:
        """創建語言選擇鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("🇹🇼 繁體中文", callback_data="lang_zh_tw"),
                InlineKeyboardButton("🇨🇳 简体中文", callback_data="lang_zh_cn")
            ],
            [
                InlineKeyboardButton("🇺�� English", callback_data="lang_en")
            ],
            [
                InlineKeyboardButton(self.language_pack.get_text("back_main_menu"), callback_data="back_main")
            ]
        ]
        return InlineKeyboardMarkup(keyboard)

class CVVMAXBot:
    """CVVMAX 終極 Bot 系統"""
    
    def __init__(self):
        self.language_pack = CVVMAXLanguagePack("zh-tw")
        self.funny_startup = CVVMAXFunnyStartup("zh-tw")
        self.keyboards = CVVMAXKeyboards(self.language_pack)
        self.user_languages = {}  # 存儲用戶語言偏好
        self.user_sessions = {}   # 存儲用戶會話狀態
    
    def get_user_language(self, user_id: int) -> str:
        """獲取用戶語言偏好"""
        return self.user_languages.get(user_id, "zh-tw")
    
    def set_user_language(self, user_id: int, language: str):
        """設定用戶語言偏好"""
        self.user_languages[user_id] = language
        self.language_pack.set_language(language)
        self.funny_startup.language_pack.set_language(language)
        self.keyboards.language_pack.set_language(language)
    
    def get_user_session(self, user_id: int) -> dict:
        """獲取用戶會話狀態"""
        if user_id not in self.user_sessions:
            self.user_sessions[user_id] = {"current_menu": "main", "data": {}}
        return self.user_sessions[user_id]
    
    async def start_command(self, update: Update, context):
        """處理 /start 命令"""
        user = update.effective_user
        user_id = user.id
        
        # 獲取用戶語言偏好
        lang = self.get_user_language(user_id)
        self.set_user_language(user_id, lang)
        
        # 風趣開場
        greeting = self.funny_startup.get_time_based_greeting()
        startup_msg = self.funny_startup.get_random_startup_message()
        
        welcome_text = f"""{greeting}

{self.language_pack.get_text("welcome_message")}

👋 歡迎【{user.first_name}】
🆔 機器人 ID：【{user_id}】
🆔 用戶名：@{user.username or '無'}

{startup_msg}

�� CVVMAX 是終極 CVV Bot 系統，集成了所有最先進的功能！

請選擇您需要的功能："""

        keyboard = self.keyboards.create_main_menu()
        await update.message.reply_text(welcome_text, reply_markup=keyboard, parse_mode='HTML')
        
        # 更新用戶會話
        session = self.get_user_session(user_id)
        session["current_menu"] = "main"
    
    async def handle_callback(self, update: Update, context):
        """處理回調查詢"""
        query = update.callback_query
        user_id = query.from_user.id
        data = query.data
        
        await query.answer()
        
        # 獲取用戶語言
        lang = self.get_user_language(user_id)
        self.set_user_language(user_id, lang)
        
        if data == "main_language":
            # 語言切換選單
            keyboard = self.keyboards.create_language_menu()
            await query.edit_message_text(
                text=self.language_pack.get_text("choose_language"),
                reply_markup=keyboard
            )
            self.get_user_session(user_id)["current_menu"] = "language"
        
        elif data.startswith("lang_"):
            # 語言切換
            lang_map = {"lang_zh_tw": "zh-tw", "lang_zh_cn": "zh-cn", "lang_en": "en"}
            new_lang = lang_map.get(data, "zh-tw")
            self.set_user_language(user_id, new_lang)
            
            # 重新顯示主選單
            keyboard = self.keyboards.create_main_menu()
            await query.edit_message_text(
                text=f"✅ 語言已切換為 {new_lang.upper()}\n\n{self.language_pack.get_text('welcome_message')}",
                reply_markup=keyboard
            )
            self.get_user_session(user_id)["current_menu"] = "main"
        
        elif data == "main_ai_system":
            # AI 分類系統
            keyboard = self.keyboards.create_ai_menu()
            await query.edit_message_text(
                text=f"🤖 {self.language_pack.get_text('ai_classification')}\n\n請選擇 AI 功能：",
                reply_markup=keyboard
            )
            self.get_user_session(user_id)["current_menu"] = "ai"
        
        elif data == "main_bin_search":
            # 搜尋選單
            keyboard = self.keyboards.create_search_menu()
            await query.edit_message_text(
                text=f"🔍 {self.language_pack.get_text('search_menu_title')}\n\n請選擇搜尋方式：",
                reply_markup=keyboard
            )
            self.get_user_session(user_id)["current_menu"] = "search"
        
        elif data == "back_main":
            # 返回主選單
            keyboard = self.keyboards.create_main_menu()
            await query.edit_message_text(
                text=self.language_pack.get_text("welcome_message"),
                reply_markup=keyboard
            )
            self.get_user_session(user_id)["current_menu"] = "main"
        
        else:
            # 其他功能按鈕
            response_text = f"�� 您選擇了：{data}\n\n�� 功能開發中，敬請期待！\n\n💡 這是 CVVMAX 的預覽版本"
            keyboard = self.keyboards.create_main_menu()
            await query.edit_message_text(
                text=response_text,
                reply_markup=keyboard
            )
            self.get_user_session(user_id)["current_menu"] = "main"
    
    async def echo(self, update: Update, context):
        """處理文字消息"""
        user = update.effective_user
        user_id = user.id
        
        # 自動語言檢測
        if user_id not in self.user_languages:
            # 根據用戶名檢測語言
            if any(char in user.first_name for char in '你好謝謝'):
                self.set_user_language(user_id, "zh-tw")
            else:
                self.set_user_language(user_id, "en")
        
        lang = self.get_user_language(user_id)
        self.language_pack.set_language(lang)
        
        response = f"💬 您說了：{update.message.text}\n\n�� 當前語言：{lang.upper()}\n🎯 CVVMAX 正在處理您的請求..."
        await update.message.reply_text(response)

async def main():
    """主函數"""
    logger.info("=" * 60)
    logger.info("🚀 CVVMAX - 終極 CVV Bot 系統啟動")
    logger.info("=" * 60)
    logger.info("�� 集成功能：")
    logger.info("   • 多語言系統 (繁中/簡中/英文)")
    logger.info("   • 風趣開場功能 (5種主題)")
    logger.info("   • 專業鍵盤系統 (3x3 原生布局)")
    logger.info("   • AI 分類系統")
    logger.info("   • 自建服務架構")
    logger.info("=" * 60)
    
    # 創建 Bot 實例
    bot = CVVMAXBot()
    
    # 創建應用
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    
    # 註冊處理器
    application.add_handler(CommandHandler("start", bot.start_command))
    application.add_handler(CallbackQueryHandler(bot.handle_callback))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, bot.echo))
    
    logger.info("✅ Bot 處理器已註冊")
    logger.info("🚀 開始 Bot 輪詢...")
    
    await application.run_polling()

if __name__ == "__main__":
    try:
        # 修復事件循環問題，保持所有功能完整
        import nest_asyncio
        nest_asyncio.apply()
        
        # 創建新的事件循環
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # 運行主程序
        loop.run_until_complete(main())
        
    except KeyboardInterrupt:
        logger.info("👋 CVVMAX 已停止")
        if 'loop' in locals() and loop.is_running():
            loop.stop()
    except Exception as e:
        logger.error(f"CVVMAX 啟動失敗: {e}")
        if 'loop' in locals() and not loop.is_closed():
            loop.close()
        exit(1)
    finally:
        if 'loop' in locals() and not loop.is_closed():
            loop.close()
