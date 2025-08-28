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
    const welcomeText = `🎉 歡迎來到 CVV Bot 信用卡交易助手！

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
          
        // 代理系統相關回調
        case 'agent_status':
          await this.handleAgentStatus(from.id);
          break;
          
        case 'agent_earnings':
          await this.handleAgentEarnings(from.id);
          break;
          
        case 'agent_team':
          await this.handleAgentTeam(from.id);
          break;
          
        case 'agent_orders':
          await this.handleAgentOrders(from.id);
          break;
          
        case 'agent_withdrawal':
          await this.handleAgentWithdrawal(from.id);
          break;
          
        case 'agent_performance':
          await this.handleAgentPerformance(from.id);
          break;
          
        case 'agent_referral':
          await this.handleAgentReferral(from.id);
          break;
          
        case 'agent_register':
          await this.handleAgentRegister(from.id);
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

  // 代理系統處理方法
  
  // 處理代理狀態查詢
  static async handleAgentStatus(chatId: number) {
    try {
      const agent = await agentService.getAgentByTelegramId(chatId);
      
      if (!agent) {
        await this.sendMessage(chatId, '❌ 您還不是代理，請先註冊成為代理。');
        return;
      }

      const statusText = `📊 <b>代理狀態</b>

👤 <b>代理信息</b>
• 姓名：${agent.firstName}
• 等級：${agent.level.icon} ${agent.level.name}
• 狀態：${this.getAgentStatusText(agent.status)}
• 推薦碼：<code>${agent.referralCode}</code>

💰 <b>收益統計</b>
• 總銷售額：${agent.totalSales.toFixed(2)} USDT
• 總佣金：${agent.totalCommission.toFixed(2)} USDT
• 可提現：${agent.availableCommission.toFixed(2)} USDT

👥 <b>團隊信息</b>
• 團隊人數：${agent.teamSize} 人
• 團隊銷售：${agent.teamSales.toFixed(2)} USDT

📅 <b>加入時間</b>
• ${agent.joinDate.toLocaleDateString('zh-TW')}`;

      const keyboard = [
        [
          { text: '💰 收益查詢', callback_data: 'agent_earnings' },
          { text: '👥 團隊管理', callback_data: 'agent_team' }
        ],
        [
          { text: '🔙 返回代理系統', callback_data: 'agent_system' }
        ]
      ];

      await this.sendMessageWithKeyboard(chatId, statusText, keyboard);
    } catch (error) {
      console.error('處理代理狀態查詢失敗:', error);
      await this.sendMessage(chatId, '❌ 獲取代理狀態失敗，請稍後再試。');
    }
  }

  // 處理代理收益查詢
  static async handleAgentEarnings(chatId: number) {
    try {
      const agent = await agentService.getAgentByTelegramId(chatId);
      
      if (!agent) {
        await this.sendMessage(chatId, '❌ 您還不是代理，請先註冊成為代理。');
        return;
      }

      const earningsText = `💰 <b>代理收益</b>

📊 <b>收益概覽</b>
• 總銷售額：${agent.totalSales.toFixed(2)} USDT
• 總佣金：${agent.totalCommission.toFixed(2)} USDT
• 可提現：${agent.availableCommission.toFixed(2)} USDT
• 佣金比例：${agent.commissionRate}%

📈 <b>等級權益</b>
• 當前等級：${agent.level.icon} ${agent.level.name}
• 等級要求：銷售額 ${agent.level.minSales} USDT，團隊 ${agent.level.minTeamSize} 人
• 下級等級：${this.getNextLevelInfo(agent.level.level)}

💡 <b>提升建議</b>
${this.getLevelUpgradeAdvice(agent)}`;

      const keyboard = [
        [
          { text: '💳 申請提現', callback_data: 'agent_withdrawal' },
          { text: '📈 績效分析', callback_data: 'agent_performance' }
        ],
        [
          { text: '🔙 返回代理系統', callback_data: 'agent_system' }
        ]
      ];

      await this.sendMessageWithKeyboard(chatId, earningsText, keyboard);
    } catch (error) {
      console.error('處理代理收益查詢失敗:', error);
      await this.sendMessage(chatId, '❌ 獲取代理收益失敗，請稍後再試。');
    }
  }

  // 處理代理團隊管理
  static async handleAgentTeam(chatId: number) {
    try {
      const agent = await agentService.getAgentByTelegramId(chatId);
      
      if (!agent) {
        await this.sendMessage(chatId, '❌ 您還不是代理，請先註冊成為代理。');
        return;
      }

      const team = await agentService.getAgentTeam(agent.id);
      
      let teamText = `👥 <b>團隊管理</b>

