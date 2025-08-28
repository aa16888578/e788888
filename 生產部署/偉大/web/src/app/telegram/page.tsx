'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TelegramPage() {
  const [botStatus, setBotStatus] = useState('未配置');
  const [webhookStatus, setWebhookStatus] = useState('未設置');
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // 檢查本地存儲的 Bot 配置
    const savedConfig = localStorage.getItem('telegram_bot_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        setBotStatus(parsed.botToken ? '已配置' : '待配置');
        setWebhookStatus(parsed.webhookUrl ? '已設置' : '需要設置');
      } catch (error) {
        setBotStatus('配置錯誤');
      }
    } else {
      setBotStatus('待配置');
      setWebhookStatus('需要設置');
    }
  }, []);

  const getStatusColor = (status: string) => {
    if (status.includes('已')) return 'text-green-600 bg-green-100';
    if (status.includes('待') || status.includes('需要')) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusDotColor = (status: string) => {
    if (status.includes('已')) return 'bg-green-500';
    if (status.includes('待') || status.includes('需要')) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              ← 返回首頁
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Telegram Bot 管理</h1>
            <Link
              href="/admin/telegram"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              高級設置
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            CVV Bot 智能助手
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            專業的 CVV 卡片交易 Telegram Bot - 智能搜索、一鍵購買、自動發貨
          </p>
        </div>

        {/* Bot 狀態 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">📊 Bot 狀態</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Bot 連接狀態</div>
                  <div className="text-sm text-gray-600">
                    {config?.botUsername ? `@${config.botUsername}` : 'Bot 未配置'}
                  </div>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(botStatus)}`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${getStatusDotColor(botStatus)}`}></span>
                  {botStatus}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Webhook 狀態</div>
                  <div className="text-sm text-gray-600">接收用戶消息</div>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(webhookStatus)}`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${getStatusDotColor(webhookStatus)}`}></span>
                  {webhookStatus}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">管理員數量</div>
                  <div className="text-sm text-gray-600">擁有管理權限的用戶</div>
                </div>
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {config?.adminChatIds?.length || 0} 個
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-600">💳 CVV Bot 功能</h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mr-3">🌍</div>
                <div>
                  <div className="font-medium">CVV 卡片瀏覽</div>
                  <div className="text-sm text-gray-600">按國家分類瀏覽卡片</div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mr-3">🔍</div>
                <div>
                  <div className="font-medium">智能搜索</div>
                  <div className="text-sm text-gray-600">快速找到需要的卡片</div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mr-3">🛒</div>
                <div>
                  <div className="font-medium">一鍵購買</div>
                  <div className="text-sm text-gray-600">快速下單，自動發貨</div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mr-3">💰</div>
                <div>
                  <div className="font-medium">USDT 支付</div>
                  <div className="text-sm text-gray-600">TRC20 加密貨幣支付</div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mr-3">👥</div>
                <div>
                  <div className="font-medium">代理系統</div>
                  <div className="text-sm text-gray-600">多層級代理分潤</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bot 命令 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-green-600">📋 Bot 命令列表</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { cmd: '/start', desc: '開始使用 CVV Bot', icon: '🚀' },
              { cmd: '/menu', desc: '顯示主選單', icon: '🏠' },
              { cmd: '/search', desc: '搜索 CVV 卡片', icon: '🔍' },
              { cmd: '/balance', desc: '查看餘額', icon: '💰' },
              { cmd: '/history', desc: '查看購買歷史', icon: '📜' },
              { cmd: '/help', desc: '獲取幫助', icon: '❓' }
            ].map((item) => (
              <div key={item.cmd} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <span className="font-mono text-blue-600 text-sm font-medium">{item.cmd}</span>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 管理工具 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl mb-4">⚙️</div>
            <h3 className="text-lg font-semibold mb-2">Bot 配置</h3>
            <p className="text-gray-600 text-sm mb-4">配置 Token、Webhook 和命令</p>
            <Link
              href="/admin/telegram"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full"
            >
              配置 Bot
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">使用統計</h3>
            <p className="text-gray-600 text-sm mb-4">查看用戶活躍度和交易數據</p>
            <button className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed w-full">
              開發中
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl mb-4">🔧</div>
            <h3 className="text-lg font-semibold mb-2">測試工具</h3>
            <p className="text-gray-600 text-sm mb-4">測試 Bot 消息和功能</p>
            <Link
              href="/admin/telegram"
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors w-full"
            >
              測試功能
            </Link>
          </div>
        </div>

        {/* 狀態提示 */}
        <div className={`rounded-lg p-8 text-center ${
          config?.botToken ? 'bg-green-50' : 'bg-blue-50'
        }`}>
          {config?.botToken ? (
            <>
              <h3 className="text-2xl font-bold text-green-900 mb-4">
                ✅ CVV Bot 配置完成！
              </h3>
              <p className="text-green-700 mb-6">
                Bot (@{config.botUsername}) 已配置完成，包含完整的 CVV 交易功能 - 瀏覽、搜索、購買、支付、代理系統
              </p>
              <div className="flex justify-center space-x-4">
                <Link 
                  href="/admin/telegram" 
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  管理 Bot
                </Link>
                <Link 
                  href="/bot" 
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  預覽界面
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                🚧 CVV Bot 需要配置
              </h3>
              <p className="text-blue-700 mb-6">
                請先配置 Telegram Bot Token 和 Webhook 來啟用 CVV 交易功能
              </p>
              <div className="flex justify-center space-x-4">
                <Link 
                  href="/admin/telegram" 
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  開始配置
                </Link>
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  創建 Bot
                </a>
              </div>
            </>
          )}
        </div>

        {/* 使用指南 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">📖 CVV Bot 使用指南</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">🔧 管理員功能</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 配置 Bot Token 和 Webhook</li>
                <li>• 管理 CVV 卡片庫存</li>
                <li>• 查看交易統計和收入</li>
                <li>• 處理用戶反饋和問題</li>
                <li>• 設置代理分潤規則</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-3">👥 用戶體驗</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 直觀的按鈕式操作界面</li>
                <li>• 快速搜索和篩選功能</li>
                <li>• 一鍵購買，自動發貨</li>
                <li>• 實時餘額和交易記錄</li>
                <li>• 24/7 智能客服支持</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}