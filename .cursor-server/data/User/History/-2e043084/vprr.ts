import { DatabaseService } from './database';
import { AuthService } from './auth';
import { CartService } from './cart';
import { SearchService } from './search';
import { OrderService } from './order';
import { PaymentService } from './payment';
import { agentService } from './agent';
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
  static async sendProductListKeyboard(chatId: number, products: Product[], categoryName: string, page: number = 1) {
    const productText = `📦 ${categoryName} 商品列表 (第 ${page} 頁)：`;
    
    const keyboard: any[] = products.map(product => [
      { text: `${product.name} - ${product.price} USDT`, callback_data: `product_${product.id}` }
    ]);

    // 添加分頁和導航按鈕
    const navigationRow: any[] = [];
    if (products.length > 0) {
      navigationRow.push(
        { text: '⬅️ 上一頁', callback_data: `prev_page_${page}` },
        { text: '➡️ 下一頁', callback_data: `next_page_${page}` }
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

  // 發送搜尋鍵盤
  static async sendSearchKeyboard(chatId: number) {
    const searchText = `🔍 <b>商品搜尋</b>

請選擇搜尋方式：`;

    const keyboard = [
      [
        { text: '🔤 按名稱搜尋', callback_data: 'search_by_name' },
        { text: '🏷️ 按標籤搜尋', callback_data: 'search_by_tag' }
      ],
      [
        { text: '💰 按價格範圍', callback_data: 'search_by_price' },
        { text: '⭐ 特色商品', callback_data: 'search_featured' }
      ],
      [
        { text: '🔥 熱門搜尋', callback_data: 'popular_search' },
        { text: '🔙 返回主選單', callback_data: 'main_menu' }
      ]
    ];

    return this.sendMessageWithKeyboard(chatId, searchText, keyboard);
  }

  // 發送搜尋結果鍵盤
  static async sendSearchResultsKeyboard(chatId: number, searchResults: any, query: string) {
    const { products, total, page, totalPages } = searchResults;
    
    const resultText = `🔍 搜尋結果：<b>${query}</b>

📦 找到 ${total} 件商品 (第 ${page}/${totalPages} 頁)：`;

    const keyboard: any[] = products.map(product => [
      { text: `${product.name} - ${product.price} USDT`, callback_data: `product_${product.id}` }
    ]);

    // 添加分頁按鈕
    if (totalPages > 1) {
      const navigationRow: any[] = [];
      if (page > 1) {
        navigationRow.push({ text: '⬅️ 上一頁', callback_data: `search_prev_${page}` });
      }
      if (page < totalPages) {
        navigationRow.push({ text: '➡️ 下一頁', callback_data: `search_next_${page}` });
      }
      if (navigationRow.length > 0) {
        keyboard.push(navigationRow);
      }
    }

    keyboard.push([
      { text: '🔍 重新搜尋', callback_data: 'search_products' },
      { text: '🏠 主選單', callback_data: 'main_menu' }
    ]);

    return this.sendMessageWithKeyboard(chatId, resultText, keyboard);
  }

  // 發送訂單列表鍵盤
  static async sendOrderListKeyboard(chatId: number, orders: any[], page: number = 1) {
    if (orders.length === 0) {
      const noOrdersText = `📋 您還沒有訂單

🛍️ 快去購物吧！`;
      
      const keyboard = [
        [
          { text: '🛍️ 瀏覽商品', callback_data: 'browse_products' },
          { text: '🔍 搜尋商品', callback_data: 'search_products' }
        ],
        [
          { text: '🏠 主選單', callback_data: 'main_menu' }
        ]
      ];

      return this.sendMessageWithKeyboard(chatId, noOrdersText, keyboard);
    }

    const orderText = `📋 您的訂單 (第 ${page} 頁)：`;
    
    const keyboard = orders.map(order => [
      { text: `📦 ${order.orderNumber} - ${order.status}`, callback_data: `order_${order.id}` }
    ]);

    // 添加分頁按鈕
    if (orders.length > 5) {
      keyboard.push([
        { text: '⬅️ 上一頁', callback_data: `order_prev_${page}` },
        { text: '➡️ 下一頁', callback_data: `order_next_${page}` }
      ]);
    }

    keyboard.push([
      { text: '🔙 返回主選單', callback_data: 'main_menu' }
    ]);

    return this.sendMessageWithKeyboard(chatId, orderText, keyboard);
  }

  // 發送訂單詳情鍵盤
  static async sendOrderDetailKeyboard(chatId: number, order: any) {
    const orderText = `📦 <b>訂單詳情</b>

🔢 訂單號：${order.orderNumber}
📅 創建時間：${order.createdAt.toLocaleDateString()}
💰 總金額：${order.total} ${order.currency}
📊 狀態：${order.status}
💳 支付狀態：${order.paymentStatus}

📦 商品列表：
${order.products.map((product: any, index: number) => 
  `${index + 1}. ${product.name} x${product.quantity} - ${product.subtotal} ${order.currency}`
).join('\n')}`;

    const keyboard = [
      [
        { text: '📱 追蹤訂單', callback_data: `track_order_${order.id}` },
        { text: '❌ 取消訂單', callback_data: `cancel_order_${order.id}` }
      ],
      [
        { text: '🔙 返回訂單列表', callback_data: 'my_orders' },
        { text: '🏠 主選單', callback_data: 'main_menu' }
      ]
    ];

    return this.sendMessageWithKeyboard(chatId, orderText, keyboard);
  }

  // 發送支付選項鍵盤
  static async sendPaymentOptionsKeyboard(chatId: number, order: any) {
    const paymentText = `💳 <b>選擇支付方式</b>

📦 訂單號：${order.orderNumber}
💰 支付金額：${order.total} ${order.currency}

請選擇支付方式：`;

    const keyboard = [
      [
        { text: '💎 USDT-TRC20', callback_data: `pay_usdt_trc20_${order.id}` },
        { text: '🔗 USDT-ERC20', callback_data: `pay_usdt_erc20_${order.id}` }
      ],
      [
        { text: '⚡ TRX 原生', callback_data: `pay_trx_${order.id}` }
      ],
      [
        { text: '🔙 返回訂單', callback_data: `order_${order.id}` },
        { text: '🏠 主選單', callback_data: 'main_menu' }
      ]
    ];

    return this.sendMessageWithKeyboard(chatId, paymentText, keyboard);
  }

  // 發送支付詳情鍵盤
  static async sendPaymentDetailKeyboard(chatId: number, payment: any) {
    const paymentText = `💳 <b>支付詳情</b>

🔢 支付ID：${payment.id}
💰 支付金額：${payment.amount} ${payment.currency}
🏦 支付方式：${payment.paymentMethod}
📱 收款地址：${payment.walletAddress}
⏰ 過期時間：${payment.expiresAt.toLocaleString()}

📱 請使用您的錢包掃描下方QR碼或手動轉帳：`;

    const keyboard = [
      [
        { text: '📱 查看QR碼', callback_data: `qr_code_${payment.id}` },
        { text: '📊 檢查狀態', callback_data: `check_payment_${payment.id}` }
      ],
      [
        { text: '❌ 取消支付', callback_data: `cancel_payment_${payment.id}` },
        { text: '🏠 主選單', callback_data: 'main_menu' }
      ]
    ];

    return this.sendMessageWithKeyboard(chatId, paymentText, keyboard);
  }

  // 發送代理系統鍵盤
  static async sendAgentSystemKeyboard(chatId: number) {
    const agentText = `🏢 <b>代理系統</b>

請選擇您需要的服務：`;

    const keyboard = [
      [
        { text: '📊 代理狀態', callback_data: 'agent_status' },
        { text: '💰 收益查詢', callback_data: 'agent_earnings' }
      ],
      [
        { text: '👥 團隊管理', callback_data: 'agent_team' },
        { text: '📋 代理訂單', callback_data: 'agent_orders' }
      ],
      [
        { text: '💳 申請提現', callback_data: 'agent_withdrawal' },
        { text: '📈 績效分析', callback_data: 'agent_performance' }
      ],
      [
        { text: '🔗 推薦碼', callback_data: 'agent_referral' },
        { text: '📝 註冊代理', callback_data: 'agent_register' }
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

請選擇您需要的幫助：`;

    const keyboard = [
      [
        { text: '🛍️ 購物指南', callback_data: 'help_shopping' },
        { text: '💳 支付說明', callback_data: 'help_payment' }
      ],
      [
        { text: '📱 使用教程', callback_data: 'help_tutorial' },
        { text: '📞 聯繫客服', callback_data: 'contact_support' }
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
          const user = await DatabaseService.getUserByTelegramId(from.id);
          if (user) {
            await this.sendWelcomeMessage(from.id, user);
          } else {
            await this.sendMessage(from.id, '❌ 用戶認證失敗，請重新開始。');
          }
          break;
          
        case 'browse_products':
          const categories = await DatabaseService.getCategories();
          await this.sendCategoryKeyboard(from.id, categories);
          break;
          
        case 'search_products':
          await this.sendSearchKeyboard(from.id);
          break;
          
        case 'view_cart':
          const cart = await CartService.getUserCart(from.id);
          await this.sendCartKeyboard(from.id, cart?.items || []);
          break;
          
        case 'my_orders':
          const orders = await OrderService.getUserOrders(from.id);
          await this.sendOrderListKeyboard(from.id, orders.orders);
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

        // 商品相關回調
        case 'search_by_name':
          await this.sendMessage(from.id, '🔍 請輸入商品名稱：');
          break;

        case 'search_by_tag':
          await this.sendMessage(from.id, '🏷️ 請輸入標籤：');
          break;

        case 'search_by_price':
          await this.sendMessage(from.id, '💰 請輸入價格範圍 (例如: 10-100)：');
          break;

        case 'search_featured':
          const featuredResults = await SearchService.advancedSearch({ featured: true });
          await this.sendSearchResultsKeyboard(from.id, { products: featuredResults, total: featuredResults.length, page: 1, totalPages: 1 }, '特色商品');
          break;

        case 'popular_search':
          const popularTerms = await SearchService.getPopularSearchTerms(5);
          const popularKeyboard = popularTerms.map(term => [
            { text: term, callback_data: `search_term_${term}` }
          ]);
          popularKeyboard.push([{ text: '🔙 返回搜尋', callback_data: 'search_products' }]);
          await this.sendMessageWithKeyboard(from.id, '🔥 熱門搜尋詞：', popularKeyboard);
          break;

        // 購物車相關回調
        case 'checkout':
          const userCart = await CartService.getUserCart(from.id);
          if (userCart && userCart.items.length > 0) {
            const order = await OrderService.createOrder(from.id, userCart, 'usdt_trc20');
            await this.sendPaymentOptionsKeyboard(from.id, order);
          } else {
            await this.sendMessage(from.id, '❌ 購物車為空，無法結帳。');
          }
          break;

        case 'clear_cart':
          await CartService.clearCart(from.id);
          await this.sendMessage(from.id, '✅ 購物車已清空。');
          await this.sendCartKeyboard(from.id, []);
          break;

        case 'edit_cart':
          await this.sendMessage(from.id, '✏️ 編輯購物車功能開發中...');
          break;

        // 訂單相關回調
        case 'back_to_products':
          await this.sendMessage(from.id, '🔙 返回商品列表...');
          break;

        // 支付相關回調
        case 'pay_usdt_trc20':
        case 'pay_usdt_erc20':
        case 'pay_trx':
          const orderId = data.split('_').slice(2).join('_');
          const paymentMethod = data.split('_')[1] + '_' + data.split('_')[2];
          const payment = await PaymentService.createPaymentOrder(orderId, paymentMethod as any);
          await this.sendPaymentDetailKeyboard(from.id, payment);
          break;

        // 分類和商品回調
        default:
          if (data.startsWith('category_')) {
            const categoryId = data.replace('category_', '');
            const category = await DatabaseService.getCategory(categoryId);
            if (category) {
              const products = await DatabaseService.getProductsByCategory(categoryId);
              await this.sendProductListKeyboard(from.id, products, category.name);
            }
          } else if (data.startsWith('product_')) {
            const productId = data.replace('product_', '');
            const product = await DatabaseService.getProduct(productId);
            if (product) {
              await this.sendProductDetailKeyboard(from.id, product);
            }
          } else if (data.startsWith('add_to_cart_')) {
            const productId = data.replace('add_to_cart_', '');
            try {
              await CartService.addToCart(from.id, productId, 1);
              await this.sendMessage(from.id, '✅ 商品已加入購物車！');
            } catch (error) {
              await this.sendMessage(from.id, `❌ 加入購物車失敗：${error.message}`);
            }
          } else if (data.startsWith('order_')) {
            const orderId = data.replace('order_', '');
            const order = await OrderService.getOrder(orderId);
            if (order) {
              await this.sendOrderDetailKeyboard(from.id, order);
            }
          } else if (data.startsWith('search_term_')) {
            const searchTerm = data.replace('search_term_', '');
            const searchResults = await SearchService.searchProducts({ query: searchTerm });
            await this.sendSearchResultsKeyboard(from.id, searchResults, searchTerm);
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

  // 處理文本消息
  static async handleTextMessage(message: any) {
    const { text, from } = message;
    
    try {
      // 處理搜尋查詢
      if (text && text.length > 1) {
        const searchResults = await SearchService.searchProducts({ query: text });
        if (searchResults.products.length > 0) {
          await this.sendSearchResultsKeyboard(from.id, searchResults, text);
        } else {
          await this.sendMessage(from.id, `🔍 沒有找到包含 "${text}" 的商品。\n\n💡 試試其他關鍵詞或瀏覽商品分類。`);
        }
      }
    } catch (error) {
      console.error('Error handling text message:', error);
      await this.sendMessage(from.id, '❌ 處理搜尋請求時發生錯誤，請稍後再試。');
    }
  }
}
