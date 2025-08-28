'use client';

import Link from 'next/link';

export default function TelegramPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-primary-600 hover:text-primary-700">
              ← 返回首頁
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Telegram Bot 管理</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            智能購物助手
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Telegram Bot 功能管理 - 一對一客服對話、智能商品推薦、購物車管理
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-4 text-primary-600">Bot 狀態</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                <div>
                  <div className="font-medium">Webhook 狀態</div>
                  <div className="text-sm text-gray-600">接收 Telegram 訊息</div>
                </div>
                <span className="inline-flex items-center px-3 py-1 bg-success-100 text-success-800 rounded-full text-sm">
                  <span className="w-2 h-2 bg-success-500 rounded-full mr-2"></span>
                  已配置
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                <div>
                  <div className="font-medium">函數部署</div>
                  <div className="text-sm text-gray-600">Firebase Functions</div>
                </div>
                <span className="inline-flex items-center px-3 py-1 bg-success-100 text-success-800 rounded-full text-sm">
                  <span className="w-2 h-2 bg-success-500 rounded-full mr-2"></span>
                  運行中
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                <div>
                  <div className="font-medium">Bot Token</div>
                  <div className="text-sm text-gray-600">需要配置環境變數</div>
                </div>
                <span className="inline-flex items-center px-3 py-1 bg-warning-100 text-warning-800 rounded-full text-sm">
                  <span className="w-2 h-2 bg-warning-500 rounded-full mr-2"></span>
                  待配置
                </span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-4 text-primary-600">Bot 功能</h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mr-3">🛍️</div>
                <div>
                  <div className="font-medium">商品查詢</div>
                  <div className="text-sm text-gray-600">搜尋和推薦商品</div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mr-3">🛒</div>
                <div>
                  <div className="font-medium">購物車管理</div>
                  <div className="text-sm text-gray-600">新增、移除、查看購物車</div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mr-3">📋</div>
                <div>
                  <div className="font-medium">訂單處理</div>
                  <div className="text-sm text-gray-600">下單、追蹤、管理訂單</div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mr-3">💰</div>
                <div>
                  <div className="font-medium">支付集成</div>
                  <div className="text-sm text-gray-600">USDT-TRC20 支付</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="text-3xl mb-4">⚙️</div>
            <h3 className="text-lg font-semibold mb-2">Bot 設定</h3>
            <p className="text-gray-600 text-sm mb-4">配置 Bot 參數和行為</p>
            <button className="btn btn-primary w-full">設定 Bot</button>
          </div>

          <div className="card p-6 text-center">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">使用統計</h3>
            <p className="text-gray-600 text-sm mb-4">查看 Bot 使用數據</p>
            <button className="btn btn-secondary w-full">查看統計</button>
          </div>

          <div className="card p-6 text-center">
            <div className="text-3xl mb-4">🔧</div>
            <h3 className="text-lg font-semibold mb-2">測試工具</h3>
            <p className="text-gray-600 text-sm mb-4">測試 Bot 功能</p>
            <button className="btn btn-secondary w-full">測試 Bot</button>
          </div>
        </div>

        <div className="bg-success-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-success-900 mb-4">
            🎉 Telegram Bot 已整合完成！
          </h3>
          <p className="text-success-700 mb-6">
            包含 38KB 完整功能代碼 - 商品查詢、購物車、訂單處理、支付集成、代理系統
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/admin" className="btn btn-primary">
              管理後台
            </Link>
            <Link href="/agents" className="btn btn-success">
              代理系統
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
