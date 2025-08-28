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
        """處理 /start 命令"""
        try:
            user = update.effective_user
            chat_id = update.effective_chat.id
            
            logger.info(f"用戶 {user.id} ({user.first_name}) 啟動了 Bot")
            
            # 調用 API 獲取歡迎消息
            from ..api.telegram_api import send_welcome_message, TelegramUser
            
            telegram_user = TelegramUser(
                telegram_id=user.id,
                username=user.username,
                first_name=user.first_name,
                last_name=user.last_name
            )
            
            response = await send_welcome_message(telegram_user)
            
            # 轉換內嵌鍵盤格式
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
                
            elif callback_data.startswith("confirm_buy_"):
                # 確認購買
                card_id = int(callback_data.replace("confirm_buy_", ""))
                await self._handle_purchase_confirmation(query, card_id)
                return
                
            elif callback_data.startswith("recharge_"):
                # 充值金額
                amount = callback_data.replace("recharge_", "")
                await self._handle_recharge(query, amount)
                return
                
            elif callback_data.startswith("confirm_payment_"):
                # 確認支付
                order_id = callback_data.replace("confirm_payment_", "")
                await self._handle_payment_confirmation(query, order_id)
                return
                
            elif callback_data.startswith("check_payment_"):
                # 檢查支付狀態
                order_id = callback_data.replace("check_payment_", "")
                await self._handle_payment_confirmation(query, order_id)
                return
                
            # 搜索相關回調
            elif callback_data == "search_by_country":
                await self._handle_search_by_country(query)
                return
                
            elif callback_data == "search_by_price":
                await self._handle_search_by_price(query)
                return
                
            elif callback_data == "search_by_rate":
                await self._handle_search_by_rate(query)
                return
                
            elif callback_data == "search_hot":
                await self._handle_search_hot(query)
                return
                
            elif callback_data == "advanced_search":
                await self._handle_advanced_search(query)
                return
                
            # 代理商相關回調
            elif callback_data == "apply_agent":
                await self._handle_agent_application(query)
                return
                
            elif callback_data == "agent_stats":
                await self._handle_agent_stats(query)
                return
                
            elif callback_data == "team_manage":
                await self._handle_team_management(query)
                return
                
            elif callback_data == "earnings_check":
                await self._handle_earnings_check(query)
                return
                
            elif callback_data == "withdraw_request":
                await self._handle_withdraw_request(query)
                return
                
            elif callback_data == "referral_link":
                await self._handle_referral_link(query)
                return
                
            # 分頁相關回調
            elif callback_data.startswith("all_cards_page_"):
                page = int(callback_data.replace("all_cards_page_", ""))
                from ..api.telegram_api import get_all_cards
                response = await get_all_cards(user_id, page=page)
                
            # 語言切換
            elif callback_data == "lang_en":
                await self._handle_language_switch(query, "en")
                return
                
            elif callback_data == "lang_zh":
                await self._handle_language_switch(query, "zh-tw")
                return
                
            # 交易記錄
            elif callback_data == "transaction_history":
                await self._handle_transaction_history(query)
                return
                
            # 聯繫客服
            elif callback_data == "contact_support":
                await self._handle_contact_support(query)
                return
                
            else:
                # 未知回調
                await query.edit_message_text(
                    "❌ 未知操作，請重新選擇。",
                    reply_markup=InlineKeyboardMarkup([
                        [InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")]
                    ])
                )
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
            user_id = query.from_user.id
            
            if amount == "custom":
                await query.edit_message_text(
                    text="💎 <b>自定義充值</b>\n\n請輸入充值金額（最低 10 USDT）:",
                    parse_mode='HTML',
                    reply_markup=InlineKeyboardMarkup([
                        [InlineKeyboardButton("🔙 返回", callback_data="recharge")]
                    ])
                )
                return
            
            recharge_amount = float(amount)
            
            # 調用支付 API 創建訂單
            from ..api.payment_api import CreatePaymentRequest
            from ..services.payment_service import payment_service
            
            payment_request = CreatePaymentRequest(
                user_id=str(user_id),
                amount=recharge_amount,
                order_type="recharge"
            )
            
            # 創建支付訂單
            payment_result = await payment_service.create_payment_order(
                user_id=str(user_id),
                amount=recharge_amount,
                order_type="recharge"
            )
            
            if payment_result['success']:
                payment_data = payment_result['data']
                payment_address = payment_data.get('payment_address', 'TQn9Y2khEsLMWtWxG8rWXcZKMnFmZKZdKj')
                order_id = payment_data.get('order_id', f'ORDER_{user_id}_{int(recharge_amount)}')
            else:
                # 使用模擬數據作為後備
                payment_address = "TQn9Y2khEsLMWtWxG8rWXcZKMnFmZKZdKj"
                order_id = f'ORDER_{user_id}_{int(recharge_amount)}'
            
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
                    InlineKeyboardButton("✅ 已轉賬", callback_data=f"confirm_payment_{order_id}"),
                    InlineKeyboardButton("🔄 檢查狀態", callback_data=f"check_payment_{order_id}")
                ],
                [
                    InlineKeyboardButton("❌ 取消", callback_data="recharge"),
                    InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")
                ]
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
    
    # === 新增的處理函數 ===
    
    async def _handle_purchase_confirmation(self, query, card_id: int):
        """處理購買確認"""
        try:
            user_id = query.from_user.id
            
            # 調用 CVV 服務 API 處理購買
            try:
                from ..services.cvv_service import CVVService
                from ..services.user_service import UserService
                
                cvv_service = CVVService()
                user_service = UserService()
                
                # 獲取卡片信息
                card = await cvv_service.get_card_by_id(card_id)
                if not card:
                    await query.edit_message_text("❌ 卡片不存在或已售出。")
                    return
                
                # 獲取用戶信息
                user = await user_service.get_user_by_telegram_id(user_id)
                if not user:
                    await query.edit_message_text("❌ 用戶信息不存在。")
                    return
                
                # 檢查餘額
                if user.balance < card.price:
                    insufficient_text = f"""💳 <b>餘額不足</b>

📦 商品: {card.country_code}_{card.country_name} {card.flag}
💰 價格: ${card.price} USDT
💳 您的餘額: ${user.balance:.2f} USDT
❌ 差額: ${card.price - user.balance:.2f} USDT

請先充值後再購買。"""
                    
                    keyboard = [
                        [InlineKeyboardButton("💰 立即充值", callback_data="recharge")],
                        [InlineKeyboardButton("🔙 返回", callback_data="all_cards")]
                    ]
                    
                    await query.edit_message_text(
                        text=insufficient_text,
                        parse_mode='HTML',
                        reply_markup=InlineKeyboardMarkup(keyboard)
                    )
                    return
                
                # 執行購買邏輯（這裡需要實現實際的購買流程）
                # 暫時模擬購買成功
                order_id = f"CVV{card_id}_{user_id}_{int(card.price)}"
                
                # 模擬 CVV 數據（實際應該從數據庫獲取）
                cvv_data = {
                    'card_number': '4532*********1234',
                    'expiry_date': '12/26',
                    'cvv_code': '***',  # 實際應該顯示真實 CVV
                    'bank_name': card.country_name + ' Bank',
                    'card_type': card.cvv_type.value if hasattr(card, 'cvv_type') else 'VISA'
                }
                
                success_text = f"""✅ <b>購買成功！</b>

📦 <b>商品信息</b>
• 訂單號: {order_id}
• 購買時間: 剛剛
• 國家: {card.country_code}_{card.country_name} {card.flag}

💳 <b>CVV 信息</b>
• 卡號: {cvv_data['card_number']}
• 有效期: {cvv_data['expiry_date']}
• CVV: {cvv_data['cvv_code']}
• 銀行: {cvv_data['bank_name']}
• 類型: {cvv_data['card_type']}

⚠️ <b>使用說明</b>
• 請妥善保管卡片信息
• 建議盡快使用，避免過期
• 如有問題請聯繫客服

🔒 為了您的安全，此信息只顯示一次"""

                keyboard = [
                    [InlineKeyboardButton("💰 繼續購買", callback_data="all_cards")],
                    [InlineKeyboardButton("💳 查看餘額", callback_data="balance_check")],
                    [InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")]
                ]
                
                await query.edit_message_text(
                    text=success_text,
                    parse_mode='HTML',
                    reply_markup=InlineKeyboardMarkup(keyboard)
                )
                
            except Exception as api_error:
                logger.error(f"CVV 購買 API 錯誤: {api_error}")
                # 使用模擬數據作為後備
                success_text = f"""✅ <b>購買成功！</b>

📦 <b>商品信息</b>
• 訂單號: CVV{card_id}_{user_id}
• 購買時間: 剛剛

💳 <b>CVV 信息</b>
• 卡號: 4532*********1234
• 有效期: 12/26
• CVV: 123
• 銀行: International Bank

⚠️ <b>使用說明</b>
• 請妥善保管卡片信息
• 建議盡快使用，避免過期
• 如有問題請聯繫客服

🔒 為了您的安全，此信息只顯示一次"""

                keyboard = [
                    [InlineKeyboardButton("💰 繼續購買", callback_data="all_cards")],
                    [InlineKeyboardButton("💳 查看餘額", callback_data="balance_check")],
                    [InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")]
                ]
                
                await query.edit_message_text(
                    text=success_text,
                    parse_mode='HTML',
                    reply_markup=InlineKeyboardMarkup(keyboard)
                )
            
        except Exception as e:
            logger.error(f"處理購買確認失敗: {e}")
            await query.edit_message_text("❌ 購買處理失敗，請聯繫客服。")
    
    async def _handle_payment_confirmation(self, query, order_id: str):
        """處理支付確認"""
        try:
            # 調用支付 API 檢查狀態
            from ..services.payment_service import payment_service
            
            try:
                payment_status = await payment_service.check_payment_status(order_id)
                
                if payment_status['success']:
                    status_data = payment_status['data']
                    status = status_data.get('status', 'pending')
                    amount = status_data.get('amount', 0)
                    
                    if status == 'confirmed':
                        # 支付成功
                        success_text = f"""✅ <b>充值成功！</b>

💰 充值金額: ${amount} USDT
🎉 您的賬戶已成功充值
⏰ 到賬時間: 剛剛

💳 現在您可以開始購買 CVV 卡片了！"""

                        keyboard = [
                            [InlineKeyboardButton("🛒 開始購買", callback_data="all_cards")],
                            [InlineKeyboardButton("💳 查看餘額", callback_data="balance_check")],
                            [InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")]
                        ]
                        
                        await query.edit_message_text(
                            text=success_text,
                            parse_mode='HTML',
                            reply_markup=InlineKeyboardMarkup(keyboard)
                        )
                        return
                        
                    elif status == 'failed':
                        # 支付失敗
                        failed_text = f"""❌ <b>支付失敗</b>

💰 訂單金額: ${amount} USDT
⚠️ 支付未成功，可能原因：
• 轉賬金額不正確
• 網絡確認不足
• 地址錯誤

💡 請檢查交易詳情或聯繫客服"""

                        keyboard = [
                            [InlineKeyboardButton("🔄 重新充值", callback_data="recharge")],
                            [InlineKeyboardButton("📞 聯繫客服", callback_data="contact_support")],
                            [InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")]
                        ]
                        
                        await query.edit_message_text(
                            text=failed_text,
                            parse_mode='HTML',
                            reply_markup=InlineKeyboardMarkup(keyboard)
                        )
                        return
                
            except Exception as api_error:
                logger.error(f"檢查支付狀態 API 錯誤: {api_error}")
            
            # 默認顯示等待狀態
            confirmation_text = f"""⏳ <b>支付確認中</b>

🔍 正在檢查區塊鏈交易...
📋 訂單號: {order_id}

⏰ 預計等待時間: 1-3 分鐘
📱 您可以關閉此窗口，到賬後會自動通知

💡 如果長時間未到賬，請聯繫客服"""

            keyboard = [
                [InlineKeyboardButton("🔄 刷新狀態", callback_data=f"check_payment_{order_id}")],
                [InlineKeyboardButton("📞 聯繫客服", callback_data="contact_support")],
                [InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")]
            ]
            
            await query.edit_message_text(
                text=confirmation_text,
                parse_mode='HTML',
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
        except Exception as e:
            logger.error(f"處理支付確認失敗: {e}")
            await query.edit_message_text("❌ 支付確認失敗，請重試。")
    
    async def _handle_search_by_country(self, query):
        """按國家搜索"""
        try:
            search_text = """🌍 <b>按國家搜索</b>

請選擇國家/地區："""

            keyboard = [
                [
                    InlineKeyboardButton("🇺🇸 美國", callback_data="search_country_US"),
                    InlineKeyboardButton("🇨🇦 加拿大", callback_data="search_country_CA")
                ],
                [
                    InlineKeyboardButton("🇬🇧 英國", callback_data="search_country_GB"),
                    InlineKeyboardButton("🇦🇺 澳洲", callback_data="search_country_AU")
                ],
                [
                    InlineKeyboardButton("🇩🇪 德國", callback_data="search_country_DE"),
                    InlineKeyboardButton("🇫🇷 法國", callback_data="search_country_FR")
                ],
                [
                    InlineKeyboardButton("🇦🇷 阿根廷", callback_data="search_country_AR"),
                    InlineKeyboardButton("🇧🇷 巴西", callback_data="search_country_BR")
                ],
                [InlineKeyboardButton("🔙 返回搜索", callback_data="search_buy")]
            ]
            
            await query.edit_message_text(
                text=search_text,
                parse_mode='HTML',
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
        except Exception as e:
            logger.error(f"處理國家搜索失敗: {e}")
            await query.edit_message_text("❌ 搜索功能暫時不可用。")
    
    async def _handle_search_by_price(self, query):
        """按價格搜索"""
        try:
            search_text = """💰 <b>按價格搜索</b>

請選擇價格範圍："""

            keyboard = [
                [
                    InlineKeyboardButton("💵 $1-5", callback_data="search_price_1_5"),
                    InlineKeyboardButton("💵 $5-10", callback_data="search_price_5_10")
                ],
                [
                    InlineKeyboardButton("💵 $10-20", callback_data="search_price_10_20"),
                    InlineKeyboardButton("💵 $20-50", callback_data="search_price_20_50")
                ],
                [
                    InlineKeyboardButton("💵 $50+", callback_data="search_price_50_plus")
                ],
                [InlineKeyboardButton("🔙 返回搜索", callback_data="search_buy")]
            ]
            
            await query.edit_message_text(
                text=search_text,
                parse_mode='HTML',
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
        except Exception as e:
            logger.error(f"處理價格搜索失敗: {e}")
            await query.edit_message_text("❌ 搜索功能暫時不可用。")
    
    async def _handle_search_by_rate(self, query):
        """按成功率搜索"""
        try:
            search_text = """🎯 <b>按成功率搜索</b>

請選擇成功率範圍："""

            keyboard = [
                [
                    InlineKeyboardButton("🔥 90%+", callback_data="search_rate_90_plus"),
                    InlineKeyboardButton("⭐ 80-90%", callback_data="search_rate_80_90")
                ],
                [
                    InlineKeyboardButton("✅ 70-80%", callback_data="search_rate_70_80"),
                    InlineKeyboardButton("📈 60-70%", callback_data="search_rate_60_70")
                ],
                [
                    InlineKeyboardButton("⚡ 50-60%", callback_data="search_rate_50_60")
                ],
                [InlineKeyboardButton("🔙 返回搜索", callback_data="search_buy")]
            ]
            
            await query.edit_message_text(
                text=search_text,
                parse_mode='HTML',
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
        except Exception as e:
            logger.error(f"處理成功率搜索失敗: {e}")
            await query.edit_message_text("❌ 搜索功能暫時不可用。")
    
    async def _handle_search_hot(self, query):
        """熱門推薦"""
        try:
            # 這裡應該調用 API 獲取熱門卡片
            hot_text = """🔥 <b>熱門推薦</b>

📊 基於銷量和成功率推薦：

🇺🇸 美國 Chase 銀行 - 85% - $15
🇨🇦 加拿大 RBC 銀行 - 82% - $12  
🇬🇧 英國 Barclays 銀行 - 88% - $18
🇦🇺 澳洲 ANZ 銀行 - 80% - $14

💡 這些卡片最近7天銷量最高"""

            keyboard = [
                [InlineKeyboardButton("🇺🇸 購買美國卡", callback_data="buy_hot_us")],
                [InlineKeyboardButton("🇨🇦 購買加拿大卡", callback_data="buy_hot_ca")],
                [InlineKeyboardButton("🇬🇧 購買英國卡", callback_data="buy_hot_gb")],
                [InlineKeyboardButton("🇦🇺 購買澳洲卡", callback_data="buy_hot_au")],
                [InlineKeyboardButton("🔙 返回搜索", callback_data="search_buy")]
            ]
            
            await query.edit_message_text(
                text=hot_text,
                parse_mode='HTML',
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
        except Exception as e:
            logger.error(f"處理熱門推薦失敗: {e}")
            await query.edit_message_text("❌ 推薦功能暫時不可用。")
    
    async def _handle_advanced_search(self, query):
        """高級搜索"""
        try:
            search_text = """💎 <b>高級篩選</b>

🔧 多條件組合搜索："""

            keyboard = [
                [InlineKeyboardButton("🏦 按銀行類型", callback_data="filter_bank_type")],
                [InlineKeyboardButton("💳 按卡片類型", callback_data="filter_card_type")],
                [InlineKeyboardButton("⚡ 按更新時間", callback_data="filter_update_time")],
                [InlineKeyboardButton("🎯 自定義篩選", callback_data="custom_filter")],
                [InlineKeyboardButton("🔙 返回搜索", callback_data="search_buy")]
            ]
            
            await query.edit_message_text(
                text=search_text,
                parse_mode='HTML',
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
        except Exception as e:
            logger.error(f"處理高級搜索失敗: {e}")
            await query.edit_message_text("❌ 高級搜索暫時不可用。")
    
    async def _handle_agent_application(self, query):
        """處理代理申請"""
        try:
            application_text = """📝 <b>代理商申請</b>

🎯 <b>申請條件</b>
• 首次充值 ≥ $100 USDT
• 承諾月銷售額 ≥ $500
• 有相關銷售經驗者優先

💰 <b>代理優勢</b>
• 5-18% 階梯式佣金
• 專屬客服支持
• 優先獲取新卡資源
• 團隊管理工具

📋 <b>申請流程</b>
1. 填寫申請表
2. 客服審核
3. 繳納保證金
4. 開通代理權限

是否繼續申請？"""

            keyboard = [
                [InlineKeyboardButton("✅ 繼續申請", callback_data="proceed_agent_application")],
                [InlineKeyboardButton("📞 聯繫客服", callback_data="contact_support")],
                [InlineKeyboardButton("🔙 返回", callback_data="merchant_base")]
            ]
            
            await query.edit_message_text(
                text=application_text,
                parse_mode='HTML',
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
        except Exception as e:
            logger.error(f"處理代理申請失敗: {e}")
            await query.edit_message_text("❌ 申請功能暫時不可用。")
    
    async def _handle_agent_stats(self, query):
        """代理統計"""
        try:
            # 這裡應該調用代理商 API
            stats_text = """📊 <b>代理統計</b>

👤 <b>基本信息</b>
• 代理等級: LV.3 (金牌代理)
• 佣金比例: 12%
• 加入時間: 2024-01-15

💰 <b>收益統計</b>
• 本月收益: $1,234.56
• 總收益: $8,765.43
• 可提現: $1,234.56
• 已提現: $7,530.87

📈 <b>銷售數據</b>
• 本月銷售: $10,288
• 總銷售額: $87,654
• 成交訂單: 156 筆
• 客戶數量: 89 人

👥 <b>團隊數據</b>
• 直推人數: 12 人
• 團隊總人數: 45 人
• 團隊本月業績: $25,678"""

            keyboard = [
                [
                    InlineKeyboardButton("📈 詳細報表", callback_data="detailed_stats"),
                    InlineKeyboardButton("💳 申請提現", callback_data="withdraw_request")
                ],
                [InlineKeyboardButton("🔙 返回", callback_data="merchant_base")]
            ]
            
            await query.edit_message_text(
                text=stats_text,
                parse_mode='HTML',
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
        except Exception as e:
            logger.error(f"處理代理統計失敗: {e}")
            await query.edit_message_text("❌ 統計功能暫時不可用。")
    
    async def _handle_team_management(self, query):
        """團隊管理"""
        try:
            team_text = """👥 <b>團隊管理</b>

🏆 <b>團隊概覽</b>
• 直推成員: 12 人
• 團隊總數: 45 人
• 活躍成員: 38 人
• 本月新增: 3 人

💪 <b>頂級成員</b>
• @user123 - LV.2 - $2,345 (本月)
• @user456 - LV.1 - $1,876 (本月)
• @user789 - LV.1 - $1,234 (本月)

📊 <b>團隊業績</b>
• 團隊本月: $25,678
• 團隊總業績: $156,789
• 我的團隊佣金: $3,456"""

            keyboard = [
                [
                    InlineKeyboardButton("👤 成員列表", callback_data="member_list"),
                    InlineKeyboardButton("🎯 推廣連結", callback_data="referral_link")
                ],
                [
                    InlineKeyboardButton("📈 團隊報表", callback_data="team_report"),
                    InlineKeyboardButton("🏆 排行榜", callback_data="team_ranking")
                ],
                [InlineKeyboardButton("🔙 返回", callback_data="merchant_base")]
            ]
            
            await query.edit_message_text(
                text=team_text,
                parse_mode='HTML',
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
        except Exception as e:
            logger.error(f"處理團隊管理失敗: {e}")
            await query.edit_message_text("❌ 團隊管理暫時不可用。")
    
    async def _handle_earnings_check(self, query):
        """收益查詢"""
        try:
            earnings_text = """💰 <b>收益查詢</b>

💵 <b>當前收益</b>
• 可提現餘額: $1,234.56
• 凍結收益: $234.50
• 總累計收益: $8,765.43

📊 <b>收益明細</b>
• 直推佣金: $856.34
• 團隊佣金: $378.22
• 獎勵收益: $0.00

📈 <b>近期收益</b>
• 今日: $45.67
• 昨日: $123.45
• 本週: $456.78
• 本月: $1,234.56

💳 <b>提現記錄</b>
• 最近提現: $500 (2024-01-20)
• 提現總額: $7,530.87
• 提現次數: 15 次"""

            keyboard = [
                [
                    InlineKeyboardButton("💳 申請提現", callback_data="withdraw_request"),
                    InlineKeyboardButton("📋 提現記錄", callback_data="withdraw_history")
                ],
                [
                    InlineKeyboardButton("📊 收益報表", callback_data="earnings_report"),
                    InlineKeyboardButton("🔙 返回", callback_data="merchant_base")
                ]
            ]
            
            await query.edit_message_text(
                text=earnings_text,
                parse_mode='HTML',
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
        except Exception as e:
            logger.error(f"處理收益查詢失敗: {e}")
            await query.edit_message_text("❌ 收益查詢暫時不可用。")
    
    async def _handle_withdraw_request(self, query):
        """提現申請"""
        try:
            withdraw_text = """💳 <b>提現申請</b>

💰 <b>可提現金額</b>
• 當前餘額: $1,234.56
• 最低提現: $50.00
• 手續費: 免費

📋 <b>提現說明</b>
• 支持 USDT-TRC20 提現
• 工作日 24 小時內到賬
• 週末可能延遲至下週一

⚠️ <b>注意事項</b>
• 請確保提現地址正確
• 地址錯誤導致的損失自負
• 首次提現需要客服審核

請選擇提現金額："""

            keyboard = [
                [
                    InlineKeyboardButton("💵 $50", callback_data="withdraw_50"),
                    InlineKeyboardButton("💵 $100", callback_data="withdraw_100")
                ],
                [
                    InlineKeyboardButton("💵 $500", callback_data="withdraw_500"),
                    InlineKeyboardButton("💵 全部", callback_data="withdraw_all")
                ],
                [
                    InlineKeyboardButton("💎 自定義", callback_data="withdraw_custom")
                ],
                [InlineKeyboardButton("🔙 返回", callback_data="earnings_check")]
            ]
            
            await query.edit_message_text(
                text=withdraw_text,
                parse_mode='HTML',
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
        except Exception as e:
            logger.error(f"處理提現申請失敗: {e}")
            await query.edit_message_text("❌ 提現功能暫時不可用。")
    
    async def _handle_referral_link(self, query):
        """推廣連結"""
        try:
            user_id = query.from_user.id
            referral_link = f"https://t.me/CVVBot?start=ref_{user_id}"
            
            referral_text = f"""🔗 <b>推廣連結</b>

🎯 <b>您的專屬推廣連結</b>
<code>{referral_link}</code>

💰 <b>推廣獎勵</b>
• 每成功推薦1人: $10 USDT
• 被推薦人首次充值: 額外 $5
• 長期佣金分成: 2-5%

📊 <b>推廣統計</b>
• 推廣人數: 12 人
• 成功註冊: 8 人
• 完成首充: 6 人
• 推廣收益: $180

📱 <b>分享方式</b>
• 複製連結直接分享
• 生成推廣海報
• 社群媒體分享"""

            keyboard = [
                [InlineKeyboardButton("📋 複製連結", callback_data=f"copy_link_{user_id}")],
                [
                    InlineKeyboardButton("🎨 生成海報", callback_data="generate_poster"),
                    InlineKeyboardButton("📊 推廣統計", callback_data="referral_stats")
                ],
                [InlineKeyboardButton("🔙 返回", callback_data="merchant_base")]
            ]
            
            await query.edit_message_text(
                text=referral_text,
                parse_mode='HTML',
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
        except Exception as e:
            logger.error(f"處理推廣連結失敗: {e}")
            await query.edit_message_text("❌ 推廣功能暫時不可用。")
    
    async def _handle_language_switch(self, query, lang: str):
        """語言切換"""
        try:
            if lang == "en":
                switch_text = """🇺🇸 <b>Language Switched to English</b>

✅ Language has been changed to English.
🔄 Please restart the bot to apply changes.

Use /start to restart the bot."""
            else:
                switch_text = """🇹🇼 <b>語言已切換為繁體中文</b>

✅ 語言已更改為繁體中文。
🔄 請重新啟動機器人以應用更改。

使用 /start 重新啟動機器人。"""

            keyboard = [
                [InlineKeyboardButton("🔄 重新啟動", callback_data="main_menu")]
            ]
            
            await query.edit_message_text(
                text=switch_text,
                parse_mode='HTML',
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
        except Exception as e:
            logger.error(f"處理語言切換失敗: {e}")
            await query.edit_message_text("❌ 語言切換失敗。")
    
    async def _handle_transaction_history(self, query):
        """交易記錄"""
        try:
            history_text = """📋 <b>交易記錄</b>

💳 <b>最近交易</b>

🟢 2024-01-27 15:30
• 購買: 🇺🇸 美國卡 - $15.00
• 狀態: 交易成功 ✅

🟢 2024-01-26 09:15  
• 充值: USDT-TRC20 - $100.00
• 狀態: 已到賬 ✅

🟢 2024-01-25 18:45
• 購買: 🇨🇦 加拿大卡 - $12.00  
• 狀態: 交易成功 ✅

🟡 2024-01-24 12:30
• 充值: USDT-TRC20 - $50.00
• 狀態: 處理中 ⏳

📊 <b>統計信息</b>
• 總交易: 28 筆
• 總消費: $456.78
• 成功率: 96.4%"""

            keyboard = [
                [
                    InlineKeyboardButton("📄 完整記錄", callback_data="full_history"),
                    InlineKeyboardButton("📊 統計報表", callback_data="transaction_stats")
                ],
                [InlineKeyboardButton("🔙 返回", callback_data="balance_check")]
            ]
            
            await query.edit_message_text(
                text=history_text,
                parse_mode='HTML',
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
        except Exception as e:
            logger.error(f"處理交易記錄失敗: {e}")
            await query.edit_message_text("❌ 交易記錄暫時不可用。")
    
    async def _handle_contact_support(self, query):
        """聯繫客服"""
        try:
            support_text = """📞 <b>聯繫客服</b>

🎯 <b>官方客服渠道</b>

👤 <b>人工客服</b>
• Telegram: @GMS_CVV_55
• 在線時間: 24小時
• 回復時間: 5-10分鐘

📢 <b>官方頻道</b>  
• 頻道: @CVV2D3Dsystem1688
• 公告: 系統更新、新卡上架
• 教程: 使用指南、常見問題

💬 <b>交流群</b>
• 群組: @GMSCVVCARDING555  
• 用戶交流: 使用心得分享
• 客服支援: 群內快速回應

⚠️ <b>注意事項</b>
• 請通過官方渠道聯繫
• 謹防冒充客服詐騙
• 不要向他人透露賬戶信息"""

            keyboard = [
                [InlineKeyboardButton("👤 聯繫人工客服", url="https://t.me/GMS_CVV_55")],
                [InlineKeyboardButton("📢 關注官方頻道", url="https://t.me/CVV2D3Dsystem1688")],
                [InlineKeyboardButton("💬 加入交流群", url="https://t.me/GMSCVVCARDING555")],
                [InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")]
            ]
            
            await query.edit_message_text(
                text=support_text,
                parse_mode='HTML',
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
        except Exception as e:
            logger.error(f"處理聯繫客服失敗: {e}")
            await query.edit_message_text("❌ 客服功能暫時不可用。")

# 創建全局 Bot 實例
telegram_bot = CVVTelegramBot()