📊 <b>團隊概覽</b>
• 團隊人數：${agent.teamSize} 人
• 團隊銷售：${agent.teamSales.toFixed(2)} USDT

📋 <b>團隊成員</b>`;

      if (team.length === 0) {
        teamText += '\n• 暫無團隊成員';
      } else {
        team.forEach((member, index) => {
          teamText += `\n${index + 1}. ${member.memberType === 'direct' ? '直接' : '間接'}成員 (${member.totalSales.toFixed(2)} USDT)`;
        });
      }

      teamText += `\n\n💡 <b>團隊建設建議</b>
• 積極推薦新代理加入
• 幫助團隊成員提升業績
• 定期溝通和培訓`;

      const keyboard = [
        [
          { text: '🔗 推薦碼', callback_data: 'agent_referral' },
          { text: '📈 績效分析', callback_data: 'agent_performance' }
        ],
        [
          { text: '🔙 返回代理系統', callback_data: 'agent_system' }
        ]
      ];

      await this.sendMessageWithKeyboard(chatId, teamText, keyboard);
    } catch (error) {
      console.error('處理代理團隊管理失敗:', error);
      await this.sendMessage(chatId, '❌ 獲取團隊信息失敗，請稍後再試。');
    }
  }

  // 處理代理訂單查詢
  static async handleAgentOrders(chatId: number) {
    try {
      const agent = await agentService.getAgentByTelegramId(chatId);
      
      if (!agent) {
        await this.sendMessage(chatId, '❌ 您還不是代理，請先註冊成為代理。');
        return;
      }

      const ordersText = `📋 <b>代理訂單</b>

📊 <b>訂單統計</b>
• 總訂單數：${agent.totalSales > 0 ? Math.ceil(agent.totalSales / 100) : 0} 筆
• 平均訂單金額：${agent.totalSales > 0 ? (agent.totalSales / Math.ceil(agent.totalSales / 100)).toFixed(2) : 0} USDT

💡 <b>訂單管理</b>
• 關注客戶訂單狀態
• 及時處理售後問題
• 提升客戶滿意度`;

      const keyboard = [
        [
          { text: '💰 收益查詢', callback_data: 'agent_earnings' },
          { text: '📈 績效分析', callback_data: 'agent_performance' }
        ],
        [
          { text: '🔙 返回代理系統', callback_data: 'agent_system' }
        ]
      ];

      await this.sendMessageWithKeyboard(chatId, ordersText, keyboard);
    } catch (error) {
      console.error('處理代理訂單查詢失敗:', error);
      await this.sendMessage(chatId, '❌ 獲取訂單信息失敗，請稍後再試。');
    }
  }

  // 處理代理提現申請
  static async handleAgentWithdrawal(chatId: number) {
    try {
      const agent = await agentService.getAgentByTelegramId(chatId);
      
      if (!agent) {
        await this.sendMessage(chatId, '❌ 您還不是代理，請先註冊成為代理。');
        return;
      }

      if (agent.availableCommission < 50) {
        await this.sendMessage(chatId, `❌ 可提現佣金不足。\n\n💰 當前可提現：${agent.availableCommission.toFixed(2)} USDT\n💳 最低提現金額：50 USDT`);
        return;
      }

      const withdrawalText = `💳 <b>申請提現</b>

💰 <b>提現信息</b>
• 可提現佣金：${agent.availableCommission.toFixed(2)} USDT
• 最低提現：50 USDT
• 手續費：2%
• 處理時間：24小時內

📝 <b>提現流程</b>
1. 聯繫客服申請提現
2. 提供錢包地址
3. 確認提現金額
4. 等待處理完成

