import { DatabaseService } from './database';
import { AuthService } from './auth';
import { User, Product, Category } from '../types';

// Telegram Bot 服務類
export class TelegramBotService {
  private static readonly BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  private static readonly API_BASE = 'https://api.telegram.org/bot';

  // 發送消息到 Telegram
  static async sendMessage(chatId: number, text: string, options: any = {}) {
    try {
      const url = `${this.API_BASE}${this.BOT_TOKEN}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
          ...options
        })
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      throw error;
    }
  }

  // 發送內嵌鍵盤消息
  static async sendMessageWithKeyboard(chatId: number, text: string, keyboard: any) {
    return this.sendMessage(chatId, text, {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
  }

  // 發送歡迎消息和主選單
  static async sendWelcomeMessage(chatId: number, user: User) {
    const welcomeText = `🎉 歡迎來到 ShopBot 購物助手！

👋 您好，${user.firstName}！

🛍️ 我們提供：
• 精選商品推薦
• 快速購物體驗
• 24/7 客服支援
• 安全支付保障

請選擇您需要的服務：`;

    const mainKeyboard = [
      [
        { text: '🛍️ 商品瀏覽', callback_data: 'browse_products' },
        { text: '🔍 商品搜尋', callback_data: 'search_products' }
      ],
      [
        { text: '🛒 購物車', callback_data: 'view_cart' },
        { text: '📋 我的訂單', callback_data: 'my_orders' }
      ],
      [
        { text: '💰 充值', callback_data: 'top_up' },
        { text: '💳 餘額查詢', callback_data: 'check_balance' }
      ],
      [
        { text: '🏢 代理系統', callback_data: 'agent_system' },
        { text: '📱 官方頻道', callback_data: 'official_channel' }
      ],
      [
        { text: '❓ 幫助', callback_data: 'help' },
        { text: '🌐 切換語言', callback_data: 'change_language' }
      ]
    ];

    return this.sendMessageWithKeyboard(chatId, welcomeText, mainKeyboard);
  }

  // 發送商品分類鍵盤
  static async sendCategoryKeyboard(chatId: number, categories: Category[]) {
    const categoryText = `📂 請選擇商品分類：`;
    
    const keyboard = categories.map(category => [
      { text: category.name, callback_data: `category_${category.id}` }
    ]);

    // 添加返回按鈕
    keyboard.push([
      { text: '🔙 返回主選單', callback_data: 'main_menu' }
    ]);

    return this.sendMessageWithKeyboard(chatId, categoryText, keyboard);
  }

  // 發送商品列表鍵盤
  static async sendProductListKeyboard(chatId: number, products: Product[], categoryName: string) {
    const productText = `📦 ${categoryName} 商品列表：`;
    
    const keyboard = products.map(product => [
      { text: `${product.name} - ${product.price} USDT`, callback_data: `product_${product.id}` }
    ]);

    // 添加分頁和導航按鈕
    const navigationRow = [];
    if (products.length > 0) {
      navigationRow.push(
        { text: '⬅️ 上一頁', callback_data: 'prev_page' },
        { text: '➡️ 下一頁', callback_data: 'next_page' }
      );
    }
    
    if (navigationRow.length > 0) {
      keyboard.push(navigationRow);
    }

    keyboard.push([
      { text: '🔙 返回分類', callback_data: 'back_to_categories' },
      { text: '🏠 主選單', callback_data: 'main_menu' }
    ]);

    return this.sendMessageWithKeyboard(chatId, productText, keyboard);
  }

  // 發送商品詳情鍵盤
  static async sendProductDetailKeyboard(chatId: number, product: Product) {
    const productText = `📦 <b>${product.name}</b>

📝 ${product.description}

💰 價格：${product.price} USDT
📊 庫存：${product.stock} 件
🏷️ 分類：${product.category}

${product.images.length > 0 ? '🖼️ 商品圖片已準備' : ''}`;

    const keyboard = [
      [
        { text: '🛒 加入購物車', callback_data: `add_to_cart_${product.id}` },
        { text: '💳 立即購買', callback_data: `buy_now_${product.id}` }
      ],
      [
        { text: '⭐ 收藏商品', callback_data: `favorite_${product.id}` },
        { text: '📤 分享商品', callback_data: `share_${product.id}` }
      ],
      [
        { text: '🔙 返回列表', callback_data: 'back_to_products' },
        { text: '🏠 主選單', callback_data: 'main_menu' }
      ]
    ];

    return this.sendMessageWithKeyboard(chatId, productText, keyboard);
  }

  // 發送購物車鍵盤
  static async sendCartKeyboard(chatId: number, cartItems: any[]) {
    if (cartItems.length === 0) {
      const emptyCartText = `🛒 您的購物車是空的

💡 快去瀏覽商品吧！`;
      
      const keyboard = [
        [
          { text: '🛍️ 瀏覽商品', callback_data: 'browse_products' },
          { text: '🔍 搜尋商品', callback_data: 'search_products' }
        ],
        [
          { text: '🏠 主選單', callback_data: 'main_menu' }
        ]
      ];

      return this.sendMessageWithKeyboard(chatId, emptyCartText, keyboard);
    }

    const cartText = `🛒 您的購物車 (${cartItems.length} 件商品)：

${cartItems.map((item, index) => 
  `${index + 1}. ${item.name} x${item.quantity} - ${item.price * item.quantity} USDT`
).join('\n')}

💰 總計：${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)} USDT`;

    const keyboard = [
      [
        { text: '💳 結帳', callback_data: 'checkout' },
        { text: '🗑️ 清空購物車', callback_data: 'clear_cart' }
      ],
      [
        { text: '✏️ 編輯購物車', callback_data: 'edit_cart' },
        { text: '🛍️ 繼續購物', callback_data: 'browse_products' }
      ],
      [
        { text: '🏠 主選單', callback_data: 'main_menu' }
      ]
    ];

    return this.sendMessageWithKeyboard(chatId, cartText, keyboard);
  }

  // 發送支付選項鍵盤
  static async sendPaymentKeyboard(chatId: number, orderTotal: number) {
    const paymentText = `💳 請選擇支付方式

💰 訂單總額：${orderTotal} USDT

💡 我們支持以下支付方式：`;

    const keyboard = [
      [
        { text: '💎 USDT-TRC20', callback_data: 'pay_usdt_trc20' },
        { text: '🔗 USDT-ERC20', callback_data: 'pay_usdt_erc20' }
      ],
      [
        { text: '⚡ TRX 原生', callback_data: 'pay_trx' }
      ],
      [
        { text: '🔙 返回訂單', callback_data: 'back_to_order' },
        { text: '🏠 主選單', callback_data: 'main_menu' }
      ]
    ];

    return this.sendMessageWithKeyboard(chatId, paymentText, keyboard);
  }

  // 發送代理系統鍵盤
  static async sendAgentSystemKeyboard(chatId: number) {
    const agentText = `🏢 <b>代理系統</b>

🎯 成為我們的代理，享受豐厚佣金！

📊 代理等級：
• 🥉 一級代理：15% 佣金
• 🥈 二級代理：8% 佣金  
• 🥇 三級代理：5% 佣金

💡 選擇您需要的服務：`;

    const keyboard = [
      [
        { text: '📝 申請代理', callback_data: 'apply_agent' },
        { text: '📊 代理狀態', callback_data: 'agent_status' }
      ],
      [
        { text: '💰 佣金查詢', callback_data: 'commission_query' },
        { text: '👥 團隊管理', callback_data: 'team_management' }
      ],
      [
        { text: '📈 業績報表', callback_data: 'performance_report' },
        { text: '🏆 排行榜', callback_data: 'leaderboard' }
      ],
      [
        { text: '🔙 返回主選單', callback_data: 'main_menu' }
      ]
    ];

    return this.sendMessageWithKeyboard(chatId, agentText, keyboard);
  }

  // 發送幫助鍵盤
  static async sendHelpKeyboard(chatId: number) {
    const helpText = `❓ <b>幫助中心</b>

🔧 常見問題解答：

1️⃣ <b>如何購物？</b>
   • 瀏覽商品 → 選擇商品 → 加入購物車 → 結帳支付

2️⃣ <b>支付方式？</b>
   • 支持 USDT-TRC20、USDT-ERC20、TRX

3️⃣ <b>訂單查詢？</b>
   • 點擊「我的訂單」查看訂單狀態

4️⃣ <b>客服支援？</b>
   • 24/7 在線客服，隨時為您服務

💡 選擇您需要的幫助：`;

    const keyboard = [
      [
        { text: '📖 使用教程', callback_data: 'tutorial' },
        { text: '❓ 常見問題', callback_data: 'faq' }
      ],
      [
        { text: '📞 聯繫客服', callback_data: 'contact_support' },
        { text: '📧 意見反饋', callback_data: 'feedback' }
      ],
      [
        { text: '🔙 返回主選單', callback_data: 'main_menu' }
      ]
    ];

    return this.sendMessageWithKeyboard(chatId, helpText, keyboard);
  }

  // 發送語言選擇鍵盤
  static async sendLanguageKeyboard(chatId: number) {
    const languageText = `🌐 <b>語言選擇</b>

Please select your language:
請選擇您的語言：`;

    const keyboard = [
      [
        { text: '🇹🇼 繁體中文', callback_data: 'lang_zh_tw' },
        { text: '🇨🇳 簡體中文', callback_data: 'lang_zh_cn' }
      ],
      [
        { text: '🇺🇸 English', callback_data: 'lang_en' },
        { text: '🇯🇵 日本語', callback_data: 'lang_ja' }
      ],
      [
        { text: '🇰🇷 한국어', callback_data: 'lang_ko' },
        { text: '🇹🇭 ไทย', callback_data: 'lang_th' }
      ],
      [
        { text: '🔙 返回主選單', callback_data: 'main_menu' }
      ]
    ];

    return this.sendMessageWithKeyboard(chatId, languageText, keyboard);
  }

  // 處理回調查詢
  static async handleCallbackQuery(callbackQuery: any) {
    const { id, from, message, data } = callbackQuery;
    
    try {
      // 根據回調數據處理不同的操作
      switch (data) {
        case 'main_menu':
          await this.sendWelcomeMessage(from.id, { firstName: from.first_name } as User);
          break;
          
        case 'browse_products':
          const categories = await DatabaseService.getCategories();
          await this.sendCategoryKeyboard(from.id, categories);
          break;
          
        case 'search_products':
          await this.sendMessage(from.id, '🔍 請輸入您要搜尋的商品名稱：');
          break;
          
        case 'view_cart':
          // 這裡需要實現購物車邏輯
          await this.sendCartKeyboard(from.id, []);
          break;
          
        case 'my_orders':
          await this.sendMessage(from.id, '📋 正在查詢您的訂單...');
          break;
          
        case 'top_up':
          await this.sendMessage(from.id, '💰 充值功能開發中...');
          break;
          
        case 'check_balance':
          await this.sendMessage(from.id, '💳 餘額查詢功能開發中...');
          break;
          
        case 'agent_system':
          await this.sendAgentSystemKeyboard(from.id);
          break;
          
        case 'help':
          await this.sendHelpKeyboard(from.id);
          break;
          
        case 'change_language':
          await this.sendLanguageKeyboard(from.id);
          break;
          
        default:
          if (data.startsWith('category_')) {
            const categoryId = data.replace('category_', '');
            // 這裡需要實現根據分類獲取商品的邏輯
            await this.sendMessage(from.id, `📂 正在載入分類商品...`);
          } else if (data.startsWith('product_')) {
            const productId = data.replace('product_', '');
            // 這裡需要實現獲取商品詳情的邏輯
            await this.sendMessage(from.id, `📦 正在載入商品詳情...`);
          }
          break;
      }

      // 回應回調查詢
      await this.answerCallbackQuery(id);
      
    } catch (error) {
      console.error('Error handling callback query:', error);
      await this.sendMessage(from.id, '❌ 處理請求時發生錯誤，請稍後再試。');
    }
  }

  // 回應回調查詢
  static async answerCallbackQuery(callbackQueryId: string, text?: string) {
    try {
      const url = `${this.API_BASE}${this.BOT_TOKEN}/answerCallbackQuery`;
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: text || '處理中...'
        })
      });
    } catch (error) {
      console.error('Failed to answer callback query:', error);
    }
  }
}
