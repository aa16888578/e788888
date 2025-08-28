#!/usr/bin/env python3
"""
最簡單的 3x3 內嵌鍵盤 Bot - 立即可用
"""
import asyncio
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler

# 您的 Bot Token
TOKEN = "8469518342:AAHeryk_9wcaU6jYdrh7kzmFCfyFr5MIp-M"

async def start(update: Update, context):
    """顯示 3x3 內嵌鍵盤"""
    keyboard = [
        [
            InlineKeyboardButton("💎 全資庫", callback_data="1"),
            InlineKeyboardButton("🎓 裸資庫", callback_data="2"),
            InlineKeyboardButton("🔥 特價庫", callback_data="3")
        ],
        [
            InlineKeyboardButton("🌍 全球卡頭", callback_data="4"),
            InlineKeyboardButton("🔍 卡頭查詢", callback_data="5"),
            InlineKeyboardButton("🏪 商家基地", callback_data="6")
        ],
        [
            InlineKeyboardButton("💰 充值", callback_data="7"),
            InlineKeyboardButton("💳 余額查詢", callback_data="8"),
            InlineKeyboardButton("🇺🇸 English", callback_data="9")
        ]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "🎯 CVV Bot - 3x3 內嵌鍵盤\n\n選擇一個功能：",
        reply_markup=reply_markup
    )

async def button_click(update: Update, context):
    """處理按鈕點擊"""
    query = update.callback_query
    await query.answer()
    
    button_map = {
        "1": "💎 全資庫功能",
        "2": "🎓 裸資庫功能", 
        "3": "🔥 特價庫功能",
        "4": "🌍 全球卡頭功能",
        "5": "🔍 卡頭查詢功能",
        "6": "🏪 商家基地功能",
        "7": "💰 充值功能",
        "8": "💳 余額查詢功能",
        "9": "🇺🇸 English功能"
    }
    
    text = f"您點擊了：{button_map.get(query.data, '未知')}"
    
    # 重新顯示鍵盤
    keyboard = [
        [
            InlineKeyboardButton("💎 全資庫", callback_data="1"),
            InlineKeyboardButton("🎓 裸資庫", callback_data="2"),
            InlineKeyboardButton("🔥 特價庫", callback_data="3")
        ],
        [
            InlineKeyboardButton("🌍 全球卡頭", callback_data="4"),
            InlineKeyboardButton("🔍 卡頭查詢", callback_data="5"),
            InlineKeyboardButton("🏪 商家基地", callback_data="6")
        ],
        [
            InlineKeyboardButton("💰 充值", callback_data="7"),
            InlineKeyboardButton("💳 余額查詢", callback_data="8"),
            InlineKeyboardButton("🇺🇸 English", callback_data="9")
        ]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(
        text=f"{text}\n\n繼續選擇：",
        reply_markup=reply_markup
    )

def main():
    app = Application.builder().token(TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(button_click))
    
    print("🎯 3x3 內嵌鍵盤 Bot 啟動！")
    print("發送 /start 查看鍵盤")
    
    app.run_polling()

if __name__ == "__main__":
    main()
