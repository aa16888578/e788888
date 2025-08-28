#!/usr/bin/env python3
"""
CVV Bot 純 Telegram Bot 版本 - 避免事件循環衝突
"""
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler

# 設置日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 載入環境變數
from dotenv import load_dotenv
import os
load_dotenv()

TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')

def create_main_keyboard():
    """創建 CVV Bot 主選單 3x3 內嵌鍵盤"""
    keyboard = [
        [
            InlineKeyboardButton("💎 全資庫", callback_data="main_all_cards"),
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
    ]
    return InlineKeyboardMarkup(keyboard)

def create_cards_keyboard():
    """創建卡片選擇 3x3 內嵌鍵盤"""
    keyboard = [
        [
            InlineKeyboardButton("🇺🇸 美國卡", callback_data="cards_us"),
            InlineKeyboardButton("🇬🇧 英國卡", callback_data="cards_gb"),
            InlineKeyboardButton("🇨🇦 加拿大卡", callback_data="cards_ca")
        ],
        [
            InlineKeyboardButton("🇦🇺 澳洲卡", callback_data="cards_au"),
            InlineKeyboardButton("🇩🇪 德國卡", callback_data="cards_de"),
            InlineKeyboardButton("🇫🇷 法國卡", callback_data="cards_fr")
        ],
        [
            InlineKeyboardButton("🇯🇵 日本卡", callback_data="cards_jp"),
            InlineKeyboardButton("🔙 返回主選單", callback_data="back_main"),
            InlineKeyboardButton("➡️ 更多國家", callback_data="cards_more")
        ]
    ]
    return InlineKeyboardMarkup(keyboard)

def create_recharge_keyboard():
    """創建充值選項 3x3 內嵌鍵盤"""
    keyboard = [
        [
            InlineKeyboardButton("💰 $10 USDT", callback_data="recharge_10"),
            InlineKeyboardButton("💰 $25 USDT", callback_data="recharge_25"),
            InlineKeyboardButton("💰 $50 USDT", callback_data="recharge_50")
        ],
        [
            InlineKeyboardButton("💰 $100 USDT", callback_data="recharge_100"),
            InlineKeyboardButton("💰 $200 USDT", callback_data="recharge_200"),
            InlineKeyboardButton("💰 $500 USDT", callback_data="recharge_500")
        ],
        [
            InlineKeyboardButton("💰 自定義金額", callback_data="recharge_custom"),
            InlineKeyboardButton("🔙 返回主選單", callback_data="back_main"),
            InlineKeyboardButton("📊 充值記錄", callback_data="recharge_history")
        ]
    ]
    return InlineKeyboardMarkup(keyboard)

async def start_command(update: Update, context):
    """處理 /start 命令 - 顯示 3x3 主選單內嵌鍵盤"""
    user = update.effective_user
    
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
    
    reply_markup = create_main_keyboard()
    
    await update.message.reply_text(
        text=welcome_text,
        parse_mode='HTML',
        reply_markup=reply_markup
    )

async def button_callback(update: Update, context):
    """處理 3x3 內嵌鍵盤按鈕回調"""
    query = update.callback_query
    await query.answer()
    
    data = query.data
    user = query.from_user
    
    # 主選單處理
    if data == "main_all_cards":
        text = """💎 <b>全資庫</b>
        
選擇您要購買的國家卡片：

📊 <b>庫存統計：</b>
• 美國卡：15,420 張
• 英國卡：8,350 張  
• 加拿大卡：6,780 張
• 其他國家：25,000+ 張

💡 <b>提示：</b>點擊國家按鈕查看詳細信息"""
        reply_markup = create_cards_keyboard()
        
    elif data == "main_naked_cards":
        text = """🎓 <b>裸資庫</b>
        
裸數據卡片 - 無額外信息：

📋 <b>特點：</b>
• 價格更優惠
• 僅提供基本卡片信息
• 適合批量購買
• 成功率相對較低

💰 <b>價格：</b>比全資庫便宜 30%-50%"""
        reply_markup = create_cards_keyboard()
        
    elif data == "main_special_cards":
        text = """🔥 <b>特價庫</b>
        
限時特價卡片：

🎯 <b>今日特價：</b>
• 美國卡：$2.5 → $1.8
• 德國卡：$3.0 → $2.2  
• 法國卡：$2.8 → $2.0

⏰ <b>活動時間：</b>24小時內有效
💡 <b>提示：</b>數量有限，先到先得"""
        reply_markup = create_cards_keyboard()
        
    elif data == "main_recharge":
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
        reply_markup = create_recharge_keyboard()
        
    elif data == "main_balance":
        text = f"""💳 <b>余額查詢</b>
        
👤 <b>用戶ID：</b>{user.id}
💰 <b>當前余額：</b>$0.00 USDT
💎 <b>可用余額：</b>$0.00 USDT
🎁 <b>贈送余額：</b>$0.00 USDT

📊 <b>消費記錄：</b>
• 今日消費：$0.00
• 本月消費：$0.00
• 總消費：$0.00

💡 <b>提示：</b>余額不足請及時充值"""
        reply_markup = create_main_keyboard()
        
    elif data == "main_merchant_base":
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
        reply_markup = create_main_keyboard()
        
    elif data == "back_main":
        # 返回主選單
        welcome_text = f"""🎯 <b>溫馨提示，售前必看！</b>

歡迎【{user.first_name}】機器人ID：【{user.id}】

🤖 GMS・24小時客服：@GMS_CVV_55
🤖 GMS・官方頻道：@CVV2D3Dsystem1688
🤖 GMS・交流群：@GMSCVVCARDING555"""
        
        text = welcome_text
        reply_markup = create_main_keyboard()
        
    elif data.startswith("cards_"):
        country = data.replace("cards_", "")
        country_names = {
            'us': '🇺🇸 美國', 'gb': '🇬🇧 英國', 'ca': '🇨🇦 加拿大',
            'au': '🇦🇺 澳洲', 'de': '🇩🇪 德國', 'fr': '🇫🇷 法國',
            'jp': '🇯🇵 日本'
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

💡 <b>購買數量選擇：</b>"""

        # 創建購買數量鍵盤
        keyboard = [
            [
                InlineKeyboardButton("💳 購買 1 張", callback_data=f"buy_{country}_1"),
                InlineKeyboardButton("💳 購買 5 張", callback_data=f"buy_{country}_5"),
                InlineKeyboardButton("💳 購買 10 張", callback_data=f"buy_{country}_10")
            ],
            [
                InlineKeyboardButton("💳 購買 20 張", callback_data=f"buy_{country}_20"),
                InlineKeyboardButton("💳 購買 50 張", callback_data=f"buy_{country}_50"),
                InlineKeyboardButton("💳 自定義數量", callback_data=f"buy_{country}_custom")
            ],
            [
                InlineKeyboardButton("📊 查看詳情", callback_data=f"details_{country}"),
                InlineKeyboardButton("🔙 返回卡片", callback_data="main_all_cards"),
                InlineKeyboardButton("⭐ 加入收藏", callback_data=f"favorite_{country}")
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
    elif data.startswith("recharge_"):
        amount = data.replace("recharge_", "")
        if amount == "custom":
            text = "💰 自定義充值金額\n\n請輸入您要充值的金額（最低 $10 USDT）："
        else:
            text = f"💰 充值 ${amount} USDT\n\n正在生成支付地址，請稍候..."
        reply_markup = create_recharge_keyboard()
        
    elif data.startswith("buy_"):
        parts = data.split("_")
        country = parts[1]
        quantity = parts[2]
        text = f"💳 購買 {quantity} 張 {country.upper()} 卡片\n\n功能開發中，請聯繫客服..."
        reply_markup = create_main_keyboard()
        
    else:
        text = f"功能開發中：{data}\n\n請聯繫客服獲取幫助"
        reply_markup = create_main_keyboard()
    
    try:
        await query.edit_message_text(
            text=text,
            parse_mode='HTML',
            reply_markup=reply_markup
        )
    except Exception as e:
        # 如果編輯失敗，發送新消息
        await query.message.reply_text(
            text=text,
            parse_mode='HTML',
            reply_markup=reply_markup
        )

def main():
    """主函數"""
    print('🎯 啟動正式版 CVV Bot')
    print('✨ 支持 3x3 原生內嵌鍵盤')
    print(f'🤖 Bot Token: {TOKEN[:20]}...' if TOKEN else '❌ 沒有找到 Bot Token')
    
    if not TOKEN:
        print('❌ 請設置 TELEGRAM_BOT_TOKEN 環境變數')
        return
    
    # 創建應用程式
    application = Application.builder().token(TOKEN).build()
    
    # 添加處理器
    application.add_handler(CommandHandler('start', start_command))
    application.add_handler(CallbackQueryHandler(button_callback))
    
    print('✅ Bot 正在運行')
    print('💡 發送 /start 查看 3x3 內嵌鍵盤')
    print('🔥 按 Ctrl+C 停止')
    print('=' * 50)
    
    # 開始輪詢
    application.run_polling(drop_pending_updates=True)

if __name__ == '__main__':
    main()
