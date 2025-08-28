"""
Telegram Bot API 端點
每個按鈕對應一個 API 端點
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.models.cvv import CVVCard, CVVStatus, CVVType
from app.models.user import User
from app.services.cvv_service import CVVService
from app.services.user_service import UserService
from app.services.payment_service import PaymentService
from pydantic import BaseModel

router = APIRouter(prefix="/telegram", tags=["Telegram Bot API"])

# === 請求/響應模型 ===
class TelegramUser(BaseModel):
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    language_code: str = "zh-tw"

class CVVCardResponse(BaseModel):
    id: int
    country_code: str
    country_name: str
    flag: str
    price: float
    success_rate: str
    stock: int
    cvv_type: str
    status: str

class InlineKeyboard(BaseModel):
    text: str
    callback_data: str

class TelegramResponse(BaseModel):
    message: str
    inline_keyboard: Optional[List[List[InlineKeyboard]]] = None
    parse_mode: str = "HTML"

# === API 端點 ===

@router.post("/welcome")
async def send_welcome_message(user: TelegramUser):
    """發送歡迎消息和主選單"""
    
    # 檢查/創建用戶
    user_service = UserService()
    db_user = await user_service.get_or_create_telegram_user(
        telegram_id=user.telegram_id,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name
    )
    
    welcome_text = f"""🎉 <b>溫馨提示.售前必看！</b>

👋 歡迎【{user.first_name or 'CVV用戶'}】機器人 ID:【{user.telegram_id}】

1.機器人所有數據均為一手資源；二手直接刪檔，不出二手，直接買完刪檔
2.購買請注意！機器人只支持 <b>USDT 充值</b>！卡號錯誤.日期過期.全補.
3.GMS 永久承諾：充值未使用餘額可以聯繫客服退款。(如果有贈送額度-需扣除贈送額度再退)
4.建議機器人用戶加入頻道，每天更新會在頻道第一時間通知，更新有需要的卡頭可第一時間搶先購買

<b>機器人充值教程:</b> https://t.me/GMS_CHANNEL2/3
<b>機器人使用教程:</b> https://t.me/GMS_CHANNEL2/4
<b>購卡前注意事項:</b> https://t.me/GMS_CHANNEL2/8
<b>售後規則 - 標準:</b> https://t.me/GMS_CHANNEL2/5