💡 <b>注意事項</b>
• 請確保錢包地址正確
• 提現手續費將從提現金額中扣除
• 如有問題請聯繫客服`;

      const keyboard = [
        [
          { text: '📞 聯繫客服', callback_data: 'contact_support' },
          { text: '💰 收益查詢', callback_data: 'agent_earnings' }
        ],
        [
          { text: '🔙 返回代理系統', callback_data: 'agent_system' }
        ]
      ];

      await this.sendMessageWithKeyboard(chatId, withdrawalText, keyboard);
    } catch (error) {
      console.error('處理代理提現申請失敗:', error);
      await this.sendMessage(chatId, '❌ 處理提現申請失敗，請稍後再試。');
    }
  }

  // 處理代理績效分析
  static async handleAgentPerformance(chatId: number) {
    try {
      const agent = await agentService.getAgentByTelegramId(chatId);
      
      if (!agent) {
        await this.sendMessage(chatId, '❌ 您還不是代理，請先註冊成為代理。');
        return;
      }

      const performance = await agentService.getAgentPerformance(
        agent.id,
        'monthly',
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        new Date()
      );

      const performanceText = `📈 <b>績效分析</b>

📊 <b>本月績效</b>
• 訂單數量：${performance.totalOrders} 筆
• 銷售金額：${performance.totalSales.toFixed(2)} USDT
• 佣金收入：${performance.totalCommission.toFixed(2)} USDT
• 平均訂單：${performance.averageOrderValue.toFixed(2)} USDT

🎯 <b>目標達成</b>
• 銷售目標：${this.getSalesTarget(agent.level.level)} USDT
• 完成進度：${this.getProgressPercentage(agent.totalSales, this.getSalesTarget(agent.level.level))}%

💡 <b>提升建議</b>
${this.getPerformanceAdvice(agent, performance)}`;

      const keyboard = [
        [
          { text: '💰 收益查詢', callback_data: 'agent_earnings' },
          { text: '👥 團隊管理', callback_data: 'agent_team' }
        ],
        [
          { text: '🔙 返回代理系統', callback_data: 'agent_system' }
        ]
      ];

      await this.sendMessageWithKeyboard(chatId, performanceText, keyboard);
    } catch (error) {
      console.error('處理代理績效分析失敗:', error);
      await this.sendMessage(chatId, '❌ 獲取績效分析失敗，請稍後再試。');
    }
  }

  // 處理代理推薦碼
  static async handleAgentReferral(chatId: number) {
    try {
      const agent = await agentService.getAgentByTelegramId(chatId);
      
      if (!agent) {
        await this.sendMessage(chatId, '❌ 您還不是代理，請先註冊成為代理。');
        return;
      }

      const referralText = `🔗 <b>推薦碼</b>

🎯 <b>您的推薦碼</b>
• 推薦碼：<code>${agent.referralCode}</code>
• 分享鏈接：https://t.me/your_bot?start=${agent.referralCode}

💰 <b>推薦獎勵</b>
• 推薦新代理：10 USDT 獎金
• 新代理首單：額外佣金
• 團隊建設：長期收益

📱 <b>分享方式</b>
1. 複製推薦碼發送給朋友
2. 分享專屬鏈接
3. 在社交媒體宣傳
4. 線下推廣活動

💡 <b>推廣技巧</b>
• 突出產品優勢
• 分享成功案例
• 提供專業建議
• 建立信任關係`;

      const keyboard = [
        [
          { text: '📋 複製推薦碼', callback_data: 'copy_referral_code' },
          { text: '🔗 分享鏈接', callback_data: 'share_referral_link' }
        ],
        [
          { text: '💰 收益查詢', callback_data: 'agent_earnings' },
          { text: '👥 團隊管理', callback_data: 'agent_team' }
        ],
        [
          { text: '🔙 返回代理系統', callback_data: 'agent_system' }
        ]
      ];

      await this.sendMessageWithKeyboard(chatId, referralText, keyboard);
    } catch (error) {
      console.error('處理代理推薦碼失敗:', error);
      await this.sendMessage(chatId, '❌ 獲取推薦碼失敗，請稍後再試。');
    }
  }

  // 處理代理註冊
  static async handleAgentRegister(chatId: number) {
    try {
      const existingAgent = await agentService.getAgentByTelegramId(chatId);
      
      if (existingAgent) {
        await this.sendMessage(chatId, '✅ 您已經是代理了！\n\n📊 查看代理狀態：/agent_status');
        return;
      }

      const registerText = `📝 <b>代理註冊</b>

