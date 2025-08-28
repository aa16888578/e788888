#!/usr/bin/env python3
"""
CVV Bot 最終版 - 完全按照截圖實現
"""
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler

# 設置日誌
logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 載入環境變數
from dotenv import load_dotenv
import os
load_dotenv()

TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')

def create_main_menu():
    """創建主選單 - 完全按照截圖的 3x3 佈局"""
    keyboard = [
        [
            InlineKeyboardButton("全資庫", callback_data="all_cards"),
            InlineKeyboardButton("裸資庫", callback_data="naked_cards"),
            InlineKeyboardButton("特價庫", callback_data="special_cards")
        ],
        [
            InlineKeyboardButton("全球卡頭庫存", callback_data="global_bin"),
            InlineKeyboardButton("卡頭查詢|購買", callback_data="bin_search"),
            InlineKeyboardButton("🔥 商家基地", callback_data="merchant_base")
        ],
        [
            InlineKeyboardButton("充值", callback_data="recharge"),
            InlineKeyboardButton("余額查詢", callback_data="balance"),
            InlineKeyboardButton("🇺🇸 English", callback_data="english")
        ]
    ]
    return InlineKeyboardMarkup(keyboard)

def create_card_list():
    """創建卡片列表 - 完全按照截圖顯示真實卡片"""
    cards_data = [
        ("AR_阿根廷🇦🇷_全資 40%-70% [2417]", "card_ar"),
        ("BH_巴林🇧🇭_全資 40%-70% [255]", "card_bh"),
        ("BO_玻利維亞🇧🇴_55%-75% 💎 [2269]", "card_bo"),
        ("BR_巴西🇧🇷_20%-50% 💎 [28373]", "card_br"),
        ("CL_智利🇨🇱_45%-75% 💎 [9848]", "card_cl"),
        ("CL_智利🇨🇱_全資 40%-70% [1169]", "card_cl2"),
        ("DE_德國🇩🇪_頂級全資 50%-80% 🔥 [2109]", "card_de"),
        ("DO_多米尼加🇩🇴_55%-75% 💎 [1475]", "card_do"),
        ("EC_厄瓜多爾🇪🇨_40%-70% 💎 [2883]", "card_ec"),
        ("EE_愛沙尼亞🇪🇪_全資 55%-75% [451]", "card_ee"),
        ("ES_西班牙🇪🇸_50%-80% 💎 [22291]", "card_es"),
        ("ES_西班牙🇪🇸_頂級全資 50%-80% 🔥 [7091]", "card_es2"),
        ("FI_芬蘭🇫🇮_頂級全資 55%-75% [594]", "card_fi"),
        ("FR_法國🇫🇷_40%-70% 💎 [16965]", "card_fr"),
        ("FR_法國🇫🇷_全資 40%-70% [9278]", "card_fr2"),
        ("GB_英國🇬🇧_40%-70% 💎 [22320]", "card_gb")
    ]
    
    keyboard = []
    for card_name, callback_data in cards_data:
        keyboard.append([InlineKeyboardButton(card_name, callback_data=callback_data)])
    
    # 添加返回按鈕
    keyboard.append([InlineKeyboardButton("🔙 返回主選單", callback_data="back_main")])
    
    return InlineKeyboardMarkup(keyboard)

async def start_command(update: Update, context):
    """處理 /start 命令 - 顯示完全按照截圖的歡迎消息和 3x3 鍵盤"""
    user = update.effective_user
    
    welcome_text = f"""溫馨提示,售前必看！
歡迎【偉Wei】機器人ID：【{user.id}】
1.機器人所有數據均為一手資源；二手直接刪檔，
不出二手，直接賣完刪檔
2.購買請注意！機器人只支持USDT充值！卡號
錯誤.日期過期.全補.
3.GMS 永久承諾：充值未使用余額可以聯系客服
退款。(如果有贈送額度-需扣除贈送額度再退)
4.建議機器人用戶加入頻道，每天更新會在頻道
第一時間通知，更新有需要的卡頭可第一時間搶
先購買

機器人充值教程：https://t.me/
GMS_CHANNEL2/3
機器人使用教程：https://t.me/
GMS_CHANNEL2/4
購卡前注意事項：https://t.me/
GMS_CHANNEL2/8
售后規則-標準：https://t.me/
GMS_CHANNEL2/5

GMS・24小時客服：@GMS_CVV_55
GMS・官方頻道：@CVV2D3Dsystem1688
GMS・交流群：@GMSCVVCARDING555"""
    
    reply_markup = create_main_menu()
    
    await update.message.reply_text(
        text=welcome_text,
        reply_markup=reply_markup
    )

