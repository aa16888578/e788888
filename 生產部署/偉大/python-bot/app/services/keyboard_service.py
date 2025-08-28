"""
內嵌鍵盤服務
生成各種 Telegram 內嵌鍵盤
"""
from typing import List, Dict, Any, Optional
from telegram import InlineKeyboardButton, InlineKeyboardMarkup
import logging
import random
from datetime import datetime

logger = logging.getLogger(__name__)

class KeyboardService:
    """內嵌鍵盤服務類"""
    
    def __init__(self):
        self.startup_count = 0
        self.last_theme = None
    
    def get_funny_startup_message(self, theme=None):
        """獲取風趣開場訊息"""
        if theme and theme in self.startup_themes:
            return self.startup_themes[theme]()
        
        # 隨機選擇主題，避免連續相同
        available_themes = [k for k in self.startup_themes.keys() if k != self.last_theme]
        if not available_themes:
            available_themes = list(self.startup_themes.keys())
        
        theme = random.choice(available_themes)
        self.last_theme = theme
        self.startup_count += 1
        
        return self.startup_themes[theme]()
    
    def get_interactive_startup(self):
        """獲取互動式開場"""
        return self.startup_themes['interactive']()
    
    def get_choose_your_startup(self):
        """獲取選擇式開場"""
        return self.startup_themes['choose_your_startup']()
    
    @property
    def startup_themes(self):
        """開場主題集合"""
        return {
            'rocket': self._rocket_launch,
            'circus': self._circus_show,
            'interactive': self._interactive_startup,
            'choose_your_startup': self._choose_your_startup,
            'dramatic': self._dramatic_startup
        }
    
    def _rocket_launch(self):
        """🚀 火箭發射風格"""
        messages = [
            "🚀 倒數計時開始... 3... 2... 1...",
            "🔥 點火！CVV Bot 正在升空！",
            "🌍 突破大氣層，進入軌道！",
            "⭐ 成功對接國際空間站！",
            "✅ CVV Bot 已成功部署到太空！",
            "🌌 現在可以從任何地方訪問我們的服務了！"
        ]
        return "\n".join(messages)
    
    def _circus_show(self):
        """🎪 馬戲團表演風格"""
        messages = [
            "🎪 歡迎來到 CVV Bot 馬戲團！",
            "🎭 讓我們開始今天的精彩表演！",
            "🤹 首先是我們的招牌節目：AI分類雜技！",
            "🎨 接下來是鍵盤魔術表演！",
            "🎪 最後是我們的壓軸好戲：CVV交易！",
            "👏 掌聲歡迎 CVV Bot 正式開幕！"
        ]
        return "\n".join(messages)
    
    def _interactive_startup(self):
        """🎮 互動式開場"""
        current_time = datetime.now()
        hour = current_time.hour
        
        # 根據時間給出不同問候
        if 6 <= hour < 12:
            time_greeting = "🌅 早安！準備好開始新的一天了嗎？"
        elif 12 <= hour < 18:
            time_greeting = "🌞 午安！休息時間也要保持活力！"
        elif 18 <= hour < 22:
            time_greeting = "🌆 晚安！讓我們一起度過美好的夜晚！"
        else:
            time_greeting = "🌙 夜深了！但CVV Bot永遠為你服務！"
        
        messages = [
            f"{time_greeting}",
            "🎮 今天想要什麼樣的開場體驗？",
            "🎲 擲骰子決定？還是讓AI為你選擇？",
            "🎯 或者... 你想要一個驚喜？",
            "💫 告訴我你的心情，我來為你量身定制！"
        ]
        return "\n".join(messages)
    
    def _choose_your_startup(self):
        """🎯 選擇式開場"""
        messages = [
            "🎯 選擇你的開場風格：",
            "",
            "1️⃣ 🚀 火箭發射 - 充滿能量的科技感",
            "2️⃣ 🎪 馬戲團表演 - 歡樂有趣的娛樂感", 
            "3️⃣ 🎭 戲劇化啟動 - 史詩般的英雄感",
            "4️⃣ 🎨 藝術家風格 - 優雅文藝的氣質感",
            "5️⃣ 🎲 隨機驚喜 - 讓命運決定一切！",
            "",
            "💬 回覆數字選擇，或說 '隨機' 讓我為你選擇！"
        ]
        return "\n".join(messages)
    
    def _dramatic_startup(self):
        """🎭 戲劇化啟動風格"""
        messages = [
            "🎭 燈光！攝影機！開始！",
            "🌟 在一個遙遠的數位世界裡...",
            "⚡ 一道閃電劃過天際！",
            "🌪️ 風起雲湧，數據如潮水般湧來！",
            "💫 突然，一個聲音響起：",
            "🎪 '歡迎來到 CVV Bot 的傳奇世界！'",
            "👑 在這裡，每個交易都是史詩！",
            "🎬 讓我們開始今天的傳奇故事！"
        ]
        return "\n".join(messages)
    
    def get_startup_stats(self):
        """獲取開場統計"""
        return f"📊 開場統計：已啟動 {self.startup_count} 次，最後主題：{self.last_theme or '無'}"
    
    @staticmethod
    def create_main_menu() -> InlineKeyboardMarkup:
        """創建主選單鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("全資庫", callback_data="all_cards"),
                InlineKeyboardButton("裸資庫", callback_data="course_cards"),
                InlineKeyboardButton("特價庫", callback_data="special_cards")
            ],
            [
                InlineKeyboardButton("全球卡頭庫存", callback_data="global_inventory"),
                InlineKeyboardButton("搜尋購買", callback_data="search_buy")
            ],
            [
                InlineKeyboardButton("代理系統", callback_data="merchant_base")
            ],
            [
                InlineKeyboardButton("支付系統", callback_data="recharge"),
                InlineKeyboardButton("幫助", callback_data="balance_check")
            ],
            [
                InlineKeyboardButton("語言", callback_data="lang_en")
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
                InlineKeyboardButton("🔍 搜尋卡頭", callback_data="search_card_prefix"),
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
    def create_card_prefix_search_keyboard() -> InlineKeyboardMarkup:
        """創建卡頭搜尋鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("🔍 輸入卡頭", callback_data="input_card_prefix"),
                InlineKeyboardButton("📊 卡頭統計", callback_data="card_prefix_stats")
            ],
            [
                InlineKeyboardButton("🏦 常用銀行", callback_data="common_banks"),
                InlineKeyboardButton("🌍 按國家篩選", callback_data="prefix_by_country")
            ],
            [
                InlineKeyboardButton("💾 搜尋記錄", callback_data="search_history"),
                InlineKeyboardButton("🔥 熱門卡頭", callback_data="popular_prefixes")
            ],
            [InlineKeyboardButton("🔙 返回搜尋購買", callback_data="search_buy")]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_ai_classification_keyboard() -> InlineKeyboardMarkup:
        """創建AI分類功能鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("📝 單筆分類", callback_data="ai_classify_single"),
                InlineKeyboardButton("📁 批量分類", callback_data="ai_classify_batch")
            ],
            [
                InlineKeyboardButton("🔍 查看分類結果", callback_data="view_ai_results"),
                InlineKeyboardButton("📊 分類統計", callback_data="ai_classification_stats")
            ],
            [InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_classification_confirmation_keyboard(result_id: str) -> InlineKeyboardMarkup:
        """創建分類確認鍵盤 - 管理員設置售價"""
        keyboard = [
            [
                InlineKeyboardButton("💰 設置售價", callback_data=f"set_price_{result_id}"),
                InlineKeyboardButton("✅ 確認入庫", callback_data=f"confirm_stock_{result_id}")
            ],
            [
                InlineKeyboardButton("✏️ 編輯信息", callback_data=f"edit_info_{result_id}"),
                InlineKeyboardButton("🔄 重新分類", callback_data=f"reclassify_{result_id}")
            ],
            [
                InlineKeyboardButton("❌ 取消", callback_data="ai_classify_single"),
                InlineKeyboardButton("📊 查看統計", callback_data="ai_classification_stats")
            ]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_back_button(callback_data: str = "main_menu") -> InlineKeyboardMarkup:
        """創建單個返回按鈕"""
        keyboard = [[InlineKeyboardButton("🔙 返回", callback_data=callback_data)]]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_merchant_base_keyboard() -> InlineKeyboardMarkup:
        """創建商家基地鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("🤖 AI分類器", callback_data="ai_classifier"),
                InlineKeyboardButton("📊 分類統計", callback_data="classification_stats")
            ],
            [
                InlineKeyboardButton("🔍 搜尋卡頭", callback_data="search_card_prefix"),
                InlineKeyboardButton("📋 卡頭查詢", callback_data="card_prefix_query")
            ],
            [
                InlineKeyboardButton("👑 代理基地", callback_data="agent_base"),
                InlineKeyboardButton("💰 收益查詢", callback_data="earnings_check")
            ],
            [InlineKeyboardButton("🔙 返回主選單", callback_data="main_menu")]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_ai_classifier_keyboard() -> InlineKeyboardMarkup:
        """創建AI分類器鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("📝 單筆分類", callback_data="single_classify"),
                InlineKeyboardButton("📁 批量分類", callback_data="batch_classify")
            ],
            [
                InlineKeyboardButton("🔍 查看分類結果", callback_data="view_classification"),
                InlineKeyboardButton("📊 分類歷史", callback_data="classification_history")
            ],
            [
                InlineKeyboardButton("⚙️ 分類設置", callback_data="classification_settings"),
                InlineKeyboardButton("📋 分類規則", callback_data="classification_rules")
            ],
            [InlineKeyboardButton("🔙 返回商家基地", callback_data="merchant_base")]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_classification_input_keyboard() -> InlineKeyboardMarkup:
        """創建分類輸入鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("📝 輸入CVV數據", callback_data="input_cvv_data"),
                InlineKeyboardButton("📁 上傳文件", callback_data="upload_file")
            ],
            [
                InlineKeyboardButton("🔍 查看示例", callback_data="view_examples"),
                InlineKeyboardButton("❓ 格式說明", callback_data="format_help")
            ],
            [InlineKeyboardButton("🔙 返回AI分類器", callback_data="ai_classifier")]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_card_prefix_search_keyboard() -> InlineKeyboardMarkup:
        """創建卡頭搜尋鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("🔍 搜尋卡頭", callback_data="search_card_prefix"),
                InlineKeyboardButton("📋 卡頭查詢", callback_data="card_prefix_query")
            ],
            [
                InlineKeyboardButton("📊 卡頭統計", callback_data="card_prefix_stats"),
                InlineKeyboardButton("💾 保存搜尋", callback_data="save_search")
            ],
            [InlineKeyboardButton("🔙 返回商家基地", callback_data="merchant_base")]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_classification_result_keyboard(result_id: str) -> InlineKeyboardMarkup:
        """創建分類結果鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("✅ 確認分類", callback_data=f"confirm_classification_{result_id}"),
                InlineKeyboardButton("✏️ 編輯結果", callback_data=f"edit_classification_{result_id}")
            ],
            [
                InlineKeyboardButton("💰 設置售價", callback_data=f"set_price_{result_id}"),
                InlineKeyboardButton("💾 保存到庫存", callback_data=f"save_to_inventory_{result_id}")
            ],
            [
                InlineKeyboardButton("🔄 重新分類", callback_data="reclassify"),
                InlineKeyboardButton("📊 查看統計", callback_data="view_stats")
            ],
            [InlineKeyboardButton("🔙 返回AI分類器", callback_data="ai_classifier")]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_batch_classification_keyboard() -> InlineKeyboardMarkup:
        """創建批量分類鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("📁 上傳TXT文件", callback_data="upload_txt"),
                InlineKeyboardButton("📊 上傳CSV文件", callback_data="upload_csv")
            ],
            [
                InlineKeyboardButton("📋 查看上傳歷史", callback_data="upload_history"),
                InlineKeyboardButton("⚙️ 批量設置", callback_data="batch_settings")
            ],
            [
                InlineKeyboardButton("🚀 開始批量分類", callback_data="start_batch_classify"),
                InlineKeyboardButton("⏸️ 暫停分類", callback_data="pause_classification")
            ],
            [InlineKeyboardButton("🔙 返回AI分類器", callback_data="ai_classifier")]
        ]
        return InlineKeyboardMarkup(keyboard)
    
    @staticmethod
    def create_classification_stats_keyboard() -> InlineKeyboardMarkup:
        """創建分類統計鍵盤"""
        keyboard = [
            [
                InlineKeyboardButton("📊 前端總數", callback_data="total_count"),
                InlineKeyboardButton("🔥 活性統計", callback_data="activity_stats")
            ],
            [
                InlineKeyboardButton("💰 銷售統計", callback_data="sales_stats"),
                InlineKeyboardButton("🏷️ 分類統計", callback_data="category_stats")
            ],
            [
                InlineKeyboardButton("📈 趨勢分析", callback_data="trend_analysis"),
                InlineKeyboardButton("📋 詳細報告", callback_data="detailed_report")
            ],
            [InlineKeyboardButton("🔙 返回商家基地", callback_data="merchant_base")]
        ]
        return InlineKeyboardMarkup(keyboard)

# 創建全局鍵盤服務實例
keyboard_service = KeyboardService()
