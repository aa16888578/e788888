"""
Telegram Bot 處理器
處理所有 Telegram 消息和回調
"""
import logging
import asyncio
from typing import Dict, Any
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
from ..api.telegram_api import router as telegram_api
from .keyboards import keyboards

logger = logging.getLogger(__name__)

class CVVTelegramBot:
    """CVV Telegram Bot 主類"""
    
    def __init__(self):
        self.application = None
        self.bot_token = settings.TELEGRAM_BOT_TOKEN
        
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

GMS・24小時客服：@GMS_CVV_55
GMS・官方頻道：@CVV2D3Dsystem1688
GMS・交流群：@GMSCVVCARDING555"""
            
            # 使用 3x3 主選單內嵌鍵盤
            reply_markup = keyboards.create_main_menu()
            
            await update.message.reply_text(
                text=welcome_text,
                parse_mode='HTML',
                reply_markup=reply_markup
            )
            
        except Exception as e:
            logger.error(f"處理 /start 命令失敗: {e}")
            await update.message.reply_text(
                "❌ 系統錯誤，請稍後再試或聯繫客服。"
            )
    
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
        
        # 其他功能回調
        else:
            await self._handle_other_callbacks(query, callback_data)
    
    async def _handle_all_cards(self, query):
        """處理全資庫按鈕"""
        text = """💎 <b>全資庫</b>
        
選擇您要購買的國家卡片：

📊 <b>庫存統計：</b>
• 美國卡：15,420 張
• 英國卡：8,350 張  
• 加拿大卡：6,780 張
• 其他國家：25,000+ 張

💡 <b>提示：</b>點擊國家按鈕查看詳細信息"""
        
        reply_markup = keyboards.create_cards_menu()
        await query.edit_message_text(text=text, parse_mode='HTML', reply_markup=reply_markup)
    
    async def _handle_naked_cards(self, query):
        """處理裸資庫按鈕"""
        text = """🎓 <b>裸資庫</b>
        
裸數據卡片 - 無額外信息：

📋 <b>特點：</b>
• 價格更優惠
• 僅提供基本卡片信息
• 適合批量購買
• 成功率相對較低

💰 <b>價格：</b>比全資庫便宜 30%-50%"""
        
        reply_markup = keyboards.create_cards_menu()
        await query.edit_message_text(text=text, parse_mode='HTML', reply_markup=reply_markup)
    
    async def _handle_special_cards(self, query):
        """處理特價庫按鈕"""
        text = """🔥 <b>特價庫</b>
        
限時特價卡片：

🎯 <b>今日特價：</b>
• 美國卡：$2.5 → $1.8
• 德國卡：$3.0 → $2.2  
• 法國卡：$2.8 → $2.0

⏰ <b>活動時間：</b>24小時內有效
💡 <b>提示：</b>數量有限，先到先得"""
        
        reply_markup = keyboards.create_cards_menu()
        await query.edit_message_text(text=text, parse_mode='HTML', reply_markup=reply_markup)
    
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
        text = "🌍 全球卡頭庫存功能開發中..."
        reply_markup = keyboards.create_main_menu()
        await query.edit_message_text(text=text, reply_markup=reply_markup)
    
    async def _handle_bin_search(self, query):
        text = "🔍 卡頭查詢功能開發中..."
        reply_markup = keyboards.create_main_menu()
        await query.edit_message_text(text=text, reply_markup=reply_markup)
    
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