<b>GMS • 24小時客服:</b> @GMS_CVV_55
<b>GMS • 官方頻道:</b> @CVV2D3Dsystem1688
<b>GMS • 交流群:</b> @GMSCVVCARDING555"""

    # 創建內嵌鍵盤
    keyboard = [
        [
            InlineKeyboard(text="全資庫", callback_data="all_cards"),
            InlineKeyboard(text="課資庫", callback_data="course_cards"),
            InlineKeyboard(text="特價庫", callback_data="special_cards")
        ],
        [
            InlineKeyboard(text="全球卡頭庫存", callback_data="global_inventory"),
            InlineKeyboard(text="卡頭查詢|購買", callback_data="search_buy")
        ],
        [
            InlineKeyboard(text="🔥 商家基地", callback_data="merchant_base")
        ],
        [
            InlineKeyboard(text="充值", callback_data="recharge"),
            InlineKeyboard(text="餘額查詢", callback_data="balance_check")
        ],
        [
            InlineKeyboard(text="🇺🇸 English", callback_data="lang_en")
        ]
    ]
    
    return TelegramResponse(
        message=welcome_text,
        inline_keyboard=keyboard
    )

@router.get("/all_cards")
async def get_all_cards(telegram_id: int, page: int = 1, limit: int = 20):
    """全資庫 - 獲取所有 CVV 卡片"""
    
    cvv_service = CVVService()
    cards = await cvv_service.get_active_cards(
        page=page, 
        limit=limit,
        card_type=None
    )
    
    if not cards:
        return TelegramResponse(
            message="❌ 暫時沒有可用的卡片，請稍後再試。",
            inline_keyboard=[[InlineKeyboard(text="🔙 返回主選單", callback_data="main_menu")]]
        )
    
    # 格式化卡片列表
    card_text = "🌍 <b>全資庫</b>\n\n"
    keyboard = []
    
    for card in cards:
        # 添加卡片信息
        card_line = f"{card.country_code}_{card.country_name} {card.flag}_全資 {card.success_rate} 【{card.stock}】"
        card_text += f"• {card_line}\n"
        
        # 添加購買按鈕
        keyboard.append([
            InlineKeyboard(
                text=f"{card.country_code}_{card.country_name} - ${card.price} USDT",
                callback_data=f"buy_card_{card.id}"
            )
        ])
    
    # 添加導航按鈕
    nav_buttons = []
    if page > 1:
        nav_buttons.append(InlineKeyboard(text="⬅️ 上一頁", callback_data=f"all_cards_page_{page-1}"))
    nav_buttons.append(InlineKeyboard(text="➡️ 下一頁", callback_data=f"all_cards_page_{page+1}"))
    
    if nav_buttons:
        keyboard.append(nav_buttons)
    
    keyboard.append([InlineKeyboard(text="🔙 返回主選單", callback_data="main_menu")])
    
    return TelegramResponse(
        message=card_text,
        inline_keyboard=keyboard
    )

@router.get("/course_cards")
async def get_course_cards(telegram_id: int):
    """課資庫 - 課程相關卡片"""
    
    return TelegramResponse(
        message="📚 <b>課資庫</b>\n\n💡 課程資源功能開發中...\n\n請選擇其他功能使用。",
        inline_keyboard=[
            [InlineKeyboard(text="全資庫", callback_data="all_cards")],
            [InlineKeyboard(text="🔙 返回主選單", callback_data="main_menu")]
        ]
    )

@router.get("/special_cards")
async def get_special_cards(telegram_id: int):
    """特價庫 - 特價卡片"""
    
    cvv_service = CVVService()
    special_cards = await cvv_service.get_special_price_cards(limit=10)
    
    if not special_cards:
        return TelegramResponse(
            message="💎 <b>特價庫</b>\n\n❌ 暫時沒有特價商品。",
            inline_keyboard=[[InlineKeyboard(text="🔙 返回主選單", callback_data="main_menu")]]
        )
    
    card_text = "💎 <b>特價庫</b>\n\n"
    keyboard = []
    
    for card in special_cards:
        original_price = card.price * 1.2  # 假設特價是原價的80%
        discount = "20%"
        
        card_text += f"🔥 {card.country_code}_{card.country_name} {card.flag}\n"
        card_text += f"   原價: ${original_price:.1f} → 特價: ${card.price} (-{discount})\n"
        card_text += f"   成功率: {card.success_rate} 庫存: [{card.stock}]\n\n"
        
        keyboard.append([
            InlineKeyboard(
                text=f"🔥 {card.country_code} - ${card.price} USDT",
                callback_data=f"buy_card_{card.id}"
            )
        ])
    
    keyboard.append([InlineKeyboard(text="🔙 返回主選單", callback_data="main_menu")])
    
    return TelegramResponse(
        message=card_text,
        inline_keyboard=keyboard
    )

@router.get("/global_inventory")
async def get_global_inventory(telegram_id: int):
    """全球卡頭庫存 - 庫存統計"""
    
    cvv_service = CVVService()
    inventory = await cvv_service.get_inventory_stats()
    
    inventory_text = "🌐 <b>全球卡頭庫存</b>\n\n"
    inventory_text += f"📊 <b>總庫存統計</b>\n"
    inventory_text += f"• 總卡片數: {inventory.get('total_cards', 0):,}\n"
    inventory_text += f"• 可用卡片: {inventory.get('active_cards', 0):,}\n"
    inventory_text += f"• 國家/地區: {inventory.get('countries', 0)}\n\n"
    
    inventory_text += f"🔥 <b>熱門國家</b>\n"
    for country in inventory.get('top_countries', []):
        inventory_text += f"• {country['flag']} {country['name']}: {country['count']:,} 張\n"
    
    keyboard = [
        [
            InlineKeyboard(text="🛒 瀏覽全部", callback_data="all_cards"),
            InlineKeyboard(text="🔍 搜索卡片", callback_data="search_buy")
        ],
        [InlineKeyboard(text="🔙 返回主選單", callback_data="main_menu")]
    ]
    
    return TelegramResponse(
        message=inventory_text,
        inline_keyboard=keyboard
    )

@router.get("/search_buy")
async def search_buy_interface(telegram_id: int):
    """卡頭查詢|購買 - 搜索界面"""
    
    search_text = "🔍 <b>卡頭查詢|購買</b>\n\n請選擇查詢方式："
    
    keyboard = [
        [
            InlineKeyboard(text="🌍 按國家查詢", callback_data="search_by_country"),
            InlineKeyboard(text="💰 按價格查詢", callback_data="search_by_price")
        ],
        [
            InlineKeyboard(text="🎯 按成功率查詢", callback_data="search_by_rate"),
            InlineKeyboard(text="🔥 熱門推薦", callback_data="search_hot")
        ],
        [
            InlineKeyboard(text="💎 高級篩選", callback_data="advanced_search")
        ],
        [InlineKeyboard(text="🔙 返回主選單", callback_data="main_menu")]
    ]
    
    return TelegramResponse(
        message=search_text,
        inline_keyboard=keyboard
    )

@router.get("/merchant_base")
async def merchant_base(telegram_id: int):
    """🔥 商家基地 - 代理/商家功能"""
    
    user_service = UserService()
    user = await user_service.get_user_by_telegram_id(telegram_id)
    
    if not user:
        return TelegramResponse(
            message="❌ 用戶信息不存在，請重新開始。",
            inline_keyboard=[[InlineKeyboard(text="🔄 重新開始", callback_data="main_menu")]]
        )
    
    merchant_text = "🔥 <b>商家基地</b>\n\n"
    
    if user.is_agent:
        # 已是代理
        merchant_text += f"✅ 您已是代理商\n"
        merchant_text += f"💰 當前餘額: ${user.balance:.2f} USDT\n"
        merchant_text += f"📊 等級: {user.agent_profile.level if user.agent_profile else 1}\n\n"
        merchant_text += "請選擇功能："
        
        keyboard = [
            [
                InlineKeyboard(text="📊 代理統計", callback_data="agent_stats"),
                InlineKeyboard(text="👥 團隊管理", callback_data="team_manage")
            ],
            [
                InlineKeyboard(text="💰 收益查詢", callback_data="earnings_check"),
                InlineKeyboard(text="💳 申請提現", callback_data="withdraw_request")
            ],
            [
                InlineKeyboard(text="🔗 推薦鏈接", callback_data="referral_link")
            ],
            [InlineKeyboard(text="🔙 返回主選單", callback_data="main_menu")]
        ]
    else:
        # 非代理用戶
        merchant_text += "🎯 <b>成為代理商的優勢</b>\n"
        merchant_text += "• 💰 豐厚佣金: 5%-18%\n"
        merchant_text += "• 👥 團隊獎勵: 額外收益\n"
        merchant_text += "• 🎁 推薦獎金: 每人10 USDT\n"
        merchant_text += "• 📈 等級晉升: 更多權益\n\n"
        merchant_text += "立即加入我們的代理團隊！"
        
        keyboard = [
            [InlineKeyboard(text="📝 申請成為代理", callback_data="apply_agent")],
            [InlineKeyboard(text="📞 聯繫客服", callback_data="contact_support")],
            [InlineKeyboard(text="🔙 返回主選單", callback_data="main_menu")]
        ]
    
    return TelegramResponse(
        message=merchant_text,
        inline_keyboard=keyboard
    )

@router.get("/recharge")
async def recharge_interface(telegram_id: int):
    """充值 - USDT 充值界面"""
    
    recharge_text = """💰 <b>USDT 充值</b>