async def button_callback(update: Update, context):
    """處理按鈕點擊 - 完全按照截圖實現"""
    query = update.callback_query
    await query.answer()
    
    data = query.data
    user = query.from_user
    
    if data == "all_cards":
        # 顯示全資庫 - 完全按照第二張截圖
        text = "全資庫"
        reply_markup = create_card_list()
        
        await query.edit_message_text(
            text=text,
            reply_markup=reply_markup
        )
        
    elif data == "naked_cards":
        text = "裸資庫\n\n暫無可用卡片"
        reply_markup = create_main_menu()
        await query.edit_message_text(text=text, reply_markup=reply_markup)
        
    elif data == "special_cards":
        text = "特價庫\n\n暫無特價卡片"
        reply_markup = create_main_menu()
        await query.edit_message_text(text=text, reply_markup=reply_markup)
        
    elif data == "global_bin":
        text = "全球卡頭庫存\n\n功能開發中..."
        reply_markup = create_main_menu()
        await query.edit_message_text(text=text, reply_markup=reply_markup)
        
    elif data == "bin_search":
        text = "卡頭查詢|購買\n\n功能開發中..."
        reply_markup = create_main_menu()
        await query.edit_message_text(text=text, reply_markup=reply_markup)
        
    elif data == "merchant_base":
        text = "🔥 商家基地\n\n功能開發中..."
        reply_markup = create_main_menu()
        await query.edit_message_text(text=text, reply_markup=reply_markup)
        
    elif data == "recharge":
        text = "充值\n\n功能開發中..."
        reply_markup = create_main_menu()
        await query.edit_message_text(text=text, reply_markup=reply_markup)
        
    elif data == "balance":
        text = f"余額查詢\n\n用戶ID：{user.id}\n當前余額：$0.00 USDT"
        reply_markup = create_main_menu()
        await query.edit_message_text(text=text, reply_markup=reply_markup)
        
    elif data == "english":
        text = "🇺🇸 English\n\nEnglish version coming soon..."
        reply_markup = create_main_menu()
        await query.edit_message_text(text=text, reply_markup=reply_markup)
        
    elif data == "back_main":
        # 返回主選單 - 完全按照第三張截圖
        welcome_text = f"""溫馨提示,售前必看！
歡迎【偉Wei】機器人ID：【{user.id}】
1.機器人所有數據均為一手資源；二手直接刪檔，
不出二手，直接賣完刪檔
2.購買請注意！機器人只支持USDT充值！卡號
錯誤.日期過期.全補.
3.GMS 永久承諾：充值未使用余額可以聯系客服
退款。(如果有贈送額度-需扣除贈送額度再退)
4.建議機器人用戶加入頻道，每天更新會在頻道
第一時間通知，更新有需要的卡頭可第一時間搶
先購買

機器人充值教程：https://t.me/
GMS_CHANNEL2/3
機器人使用教程：https://t.me/
GMS_CHANNEL2/4
購卡前注意事項：https://t.me/
GMS_CHANNEL2/8
售后規則-標準：https://t.me/
GMS_CHANNEL2/5

GMS・24小時客服：@GMS_CVV_55
GMS・官方頻道：@CVV2D3Dsystem1688
GMS・交流群：@GMSCVVCARDING555"""
        
        reply_markup = create_main_menu()
        await query.edit_message_text(text=welcome_text, reply_markup=reply_markup)
        
    elif data.startswith("card_"):
        # 處理具體卡片點擊
        card_name = data.replace("card_", "").upper()
        text = f"您選擇了 {card_name} 卡片\n\n購買功能開發中，請聯繫客服..."
        
        keyboard = [
            [InlineKeyboardButton("🔙 返回卡片列表", callback_data="all_cards")],
            [InlineKeyboardButton("🏠 返回主選單", callback_data="back_main")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(text=text, reply_markup=reply_markup)
    
    else:
        text = f"功能開發中：{data}"
        reply_markup = create_main_menu()
        await query.edit_message_text(text=text, reply_markup=reply_markup)

def main():
    """主函數"""
    print('🎯 啟動 CVV Bot - 完全按照截圖實現')
    print('✨ 3x3 內嵌鍵盤 + 真實卡片列表')
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
    print('💡 發送 /start 查看完全按照截圖的效果')
    print('🔥 按 Ctrl+C 停止')
    print('=' * 50)
    
    # 開始輪詢
    application.run_polling(drop_pending_updates=True)

if __name__ == '__main__':
    main()
