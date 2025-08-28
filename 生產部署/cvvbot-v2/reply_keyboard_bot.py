#!/usr/bin/env python3
"""
CVV Telegram Bot - 使用回覆鍵盤版本
"""
import os
import asyncio
import logging
import random
from telegram import Update, ReplyKeyboardMarkup, ReplyKeyboardRemove
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# 設置日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Bot Token
BOT_TOKEN = "8469518342:AAG7odEC49CcWeBr6eJ9GbjGdFl5SzlwL54"

def create_main_keyboard():
    """創建主選單回覆鍵盤"""
    keyboard = [
        ["💳 全資庫", "🎯 裸資庫", "🔥 特價庫"],
        ["📊 全球庫存", "🔍 搜索卡片"],
        ["💰 充值中心", "💳 餘額查詢"],
        ["👥 代理專區", "🌐 語言"]
    ]
    return ReplyKeyboardMarkup(
        keyboard, 
        resize_keyboard=True, 
        one_time_keyboard=False,
        input_field_placeholder="選擇功能..."
    )

def create_card_type_keyboard():
    """創建卡片類型選擇鍵盤"""
    keyboard = [
        ["🇺🇸 美國", "🇬🇧 英國", "🇨🇦 加拿大"],
        ["🇦🇷 阿根廷", "🇧🇷 巴西", "🇩🇪 德國"],
        ["🇫🇷 法國", "🇮🇹 意大利", "🇪🇸 西班牙"],
        ["🔙 返回主選單"]
    ]
    return ReplyKeyboardMarkup(
        keyboard, 
        resize_keyboard=True, 
        one_time_keyboard=False
    )

def create_recharge_keyboard():
    """創建充值金額鍵盤"""
    keyboard = [
        ["💵 $10", "💵 $50", "💵 $100"],
        ["💵 $500", "💵 $1000"],
        ["💎 自定義金額"],
        ["🔙 返回主選單"]
    ]
    return ReplyKeyboardMarkup(
        keyboard, 
        resize_keyboard=True, 
        one_time_keyboard=False
    )

def create_agent_keyboard():
    """創建代理商功能鍵盤"""
    keyboard = [
        ["📊 代理統計", "👥 團隊管理"],
        ["💰 收益查詢", "💳 申請提現"],
        ["🔗 推薦鏈接", "📈 升級等級"],
        ["🔙 返回主選單"]
    ]
    return ReplyKeyboardMarkup(
        keyboard, 
        resize_keyboard=True, 
        one_time_keyboard=False
    )

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """處理 /start 命令"""
    user_id = update.effective_user.id
    username = update.effective_user.username or "無用戶名"
    first_name = update.effective_user.first_name or "無名稱"
    
    # 記錄用戶信息（用於設置管理員）
    logger.info(f"👤 用戶啟動 Bot - ID: {user_id}, 用戶名: @{username}, 名稱: {first_name}")
    
    welcome_text = f"""🎉 <b>歡迎使用 CVV Bot！</b>

👤 <b>用戶信息:</b>
• ID: {user_id}
• 用戶名: @{username}
• 名稱: {first_name}

🔥 <b>我們是專業的 CVV 交易平台</b>
✅ 全球最新 CVV 卡片
✅ 實時庫存更新  
✅ 24/7 自動發卡
✅ 安全加密保護

💎 <b>請選擇您需要的服務：</b>

💡 <b>提示:</b> 如果回覆鍵盤消失，請發送 /keyboard 恢復"""

    await update.message.reply_text(
        welcome_text,
        parse_mode='HTML',
        reply_markup=create_main_keyboard()
    )

async def restore_keyboard_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """處理 /keyboard 命令，恢復回覆鍵盤"""
    user_id = update.effective_user.id
    logger.info(f"👤 用戶 {user_id} 請求恢復鍵盤")
    
    restore_text = """⌨️ <b>回覆鍵盤已恢復！</b>

✅ <b>您的功能鍵盤已重新載入</b>

🎯 <b>可用功能：</b>
• 💳 CVV 卡片管理 (全資庫、裸資庫、特價庫)
• 📊 庫存和搜索功能
• 💰 充值和餘額管理
• 👥 代理商專區
• 🖥️ 前端管理系統
• 📋 AI 入庫分類系統

💡 <b>使用方法：</b>點擊下方按鈕即可使用對應功能"""

    await update.message.reply_text(
        restore_text,
        parse_mode='HTML',
        reply_markup=create_main_keyboard()
    )

