"""
Telegram Bot 內嵌鍵盤定義
包含所有 3x3 原生內嵌鍵盤佈局
"""
from telegram import InlineKeyboardButton, InlineKeyboardMarkup
from typing import List, Dict, Any

class CVVKeyboards:
    """CVV Bot 內嵌鍵盤管理器"""
    
    @staticmethod
    def create_main_menu() -> InlineKeyboardMarkup:
        """創建主選單 3x3 內嵌鍵盤"""
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
    
    @staticmethod
    def create_cards_menu() -> InlineKeyboardMarkup:
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
    
    @staticmethod
    def create_recharge_menu() -> InlineKeyboardMarkup:
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
    
    @staticmethod
    def create_merchant_menu() -> InlineKeyboardMarkup:
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
    
    @staticmethod
    def create_card_detail_menu(country_code: str) -> InlineKeyboardMarkup:
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
    
    @staticmethod
    def create_admin_menu() -> InlineKeyboardMarkup:
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
                InlineKeyboardButton("🔙 返回主選單", callback_data="back_main"),
                InlineKeyboardButton("🚨 緊急停機", callback_data="admin_emergency")
            ]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_language_menu() -> InlineKeyboardMarkup:
        """創建語言選擇 3x3 內嵌鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("🇨🇳 中文", callback_data="lang_zh"),
                InlineKeyboardButton("🇺🇸 English", callback_data="lang_en"),
                InlineKeyboardButton("🇷🇺 Русский", callback_data="lang_ru")
            ],
            [
                InlineKeyboardButton("🇪🇸 Español", callback_data="lang_es"),
                InlineKeyboardButton("🇫🇷 Français", callback_data="lang_fr"),
                InlineKeyboardButton("🇩🇪 Deutsch", callback_data="lang_de")
            ],
            [
                InlineKeyboardButton("🇯🇵 日本語", callback_data="lang_ja"),
                InlineKeyboardButton("🇰🇷 한국어", callback_data="lang_ko"),
                InlineKeyboardButton("🔙 返回主選單", callback_data="back_main")
            ]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_confirmation_menu(action: str, data: str = "") -> InlineKeyboardMarkup:
        """創建確認操作 3x3 內嵌鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("✅ 確認", callback_data=f"confirm_{action}_{data}"),
                InlineKeyboardButton("❌ 取消", callback_data=f"cancel_{action}_{data}"),
                InlineKeyboardButton("❓ 說明", callback_data=f"help_{action}")
            ],
            [
                InlineKeyboardButton("📋 查看詳情", callback_data=f"details_{action}_{data}"),
                InlineKeyboardButton("⚙️ 修改設置", callback_data=f"modify_{action}_{data}"),
                InlineKeyboardButton("📞 聯繫客服", callback_data="contact_support")
            ],
            [
                InlineKeyboardButton("🔙 返回上級", callback_data="back_previous"),
                InlineKeyboardButton("🏠 返回主選單", callback_data="back_main"),
                InlineKeyboardButton("🔄 重新操作", callback_data=f"retry_{action}")
            ]
        ]
        return InlineKeyboardMarkup(keyboard)

# 鍵盤管理器實例
keyboards = CVVKeyboards()
