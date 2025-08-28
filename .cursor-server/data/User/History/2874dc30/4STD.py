#!/usr/bin/env python3
"""
CVV Bot - 回復鍵盤版本（輸入框下方的 3x3 鍵盤）
"""
import logging
from telegram import Update, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import Application, CommandHandler, MessageHandler, filters

# 設置日誌
logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 載入環境變數
from dotenv import load_dotenv
import os
load_dotenv()

TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')

def create_main_keyboard():
    """創建主選單 3x3 回復鍵盤 - 顯示在輸入框下方"""
    keyboard = [
        [
            KeyboardButton("全資庫"),
            KeyboardButton("裸資庫"),
            KeyboardButton("特價庫")
        ],
        [
            KeyboardButton("全球卡頭庫存"),
            KeyboardButton("卡頭查詢|購買"),
            KeyboardButton("🔥 商家基地")
        ],
        [
            KeyboardButton("充值"),
            KeyboardButton("余額查詢"),
            KeyboardButton("🇺🇸 English")
        ]
    ]
    return ReplyKeyboardMarkup(
        keyboard, 
        resize_keyboard=True,  # 自動調整鍵盤大小
        one_time_keyboard=False  # 鍵盤保持顯示
    )

def create_card_list_text():
    """創建卡片列表文字"""
    cards = [
        "AR_阿根廷🇦🇷_全資 40%-70% [2417]",
        "BH_巴林🇧🇭_全資 40%-70% [255]", 
        "BO_玻利維亞🇧🇴_55%-75% 💎 [2269]",
        "BR_巴西🇧🇷_20%-50% 💎 [28373]",
        "CL_智利🇨🇱_45%-75% 💎 [9848]",
        "CL_智利🇨🇱_全資 40%-70% [1169]",
        "DE_德國🇩🇪_頂級全資 50%-80% 🔥 [2109]",
        "DO_多米尼加🇩🇴_55%-75% 💎 [1475]",
        "EC_厄瓜多爾🇪🇨_40%-70% 💎 [2883]",
        "EE_愛沙尼亞🇪🇪_全資 55%-75% [451]",
        "ES_西班牙🇪🇸_50%-80% 💎 [22291]",
        "ES_西班牙🇪🇸_頂級全資 50%-80% 🔥 [7091]",
        "FI_芬蘭🇫🇮_頂級全資 55%-75% [594]",
        "FR_法國🇫🇷_40%-70% 💎 [16965]",
        "FR_法國🇫🇷_全資 40%-70% [9278]",
        "GB_英國🇬🇧_40%-70% 💎 [22320]"
    ]
    return "全資庫\n\n" + "\n".join(cards)

async def start_command(update: Update, context):
    """處理 /start 命令 - 顯示歡迎消息和 3x3 回復鍵盤"""
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
    
    reply_markup = create_main_keyboard()
    
    await update.message.reply_text(
        text=welcome_text,
        reply_markup=reply_markup
    )

async def handle_message(update: Update, context):
    """處理用戶點擊回復鍵盤按鈕發送的消息"""
    user = update.effective_user
    message_text = update.message.text
    
    reply_markup = create_main_keyboard()  # 保持鍵盤顯示
    
    if message_text == "全資庫":
        # 顯示卡片列表
        text = create_card_list_text()
        await update.message.reply_text(text=text, reply_markup=reply_markup)
        
    elif message_text == "裸資庫":
        text = "裸資庫\n\n暫無可用卡片"
        await update.message.reply_text(text=text, reply_markup=reply_markup)
        
    elif message_text == "特價庫":
        text = "特價庫\n\n暫無特價卡片"
        await update.message.reply_text(text=text, reply_markup=reply_markup)
        
    elif message_text == "全球卡頭庫存":
        text = "全球卡頭庫存\n\n功能開發中..."
        await update.message.reply_text(text=text, reply_markup=reply_markup)
        
    elif message_text == "卡頭查詢|購買":
        text = "卡頭查詢|購買\n\n功能開發中..."
        await update.message.reply_text(text=text, reply_markup=reply_markup)
        
    elif message_text == "🔥 商家基地":
        text = "🔥 商家基地\n\n功能開發中..."
        await update.message.reply_text(text=text, reply_markup=reply_markup)
        
    elif message_text == "充值":
        text = "充值\n\n功能開發中..."
        await update.message.reply_text(text=text, reply_markup=reply_markup)
        
    elif message_text == "余額查詢":
        text = f"余額查詢\n\n用戶ID：{user.id}\n當前余額：$0.00 USDT"
        await update.message.reply_text(text=text, reply_markup=reply_markup)
        
    elif message_text == "🇺🇸 English":
        text = "🇺🇸 English\n\nEnglish version coming soon..."
        await update.message.reply_text(text=text, reply_markup=reply_markup)
        
    else:
        # 處理其他消息
        if "客服" in message_text or "help" in message_text.lower():
            text = """📞 客服聯繫方式

• Telegram: @GMS_CVV_55
• 頻道: @CVV2D3Dsystem1688  
• 交流群: @GMSCVVCARDING555

客服在線時間: 24小時"""
        else:
            text = f"收到消息: {message_text}\n\n請使用下方按鈕選擇功能"
            
        await update.message.reply_text(text=text, reply_markup=reply_markup)

def main():
    """主函數"""
    print('🎯 啟動 CVV Bot - 回復鍵盤版本')
    print('✨ 3x3 鍵盤顯示在輸入框下方')
    print(f'🤖 Bot Token: {TOKEN[:20]}...' if TOKEN else '❌ 沒有找到 Bot Token')
    
    if not TOKEN:
        print('❌ 請設置 TELEGRAM_BOT_TOKEN 環境變數')
        return
    
    # 創建應用程式
    application = Application.builder().token(TOKEN).build()
    
    # 添加處理器
    application.add_handler(CommandHandler('start', start_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    print('✅ Bot 正在運行')
    print('💡 發送 /start 查看輸入框下方的 3x3 鍵盤')
    print('🔥 按 Ctrl+C 停止')
    print('=' * 50)
    
    # 開始輪詢
    application.run_polling(drop_pending_updates=True)

if __name__ == '__main__':
    main()