🎯 <b>充值說明</b>
• 支持 USDT-TRC20 充值
• 最低充值金額: 10 USDT
• 到賬時間: 1-3 個區塊確認
• 手續費: 免費

📱 <b>充值步驟</b>
1. 選擇充值金額
2. 獲取充值地址
3. 轉賬 USDT-TRC20
4. 等待到賬確認

⚠️ <b>注意事項</b>
• 請務必使用 TRC20 網絡
• 確認地址正確後再轉賬
• 小額測試後再大額充值"""

    keyboard = [
        [
            InlineKeyboard(text="💵 $10", callback_data="recharge_10"),
            InlineKeyboard(text="💵 $50", callback_data="recharge_50"),
            InlineKeyboard(text="💵 $100", callback_data="recharge_100")
        ],
        [
            InlineKeyboard(text="💵 $500", callback_data="recharge_500"),
            InlineKeyboard(text="💵 $1000", callback_data="recharge_1000")
        ],
        [
            InlineKeyboard(text="💎 自定義金額", callback_data="recharge_custom")
        ],
        [InlineKeyboard(text="🔙 返回主選單", callback_data="main_menu")]
    ]
    
    return TelegramResponse(
        message=recharge_text,
        inline_keyboard=keyboard
    )

@router.get("/balance_check")
async def balance_check(telegram_id: int):
    """餘額查詢"""
    
    user_service = UserService()
    user = await user_service.get_user_by_telegram_id(telegram_id)
    
    if not user:
        return TelegramResponse(
            message="❌ 用戶信息不存在，請重新開始。",
            inline_keyboard=[[InlineKeyboard(text="🔄 重新開始", callback_data="main_menu")]]
        )
    
    balance_text = f"""💳 <b>餘額查詢</b>