🎯 <b>成為代理的好處</b>
• 銷售佣金：5%-18%
• 團隊獎勵：額外收益
• 推薦獎金：10 USDT
• 等級晉升：更多權益

📋 <b>註冊要求</b>
• 年滿18歲
• 有銷售經驗
• 願意推廣產品
• 遵守代理規則

💡 <b>註冊流程</b>
1. 填寫基本信息
2. 等待審核通過
3. 開始推廣銷售
4. 獲得佣金收益

🔗 <b>開始註冊</b>
請聯繫客服進行代理註冊，或使用推薦碼註冊。`;

      const keyboard = [
        [
          { text: '📞 聯繫客服', callback_data: 'contact_support' },
          { text: '🔗 使用推薦碼', callback_data: 'use_referral_code' }
        ],
        [
          { text: '🔙 返回代理系統', callback_data: 'agent_system' }
        ]
      ];

      await this.sendMessageWithKeyboard(chatId, registerText, keyboard);
    } catch (error) {
      console.error('處理代理註冊失敗:', error);
      await this.sendMessage(chatId, '❌ 處理代理註冊失敗，請稍後再試。');
    }
  }

  // 輔助方法
  
  // 獲取代理狀態文本
  private static getAgentStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': '待審核',
      'active': '活躍',
      'suspended': '暫停',
      'terminated': '終止',
      'inactive': '不活躍'
    };
    return statusMap[status] || '未知';
  }

  // 獲取下級等級信息
  private static getNextLevelInfo(currentLevel: number): string {
    if (currentLevel >= 5) return '已達最高等級';
    
    const nextLevels = [
      '銀牌代理 (1000 USDT, 5人)',
      '金牌代理 (5000 USDT, 15人)',
      '白金代理 (15000 USDT, 30人)',
      '鑽石代理 (50000 USDT, 50人)'
    ];
    
    return nextLevels[currentLevel - 1] || '未知';
  }

  // 獲取等級升級建議
  private static getLevelUpgradeAdvice(agent: any): string {
    const currentLevel = agent.level.level;
    const nextLevel = currentLevel + 1;
    
    if (nextLevel > 5) return '🎉 恭喜！您已達到最高等級。';
    
    const nextLevels = [
      { sales: 1000, team: 5 },
      { sales: 5000, team: 15 },
      { sales: 15000, team: 30 },
      { sales: 50000, team: 50 }
    ];
    
    const target = nextLevels[currentLevel - 1];
    if (!target) return '💡 繼續努力，提升業績！';
    
    const salesDiff = target.sales - agent.totalSales;
    const teamDiff = target.team - agent.teamSize;
    
    let advice = '💡 升級建議：\n';
    if (salesDiff > 0) advice += `• 增加銷售額 ${salesDiff.toFixed(2)} USDT\n`;
    if (teamDiff > 0) advice += `• 擴展團隊 ${teamDiff} 人\n`;
    
    return advice;
  }

  // 獲取銷售目標
  private static getSalesTarget(level: number): number {
    const targets = [0, 1000, 5000, 15000, 50000];
    return targets[level] || 0;
  }

  // 獲取進度百分比
  private static getProgressPercentage(current: number, target: number): string {
    if (target === 0) return '0%';
    const percentage = (current / target) * 100;
    return Math.min(percentage, 100).toFixed(1) + '%';
  }

  // 獲取績效建議
  private static getPerformanceAdvice(agent: any, performance: any): string {
    if (performance.totalOrders === 0) {
      return '💡 本月還沒有訂單，建議：\n• 積極推廣產品\n• 聯繫潛在客戶\n• 參加培訓活動';
    }
    
    if (performance.averageOrderValue < 100) {
      return '💡 平均訂單金額偏低，建議：\n• 推薦高價值產品\n• 提供組合優惠\n• 提升客戶體驗';
    }
    
    return '💡 業績表現良好，建議：\n• 保持推廣力度\n• 擴展客戶群體\n• 提升服務質量';
  }
}
