import { onRequest } from 'firebase-functions/v2/https';
import { TelegramBotService } from './services/telegram';
import { AuthService } from './services/auth';
import { DatabaseService } from './services/database';

// Telegram Webhook 處理器
export const telegramWebhook = onRequest({
  cors: true,
  maxInstances: 10
}, async (req, res) => {
  try {
    // 只處理 POST 請求
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const update = req.body;
    console.log('Received Telegram update:', JSON.stringify(update, null, 2));

    // 處理回調查詢
    if (update.callback_query) {
      await TelegramBotService.handleCallbackQuery(update.callback_query);
      return res.json({ success: true });
    }

    // 處理消息
    if (update.message) {
      const message = update.message;
      const chatId = message.chat.id;
      const from = message.from;
      const text = message.text;

      // 檢查是否為私聊
      if (message.chat.type !== 'private') {
        return res.json({ success: true });
      }

      // 處理命令
      if (text && text.startsWith('/')) {
        await handleCommand(chatId, from, text);
      } else if (text) {
        // 處理普通文本消息
        await handleTextMessage(chatId, from, text);
      }

      return res.json({ success: true });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 處理命令
async function handleCommand(chatId: number, from: any, command: string) {
  try {
    switch (command) {
      case '/start':
        await handleStartCommand(chatId, from);
        break;
        
      case '/help':
        await TelegramBotService.sendHelpKeyboard(chatId);
        break;
        
      case '/menu':
        await handleStartCommand(chatId, from);
        break;
        
      case '/products':
        const categories = await DatabaseService.getCategories();
        await TelegramBotService.sendCategoryKeyboard(chatId, categories);
        break;
        
      case '/cart':
        await TelegramBotService.sendCartKeyboard(chatId, []);
        break;
        
      case '/orders':
        await TelegramBotService.sendMessage(chatId, '📋 正在查詢您的訂單...');
        break;
        
      case '/agent':
        await TelegramBotService.sendAgentSystemKeyboard(chatId);
        break;
        
      case '/language':
        await TelegramBotService.sendLanguageKeyboard(chatId);
        break;
        
      default:
        await TelegramBotService.sendMessage(chatId, 
          `❓ 未知命令：${command}\n\n💡 使用 /help 查看可用命令。`
        );
        break;
    }
  } catch (error) {
    console.error('Error handling command:', error);
    await TelegramBotService.sendMessage(chatId, '❌ 處理命令時發生錯誤，請稍後再試。');
  }
}

// 處理開始命令
async function handleStartCommand(chatId: number, from: any) {
  try {
    // 創建或獲取用戶
    const user = await AuthService.createOrGetUser({
      telegramId: from.id,
      username: from.username,
      firstName: from.first_name,
      lastName: from.last_name,
      languageCode: from.language_code
    });

    // 發送歡迎消息
    await TelegramBotService.sendWelcomeMessage(chatId, user);
    
    // 發送使用提示
    setTimeout(async () => {
      await TelegramBotService.sendMessage(chatId, 
        `💡 <b>使用提示</b>\n\n` +
        `• 點擊按鈕進行操作\n` +
        `• 使用 /menu 返回主選單\n` +
        `• 使用 /help 獲取幫助\n` +
        `• 24/7 客服隨時為您服務`
      );
    }, 2000);

  } catch (error) {
    console.error('Error handling start command:', error);
    await TelegramBotService.sendMessage(chatId, '❌ 初始化失敗，請稍後再試。');
  }
}

// 處理文本消息
async function handleTextMessage(chatId: number, from: any, text: string) {
  try {
    // 檢查是否為搜尋請求
    if (text.length > 2 && text.length < 50) {
      await handleSearchRequest(chatId, text);
      return;
    }

    // 檢查是否為客服消息
    if (text.toLowerCase().includes('客服') || text.toLowerCase().includes('help')) {
      await TelegramBotService.sendMessage(chatId, 
        `📞 <b>客服支援</b>\n\n` +
        `• 24/7 在線客服\n` +
        `• 專業技術支援\n` +
        `• 快速問題解決\n\n` +
        `💬 請描述您的問題，客服會盡快回覆您。`
      );
      return;
    }

    // 默認回應
    await TelegramBotService.sendMessage(chatId, 
      `💬 收到您的消息：${text}\n\n` +
      `💡 請使用按鈕或命令進行操作。\n` +
      `🔙 使用 /menu 返回主選單。`
    );

  } catch (error) {
    console.error('Error handling text message:', error);
    await TelegramBotService.sendMessage(chatId, '❌ 處理消息時發生錯誤，請稍後再試。');
  }
}

// 處理搜尋請求
async function handleSearchRequest(chatId: number, searchTerm: string) {
  try {
    // 這裡需要實現商品搜尋邏輯
    await TelegramBotService.sendMessage(chatId, 
      `🔍 正在搜尋「${searchTerm}」...\n\n` +
      `💡 搜尋功能開發中，請稍後使用。`
    );
  } catch (error) {
    console.error('Error handling search request:', error);
    await TelegramBotService.sendMessage(chatId, '❌ 搜尋失敗，請稍後再試。');
  }
}

// 設置 Webhook 的輔助函數
export const setWebhook = onRequest(async (req, res) => {
  try {
    const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!webhookUrl || !botToken) {
      return res.status(500).json({ 
        error: 'Missing webhook URL or bot token' 
      });
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query']
        })
      }
    );

    const result = await response.json();
    
    if (result.ok) {
      res.json({ 
        success: true, 
        message: 'Webhook set successfully',
        result 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Failed to set webhook',
        result 
      });
    }
  } catch (error) {
    console.error('Error setting webhook:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// 獲取 Bot 信息的輔助函數
export const getBotInfo = onRequest(async (req, res) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      return res.status(500).json({ 
        error: 'Missing bot token' 
      });
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getMe`
    );

    const result = await response.json();
    
    if (result.ok) {
      res.json({ 
        success: true, 
        botInfo: result.result 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Failed to get bot info',
        result 
      });
    }
  } catch (error) {
    console.error('Error getting bot info:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});
