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
        """處理內嵌鍵盤按鈕回調"""
        try:
            query = update.callback_query
            user = query.from_user
            callback_data = query.data
            
            logger.info(f"用戶 {user.id} 點擊了按鈕: {callback_data}")
            
            # 確認回調
            await query.answer()
            
            # 根據回調數據路由到不同的處理函數
            await self._handle_callback(query, callback_data)
            
        except Exception as e:
            logger.error(f"處理按鈕回調失敗: {e}")
            await query.answer("❌ 操作失敗，請重試", show_alert=True)
    
    async def _handle_callback(self, query, callback_data: str):
        """處理具體的回調數據"""
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