async def get_ai_filtered_data(category: str) -> dict:
    """模擬 AI 分類系統數據獲取"""
    # 模擬不同類別的數據
    if category == "all_cards":
        return {
            'total_count': random.randint(150, 300),
            'avg_price': round(random.uniform(25.0, 45.0), 2),
            'avg_success_rate': random.randint(80, 95),
            'quality_score': random.randint(85, 98),
            'recommendation': '推薦選擇美國和加拿大地區的高品質卡片，成功率超過 90%',
            'top_bins': '453201 (Chase Bank), 542312 (Bank of America), 411234 (Wells Fargo)',
            'top_countries': '🇺🇸 美國 (45%), 🇨🇦 加拿大 (25%), 🇬🇧 英國 (20%)',
            'risk_assessment': '低風險 - 高品質卡片，適合批量購買'
        }
    elif category == "global_inventory":
        return {
            'total_count': random.randint(500, 800),
            'avg_price': round(random.uniform(15.0, 35.0), 2),
            'avg_success_rate': random.randint(70, 85),
            'quality_score': random.randint(75, 90),
            'recommendation': '全球庫存豐富，建議選擇歐美地區卡片獲得更好成功率',
            'top_bins': '434567 (HSBC), 515234 (RBC), 478901 (Capital One)',
            'top_countries': '🇺🇸 美國 (30%), 🇬🇧 英國 (25%), 🇩🇪 德國 (20%), 🇫🇷 法國 (15%)',
            'risk_assessment': '中等風險 - 品質參差不齊，建議仔細篩選'
        }
    else:
        return {
            'total_count': random.randint(50, 150),
            'avg_price': round(random.uniform(20.0, 40.0), 2),
            'avg_success_rate': random.randint(75, 90),
            'quality_score': random.randint(80, 95),
            'recommendation': '精選卡片，品質穩定',
            'top_bins': '多種銀行可選',
            'top_countries': '覆蓋主要國家',
            'risk_assessment': '風險可控'
        }

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """處理用戶消息"""
    text = update.message.text
    user_id = update.effective_user.id
    
    if text == "💳 全資庫":
        # 調用 AI 分類系統獲取智能篩選結果
        ai_data = await get_ai_filtered_data("all_cards")
        
        response_text = f"""💳 <b>全資庫 - AI 智能篩選</b>

🤖 <b>AI 分析結果:</b>
• 總卡片數: {ai_data['total_count']} 張
• 平均價格: ${ai_data['avg_price']} USDT
• 平均成功率: {ai_data['avg_success_rate']}%
• AI 品質評分: {ai_data['quality_score']}/100

🌟 <b>AI 推薦:</b>
{ai_data['recommendation']}

🏦 <b>熱門銀行 BIN:</b>
{ai_data['top_bins']}

🌍 <b>覆蓋國家:</b>
{ai_data['top_countries']}

💡 <b>風險評估:</b> {ai_data['risk_assessment']}

🔗 <b>查看完整列表:</b> http://localhost:3000/cards/all-cards"""
        
        await update.message.reply_text(
            response_text,
            parse_mode='HTML',
            reply_markup=create_card_type_keyboard()
        )
        
    elif text == "🎯 裸資庫":
        response_text = """🎯 <b>裸資庫 - 原始數據</b>

📚 <b>適用於：</b>
• 原始 CVV 數據
• 未處理卡片信息
• 技術開發測試

💰 <b>價格: $1.50-2.80</b>
📊 <b>成功率: 60-75%</b>

<b>請選擇國家：</b>"""
        
        await update.message.reply_text(
            response_text,
            parse_mode='HTML',
            reply_markup=create_card_type_keyboard()
        )
        
    elif text == "🔥 特價庫":
        response_text = """🔥 <b>特價庫 - 限時優惠</b>

⚡ <b>今日特價：</b>
🇦🇷 阿根廷 - $2.20 (原價$3.50)
🇧🇷 巴西 - $2.80 (原價$4.20)
🇲🇽 墨西哥 - $2.50 (原價$3.80)

⏰ <b>限時24小時</b>
🔥 <b>數量有限，售完即止！</b>

<b>請選擇國家：</b>"""
        
        await update.message.reply_text(
            response_text,
            parse_mode='HTML',
            reply_markup=create_card_type_keyboard()
        )
        
    elif text == "📊 全球庫存":
        # 調用 AI 分類系統獲取全球庫存數據
        ai_data = await get_ai_filtered_data("global_inventory")
        
        response_text = f"""📊 <b>全球庫存 - AI 智能統計</b>

🤖 <b>AI 實時分析:</b>
• 全球總庫存: {ai_data['total_count']} 張
• 平均價格: ${ai_data['avg_price']} USDT
• 整體成功率: {ai_data['avg_success_rate']}%
• AI 品質評分: {ai_data['quality_score']}/100

🌟 <b>AI 建議:</b>
{ai_data['recommendation']}

🏦 <b>主要銀行 BIN:</b>
{ai_data['top_bins']}

🌍 <b>地區分佈:</b>
{ai_data['top_countries']}

⚠️ <b>風險提醒:</b> {ai_data['risk_assessment']}

📈 <b>實時更新中...</b>
🔗 <b>詳細分析:</b> http://localhost:3000/inventory/global"""
        
        await update.message.reply_text(
            response_text,
            parse_mode='HTML',
            reply_markup=create_main_keyboard()
        )
        
    elif text == "🔍 搜索卡片":
        response_text = """🔍 <b>搜索卡片</b>

🎯 <b>搜索方式：</b>
• 按國家搜索
• 按價格範圍搜索
• 按成功率搜索
• 按銀行類型搜索

💡 <b>提示：</b>選擇國家後可查看詳細信息

<b>請選擇國家：</b>"""
        
        await update.message.reply_text(
            response_text,
            parse_mode='HTML',
            reply_markup=create_card_type_keyboard()
        )
        
    elif text == "💰 充值中心":
        response_text = """💰 <b>充值中心</b>

💎 <b>支付方式: USDT-TRC20</b>

💵 <b>快速充值金額：</b>
• $10 USDT - 新手推薦
• $50 USDT - 小量購買
• $100 USDT - 常用金額
• $500 USDT - 批量購買
• $1000 USDT - VIP 用戶
• 自定義金額

⚡ <b>到賬時間: 1-3分鐘</b>
🔒 <b>安全加密保護</b>

<b>請選擇充值金額：</b>"""
        
        await update.message.reply_text(
            response_text,
            parse_mode='HTML',
            reply_markup=create_recharge_keyboard()
        )
        
    elif text == "💳 餘額查詢":
        response_text = f"""💳 <b>餘額查詢</b>

👤 <b>用戶ID:</b> {user_id}
💰 <b>當前餘額:</b> $125.50 USDT
📊 <b>今日消費:</b> $45.20 USDT
🛒 <b>總購買:</b> 23 張卡片

📈 <b>本月統計:</b>
• 購買次數: 156 次
• 總消費: $1,245.80 USDT
• 成功率: 89.5%

💎 <b>VIP 等級:</b> 銀牌會員
🎁 <b>下次升級還需:</b> $254.50 USDT"""
        
        await update.message.reply_text(
            response_text,
            parse_mode='HTML',
            reply_markup=create_main_keyboard()
        )
        
    elif text == "👥 代理專區":
        response_text = """👥 <b>代理專區 - 代理商系統</b>

🏆 <b>代理商等級制度：</b>
⭐ 1級代理 - 5% 佣金
⭐⭐ 2級代理 - 8% 佣金  
⭐⭐⭐ 3級代理 - 12% 佣金
⭐⭐⭐⭐ 4級代理 - 15% 佣金
⭐⭐⭐⭐⭐ 5級代理 - 18% 佣金

💰 <b>月收入可達 $5,000+</b>
🎯 <b>無風險，高回報</b>
📈 <b>團隊裂變，收益翻倍</b>

<b>代理商功能：</b>"""
        
        await update.message.reply_text(
            response_text,
            parse_mode='HTML',
            reply_markup=create_agent_keyboard()
        )
        
    elif text in ["🇺🇸 美國", "🇬🇧 英國", "🇨🇦 加拿大", "🇦🇷 阿根廷", "🇧🇷 巴西", "🇩🇪 德國", "🇫🇷 法國", "🇮🇹 意大利", "🇪🇸 西班牙"]:
        country = text[2:]  # 移除國旗emoji
        response_text = f"""🌍 <b>{country} CVV 卡片</b>

💳 <b>可用卡片：</b>
• Visa: 234 張 - $3.50
• MasterCard: 189 張 - $3.80
• American Express: 67 張 - $4.20

📊 <b>統計信息：</b>
• 平均成功率: 87.5%
• 今日銷量: 45 張
• 庫存更新: 5分鐘前

💰 <b>價格範圍: $3.50 - $4.20</b>
⚡ <b>自動發卡: 1-3分鐘</b>

🛒 <b>購買方式：</b>
1. 確認餘額充足
2. 選擇卡片數量
3. 自動扣款發卡

<b>確認購買嗎？</b>"""
        
        keyboard = [
            ["✅ 購買 1張", "✅ 購買 5張", "✅ 購買 10張"],
            ["🔙 返回選擇", "🔙 返回主選單"]
        ]
        reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
        
        await update.message.reply_text(
            response_text,
            parse_mode='HTML',
            reply_markup=reply_markup
        )
        
    elif text.startswith("✅ 購買"):
        quantity = text.split()[1].replace("張", "")
        response_text = f"""✅ <b>購買成功！</b>

📦 <b>訂單信息：</b>
• 數量: {quantity} 張
• 總價: ${float(quantity) * 3.5:.2f} USDT
• 訂單號: CVV{user_id}_{quantity}

💳 <b>卡片信息：</b>"""
        
        # 模擬生成卡片信息
        for i in range(int(quantity)):
            response_text += f"""
<b>卡片 {i+1}:</b>
• 卡號: 4532*********{1234+i}
• 有效期: 12/26
• CVV: {123+i}
• 銀行: Chase Bank"""
        
        response_text += """

⚠️ <b>使用說明：</b>
• 請妥善保管卡片信息
• 建議盡快使用，避免過期
• 如有問題請聯繫客服

🔒 <b>為了您的安全，此信息只顯示一次</b>"""
        
        await update.message.reply_text(
            response_text,
            parse_mode='HTML',
            reply_markup=create_main_keyboard()
        )
        
    elif text == "🔙 返回主選單":
        await start_command(update, context)
        
    elif text == "🌐 語言":
        response_text = """🌐 <b>語言設置</b>

🗣️ <b>可選語言：</b>
🇨🇳 中文（繁體） - 當前使用
🇺🇸 English - 英語
🇯🇵 日本語 - 日語  
🇰🇷 한국어 - 韓語
🇪🇸 Español - 西班牙語
🇫🇷 Français - 法語

💡 <b>提示：</b>語言切換功能開發中
目前僅支持繁體中文

<b>更多語言即將推出！</b>"""
        
        await update.message.reply_text(
            response_text,
            parse_mode='HTML',
            reply_markup=create_main_keyboard()
        )
        

    elif text == "🔙 返回選擇":
        await update.message.reply_text(
            "請選擇國家：",
            reply_markup=create_card_type_keyboard()
        )
        
    else:
        # 處理其他功能按鈕
        response_text = f"🔧 <b>{text}</b>\n\n功能開發中，敬請期待！"
        await update.message.reply_text(
            response_text,
            parse_mode='HTML',
            reply_markup=create_main_keyboard()
        )

