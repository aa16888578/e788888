'use client';

import { useState, useEffect } from 'react';
import { telegramService } from '@/lib/telegramService';
import { 
  TelegramBotConfig, 
  TelegramWebhookInfo,
  TelegramBotStats,
  TELEGRAM_BOT_COMMANDS 
} from '@/types/telegram';

export default function TelegramBotManagePage() {
  const [config, setConfig] = useState<TelegramBotConfig>({
    botToken: '',
    botUsername: '',
    webhookUrl: '',
    adminChatIds: [],
    allowedChatIds: [],
    enableWebhook: true,
    enablePolling: false,
    maxConnections: 40,
    allowedUpdates: ['message', 'callback_query']
  });

  const [botInfo, setBotInfo] = useState<any>(null);
  const [webhookInfo, setWebhookInfo] = useState<TelegramWebhookInfo | null>(null);
  const [botStats, setBotStats] = useState<TelegramBotStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testChatId, setTestChatId] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // 加載保存的配置
  useEffect(() => {
    const savedConfig = localStorage.getItem('telegram_bot_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        telegramService.setConfig(parsed);
      } catch (error) {
        console.error('載入配置失敗:', error);
      }
    }
  }, []);

  // 保存配置
  const saveConfig = () => {
    localStorage.setItem('telegram_bot_config', JSON.stringify(config));
    telegramService.setConfig(config);
    alert('配置已保存！');
  };

  // 驗證 Bot Token
  const validateToken = async () => {
    if (!config.botToken) {
      alert('請先輸入 Bot Token');
      return;
    }

    setLoading(true);
    try {
      const isValid = await telegramService.validateBotToken(config.botToken);
      if (isValid) {
        const info = await telegramService.getBotInfo(config.botToken);
        setBotInfo(info);
        setConfig(prev => ({ ...prev, botUsername: info.username }));
        alert('Bot Token 驗證成功！');
      } else {
        alert('Bot Token 無效，請檢查後重試');
      }
    } catch (error) {
      console.error('驗證失敗:', error);
      alert('驗證失敗: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 設置 Webhook
  const setupWebhook = async () => {
    if (!config.botToken || !config.webhookUrl) {
      alert('請先設置 Bot Token 和 Webhook URL');
      return;
    }

    setLoading(true);
    try {
      const success = await telegramService.setWebhook(config.webhookUrl, config.botToken);
      if (success) {
        alert('Webhook 設置成功！');
        await getWebhookInfo();
      } else {
        alert('Webhook 設置失敗');
      }
    } catch (error) {
      console.error('設置 Webhook 失敗:', error);
      alert('設置失敗: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 刪除 Webhook
  const deleteWebhook = async () => {
    if (!config.botToken) {
      alert('請先設置 Bot Token');
      return;
    }

    setLoading(true);
    try {
      const success = await telegramService.deleteWebhook(config.botToken);
      if (success) {
        alert('Webhook 已刪除！');
        setWebhookInfo(null);
      } else {
        alert('刪除 Webhook 失敗');
      }
    } catch (error) {
      console.error('刪除 Webhook 失敗:', error);
      alert('刪除失敗: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 獲取 Webhook 信息
  const getWebhookInfo = async () => {
    if (!config.botToken) return;

    try {
      const info = await telegramService.getWebhookInfo(config.botToken);
      setWebhookInfo(info);
    } catch (error) {
      console.error('獲取 Webhook 信息失敗:', error);
    }
  };

  // 設置 Bot 命令
  const setBotCommands = async () => {
    if (!config.botToken) {
      alert('請先設置 Bot Token');
      return;
    }

    setLoading(true);
    try {
      const success = await telegramService.setBotCommands(config.botToken);
      if (success) {
        alert('Bot 命令設置成功！');
      } else {
        alert('設置 Bot 命令失敗');
      }
    } catch (error) {
      console.error('設置 Bot 命令失敗:', error);
      alert('設置失敗: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 發送測試消息
  const sendTestMessage = async () => {
    if (!config.botToken || !testChatId || !testMessage) {
      alert('請填寫所有測試字段');
      return;
    }

    setLoading(true);
    try {
      const result = await telegramService.sendMessage(testChatId, testMessage);
      if (result) {
        alert('測試消息發送成功！');
        setTestMessage('');
        setTestChatId('');
      } else {
        alert('發送測試消息失敗');
      }
    } catch (error) {
      console.error('發送測試消息失敗:', error);
      alert('發送失敗: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 廣播消息
  const handleBroadcast = async () => {
    if (!broadcastMessage || config.adminChatIds.length === 0) {
      alert('請輸入廣播消息並設置管理員 Chat ID');
      return;
    }

    setLoading(true);
    try {
      const chatIds = config.adminChatIds.map(id => parseInt(id));
      const successCount = await telegramService.broadcastMessage(broadcastMessage, chatIds);
      alert(`廣播完成！成功發送給 ${successCount} 個用戶`);
      setBroadcastMessage('');
    } catch (error) {
      console.error('廣播失敗:', error);
      alert('廣播失敗: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🤖 Telegram Bot 管理</h1>
          <p className="text-gray-600 mt-2">配置和管理 CVV Bot 的 Telegram 機器人</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 基本配置 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">🔧 基本配置</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bot Token
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      value={config.botToken}
                      onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
                      placeholder="請輸入從 @BotFather 獲得的 Bot Token"
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={validateToken}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? '驗證中...' : '驗證'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bot 用戶名
                  </label>
                  <input
                    type="text"
                    value={config.botUsername}
                    onChange={(e) => setConfig({ ...config, botUsername: e.target.value })}
                    placeholder="Bot 用戶名（驗證 Token 後自動填入）"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={config.webhookUrl}
                    onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                    placeholder="https://your-domain.com/api/telegram/webhook"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    管理員 Chat ID（每行一個）
                  </label>
                  <textarea
                    value={config.adminChatIds.join('\n')}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      adminChatIds: e.target.value.split('\n').filter(id => id.trim()) 
                    })}
                    placeholder="123456789&#10;987654321"
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      最大連接數
                    </label>
                    <input
                      type="number"
                      value={config.maxConnections}
                      onChange={(e) => setConfig({ ...config, maxConnections: parseInt(e.target.value) })}
                      min="1"
                      max="100"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      運行模式
                    </label>
                    <select
                      value={config.enableWebhook ? 'webhook' : 'polling'}
                      onChange={(e) => setConfig({ 
                        ...config, 
                        enableWebhook: e.target.value === 'webhook',
                        enablePolling: e.target.value === 'polling'
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="webhook">Webhook</option>
                      <option value="polling">Polling</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={saveConfig}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    保存配置
                  </button>
                  <button
                    onClick={setBotCommands}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                  >
                    設置命令
                  </button>
                </div>
              </div>
            </div>

            {/* Webhook 管理 */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">🔗 Webhook 管理</h2>
              
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <button
                    onClick={setupWebhook}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    設置 Webhook
                  </button>
                  <button
                    onClick={deleteWebhook}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    刪除 Webhook
                  </button>
                  <button
                    onClick={getWebhookInfo}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                  >
                    檢查狀態
                  </button>
                </div>

                {webhookInfo && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Webhook 狀態</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">URL:</span>
                        <span className="font-mono">{webhookInfo.url || '未設置'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">待處理更新:</span>
                        <span className={`font-medium ${webhookInfo.pending_update_count > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {webhookInfo.pending_update_count}
                        </span>
                      </div>
                      {webhookInfo.last_error_message && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">最後錯誤:</span>
                          <span className="text-red-600 text-xs">{webhookInfo.last_error_message}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 測試功能 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">🧪 測試功能</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">發送測試消息</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={testChatId}
                      onChange={(e) => setTestChatId(e.target.value)}
                      placeholder="Chat ID"
                      className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="測試消息內容"
                      className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={sendTestMessage}
                    disabled={loading}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    發送測試消息
                  </button>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">廣播消息</h3>
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="輸入要廣播的消息內容"
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleBroadcast}
                    disabled={loading}
                    className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                  >
                    發送廣播
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 側邊欄信息 */}
          <div className="lg:col-span-1">
            {/* Bot 信息 */}
            {botInfo && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">🤖 Bot 信息</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">名稱:</span>
                    <span className="font-medium">{botInfo.first_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">用戶名:</span>
                    <span className="font-mono">@{botInfo.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID:</span>
                    <span className="font-mono">{botInfo.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">可接收消息:</span>
                    <span className={botInfo.can_read_all_group_messages ? 'text-green-600' : 'text-red-600'}>
                      {botInfo.can_read_all_group_messages ? '是' : '否'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bot 命令 */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">📋 Bot 命令</h3>
              <div className="space-y-2 text-sm">
                {TELEGRAM_BOT_COMMANDS.filter(cmd => cmd.enabled).map((cmd) => (
                  <div key={cmd.command} className="flex justify-between items-center py-1">
                    <div>
                      <span className="font-mono text-blue-600">/{cmd.command}</span>
                      {cmd.adminOnly && <span className="ml-2 px-1 bg-red-100 text-red-600 text-xs rounded">管理員</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 使用說明 */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-blue-900">📖 使用說明</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div>
                  <h4 className="font-medium mb-1">1. 創建 Bot</h4>
                  <p>與 @BotFather 對話創建新的 Bot，獲取 Bot Token</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">2. 配置 Token</h4>
                  <p>將 Bot Token 輸入上方表單並點擊驗證</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">3. 設置 Webhook</h4>
                  <p>配置 Webhook URL 以接收用戶消息</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">4. 測試功能</h4>
                  <p>使用測試功能確認 Bot 正常工作</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
