import { NextRequest, NextResponse } from 'next/server';
import { telegramService } from '@/lib/telegramService';
import { TelegramUpdate, TelegramBotConfig } from '@/types/telegram';

// Telegram Webhook 處理器
export async function POST(request: NextRequest) {
  try {
    // 驗證請求來源（可選：驗證 Telegram 的 secret token）
    const update: TelegramUpdate = await request.json();
    
    if (!update || !update.update_id) {
      return NextResponse.json(
        { error: 'Invalid update format' },
        { status: 400 }
      );
    }

    // 檢查 Bot 配置
    const config = telegramService.getConfig();
    if (!config || !config.botToken) {
      console.error('Bot Token 未配置');
      return NextResponse.json(
        { error: 'Bot not configured' },
        { status: 500 }
      );
    }

    // 處理更新
    await telegramService.handleUpdate(update);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook 處理錯誤:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 健康檢查
export async function GET(request: NextRequest) {
  try {
    const config = telegramService.getConfig();
    
    return NextResponse.json({
      status: 'ok',
      configured: !!config?.botToken,
      webhook_url: request.url,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    );
  }
}