async def send_restart_notification(application):
    """發送重啟通知消息"""
    try:
        from datetime import datetime
        
        # 管理員 ID (從環境變量或配置文件讀取)
        # 如果沒有設置，將發送給第一個使用 /start 的用戶
        ADMIN_IDS = []
        
        # 嘗試從文件讀取管理員 ID
        try:
            with open('admin_ids.txt', 'r') as f:
                for line in f:
                    admin_id = line.strip()
                    if admin_id.isdigit():
                        ADMIN_IDS.append(int(admin_id))
        except FileNotFoundError:
            # 如果沒有管理員 ID 文件，跳過通知
            logger.info("⚠️ 未找到 admin_ids.txt 文件，跳過重啟通知")
            return
        
        # 風趣的重啟消息列表
        funny_messages = [
            f"""🚀 <b>哎呀！CVV Bot 又活過來啦！</b>

⏰ <b>復活時間:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
🤖 <b>患者:</b> @e7_69testbot
💊 <b>治療方式:</b> 重啟大法 + 回覆鍵盤療法
✅ <b>病情:</b> 已完全康復，生龍活虎！

🏥 <b>體檢報告:</b>
• 心臟（API）: 砰砰跳動 💓
• 大腦（數據庫）: 思維清晰 🧠
• 四肢（功能）: 活動自如 🦾

🎉 <b>可以愉快地賣卡片啦！</b>""",
            
            f"""🎭 <b>CVV Bot 表演重啟魔術！</b>

⏰ <b>魔術時間:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
🎩 <b>魔術師:</b> @e7_69testbot
✨ <b>魔術類型:</b> 瞬間重生術（回覆鍵盤版）
🎪 <b>表演結果:</b> 完美成功！觀眾掌聲雷動！

🎯 <b>魔術道具檢查:</b>
• 魔法棒（API）: 閃閃發光 ⚡
• 魔術帽（數據庫）: 裡面藏著無數卡片 🎩
• 舞台（系統）: 燈光璀璨 🌟

🎊 <b>下一場表演：賣卡大戲即將開始！</b>""",
            
            f"""🍕 <b>CVV Bot 剛吃完披薩回來上班！</b>

⏰ <b>上班時間:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
👨‍💻 <b>員工:</b> @e7_69testbot
🍽️ <b>午餐:</b> 意大利披薩 + 回覆鍵盤沙拉
😋 <b>心情:</b> 吃飽喝足，精神百倍！

💼 <b>工作狀態檢查:</b>
• 咖啡機（API）: 香濃可口 ☕
• 辦公桌（數據庫）: 整理得井井有條 📋
• 工作效率（功能）: 200% 爆表！ 📈

🎯 <b>今日目標：讓客戶買到滿意的卡片！</b>"""
        ]
        
        import random
        restart_message = random.choice(funny_messages)

        for admin_id in ADMIN_IDS:
            try:
                await application.bot.send_message(
                    chat_id=admin_id,
                    text=restart_message,
                    parse_mode='HTML'
                )
                logger.info(f"✅ 重啟通知已發送給管理員 {admin_id}")
            except Exception as e:
                logger.warning(f"⚠️ 發送重啟通知失敗 (管理員 {admin_id}): {e}")
                
    except Exception as e:
        logger.error(f"❌ 發送重啟通知時發生錯誤: {e}")

