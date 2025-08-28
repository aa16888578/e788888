#!/usr/bin/env python3
"""
恢復回覆鍵盤工具
"""
import asyncio
from telegram import Bot, ReplyKeyboardMarkup

BOT_TOKEN = "8469518342:AAG7odEC49CcWeBr6eJ9GbjGdFl5SzlwL54"

# 管理員 ID
ADMIN_IDS = [5931779846, 7046315762]

def create_main_keyboard():
    """創建主選單回覆鍵盤"""
    keyboard = [
        ["💳 全資庫", "🎯 裸資庫", "🔥 特價庫"],
        ["📊 全球庫存", "🔍 搜索卡片"],
        ["💰 充值中心", "💳 餘額查詢"],
        ["👥 代理專區", "🌐 語言"],
        ["🖥️ 前端系統", "📋 入庫分類"]
    ]
    return ReplyKeyboardMarkup(
        keyboard, 
        resize_keyboard=True, 
        one_time_keyboard=False,
        input_field_placeholder="選擇功能..."
    )

async def restore_keyboard():
    """恢復回覆鍵盤"""
    bot = Bot(token=BOT_TOKEN)
    
    message_text = """🔄 <b>回覆鍵盤已恢復！</b>

⌨️ <b>您的回覆鍵盤已重新載入</b>

🎯 <b>可用功能：</b>
• 💳 CVV 卡片管理
• 💰 充值和餘額查詢
• 👥 代理商功能
• 🖥️ 前端系統訪問
• 📋 入庫分類系統

💡 <b>提示：</b>如果鍵盤再次消失，請發送 /start 命令"""
    
    for admin_id in ADMIN_IDS:
        try:
            await bot.send_message(
                chat_id=admin_id,
                text=message_text,
                parse_mode='HTML',
                reply_markup=create_main_keyboard()
            )
            print(f"✅ 回覆鍵盤已發送給管理員 {admin_id}")
        except Exception as e:
            print(f"❌ 發送失敗 (管理員 {admin_id}): {e}")

if __name__ == "__main__":
    print("🔄 正在恢復回覆鍵盤...")
    asyncio.run(restore_keyboard())
    print("✅ 完成！")
