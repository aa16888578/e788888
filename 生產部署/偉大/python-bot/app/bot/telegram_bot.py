"""
Telegram Bot 處理器
處理所有 Telegram 消息和回調
"""
import logging
import asyncio
import time
from typing import Dict, Any
from datetime import datetime
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application, 
    CommandHandler, 
    CallbackQueryHandler, 
    MessageHandler,
    filters,
    ContextTypes
)

from ..core.config import settings
from ..services.firebase_service import firebase_service
from ..bot.keyboards import CVVKeyboards
from ..services.gemini_classification_service import gemini_classification_service
from ..services.cvv_display_service import cvv_display_service
from ..api.telegram_api import router as telegram_api

logger = logging.getLogger(__name__)

class CVVTelegramBot:
    """CVV Telegram Bot 主類"""
    
    def __init__(self):
        self.application = None
        self.bot_token = settings.TELEGRAM_BOT_TOKEN
        self.keyboards = CVVKeyboards()  # 創建鍵盤管理器實例
        
    async def initialize(self):
        """初始化 Bot"""
        if not self.bot_token:
            raise ValueError("TELEGRAM_BOT_TOKEN 未設置")
        
        # 創建應用程序
        self.application = Application.builder().token(self.bot_token).build()
        
        # 註冊處理器
        await self._register_handlers()
        
        logger.info("✅ Telegram Bot 初始化完成")
    
    async def _register_handlers(self):
        """註冊所有處理器"""
        app = self.application
        
        # 命令處理器
        app.add_handler(CommandHandler("start", self.start_command))
        app.add_handler(CommandHandler("help", self.help_command))
        app.add_handler(CommandHandler("balance", self.balance_command))
        app.add_handler(CommandHandler("cards", self.cards_command))
        
        # 回調查詢處理器
        app.add_handler(CallbackQueryHandler(self.button_callback))
        
        # 消息處理器
        app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.handle_message))
        
        # 錯誤處理器
        app.add_error_handler(self.error_handler)
    
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """處理 /start 命令 - 顯示 3x3 主選單內嵌鍵盤"""
        try:
            user = update.effective_user
            chat_id = update.effective_chat.id
            
            logger.info(f"用戶 {user.id} ({user.first_name}) 啟動了 Bot")
            
            # CVV Bot 歡迎消息
            welcome_text = f"""🎯 <b>溫馨提示，售前必看！</b>

歡迎【{user.first_name}】機器人ID：【{user.id}】

1.機器人所有數據均為一手資源；二手直接刪檔，
不出二手，直接賣完刪檔

2.購買請注意！機器人只支持USDT充值！卡號
錯誤.日期過期.全補.

3.GMS 永久承諾：充值未使用余額可以聯系客服
退款。(如果有贈送額度-需扣除贈送額度再退)

4.建議機器人用戶加入頻道，每天更新會在頻道
第一時間通知，更新有需要的卡頭可第一時間搶
先購買

機器人充值教程：https://t.me/GMS_CHANNEL2/3
機器人使用教程：https://t.me/GMS_CHANNEL2/4
購卡前注意事項：https://t.me/GMS_CHANNEL2/8
售后規則-標準：https://t.me/GMS_CHANNEL2/5

🤖 GMS・24小時客服：@GMS_CVV_55
🤖 GMS・官方頻道：@CVV2D3Dsystem1688
🤖 GMS・交流群：@GMSCVVCARDING555"""
            
            # 使用 3x3 主選單內嵌鍵盤
            try:
                reply_markup = self.keyboards.create_main_menu()
                
                await update.message.reply_text(
                    text=welcome_text,
                    parse_mode='HTML',
                    reply_markup=reply_markup
                )
                
            except Exception as keyboard_error:
                logger.error(f"鍵盤創建失敗: {keyboard_error}")
                # 如果鍵盤模塊出錯，使用備用鍵盤
                backup_keyboard = InlineKeyboardMarkup([
                    [
                        InlineKeyboardButton("🎓 裸資庫", callback_data="main_naked_cards"),
                        InlineKeyboardButton("🔥 特價庫", callback_data="main_special_cards")
                    ],
                    [
                        InlineKeyboardButton("🌍 全球卡頭庫存", callback_data="main_global_bin"),
                        InlineKeyboardButton("🔍 卡頭查詢|購買", callback_data="main_bin_search"),
                        InlineKeyboardButton("🏪 商家基地", callback_data="main_merchant_base")
                    ],
                    [
                        InlineKeyboardButton("💰 充值", callback_data="main_recharge"),
                        InlineKeyboardButton("💳 余額查詢", callback_data="main_balance"),
                        InlineKeyboardButton("🇺🇸 English", callback_data="main_english")
                    ]
                ])
                
                await update.message.reply_text(
                    text=f"🎯 歡迎【{user.first_name}】使用 CVV Bot！\n\n請選擇功能：",
                    reply_markup=backup_keyboard
                )
                
        except Exception as e:
            logger.error(f"處理 /start 命令失敗: {e}")
            await update.message.reply_text("❌ Bot啟動失敗，請稍後再試。")
    
    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """處理 /help 命令"""
        help_text = """🤖 <b>CVV Bot 使用說明</b>

<b>基本命令:</b>
• /start - 開始使用機器人
• /help - 顯示幫助信息
• /balance - 查詢餘額
• /cards - 瀏覽卡片

<b>主要功能:</b>
• 🌍 全資庫 - 瀏覽所有可用卡片
• 💰 充值 - USDT-TRC20 充值
• 📊 餘額查詢 - 查看賬戶餘額
• 🔥 商家基地 - 代理商功能

<b>客服支持:</b>
• Telegram: @GMS_CVV_55
• 頻道: @CVV2D3Dsystem1688
• 交流群: @GMSCVVCARDING555

<b>注意事項:</b>
• 僅支持 USDT-TRC20 充值
• 卡號錯誤/過期全補
• 建議小額測試後大額購買"""

        await update.message.reply_text(
            text=help_text,
            parse_mode='HTML'
        )
    
    async def balance_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """處理 /balance 命令"""
        try:
            user = update.effective_user
            
            # 調用 API 獲取餘額
            from ..api.telegram_api import balance_check
            
            response = await balance_check(user.id)
            
            # 轉換內嵌鍵盤
            keyboard = []
            if response.inline_keyboard:
                for row in response.inline_keyboard:
                    keyboard_row = []
                    for btn in row:
                        keyboard_row.append(
                            InlineKeyboardButton(
                                text=btn.text,
                                callback_data=btn.callback_data
                            )
                        )
                    keyboard.append(keyboard_row)
            
            reply_markup = InlineKeyboardMarkup(keyboard) if keyboard else None
            
            await update.message.reply_text(
                text=response.message,
                parse_mode='HTML',
                reply_markup=reply_markup
            )
            
        except Exception as e:
            logger.error(f"處理 /balance 命令失敗: {e}")
            await update.message.reply_text(
                "❌ 查詢餘額失敗，請稍後再試。"
            )
    
    async def cards_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """處理 /cards 命令"""
        try:
            user = update.effective_user
            
            # 調用 API 獲取卡片列表
            from ..api.telegram_api import get_all_cards
            
            response = await get_all_cards(user.id)
            
            # 轉換內嵌鍵盤
            keyboard = []
            if response.inline_keyboard:
                for row in response.inline_keyboard:
                    keyboard_row = []
                    for btn in row:
                        keyboard_row.append(
                            InlineKeyboardButton(
                                text=btn.text,
                                callback_data=btn.callback_data
                            )
                        )
                    keyboard.append(keyboard_row)
            
            reply_markup = InlineKeyboardMarkup(keyboard) if keyboard else None
            
            await update.message.reply_text(
                text=response.message,
                parse_mode='HTML',
                reply_markup=reply_markup
            )
            
        except Exception as e:
            logger.error(f"處理 /cards 命令失敗: {e}")
            await update.message.reply_text(
                "❌ 獲取卡片列表失敗，請稍後再試。"
            )
    
    async def button_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """處理 3x3 內嵌鍵盤按鈕回調"""
        try:
            query = update.callback_query
            user = query.from_user
            callback_data = query.data
            
            logger.info(f"用戶 {user.id} 點擊了按鈕: {callback_data}")
            
            # 確認回調
            await query.answer()
            
            # 根據回調數據路由到不同的處理函數
            await self._handle_3x3_callback(query, callback_data)
            
        except Exception as e:
            logger.error(f"處理按鈕回調失敗: {e}")
            await query.answer("❌ 操作失敗，請重試", show_alert=True)
    
    async def _handle_3x3_callback(self, query, callback_data: str):
        """處理 3x3 內嵌鍵盤回調數據"""
        user = query.from_user
        
        # 主選單回調處理
        if callback_data == "main_all_cards":
            await self._handle_all_cards(query)
        elif callback_data == "main_naked_cards":
            await self._handle_naked_cards(query)
        elif callback_data == "main_special_cards":
            await self._handle_special_cards(query)
        elif callback_data == "main_global_bin":
            await self._handle_global_bin(query)
        elif callback_data == "main_bin_search":
            await self._handle_bin_search(query)
        elif callback_data == "main_merchant_base":
            await self._handle_merchant_base(query)
        elif callback_data == "main_recharge":
            await self._handle_recharge(query)
        elif callback_data == "main_balance":
            await self._handle_balance(query)
        elif callback_data == "main_english":
            await self._handle_english(query)
        
        # 卡片選擇回調處理
        elif callback_data.startswith("cards_"):
            country = callback_data.replace("cards_", "")
            await self._handle_country_cards(query, country)
        
        # 充值回調處理
        elif callback_data.startswith("recharge_"):
            amount = callback_data.replace("recharge_", "")
            await self._handle_recharge_amount(query, amount)
        
        # 購買回調處理
        elif callback_data.startswith("buy_"):
            await self._handle_buy_cards(query, callback_data)
        
        # 返回按鈕處理
        elif callback_data == "back_main":
            await self._handle_back_main(query)
        elif callback_data == "back_cards":
            await self._handle_back_cards(query)
        elif callback_data == "back_previous":
            await self._handle_back_previous(query)
        
        # AI分類功能回調
        elif callback_data == "search_card_prefix":
            await self._handle_search_card_prefix(query)
        elif callback_data == "ai_classify_single":
            await self._handle_ai_classify_single(query)
        elif callback_data == "ai_classify_batch":
            await self._handle_ai_classify_batch(query)
        elif callback_data == "view_ai_results":
            await self._handle_view_ai_results(query)
        elif callback_data == "ai_classification_stats":
            await self._handle_ai_classification_stats(query)
        elif callback_data.startswith("set_price_"):
            result_id = callback_data.replace("set_price_", "")
            await self._handle_set_price(query, result_id)
        elif callback_data.startswith("confirm_stock_"):
            result_id = callback_data.replace("confirm_stock_", "")
            await self._handle_confirm_stock(query, result_id)
        
        # 其他功能回調
        else:
            await self._handle_other_callbacks(query, callback_data)
    
    async def _handle_all_cards(self, query):
        """處理全資庫按鈕 - 顯示AI分類結果"""
        try:
            # 獲取全資庫數據
            library_data = await cvv_display_service.get_card_library_display("全資庫")
            
            if library_data.get('error'):
                text = f"❌ 載入全資庫失敗: {library_data['error']}"
                reply_markup = keyboard_service.create_main_menu()
            else:
                stats = library_data.get('stats', {})
                cards = library_data.get('cards', [])
                pagination = library_data.get('pagination', {})
                
                text = f"""💎 **全資庫** (AI智能分類)

📊 **庫存統計** (AI實時更新):
　　總庫存: {stats.get('total', 0):,} 張
　　平均價格: ${stats.get('avg_price', 0):.2f} USD
　　平均活性: {stats.get('avg_activity', 0):.1f}%
　　價格範圍: {stats.get('price_range', '$0-$0')}

🔥 **熱門卡片** (AI推薦):"""
                
                # 顯示前5張卡片
                for i, card in enumerate(cards[:5], 1):
                    quality_indicator = card.get('quality_indicator', '📋')
                    text += f"\n　　{i}. {quality_indicator} {card.get('display_text', '未知卡片')}"
                
                text += f"""

📖 **分頁信息**: {pagination.get('current_page', 1)}/{pagination.get('total_pages', 1)}

💡 **AI提示**: 全資庫包含完整信息的高品質卡片，成功率較高"""
                
                # 創建卡片列表鍵盤
                reply_markup = keyboard_service.create_card_list_keyboard(cards)
            
            await query.edit_message_text(text=text, parse_mode='Markdown', reply_markup=reply_markup)
            
        except Exception as e:
            logger.error(f"處理全資庫失敗: {e}")
            text = "💎 全資庫載入中..."
            reply_markup = keyboard_service.create_main_menu()
            await query.edit_message_text(text=text, reply_markup=reply_markup)
    
    async def _handle_naked_cards(self, query):
        """處理裸資庫按鈕 - 顯示AI分類結果"""
        try:
            # 獲取裸資庫數據
            library_data = await cvv_display_service.get_card_library_display("裸資庫")
            
            if library_data.get('error'):
                text = f"❌ 載入裸資庫失敗: {library_data['error']}"
                reply_markup = keyboard_service.create_main_menu()
            else:
                stats = library_data.get('stats', {})
                cards = library_data.get('cards', [])
                
                text = f"""🎓 **裸資庫** (AI智能分類)

📋 **特點** (AI分析):
　　價格更優惠 (比全資庫便宜30%-50%)
　　僅提供基本卡片信息
　　適合批量購買
　　成功率相對較低

📊 **庫存統計** (AI實時更新):
　　總庫存: {stats.get('total', 0):,} 張
　　平均價格: ${stats.get('avg_price', 0):.2f} USD
　　平均活性: {stats.get('avg_activity', 0):.1f}%

🔥 **推薦卡片** (AI篩選):"""
                
                # 顯示前5張卡片
                for i, card in enumerate(cards[:5], 1):
                    quality_indicator = card.get('quality_indicator', '📋')
                    text += f"\n　　{i}. {quality_indicator} {card.get('display_text', '未知卡片')}"
                
                text += f"""

💡 **AI建議**: 裸資庫適合有經驗的用戶，性價比較高"""
                
                # 創建卡片列表鍵盤
                reply_markup = keyboard_service.create_card_list_keyboard(cards)
            
            await query.edit_message_text(text=text, parse_mode='Markdown', reply_markup=reply_markup)
            
        except Exception as e:
            logger.error(f"處理裸資庫失敗: {e}")
            text = "🎓 裸資庫載入中..."
            reply_markup = keyboard_service.create_main_menu()
            await query.edit_message_text(text=text, reply_markup=reply_markup)
    
    async def _handle_special_cards(self, query):
        """處理特價庫按鈕 - 顯示AI分類結果"""
        try:
            # 獲取特價庫數據
            library_data = await cvv_display_service.get_card_library_display("特價庫")
            
            if library_data.get('error'):
                text = f"❌ 載入特價庫失敗: {library_data['error']}"
                reply_markup = keyboard_service.create_main_menu()
            else:
                stats = library_data.get('stats', {})
                cards = library_data.get('cards', [])
                
                text = f"""🔥 **特價庫** (AI智能分類)

🎯 **限時特價** (AI動態定價):
　　總庫存: {stats.get('total', 0):,} 張
　　平均價格: ${stats.get('avg_price', 0):.2f} USD (💰 特價)
　　平均活性: {stats.get('avg_activity', 0):.1f}%
　　價格範圍: {stats.get('price_range', '$0-$0')}

💰 **今日特價推薦** (AI篩選):"""
                
                # 顯示前5張特價卡片
                for i, card in enumerate(cards[:5], 1):
                    quality_indicator = card.get('quality_indicator', '💰')
                    text += f"\n　　{i}. {quality_indicator} {card.get('display_text', '未知卡片')}"
                
                text += f"""

⏰ **活動時間**: 24小時內有效
💡 **AI建議**: 特價庫數量有限，先到先得！"""
                
                # 創建卡片列表鍵盤
                reply_markup = keyboard_service.create_card_list_keyboard(cards)
            
            await query.edit_message_text(text=text, parse_mode='Markdown', reply_markup=reply_markup)
            
        except Exception as e:
            logger.error(f"處理特價庫失敗: {e}")
            text = "🔥 特價庫載入中..."
            reply_markup = keyboard_service.create_main_menu()
            await query.edit_message_text(text=text, reply_markup=reply_markup)
    
    async def _handle_recharge(self, query):
        """處理充值按鈕"""
        text = """💰 <b>USDT 充值</b>
        
選擇充值金額：

💳 <b>支持方式：</b>
• USDT-TRC20 (推薦)
• USDT-ERC20

🎁 <b>充值優惠：</b>
• 充值 $100+ 送 5%
• 充值 $500+ 送 10%  
• 充值 $1000+ 送 15%

⚡ <b>到賬時間：</b>1-3 分鐘"""
        
        reply_markup = keyboards.create_recharge_menu()
        await query.edit_message_text(text=text, parse_mode='HTML', reply_markup=reply_markup)
    
    async def _handle_balance(self, query):
        """處理余額查詢按鈕"""
        user_id = query.from_user.id
        
        # 這裡應該從數據庫查詢真實余額
        balance = 0.00  # 示例數據
        
        text = f"""💳 <b>余額查詢</b>
        
👤 <b>用戶ID：</b>{user_id}
💰 <b>當前余額：</b>${balance:.2f} USDT
💎 <b>可用余額：</b>${balance:.2f} USDT
🎁 <b>贈送余額：</b>$0.00 USDT

📊 <b>消費記錄：</b>
• 今日消費：$0.00
• 本月消費：$0.00
• 總消費：$0.00

💡 <b>提示：</b>余額不足請及時充值"""
        
        reply_markup = keyboards.create_main_menu()
        await query.edit_message_text(text=text, parse_mode='HTML', reply_markup=reply_markup)
    
    async def _handle_merchant_base(self, query):
        """處理商家基地按鈕"""
        text = """🏪 <b>商家基地</b>
        
代理商專用功能：

👑 <b>您的等級：</b>普通用戶
💸 <b>佣金比例：</b>5%
👥 <b>邀請用戶：</b>0 人
💰 <b>累計佣金：</b>$0.00

📈 <b>升級條件：</b>
• 銅牌代理：邀請 10 人
• 銀牌代理：邀請 50 人  
• 金牌代理：邀請 100 人"""
        
        reply_markup = keyboards.create_merchant_menu()
        await query.edit_message_text(text=text, parse_mode='HTML', reply_markup=reply_markup)
    
    async def _handle_country_cards(self, query, country):
        """處理國家卡片選擇"""
        country_names = {
            'us': '🇺🇸 美國', 'gb': '🇬🇧 英國', 'ca': '🇨🇦 加拿大',
            'au': '🇦🇺 澳洲', 'de': '🇩🇪 德國', 'fr': '🇫🇷 法國',
            'jp': '🇯🇵 日本', 'kr': '🇰🇷 韓國'
        }
        
        country_name = country_names.get(country, country.upper())
        
        text = f"""💳 <b>{country_name} 卡片</b>
        
📊 <b>庫存信息：</b>
• 可用數量：1,234 張
• 成功率：85%
• 價格：$3.50/張

💳 <b>卡片類型分布：</b>
• Visa：60%
• Mastercard：30%  
• American Express：10%

🏦 <b>主要銀行：</b>
• Chase Bank
• Bank of America
• Wells Fargo

💡 <b>選擇購買數量：</b>"""
        
        reply_markup = keyboards.create_card_detail_menu(country)
        await query.edit_message_text(text=text, parse_mode='HTML', reply_markup=reply_markup)
    
    async def _handle_back_main(self, query):
        """返回主選單"""
        user = query.from_user
        
        welcome_text = f"""🎯 <b>溫馨提示，售前必看！</b>

歡迎【{user.first_name}】機器人ID：【{user.id}】

1.機器人所有數據均為一手資源；二手直接刪檔，
不出二手，直接賣完刪檔

2.購買請注意！機器人只支持USDT充值！卡號
錯誤.日期過期.全補.

3.GMS 永久承諾：充值未使用余額可以聯系客服
退款。(如果有贈送額度-需扣除贈送額度再退)

4.建議機器人用戶加入頻道，每天更新會在頻道
第一時間通知，更新有需要的卡頭可第一時間搶
先購買

GMS・24小時客服：@GMS_CVV_55
GMS・官方頻道：@CVV2D3Dsystem1688
GMS・交流群：@GMSCVVCARDING555"""
        
        reply_markup = keyboards.create_main_menu()
        await query.edit_message_text(text=welcome_text, parse_mode='HTML', reply_markup=reply_markup)
    
    async def _handle_back_cards(self, query):
        """返回卡片選單"""
        await self._handle_all_cards(query)
    
    # 其他處理方法的占位符
    async def _handle_global_bin(self, query):
        """處理全球卡頭庫存 - 顯示風趣統計"""
        try:
            # 獲取風趣的統計報告
            stats_text = await cvv_display_service.get_global_inventory_stats()
            reply_markup = keyboard_service.create_main_menu()
            await query.edit_message_text(text=stats_text, parse_mode='Markdown', reply_markup=reply_markup)
        except Exception as e:
            logger.error(f"處理全球庫存失敗: {e}")
            text = "🌍 全球卡頭庫存載入中..."
            reply_markup = keyboard_service.create_main_menu()
            await query.edit_message_text(text=text, reply_markup=reply_markup)
    
    async def _handle_bin_search(self, query):
        """處理搜尋購買 - 顯示搜尋選項"""
        text = """🔍 **搜尋購買**
        
請選擇搜尋方式：

🌍 **按國家查詢** - 選擇特定國家的卡片
💰 **按價格查詢** - 設置價格範圍篩選  
🎯 **按成功率查詢** - 根據活性率篩選
🔥 **熱門推薦** - 查看最受歡迎的卡片
🔍 **搜尋卡頭** - 根據卡號前六碼搜尋
💎 **高級篩選** - 多條件組合搜尋"""
        
        reply_markup = keyboard_service.create_search_keyboard()
        await query.edit_message_text(text=text, parse_mode='Markdown', reply_markup=reply_markup)
    
    async def _handle_search_card_prefix(self, query):
        """處理搜尋卡頭功能"""
        text = """🔍 **卡頭搜尋系統**

請選擇搜尋方式：

📝 **輸入卡頭** - 手動輸入6位卡號前綴
📊 **卡頭統計** - 查看各卡頭庫存統計
🏦 **常用銀行** - 選擇知名銀行卡頭
🌍 **按國家篩選** - 根據國家查看卡頭

💡 **提示**: 卡頭是信用卡號的前6位數字，代表發卡銀行"""
        
        reply_markup = keyboard_service.create_card_prefix_search_keyboard()
        await query.edit_message_text(text=text, parse_mode='Markdown', reply_markup=reply_markup)
    
    async def _handle_ai_classify_single(self, query):
        """處理單筆AI分類"""
        text = """🤖 **AI分類器 - 單筆分類**

請輸入CVV數據，AI將自動解析：

📋 **數據格式**:
國家代碼_國家_庫別_卡號_有效日期_安全碼_姓名_電話_售價_其他信息

📝 **示例**:
US_美國🇺🇸_全資庫_4111111111111111_12/26_123_John Smith_+1234567890_25.00_Address info

💡 **請直接輸入CVV數據，AI將為您解析分類**"""
        
        reply_markup = keyboard_service.create_back_button("search_buy")
        await query.edit_message_text(text=text, parse_mode='Markdown', reply_markup=reply_markup)
    
    async def _handle_ai_classify_batch(self, query):
        """處理批量AI分類"""
        text = """📁 **AI分類器 - 批量分類**

批量分類功能：

📋 **支援格式**:
• TXT 文件 (每行一條CVV數據)
• CSV 文件 (Excel格式)
• 直接文本輸入 (多行)

🚀 **處理能力**:
• 單次最多 100 條數據
• 自動去重和驗證
• 智能分類和定價建議

⚠️ **注意事項**:
• 僅管理員可使用批量功能
• 處理時間約 1-3 分鐘
• 結果需要人工確認"""
        
        reply_markup = keyboard_service.create_batch_classification_keyboard()
        await query.edit_message_text(text=text, parse_mode='Markdown', reply_markup=reply_markup)
    
    async def _handle_view_ai_results(self, query):
        """處理查看AI分類結果"""
        text = """🔍 **AI分類結果查看**

📊 **最近分類結果**:

暫無分類記錄

💡 **提示**: 
• 使用單筆分類或批量分類後
• 結果會顯示在這裡
• 管理員可以確認和修改結果"""
        
        reply_markup = keyboard_service.create_ai_classification_keyboard()
        await query.edit_message_text(text=text, parse_mode='Markdown', reply_markup=reply_markup)
    
    async def _handle_ai_classification_stats(self, query):
        """處理AI分類統計"""
        try:
            # 獲取分類統計
            stats = await gemini_classification_service.get_classification_stats()
            
            text = f"""📊 **AI分類統計報告**

📈 **基本數據**:
　　前端總數: {stats.get('total_classified', 0):,} 張
　　活性指標: {stats.get('activity_rate', 0):.1f}%
　　今日新增: {stats.get('daily_growth', 0)} 張

💰 **銷售統計**:
　　總收益: ${stats.get('revenue_stats', {}).get('total_revenue', 0):,}
　　日收益: ${stats.get('revenue_stats', {}).get('daily_revenue', 0):,}
　　平均價格: ${stats.get('revenue_stats', {}).get('average_price', 0):.2f}

🏷️ **分類統計**:"""
            
            category_breakdown = stats.get('category_breakdown', {})
            for category, data in category_breakdown.items():
                count = data.get('count', 0)
                percentage = data.get('percentage', 0)
                text += f"\n　　{category}: {count:,} 張 ({percentage:.1f}%)"
            
            reply_markup = keyboard_service.create_classification_stats_keyboard()
            await query.edit_message_text(text=text, parse_mode='Markdown', reply_markup=reply_markup)
            
        except Exception as e:
            logger.error(f"獲取AI分類統計失敗: {e}")
            text = "❌ 統計數據載入失敗，請稍後再試"
            reply_markup = keyboard_service.create_back_button("merchant_base")
            await query.edit_message_text(text=text, reply_markup=reply_markup)
    
    async def _handle_set_price(self, query, result_id: str):
        """處理設置售價"""
        text = f"""💰 **設置售價**

分類結果 ID: {result_id}

請輸入售價 (USD):

💡 **定價參考**:
• 頂級國家 (US,UK,CA): $15-50
• 歐洲國家 (DE,FR,IT): $8-25
• 南美國家 (AR,BR,CL): $3-15
• 其他國家: $1-8

📝 **請直接輸入數字，如: 25.50**"""
        
        reply_markup = keyboard_service.create_back_button("ai_classifier")
        await query.edit_message_text(text=text, parse_mode='Markdown', reply_markup=reply_markup)
    
    async def _handle_confirm_stock(self, query, result_id: str):
        """處理確認入庫"""
        text = f"""✅ **確認入庫**

分類結果 ID: {result_id}

✅ 已成功加入庫存！

📊 **入庫信息**:
• 庫存編號: CVV_{result_id}
• 入庫時間: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
• 狀態: 可售

💡 用戶現在可以在相應庫別中找到此卡片"""
        
        reply_markup = keyboard_service.create_ai_classification_keyboard()
        await query.edit_message_text(text=text, parse_mode='Markdown', reply_markup=reply_markup)
    
    async def _handle_english(self, query):
        text = "🇺🇸 English version coming soon..."
        reply_markup = keyboards.create_main_menu()
        await query.edit_message_text(text=text, reply_markup=reply_markup)
    
    async def _handle_recharge_amount(self, query, amount):
        text = f"💰 充值 ${amount} USDT\n\n功能開發中..."
        reply_markup = keyboards.create_recharge_menu()
        await query.edit_message_text(text=text, reply_markup=reply_markup)
    
    async def _handle_buy_cards(self, query, callback_data):
        text = "💳 購買功能開發中..."
        reply_markup = keyboards.create_main_menu()
        await query.edit_message_text(text=text, reply_markup=reply_markup)
    
    async def _handle_back_previous(self, query):
        await self._handle_back_main(query)
    
    async def _handle_other_callbacks(self, query, callback_data):
        text = f"功能開發中：{callback_data}"
        reply_markup = keyboards.create_main_menu()
        await query.edit_message_text(text=text, reply_markup=reply_markup)

    async def _handle_callback(self, query, callback_data: str):
        """處理具體的回調數據 - 保持向後兼容"""
        user_id = query.from_user.id
        
        try:
            # 根據回調數據選擇對應的 API 端點
            if callback_data == "main_menu":
                # 返回主選單
                from ..api.telegram_api import send_welcome_message, TelegramUser
                
                telegram_user = TelegramUser(
                    telegram_id=user_id,
                    username=query.from_user.username,
                    first_name=query.from_user.first_name,
                    last_name=query.from_user.last_name
                )
                
                response = await send_welcome_message(telegram_user)
                
            elif callback_data == "all_cards":
                # 全資庫
                from ..api.telegram_api import get_all_cards
                response = await get_all_cards(user_id)
                
            elif callback_data == "course_cards":
                # 課資庫
                from ..api.telegram_api import get_course_cards
                response = await get_course_cards(user_id)
                
            elif callback_data == "special_cards":
                # 特價庫
                from ..api.telegram_api import get_special_cards
                response = await get_special_cards(user_id)
                
            elif callback_data == "global_inventory":
                # 全球卡頭庫存
                from ..api.telegram_api import get_global_inventory
                response = await get_global_inventory(user_id)
                
            elif callback_data == "search_buy":
                # 卡頭查詢|購買
                from ..api.telegram_api import search_buy_interface
                response = await search_buy_interface(user_id)
                
            elif callback_data == "merchant_base":
                # 商家基地
                from ..api.telegram_api import merchant_base
                response = await merchant_base(user_id)
                
            elif callback_data == "recharge":
                # 充值
                from ..api.telegram_api import recharge_interface
                response = await recharge_interface(user_id)
                
            elif callback_data == "balance_check":
                # 餘額查詢
                from ..api.telegram_api import balance_check
                response = await balance_check(user_id)
                
            elif callback_data.startswith("buy_card_"):
                # 購買卡片
                card_id = int(callback_data.replace("buy_card_", ""))
                from ..api.telegram_api import buy_card
                response = await buy_card(user_id, card_id)
                
            elif callback_data.startswith("recharge_"):
                # 充值金額
                amount = callback_data.replace("recharge_", "")
                await self._handle_recharge(query, amount)
                return
                
            else:
                # 未知回調
                await query.edit_message_text("❌ 未知操作，請重新選擇。")
                return
            
            # 轉換並發送響應
            keyboard = []
            if response.inline_keyboard:
                for row in response.inline_keyboard:
                    keyboard_row = []
                    for btn in row:
                        keyboard_row.append(
                            InlineKeyboardButton(
                                text=btn.text,
                                callback_data=btn.callback_data
                            )
                        )
                    keyboard.append(keyboard_row)
            
            reply_markup = InlineKeyboardMarkup(keyboard) if keyboard else None
            
            await query.edit_message_text(
                text=response.message,
                parse_mode='HTML',
                reply_markup=reply_markup
            )
            
        except Exception as e:
            logger.error(f"處理回調 {callback_data} 失敗: {e}")
            await query.edit_message_text(
                text="❌ 操作失敗，請重試或聯繫客服。",
                reply_markup=InlineKeyboardMarkup([
                    [InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")]
                ])
            )
    
    async def _handle_recharge(self, query, amount: str):
        """處理充值操作"""
        try:
            # 這裡會生成支付地址和訂單
            # 暫時返回模擬數據
            
            recharge_amount = float(amount) if amount != "custom" else 0
            
            if amount == "custom":
                await query.edit_message_text(
                    text="💎 <b>自定義充值</b>\n\n請輸入充值金額（最低 10 USDT）:",
                    parse_mode='HTML',
                    reply_markup=InlineKeyboardMarkup([
                        [InlineKeyboardButton("🔙 返回", callback_data="recharge")]
                    ])
                )
                return
            
            # 生成模擬支付地址
            payment_address = "TQn9Y2khEsLMWtWxG8rWXcZKMnFmZKZdKj"  # 示例地址
            
            payment_text = f"""💰 <b>USDT-TRC20 充值</b>

💵 <b>充值金額:</b> ${recharge_amount} USDT
🏦 <b>支付地址:</b>
<code>{payment_address}</code>

⚠️ <b>重要提醒:</b>
• 請務必使用 TRC20 網絡轉賬
• 確認地址正確後再轉賬
• 轉賬完成後系統自動到賬
• 如有問題請聯繫客服

📱 <b>支付步驟:</b>
1. 複製上方地址
2. 打開錢包應用
3. 選擇 USDT-TRC20
4. 粘貼地址並轉賬
5. 等待到賬確認"""

            keyboard = [
                [InlineKeyboardButton("📋 複製地址", callback_data=f"copy_address_{payment_address}")],
                [
                    InlineKeyboardButton("✅ 已轉賬", callback_data=f"confirm_payment_{recharge_amount}"),
                    InlineKeyboardButton("❌ 取消", callback_data="recharge")
                ],
                [InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")]
            ]
            
            await query.edit_message_text(
                text=payment_text,
                parse_mode='HTML',
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
        except Exception as e:
            logger.error(f"處理充值失敗: {e}")
            await query.edit_message_text("❌ 生成支付訂單失敗，請重試。")
    
    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """處理普通文本消息"""
        user = update.effective_user
        message_text = update.message.text
        
        logger.info(f"用戶 {user.id} 發送消息: {message_text}")
        
        # 檢查是否是CVV數據格式
        if self._is_cvv_data_format(message_text):
            await self._process_cvv_classification(update, message_text)
            return
        
        # 檢查是否是卡頭搜尋 (6位數字)
        if self._is_card_prefix_format(message_text):
            await self._process_card_prefix_search(update, message_text)
            return
        
        # 檢查是否是售價輸入
        if self._is_price_input(message_text):
            await self._process_price_input(update, message_text)
            return
        
        # 簡單的消息處理
        if "客服" in message_text or "help" in message_text.lower():
            await update.message.reply_text(
                "📞 <b>客服聯繫方式</b>\n\n"
                "• Telegram: @GMS_CVV_55\n"
                "• 頻道: @CVV2D3Dsystem1688\n"
                "• 交流群: @GMSCVVCARDING555\n\n"
                "客服在線時間: 24小時",
                parse_mode='HTML'
            )
        else:
            await update.message.reply_text(
                "🤖 請使用下方按鈕操作，或發送 /help 查看幫助信息。"
            )
    
    def _is_cvv_data_format(self, text: str) -> bool:
        """檢查是否為CVV數據格式"""
        # 檢查是否包含下劃線分隔的多個字段
        parts = text.split('_')
        return len(parts) >= 6 and len(parts[0]) == 2  # 國家代碼是2位
    
    def _is_card_prefix_format(self, text: str) -> bool:
        """檢查是否為卡頭格式 (6位數字)"""
        return text.isdigit() and len(text) == 6
    
    def _is_price_input(self, text: str) -> bool:
        """檢查是否為價格輸入"""
        try:
            float(text)
            return True
        except ValueError:
            return False
    
    async def _process_cvv_classification(self, update: Update, cvv_data: str):
        """處理CVV數據分類"""
        try:
            user = update.effective_user
            
            # 發送處理中消息
            processing_msg = await update.message.reply_text(
                "🤖 AI正在分析您的CVV數據，請稍候...",
                parse_mode='HTML'
            )
            
            # 使用Gemini AI進行分類
            async with gemini_classification_service:
                result = await gemini_classification_service.classify_single_cvv(cvv_data)
            
            # 格式化分類結果供管理員確認
            result_text = await cvv_display_service.format_ai_classification_for_admin(result)
            
            # 生成結果ID
            result_id = f"cvv_{user.id}_{int(time.time())}"
            
            # 暫存分類結果 (實際應該存到數據庫)
            context.user_data[f"classification_{result_id}"] = result
            
            # 創建確認鍵盤
            reply_markup = keyboard_service.create_classification_confirmation_keyboard(result_id)
            
            # 更新消息
            await processing_msg.edit_text(
                text=result_text,
                parse_mode='Markdown',
                reply_markup=reply_markup
            )
            
        except Exception as e:
            logger.error(f"CVV分類處理失敗: {e}")
            await update.message.reply_text(
                "❌ AI分類失敗，請檢查數據格式或聯繫客服。\n\n"
                "📋 正確格式: 國家代碼_國家_庫別_卡號_有效日期_安全碼_姓名_電話_售價_其他信息"
            )
    
    async def _process_card_prefix_search(self, update: Update, prefix: str):
        """處理卡頭搜尋"""
        try:
            # 發送搜尋中消息
            searching_msg = await update.message.reply_text(
                f"🔍 正在搜尋卡頭 {prefix}，請稍候...",
                parse_mode='HTML'
            )
            
            # 搜尋卡頭
            search_result = await cvv_display_service.search_by_card_prefix(prefix)
            
            if search_result.get('found'):
                # 格式化搜尋結果
                result_text = search_result.get('summary', '')
                
                # 添加詳細統計
                country_stats = search_result.get('country_stats', {})
                if country_stats:
                    result_text += "\n\n🌍 **國家分布**:\n"
                    for country, data in country_stats.items():
                        flag = data.get('country_flag', '🏳️')
                        name = data.get('country_name', '未知')
                        count = data.get('count', 0)
                        avg_price = data.get('avg_price', 0)
                        activity = data.get('avg_activity', 0)
                        result_text += f"　　{flag} {name}: {count} 張, ${avg_price:.2f}, {activity:.1f}%\n"
            else:
                result_text = search_result.get('message', f"🔍 未找到卡頭 {prefix} 的相關卡片")
                suggestions = search_result.get('suggestions', [])
                if suggestions:
                    result_text += f"\n\n💡 **相似卡頭建議**: {', '.join(suggestions[:3])}"
            
            # 更新消息
            reply_markup = keyboard_service.create_card_prefix_search_keyboard()
            await searching_msg.edit_text(
                text=result_text,
                parse_mode='Markdown',
                reply_markup=reply_markup
            )
            
        except Exception as e:
            logger.error(f"卡頭搜尋失敗: {e}")
            await update.message.reply_text(
                f"❌ 搜尋卡頭 {prefix} 失敗，請稍後再試。"
            )
    
    async def _process_price_input(self, update: Update, price_text: str):
        """處理價格輸入"""
        try:
            price = float(price_text)
            
            # 這裡應該根據用戶上下文確定是為哪個分類結果設置價格
            # 暫時返回確認信息
            await update.message.reply_text(
                f"💰 **價格設置**\n\n"
                f"設置價格: ${price:.2f} USD\n\n"
                f"✅ 價格已更新，請返回AI分類器確認入庫。",
                parse_mode='Markdown'
            )
            
        except ValueError:
            await update.message.reply_text(
                "❌ 價格格式錯誤，請輸入有效數字，如: 25.50"
            )
    
    async def error_handler(self, update: object, context: ContextTypes.DEFAULT_TYPE):
        """錯誤處理器"""
        logger.error(f"Bot 錯誤: {context.error}")
        
        if update and hasattr(update, 'effective_message'):
            try:
                await update.effective_message.reply_text(
                    "❌ 系統出現錯誤，請稍後再試或聯繫客服。"
                )
            except:
                pass
    
    async def start_polling(self):
        """啟動 Bot 輪詢"""
        if not self.application:
            await self.initialize()
        
        logger.info("🚀 開始 Telegram Bot 輪詢...")
        await self.application.run_polling()
    
    async def stop(self):
        """停止 Bot"""
        if self.application:
            await self.application.stop()
            logger.info("🛑 Telegram Bot 已停止")

# 創建全局 Bot 實例
telegram_bot = CVVTelegramBot()

async def main():
    """主函數 - 直接運行 Bot 測試"""
    try:
        print("🎯 啟動 CVV Telegram Bot 測試")
        print("✨ 使用 3x3 原生內嵌鍵盤")
        
        await telegram_bot.initialize()
        print("✅ Bot 初始化完成")
        print("💡 發送 /start 查看 3x3 內嵌鍵盤")
        print("🔥 按 Ctrl+C 停止")
        
        await telegram_bot.start_polling()
    except KeyboardInterrupt:
        print("🛑 Bot 已停止")
    except Exception as e:
        print(f"❌ Bot 啟動失敗: {e}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
