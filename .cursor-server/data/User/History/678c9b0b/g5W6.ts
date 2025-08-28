// Telegram Bot 服務層

import {
  TelegramBotConfig,
  TelegramUpdate,
  TelegramMessage,
  TelegramInlineKeyboard,
  TelegramReplyKeyboard,
  TelegramApiResponse,
  TelegramWebhookInfo,
  TelegramBotStats,
  CVVBotUser,
  CVVBotSession,
  TELEGRAM_BOT_COMMANDS,
  TELEGRAM_MESSAGES
} from '@/types/telegram';

class TelegramService {
  private apiBaseUrl = 'https://api.telegram.org/bot';
  private config: TelegramBotConfig | null = null;

  // ============ 配置管理 ============

  /**
   * 設置 Bot 配置
   */
  setConfig(config: TelegramBotConfig) {
    this.config = config;
  }

  /**
   * 獲取 Bot 配置
   */
  getConfig(): TelegramBotConfig | null {
    return this.config;
  }

  /**
   * 驗證 Bot Token
   */
  async validateBotToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}${token}/getMe`);
      const data: TelegramApiResponse = await response.json();
      return data.ok;
    } catch (error) {
      console.error('驗證 Bot Token 失敗:', error);
      return false;
    }
  }

  /**
   * 獲取 Bot 信息
   */
  async getBotInfo(token?: string): Promise<any> {
    const botToken = token || this.config?.botToken;
    if (!botToken) {
      throw new Error('Bot Token 未設置');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}${botToken}/getMe`);
      const data: TelegramApiResponse = await response.json();
      
      if (!data.ok) {
        throw new Error(data.description || 'Failed to get bot info');
      }

      return data.result;
    } catch (error) {
      console.error('獲取 Bot 信息失敗:', error);
      throw error;
    }
  }

  // ============ Webhook 管理 ============

  /**
   * 設置 Webhook
   */
  async setWebhook(url: string, token?: string): Promise<boolean> {
    const botToken = token || this.config?.botToken;
    if (!botToken) {
      throw new Error('Bot Token 未設置');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}${botToken}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          allowed_updates: this.config?.allowedUpdates || ['message', 'callback_query'],
          max_connections: this.config?.maxConnections || 40
        }),
      });

      const data: TelegramApiResponse = await response.json();
      return data.ok;
    } catch (error) {
      console.error('設置 Webhook 失敗:', error);
      return false;
    }
  }

  /**
   * 刪除 Webhook
   */
  async deleteWebhook(token?: string): Promise<boolean> {
    const botToken = token || this.config?.botToken;
    if (!botToken) {
      throw new Error('Bot Token 未設置');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}${botToken}/deleteWebhook`, {
        method: 'POST',
      });

      const data: TelegramApiResponse = await response.json();
      return data.ok;
    } catch (error) {
      console.error('刪除 Webhook 失敗:', error);
      return false;
    }
  }

  /**
   * 獲取 Webhook 信息
   */
  async getWebhookInfo(token?: string): Promise<TelegramWebhookInfo | null> {
    const botToken = token || this.config?.botToken;
    if (!botToken) {
      throw new Error('Bot Token 未設置');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}${botToken}/getWebhookInfo`);
      const data: TelegramApiResponse<TelegramWebhookInfo> = await response.json();
      
      if (!data.ok) {
        throw new Error(data.description || 'Failed to get webhook info');
      }

      return data.result || null;
    } catch (error) {
      console.error('獲取 Webhook 信息失敗:', error);
      return null;
    }
  }

  // ============ 消息發送 ============

  /**
   * 發送文本消息
   */
  async sendMessage(
    chatId: number | string,
    text: string,
    options?: {
      parse_mode?: 'HTML' | 'Markdown';
      reply_markup?: TelegramInlineKeyboard | TelegramReplyKeyboard;
      disable_web_page_preview?: boolean;
      disable_notification?: boolean;
      reply_to_message_id?: number;
    }
  ): Promise<TelegramMessage | null> {
    if (!this.config?.botToken) {
      throw new Error('Bot Token 未設置');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}${this.config.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          ...options,
        }),
      });

      const data: TelegramApiResponse<TelegramMessage> = await response.json();
      
      if (!data.ok) {
        throw new Error(data.description || 'Failed to send message');
      }

      return data.result || null;
    } catch (error) {
      console.error('發送消息失敗:', error);
      return null;
    }
  }

  /**
   * 編輯消息
   */
  async editMessage(
    chatId: number | string,
    messageId: number,
    text: string,
    options?: {
      parse_mode?: 'HTML' | 'Markdown';
      reply_markup?: TelegramInlineKeyboard;
      disable_web_page_preview?: boolean;
    }
  ): Promise<boolean> {
    if (!this.config?.botToken) {
      throw new Error('Bot Token 未設置');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}${this.config.botToken}/editMessageText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text,
          ...options,
        }),
      });

      const data: TelegramApiResponse = await response.json();
      return data.ok;
    } catch (error) {
      console.error('編輯消息失敗:', error);
      return false;
    }
  }

  /**
   * 刪除消息
   */
  async deleteMessage(chatId: number | string, messageId: number): Promise<boolean> {
    if (!this.config?.botToken) {
      throw new Error('Bot Token 未設置');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}${this.config.botToken}/deleteMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
        }),
      });

      const data: TelegramApiResponse = await response.json();
      return data.ok;
    } catch (error) {
      console.error('刪除消息失敗:', error);
      return false;
    }
  }

  // ============ Bot 命令管理 ============

  /**
   * 設置 Bot 命令
   */
  async setBotCommands(token?: string): Promise<boolean> {
    const botToken = token || this.config?.botToken;
    if (!botToken) {
      throw new Error('Bot Token 未設置');
    }

    const commands = TELEGRAM_BOT_COMMANDS
      .filter(cmd => cmd.enabled && !cmd.adminOnly)
      .map(cmd => ({
        command: cmd.command,
        description: cmd.description
      }));

    try {
      const response = await fetch(`${this.apiBaseUrl}${botToken}/setMyCommands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commands,
        }),
      });

      const data: TelegramApiResponse = await response.json();
      return data.ok;
    } catch (error) {
      console.error('設置 Bot 命令失敗:', error);
      return false;
    }
  }

  /**
   * 獲取 Bot 命令
   */
  async getBotCommands(token?: string): Promise<any[]> {
    const botToken = token || this.config?.botToken;
    if (!botToken) {
      throw new Error('Bot Token 未設置');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}${botToken}/getMyCommands`);
      const data: TelegramApiResponse = await response.json();
      
      if (!data.ok) {
        throw new Error(data.description || 'Failed to get bot commands');
      }

      return data.result || [];
    } catch (error) {
      console.error('獲取 Bot 命令失敗:', error);
      return [];
    }
  }

  // ============ 鍵盤生成 ============

  /**
   * 生成主選單鍵盤
   */
  generateMainMenuKeyboard(): TelegramInlineKeyboard {
    return {
      inline_keyboard: [
        [
          { text: '🌍 全資庫', callback_data: 'menu_all_cards' },
          { text: '📚 課資庫', callback_data: 'menu_course_cards' }
        ],
        [
          { text: '💎 特價庫', callback_data: 'menu_special_cards' },
          { text: '🔍 搜索', callback_data: 'menu_search' }
        ],
        [
          { text: '💰 餘額', callback_data: 'menu_balance' },
          { text: '➕ 充值', callback_data: 'menu_recharge' }
        ],
        [
          { text: '📜 歷史', callback_data: 'menu_history' },
          { text: '👥 代理', callback_data: 'menu_agent' }
        ],
        [
          { text: '❓ 幫助', callback_data: 'menu_help' }
        ]
      ]
    };
  }

  /**
   * 生成國家選擇鍵盤
   */
  generateCountryKeyboard(): TelegramInlineKeyboard {
    const countries = [
      { code: 'US', name: '🇺🇸 美國', flag: '🇺🇸' },
      { code: 'CA', name: '🇨🇦 加拿大', flag: '🇨🇦' },
      { code: 'GB', name: '🇬🇧 英國', flag: '🇬🇧' },
      { code: 'DE', name: '🇩🇪 德國', flag: '🇩🇪' },
      { code: 'FR', name: '🇫🇷 法國', flag: '🇫🇷' },
      { code: 'ES', name: '🇪🇸 西班牙', flag: '🇪🇸' },
      { code: 'BR', name: '🇧🇷 巴西', flag: '🇧🇷' },
      { code: 'AR', name: '🇦🇷 阿根廷', flag: '🇦🇷' }
    ];

    const keyboard = [];
    for (let i = 0; i < countries.length; i += 2) {
      const row = [
        { text: countries[i].name, callback_data: `country_${countries[i].code}` }
      ];
      if (countries[i + 1]) {
        row.push({ text: countries[i + 1].name, callback_data: `country_${countries[i + 1].code}` });
      }
      keyboard.push(row);
    }

    keyboard.push([{ text: '🔙 返回主選單', callback_data: 'back_to_menu' }]);

    return { inline_keyboard: keyboard };
  }

  // ============ 消息處理 ============

  /**
   * 處理 Webhook 更新
   */
  async handleUpdate(update: TelegramUpdate): Promise<void> {
    try {
      if (update.message) {
        await this.handleMessage(update.message);
      } else if (update.callback_query) {
        await this.handleCallbackQuery(update.callback_query);
      }
    } catch (error) {
      console.error('處理更新失敗:', error);
    }
  }

  /**
   * 處理文本消息
   */
  private async handleMessage(message: TelegramMessage): Promise<void> {
    const chatId = message.chat.id;
    const text = message.text || '';
    const userId = message.from?.id;

    if (!userId) return;

    // 處理命令
    if (text.startsWith('/')) {
      const command = text.split(' ')[0].substring(1);
      await this.handleCommand(command, chatId, userId, message);
      return;
    }

    // 處理普通文本消息
    await this.handleTextMessage(text, chatId, userId, message);
  }

  /**
   * 處理回調查詢
   */
  private async handleCallbackQuery(callbackQuery: any): Promise<void> {
    const chatId = callbackQuery.message?.chat.id;
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;

    if (!chatId || !data) return;

    // 回應回調查詢
    await this.answerCallbackQuery(callbackQuery.id);

    // 處理回調數據
    await this.handleCallbackData(data, chatId, userId, callbackQuery.message);
  }

  /**
   * 處理命令
   */
  private async handleCommand(
    command: string, 
    chatId: number, 
    userId: number, 
    message: TelegramMessage
  ): Promise<void> {
    switch (command) {
      case 'start':
        await this.sendWelcomeMessage(chatId, userId);
        break;
      case 'menu':
        await this.sendMainMenu(chatId);
        break;
      case 'help':
        await this.sendMessage(chatId, TELEGRAM_MESSAGES.HELP);
        break;
      default:
        await this.sendMessage(chatId, '❓ 未知命令，請使用 /help 查看可用命令。');
    }
  }

  /**
   * 處理普通文本消息
   */
  private async handleTextMessage(
    text: string,
    chatId: number,
    userId: number,
    message: TelegramMessage
  ): Promise<void> {
    // 根據用戶當前狀態處理文本消息
    await this.sendMessage(chatId, '請使用 /menu 查看可用功能。');
  }

  /**
   * 處理回調數據
   */
  private async handleCallbackData(
    data: string,
    chatId: number,
    userId: number,
    message?: TelegramMessage
  ): Promise<void> {
    if (data.startsWith('menu_')) {
      const action = data.replace('menu_', '');
      await this.handleMenuAction(action, chatId, userId);
    } else if (data.startsWith('country_')) {
      const countryCode = data.replace('country_', '');
      await this.handleCountrySelection(countryCode, chatId, userId);
    } else if (data === 'back_to_menu') {
      await this.sendMainMenu(chatId);
    }
  }

  /**
   * 發送歡迎消息
   */
  private async sendWelcomeMessage(chatId: number, userId: number): Promise<void> {
    await this.sendMessage(chatId, TELEGRAM_MESSAGES.WELCOME, {
      reply_markup: this.generateMainMenuKeyboard()
    });
  }

  /**
   * 發送主選單
   */
  private async sendMainMenu(chatId: number): Promise<void> {
    await this.sendMessage(chatId, TELEGRAM_MESSAGES.MAIN_MENU, {
      reply_markup: this.generateMainMenuKeyboard()
    });
  }

  /**
   * 處理選單動作
   */
  private async handleMenuAction(action: string, chatId: number, userId: number): Promise<void> {
    switch (action) {
      case 'all_cards':
        await this.sendMessage(chatId, '🌍 全資庫\n\n請選擇國家：', {
          reply_markup: this.generateCountryKeyboard()
        });
        break;
      case 'search':
        await this.sendMessage(chatId, '🔍 搜索功能\n\n請輸入您要搜索的國家代碼或銀行名稱：');
        break;
      case 'balance':
        await this.sendMessage(chatId, '💰 您的餘額：$0.00 USDT\n\n點擊充值增加餘額。', {
          reply_markup: {
            inline_keyboard: [
              [{ text: '➕ 充值', callback_data: 'menu_recharge' }],
              [{ text: '🔙 返回主選單', callback_data: 'back_to_menu' }]
            ]
          }
        });
        break;
      default:
        await this.sendMessage(chatId, '🚧 此功能正在開發中...');
    }
  }

  /**
   * 處理國家選擇
   */
  private async handleCountrySelection(countryCode: string, chatId: number, userId: number): Promise<void> {
    await this.sendMessage(chatId, `🏳️ 您選擇了 ${countryCode}\n\n正在加載可用的 CVV 卡片...`);
  }

  /**
   * 回應回調查詢
   */
  private async answerCallbackQuery(callbackQueryId: string, text?: string): Promise<boolean> {
    if (!this.config?.botToken) return false;

    try {
      const response = await fetch(`${this.apiBaseUrl}${this.config.botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: text || '',
        }),
      });

      const data: TelegramApiResponse = await response.json();
      return data.ok;
    } catch (error) {
      console.error('回應回調查詢失敗:', error);
      return false;
    }
  }

  // ============ 統計和管理 ============

  /**
   * 獲取 Bot 統計
   */
  async getBotStats(): Promise<TelegramBotStats | null> {
    // 這裡需要從數據庫獲取統計數據
    // 暫時返回模擬數據
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalMessages: 0,
      commandsUsed: {},
      lastActivity: new Date(),
      uptime: 0
    };
  }

  /**
   * 廣播消息
   */
  async broadcastMessage(message: string, userIds: number[]): Promise<number> {
    let successCount = 0;

    for (const userId of userIds) {
      try {
        const result = await this.sendMessage(userId, message);
        if (result) {
          successCount++;
        }
        // 避免觸發速率限制
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`向用戶 ${userId} 發送消息失敗:`, error);
      }
    }

    return successCount;
  }
}

// 創建單例實例
export const telegramService = new TelegramService();
export default telegramService;
