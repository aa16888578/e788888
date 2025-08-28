import { Router, Request, Response } from 'express';
import { db } from '../utils/firebase-admin';

const router = Router();

// Telegram Bot API 模擬端點
router.post('/telegram/webhook', async (req: Request, res: Response) => {
  try {
    const update = req.body;
    console.log('Received Telegram update:', JSON.stringify(update, null, 2));
    
    // 這裡模擬 Python Bot 的邏輯
    if (update.message) {
      const message = update.message;
      const chatId = message.chat.id;
      const text = message.text;
      
      // 存儲消息到 Firestore
      await db.collection('telegram_messages').add({
        chatId,
        text,
        userId: message.from?.id,
        username: message.from?.username,
        timestamp: new Date(),
        processed: false
      });
      
      // 模擬回應邏輯
      let responseText = '歡迎使用 CVV Bot！';
      
      if (text === '/start') {
        responseText = `🤖 歡迎使用 CVV Bot！\n\n可用指令：\n/cards - 查看可用卡片\n/balance - 查看餘額\n/help - 幫助信息`;
      } else if (text === '/cards') {
        responseText = '📋 正在載入可用的 CVV 卡片...';
      } else if (text === '/balance') {
        responseText = '💰 您的餘額: $0.00 USDT';
      } else if (text === '/help') {
        responseText = '📖 CVV Bot 幫助\n\n這是一個 CVV 卡片交易系統。\n請聯繫管理員獲取更多信息。';
      }
      
      // 存儲回應
      await db.collection('telegram_responses').add({
        chatId,
        text: responseText,
        timestamp: new Date(),
        sent: false
      });
    }
    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CVV 卡片 API 端點
router.get('/cvv/cards', async (req: Request, res: Response) => {
  try {
    // 模擬 CVV 卡片數據
    const mockCards = [
      {
        id: 'cvv_001',
        country: 'US',
        countryName: '美國',
        cardType: 'visa',
        price: 15.99,
        balanceRange: '$100-$500',
        successRate: '85%',
        status: 'available'
      },
      {
        id: 'cvv_002', 
        country: 'UK',
        countryName: '英國',
        cardType: 'mastercard',
        price: 18.50,
        balanceRange: '$200-$800',
        successRate: '92%',
        status: 'available'
      },
      {
        id: 'cvv_003',
        country: 'CA',
        countryName: '加拿大',
        cardType: 'visa',
        price: 12.99,
        balanceRange: '$50-$300',
        successRate: '78%',
        status: 'available'
      }
    ];
    
    res.json({
      success: true,
      data: mockCards,
      total: mockCards.length
    });
  } catch (error) {
    console.error('CVV cards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 用戶餘額查詢
router.get('/user/:userId/balance', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // 從 Firestore 查詢用戶餘額
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      // 創建新用戶
      await db.collection('users').doc(userId).set({
        telegramId: userId,
        balance: 0,
        isActive: true,
        createdAt: new Date(),
        lastActivity: new Date()
      });
      
      return res.json({
        success: true,
        data: {
          userId,
          balance: 0,
          currency: 'USDT'
        }
      });
    }
    
    const userData = userDoc.data();
    res.json({
      success: true,
      data: {
        userId,
        balance: userData?.balance || 0,
        currency: 'USDT'
      }
    });
  } catch (error) {
    console.error('User balance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 購買 CVV 卡片
router.post('/purchase', async (req: Request, res: Response) => {
  try {
    const { userId, cardId, quantity = 1 } = req.body;
    
    if (!userId || !cardId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // 創建購買記錄
    const purchaseRecord = {
      userId,
      cardId,
      quantity,
      status: 'pending',
      timestamp: new Date(),
      totalPrice: 15.99 * quantity // 模擬價格計算
    };
    
    const docRef = await db.collection('purchases').add(purchaseRecord);
    
    res.json({
      success: true,
      data: {
        purchaseId: docRef.id,
        ...purchaseRecord
      }
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 系統狀態
router.get('/status', async (req: Request, res: Response) => {
  try {
    // 檢查數據庫連接
    const testDoc = await db.collection('_health').doc('check').get();
    
    res.json({
      success: true,
      service: 'Python Bot API (Node.js Implementation)',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: 'connected',
      features: [
        'Telegram Bot Integration',
        'CVV Card Management', 
        'User Balance System',
        'Purchase Processing',
        'Real-time Updates'
      ]
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Service unavailable' 
    });
  }
});

export default router;