👤 <b>用戶信息</b>
• 用戶ID: {user.telegram_id}
• 用戶名: {user.first_name or user.username or '未設置'}

💰 <b>餘額詳情</b>
• 當前餘額: ${user.balance:.2f} USDT
• 總消費: ${user.total_spent:.2f} USDT
• 總訂單: {user.total_orders} 筆

📊 <b>賬戶狀態</b>
• 狀態: {'✅ 正常' if user.is_active else '❌ 受限'}
• 認證狀態: {'✅ 已認證' if user.is_verified else '⏳ 未認證'}
• 代理狀態: {'✅ 代理商' if user.is_agent else '👤 普通用戶'}"""

    keyboard = [
        [
            InlineKeyboard(text="💰 立即充值", callback_data="recharge"),
            InlineKeyboard(text="📋 交易記錄", callback_data="transaction_history")
        ]
    ]
    
    if user.is_agent:
        keyboard.append([InlineKeyboard(text="🔥 代理收益", callback_data="agent_earnings")])
    
    keyboard.append([InlineKeyboard(text="🔙 返回主選單", callback_data="main_menu")])
    
    return TelegramResponse(
        message=balance_text,
        inline_keyboard=keyboard
    )

@router.post("/buy_card")
async def buy_card(telegram_id: int, card_id: int):
    """購買 CVV 卡片"""
    
    cvv_service = CVVService()
    user_service = UserService()
    
    # 獲取卡片信息
    card = await cvv_service.get_card_by_id(card_id)
    if not card or card.status != CVVStatus.ACTIVE:
        return TelegramResponse(
            message="❌ 卡片不存在或已售出。",
            inline_keyboard=[[InlineKeyboard(text="🔙 返回", callback_data="all_cards")]]
        )
    
    # 獲取用戶信息
    user = await user_service.get_user_by_telegram_id(telegram_id)
    if not user:
        return TelegramResponse(
            message="❌ 用戶信息不存在。",
            inline_keyboard=[[InlineKeyboard(text="🔄 重新開始", callback_data="main_menu")]]
        )
    
    # 檢查餘額
    if user.balance < card.price:
        insufficient_text = f"""💳 <b>餘額不足</b>

📦 商品: {card.country_code}_{card.country_name} {card.flag}
💰 價格: ${card.price} USDT
💳 您的餘額: ${user.balance:.2f} USDT
❌ 差額: ${card.price - user.balance:.2f} USDT

請先充值後再購買。"""
        
        return TelegramResponse(
            message=insufficient_text,
            inline_keyboard=[
                [InlineKeyboard(text="💰 立即充值", callback_data="recharge")],
                [InlineKeyboard(text="🔙 返回", callback_data="all_cards")]
            ]
        )
    
    # 顯示購買確認
    confirm_text = f"""🛒 <b>購買確認</b>

📦 <b>商品信息</b>
• 國家: {card.country_code}_{card.country_name} {card.flag}
• 成功率: {card.success_rate}
• 類型: {card.cvv_type.value}

💰 <b>價格信息</b>
• 單價: ${card.price} USDT
• 您的餘額: ${user.balance:.2f} USDT
• 購買後餘額: ${user.balance - card.price:.2f} USDT

⚠️ <b>購買須知</b>
• 購買後立即發貨
• 卡號錯誤/過期全補
• 不支持退款

確認購買嗎？"""
    
    keyboard = [
        [
            InlineKeyboard(text="✅ 確認購買", callback_data=f"confirm_buy_{card_id}"),
            InlineKeyboard(text="❌ 取消", callback_data="all_cards")
        ]
    ]
    
    return TelegramResponse(
        message=confirm_text,
        inline_keyboard=keyboard
    )