async def main():
    """主函數"""
    # 🎭 風趣開場系統
    startup_themes = [
        "🚀 倒數計時開始... 3... 2... 1...\n🔥 點火！CVV Bot 正在升空！\n🌍 突破大氣層，進入軌道！\n⭐ 成功對接國際空間站！\n✅ CVV Bot 已成功部署到太空！\n🌌 現在可以從任何地方訪問我們的服務了！",
        
        "🎪 歡迎來到 CVV Bot 馬戲團！\n🎭 讓我們開始今天的精彩表演！\n🤹 首先是我們的招牌節目：AI分類雜技！\n🎨 接下來是鍵盤魔術表演！\n🎪 最後是我們的壓軸好戲：CVV交易！\n👏 掌聲歡迎 CVV Bot 正式開幕！",
        
        "🎭 燈光！攝影機！開始！\n🌟 在一個遙遠的數位世界裡...\n⚡ 一道閃電劃過天際！\n🌪️ 風起雲湧，數據如潮水般湧來！\n💫 突然，一個聲音響起：\n🎪 '歡迎來到 CVV Bot 的傳奇世界！'\n👑 在這裡，每個交易都是史詩！\n🎬 讓我們開始今天的傳奇故事！",
        
        "🎨 藝術家風格啟動中...\n🎭 優雅的代碼在舞動\n💫 每個函數都是詩篇\n🌟 每個API都是畫作\n🎪 CVV Bot 藝術展正式開幕！\n👑 讓我們用創意點亮數位世界！",
        
        "🎲 命運之輪開始轉動...\n🎯 隨機選擇啟動模式\n🌟 今天的主題是：驚喜！\n💫 準備好接受意外的美好嗎？\n🎪 CVV Bot 隨機模式啟動！\n🎭 讓我們一起探索未知的可能！"
    ]
    
    # 隨機選擇開場主題
    startup_message = random.choice(startup_themes)
    logger.info("🎭 風趣開場系統啟動！")
    logger.info(startup_message)
    
    logger.info("🚀 啟動 CVV Telegram Bot (回覆鍵盤版)...")
    logger.info("🤖 Bot: @e7_69testbot")
    logger.info("⌨️ 使用回覆鍵盤模式")
    
    # 創建應用程序
    application = Application.builder().token(BOT_TOKEN).build()
    
    # 添加處理器
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("keyboard", restore_keyboard_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    # 啟動 Bot
    await application.initialize()
    await application.start()
    
    logger.info("✅ CVV Telegram Bot 啟動成功！")
    logger.info("💡 發送 /start 給 @e7_69testbot 開始使用")
    
    # 發送重啟通知
    await send_restart_notification(application)
    
    # 開始輪詢
    await application.updater.start_polling()
    
    try:
        # 保持運行
        await asyncio.Event().wait()
    except KeyboardInterrupt:
        logger.info("⏹️ 收到停止信號")
    finally:
        await application.updater.stop()
        await application.stop()
        await application.shutdown()
        logger.info("🛑 CVV Telegram Bot 已停止")

if __name__ == "__main__":
    asyncio.run(main())
