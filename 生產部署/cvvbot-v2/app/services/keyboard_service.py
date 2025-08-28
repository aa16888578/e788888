"""
內嵌鍵盤服務
生成各種 Telegram 內嵌鍵盤
"""
from typing import List, Dict, Any, Optional
from telegram import InlineKeyboardButton, InlineKeyboardMarkup
import logging

logger = logging.getLogger(__name__)

class KeyboardService:
    """內嵌鍵盤服務類"""
    
    @staticmethod
    def create_main_menu() -> InlineKeyboardMarkup:
        """創建主選單鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("全資庫", callback_data="all_cards"),
                InlineKeyboardButton("課資庫", callback_data="course_cards"),
                InlineKeyboardButton("特價庫", callback_data="special_cards")
            ],
            [
                InlineKeyboardButton("全球卡頭庫存", callback_data="global_inventory"),
                InlineKeyboardButton("卡頭查詢|購買", callback_data="search_buy")
            ],
            [
                InlineKeyboardButton("🔥 商家基地", callback_data="merchant_base")
            ],
            [
                InlineKeyboardButton("充值", callback_data="recharge"),
                InlineKeyboardButton("餘額查詢", callback_data="balance_check")
            ],
            [
                InlineKeyboardButton("🇺🇸 English", callback_data="lang_en")
            ]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_card_list_keyboard(cards: List[Dict], page: int = 1) -> InlineKeyboardMarkup:
        """創建卡片列表鍵盤"""
        keyboard = []
        
        # 添加卡片按鈕
        for card in cards:
            button_text = f"{card.get('country_code')}_{card.get('country_name')} - ${card.get('price')} USDT"
            callback_data = f"buy_card_{card.get('id')}"
            keyboard.append([InlineKeyboardButton(button_text, callback_data=callback_data)])
        
        # 添加分頁按鈕
        nav_buttons = []
        if page > 1:
            nav_buttons.append(InlineKeyboardButton("⬅️ 上一頁", callback_data=f"page_{page-1}"))
        nav_buttons.append(InlineKeyboardButton("➡️ 下一頁", callback_data=f"page_{page+1}"))
        
        if nav_buttons:
            keyboard.append(nav_buttons)
        
        # 返回按鈕
        keyboard.append([InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")])
        
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_recharge_keyboard() -> InlineKeyboardMarkup:
        """創建充值金額選擇鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("💵 $10", callback_data="recharge_10"),
                InlineKeyboardButton("💵 $50", callback_data="recharge_50"),
                InlineKeyboardButton("💵 $100", callback_data="recharge_100")
            ],
            [
                InlineKeyboardButton("💵 $500", callback_data="recharge_500"),
                InlineKeyboardButton("💵 $1000", callback_data="recharge_1000")
            ],
            [
                InlineKeyboardButton("💎 自定義金額", callback_data="recharge_custom")
            ],
            [InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_payment_keyboard(payment_address: str, amount: float) -> InlineKeyboardMarkup:
        """創建支付確認鍵盤"""
        keyboard = [
            [InlineKeyboardButton("📋 複製地址", callback_data=f"copy_address_{payment_address}")],
            [
                InlineKeyboardButton("✅ 已轉賬", callback_data=f"confirm_payment_{amount}"),
                InlineKeyboardButton("❌ 取消", callback_data="recharge")
            ],
            [InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_agent_menu_keyboard(is_agent: bool = False) -> InlineKeyboardMarkup:
        """創建代理商選單鍵盤"""
        if is_agent:
            # 已是代理商
            keyboard = [
                [
                    InlineKeyboardButton("📊 代理統計", callback_data="agent_stats"),
                    InlineKeyboardButton("👥 團隊管理", callback_data="team_manage")
                ],
                [
                    InlineKeyboardButton("💰 收益查詢", callback_data="earnings_check"),
                    InlineKeyboardButton("💳 申請提現", callback_data="withdraw_request")
                ],
                [
                    InlineKeyboardButton("🔗 推薦鏈接", callback_data="referral_link"),
                    InlineKeyboardButton("📈 升級等級", callback_data="upgrade_level")
                ],
                [InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")]
            ]
        else:
            # 非代理用戶
            keyboard = [
                [InlineKeyboardButton("📝 申請成為代理", callback_data="apply_agent")],
                [InlineKeyboardButton("💡 代理商介紹", callback_data="agent_intro")],
                [InlineKeyboardButton("📞 聯繫客服", callback_data="contact_support")],
                [InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")]
            ]
        
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_search_keyboard() -> InlineKeyboardMarkup:
        """創建搜索選項鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("🌍 按國家查詢", callback_data="search_by_country"),
                InlineKeyboardButton("💰 按價格查詢", callback_data="search_by_price")
            ],
            [
                InlineKeyboardButton("🎯 按成功率查詢", callback_data="search_by_rate"),
                InlineKeyboardButton("🔥 熱門推薦", callback_data="search_hot")
            ],
            [
                InlineKeyboardButton("💎 高級篩選", callback_data="advanced_search")
            ],
            [InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_country_selection_keyboard() -> InlineKeyboardMarkup:
        """創建國家選擇鍵盤"""
        # 熱門國家
        keyboard = [
            [
                InlineKeyboardButton("🇺🇸 美國", callback_data="country_US"),
                InlineKeyboardButton("🇬🇧 英國", callback_data="country_GB"),
                InlineKeyboardButton("🇨🇦 加拿大", callback_data="country_CA")
            ],
            [
                InlineKeyboardButton("🇦🇷 阿根廷", callback_data="country_AR"),
                InlineKeyboardButton("🇧🇷 巴西", callback_data="country_BR"),
                InlineKeyboardButton("🇩🇪 德國", callback_data="country_DE")
            ],
            [
                InlineKeyboardButton("🇫🇷 法國", callback_data="country_FR"),
                InlineKeyboardButton("🇮🇹 意大利", callback_data="country_IT"),
                InlineKeyboardButton("🇪🇸 西班牙", callback_data="country_ES")
            ],
            [
                InlineKeyboardButton("🌍 查看更多國家", callback_data="more_countries")
            ],
            [InlineKeyboardButton("🔙 返回搜索", callback_data="search_buy")]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_price_range_keyboard() -> InlineKeyboardMarkup:
        """創建價格範圍選擇鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("💰 $1-5", callback_data="price_1_5"),
                InlineKeyboardButton("💰 $5-10", callback_data="price_5_10"),
                InlineKeyboardButton("💰 $10-20", callback_data="price_10_20")
            ],
            [
                InlineKeyboardButton("💰 $20-50", callback_data="price_20_50"),
                InlineKeyboardButton("💰 $50-100", callback_data="price_50_100"),
                InlineKeyboardButton("💰 $100+", callback_data="price_100_plus")
            ],
            [InlineKeyboardButton("🔙 返回搜索", callback_data="search_buy")]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_success_rate_keyboard() -> InlineKeyboardMarkup:
        """創建成功率選擇鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("🎯 90%+", callback_data="rate_90_plus"),
                InlineKeyboardButton("🎯 80-90%", callback_data="rate_80_90"),
                InlineKeyboardButton("🎯 70-80%", callback_data="rate_70_80")
            ],
            [
                InlineKeyboardButton("🎯 60-70%", callback_data="rate_60_70"),
                InlineKeyboardButton("🎯 50-60%", callback_data="rate_50_60"),
                InlineKeyboardButton("🎯 50%以下", callback_data="rate_below_50")
            ],
            [InlineKeyboardButton("🔙 返回搜索", callback_data="search_buy")]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_purchase_confirmation_keyboard(card_id: str) -> InlineKeyboardMarkup:
        """創建購買確認鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("✅ 確認購買", callback_data=f"confirm_buy_{card_id}"),
                InlineKeyboardButton("❌ 取消", callback_data="all_cards")
            ],
            [InlineKeyboardButton("💰 查看餘額", callback_data="balance_check")],
            [InlineKeyboardButton("🔙 返回卡片列表", callback_data="all_cards")]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_agent_stats_keyboard() -> InlineKeyboardMarkup:
        """創建代理統計鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("📈 銷售統計", callback_data="sales_stats"),
                InlineKeyboardButton("💰 收益統計", callback_data="earnings_stats")
            ],
            [
                InlineKeyboardButton("👥 團隊統計", callback_data="team_stats"),
                InlineKeyboardButton("🏆 排行榜", callback_data="leaderboard")
            ],
            [
                InlineKeyboardButton("📊 詳細報告", callback_data="detailed_report")
            ],
            [InlineKeyboardButton("🔙 返回代理基地", callback_data="merchant_base")]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_language_keyboard() -> InlineKeyboardMarkup:
        """創建語言選擇鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("🇹🇼 繁體中文", callback_data="lang_zh_tw"),
                InlineKeyboardButton("🇨🇳 簡體中文", callback_data="lang_zh_cn")
            ],
            [
                InlineKeyboardButton("🇺🇸 English", callback_data="lang_en"),
                InlineKeyboardButton("🇯🇵 日本語", callback_data="lang_ja")
            ],
            [
                InlineKeyboardButton("🇰🇷 한국어", callback_data="lang_ko"),
                InlineKeyboardButton("🇷🇺 Русский", callback_data="lang_ru")
            ],
            [InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_admin_keyboard() -> InlineKeyboardMarkup:
        """創建管理員鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("📊 系統統計", callback_data="admin_stats"),
                InlineKeyboardButton("👥 用戶管理", callback_data="admin_users")
            ],
            [
                InlineKeyboardButton("💳 卡片管理", callback_data="admin_cards"),
                InlineKeyboardButton("💰 財務管理", callback_data="admin_finance")
            ],
            [
                InlineKeyboardButton("🤖 AI 入庫", callback_data="admin_ai_import"),
                InlineKeyboardButton("⚙️ 系統設置", callback_data="admin_settings")
            ],
            [InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_back_button(callback_data: str = "main_menu") -> InlineKeyboardMarkup:
        """創建單個返回按鈕"""
        keyboard = [[InlineKeyboardButton("🔙 返回", callback_data=callback_data)]]
        return InlineKeyboardMarkup(keyboard)

# 創建全局鍵盤服務實例
keyboard_service = KeyboardService()
