// Telegram Bot 相關類型定義

export interface TelegramBotConfig {
  botToken: string;
  botUsername: string;
  webhookUrl?: string;
  adminChatIds: string[];
  allowedChatIds?: string[];
  enableWebhook: boolean;
  enablePolling: boolean;
  maxConnections?: number;
  allowedUpdates: string[];
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  entities?: TelegramMessageEntity[];
  reply_to_message?: TelegramMessage;
}

export interface TelegramMessageEntity {
  type: string;
  offset: number;
  length: number;
  url?: string;
  user?: TelegramUser;
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  inline_message_id?: string;
  chat_instance: string;
  data?: string;
  game_short_name?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
  edited_channel_post?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export interface TelegramInlineKeyboard {
  inline_keyboard: TelegramInlineKeyboardButton[][];
}

export interface TelegramInlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
  web_app?: {
    url: string;
  };
  switch_inline_query?: string;
  switch_inline_query_current_chat?: string;
  pay?: boolean;
}

export interface TelegramReplyKeyboard {
  keyboard: TelegramKeyboardButton[][];
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
  input_field_placeholder?: string;
  selective?: boolean;
}

export interface TelegramKeyboardButton {
  text: string;
  request_contact?: boolean;
  request_location?: boolean;
  request_poll?: {
    type: string;
  };
  web_app?: {
    url: string;
  };
}

export interface TelegramBotCommand {
  command: string;
  description: string;
  handler: string;
  adminOnly?: boolean;
  enabled: boolean;
}

export interface TelegramBotStats {
  totalUsers: number;
  activeUsers: number;
  totalMessages: number;
  commandsUsed: Record<string, number>;
  lastActivity: Date;
  uptime: number;
}

export interface TelegramWebhookInfo {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  ip_address?: string;
  last_error_date?: number;
  last_error_message?: string;
  last_synchronization_error_date?: number;
  max_connections?: number;
  allowed_updates?: string[];
}

// CVV Bot 特定的 Telegram 消息類型
export interface CVVBotMessage {
  type: 'welcome' | 'menu' | 'search' | 'purchase' | 'order' | 'help' | 'error';
  userId: number;
  chatId: number;
  messageId?: number;
  content: string;
  data?: any;
  timestamp: Date;
}

export interface CVVBotSession {
  userId: number;
  chatId: number;
  state: 'idle' | 'browsing' | 'searching' | 'purchasing' | 'payment';
  currentAction?: string;
  data?: Record<string, any>;
  lastActivity: Date;
  createdAt: Date;
}

export interface CVVBotUser {
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  languageCode?: string;
  isActive: boolean;
  isBlocked: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  agentLevel?: number;
  balance: number;
  totalPurchases: number;
  totalSpent: number;
  referredBy?: number;
  referralCode: string;
  createdAt: Date;
  lastActivity: Date;
}

// Telegram Bot API 響應類型
export interface TelegramApiResponse<T = any> {
  ok: boolean;
  result?: T;
  error_code?: number;
  description?: string;
}

// Bot 命令定義
export const TELEGRAM_BOT_COMMANDS: TelegramBotCommand[] = [
  {
    command: 'start',
    description: '開始使用 CVV Bot',
    handler: 'handleStart',
    enabled: true
  },
  {
    command: 'menu',
    description: '顯示主選單',
    handler: 'handleMenu',
    enabled: true
  },
  {
    command: 'search',
    description: '搜索 CVV 卡片',
    handler: 'handleSearch',
    enabled: true
  },
  {
    command: 'balance',
    description: '查看餘額',
    handler: 'handleBalance',
    enabled: true
  },
  {
    command: 'history',
    description: '查看購買歷史',
    handler: 'handleHistory',
    enabled: true
  },
  {
    command: 'help',
    description: '獲取幫助',
    handler: 'handleHelp',
    enabled: true
  },
  {
    command: 'admin',
    description: '管理員功能',
    handler: 'handleAdmin',
    adminOnly: true,
    enabled: true
  },
  {
    command: 'stats',
    description: '查看統計數據',
    handler: 'handleStats',
    adminOnly: true,
    enabled: true
  },
  {
    command: 'broadcast',
    description: '廣播消息',
    handler: 'handleBroadcast',
    adminOnly: true,
    enabled: true
  }
];

// 常用回覆模板
export const TELEGRAM_MESSAGES = {
  WELCOME: `🎉 歡迎來到 CVV Bot！

💳 這裡是您購買高品質 CVV 卡片的最佳選擇
🔒 安全、快速、可靠的交易體驗
💰 支持 USDT-TRC20 支付

請選擇您需要的功能：`,

  MAIN_MENU: `🏠 主選單

請選擇您需要的功能：`,

  HELP: `❓ 使用幫助

🔍 /search - 搜索 CVV 卡片
💰 /balance - 查看餘額  
📜 /history - 查看購買歷史
🏠 /menu - 返回主選單

如需更多幫助，請聯繫管理員。`,

  ERROR: `❌ 發生錯誤

請稍後再試，或聯繫管理員獲取幫助。`,

  UNAUTHORIZED: `🚫 訪問被拒絕

您沒有權限執行此操作。`,

  MAINTENANCE: `🔧 系統維護中

系統正在進行維護，請稍後再試。`
} as const;

export type TelegramMessageType = keyof typeof TELEGRAM_MESSAGES;
