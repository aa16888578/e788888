"""
Telegram Bot 內嵌鍵盤定義
包含所有 3x3 原生內嵌鍵盤佈局
支援多語言系統
"""
from telegram import InlineKeyboardButton, InlineKeyboardMarkup
from typing import List, Dict, Any
from app.core.language_pack import LanguagePack

class CVVKeyboards:
    """CVV Bot 內嵌鍵盤管理器"""
    
    def __init__(self, language: str = "zh-tw"):
        self.language_pack = LanguagePack(language)
    
    def create_main_menu(self) -> InlineKeyboardMarkup:
        """創建主選單 3x3 內嵌鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton(self.language_pack.get_text("all_cards"), callback_data="main_all_cards"),
                InlineKeyboardButton(self.language_pack.get_text("naked_cards"), callback_data="main_naked_cards"),
                InlineKeyboardButton(self.language_pack.get_text("special_cards"), callback_data="main_special_cards")
            ],
            [
                InlineKeyboardButton(self.language_pack.get_text("global_inventory"), callback_data="main_global_bin"),
                InlineKeyboardButton(self.language_pack.get_text("search_buy"), callback_data="main_bin_search"),
                InlineKeyboardButton(self.language_pack.get_text("merchant_base"), callback_data="main_merchant_base")
            ],
            [
                InlineKeyboardButton(self.language_pack.get_text("recharge"), callback_data="main_recharge"),
                InlineKeyboardButton(self.language_pack.get_text("balance_check"), callback_data="main_balance"),
                InlineKeyboardButton(self.language_pack.get_text("language"), callback_data="main_english")
            ]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    def create_cards_menu(self) -> InlineKeyboardMarkup:
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
                InlineKeyboardButton(self.language_pack.get_text("back"), callback_data="back_main"),
                InlineKeyboardButton("➡️ 更多國家", callback_data="cards_more")
            ]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    def create_recharge_menu(self) -> InlineKeyboardMarkup:
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
    
    def create_merchant_menu(self) -> InlineKeyboardMarkup:
        """創建商家功能 3x3 內嵌鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("📊 銷售統計", callback_data="merchant_stats"),
                InlineKeyboardButton("💼 代理等級", callback_data="merchant_level"),
                InlineKeyboardButton("💸 佣金查詢", callback_data="merchant_commission")
            ],
            [
                InlineKeyboardButton("👥 邀請用戶", callback_data="merchant_invite"),
                InlineKeyboardButton("📈 推廣連結", callback_data="merchant_referral"),
                InlineKeyboardButton("💰 提現申請", callback_data="merchant_withdraw")
            ],
            [
                InlineKeyboardButton("📋 訂單管理", callback_data="merchant_orders"),
                InlineKeyboardButton("🔙 返回主選單", callback_data="back_main"),
                InlineKeyboardButton("📞 聯繫客服", callback_data="merchant_support")
            ]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    def create_card_detail_menu(self, country_code: str) -> InlineKeyboardMarkup:
        """創建卡片詳情 3x3 內嵌鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("💳 購買 1 張", callback_data=f"buy_{country_code}_1"),
                InlineKeyboardButton("💳 購買 5 張", callback_data=f"buy_{country_code}_5"),
                InlineKeyboardButton("💳 購買 10 張", callback_data=f"buy_{country_code}_10")
            ],
            [
                InlineKeyboardButton("💳 購買 20 張", callback_data=f"buy_{country_code}_20"),
                InlineKeyboardButton("💳 購買 50 張", callback_data=f"buy_{country_code}_50"),
                InlineKeyboardButton("💳 自定義數量", callback_data=f"buy_{country_code}_custom")
            ],
            [
                InlineKeyboardButton("📊 查看詳情", callback_data=f"details_{country_code}"),
                InlineKeyboardButton("🔙 返回卡片", callback_data="back_cards"),
                InlineKeyboardButton("⭐ 加入收藏", callback_data=f"favorite_{country_code}")
            ]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    def create_admin_menu(self) -> InlineKeyboardMarkup:
        """創建管理員功能 3x3 內嵌鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("👥 用戶管理", callback_data="admin_users"),
                InlineKeyboardButton("💳 卡片管理", callback_data="admin_cards"),
                InlineKeyboardButton("💰 財務管理", callback_data="admin_finance")
            ],
            [
                InlineKeyboardButton("📊 系統統計", callback_data="admin_stats"),
                InlineKeyboardButton("⚙️ 系統設置", callback_data="admin_settings"),
                InlineKeyboardButton("📢 廣播消息", callback_data="admin_broadcast")
            ],
            [
                InlineKeyboardButton("🔍 日誌查看", callback_data="admin_logs"),
                InlineKeyboardButton(self.language_pack.get_text("back"), callback_data="back_main"),
                InlineKeyboardButton("🚨 緊急停機", callback_data="admin_emergency")
            ]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    def create_language_menu(self) -> InlineKeyboardMarkup:
        """創建語言選擇 3x3 內嵌鍵盤"""
        from app.bot.language_keyboards import LanguageKeyboards
        
        # 使用多語言鍵盤系統
        lang_keyboards = LanguageKeyboards()
        return lang_keyboards.get_language_keyboard_by_current_lang(self.language_pack.get_current_language())
    
    def create_confirmation_menu(self, action: str, data: str = "") -> InlineKeyboardMarkup:
        """創建確認操作 3x3 內嵌鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton(self.language_pack.get_text("confirm"), callback_data=f"confirm_{action}_{data}"),
                InlineKeyboardButton(self.language_pack.get_text("cancel"), callback_data=f"cancel_{action}_{data}"),
                InlineKeyboardButton("❓ 說明", callback_data=f"help_{action}")
            ],
            [
                InlineKeyboardButton("📋 查看詳情", callback_data=f"details_{action}_{data}"),
                InlineKeyboardButton("⚙️ 修改設置", callback_data=f"modify_{action}_{data}"),
                InlineKeyboardButton("📞 聯繫客服", callback_data="contact_support")
            ],
            [
                InlineKeyboardButton(self.language_pack.get_text("back"), callback_data="back_previous"),
                InlineKeyboardButton("🏠 返回主選單", callback_data="back_main"),
                InlineKeyboardButton("🔄 重新操作", callback_data=f"retry_{action}")
            ]
        ]
        return InlineKeyboardMarkup(keyboard)

# 鍵盤管理器實例
keyboards = CVVKeyboards()  # 預設繁體中文

def get_keyboards(language: str = "zh-tw") -> CVVKeyboards:
    """獲取指定語言的鍵盤管理器"""
    return CVVKeyboards(language)
