'use client';

import Link from 'next/link';

export default function WebPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-primary-600 hover:text-primary-700">
              ← 返回首頁
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">MiniWeb 購物平台</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌐</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            輕量級電商購物體驗
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            快速瀏覽、簡單操作、分享鏈接 - 為移動端優化的購物體驗
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="text-3xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold mb-2">商品瀏覽</h3>
            <p className="text-gray-600 mb-4">快速瀏覽所有商品，支援分類和搜尋</p>
            <button className="btn btn-primary w-full">瀏覽商品</button>
          </div>

          <div className="card p-6">
            <div className="text-3xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold mb-2">購物車</h3>
            <p className="text-gray-600 mb-4">輕鬆管理購物車，快速結帳</p>
            <button className="btn btn-primary w-full">查看購物車</button>
          </div>

          <div className="card p-6">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">PWA 支援</h3>
            <p className="text-gray-600 mb-4">可安裝為應用，支援離線瀏覽</p>
            <button className="btn btn-secondary w-full">安裝應用</button>
          </div>
        </div>

        <div className="bg-primary-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-primary-900 mb-4">
            功能開發中
          </h3>
          <p className="text-primary-700 mb-6">
            MiniWeb 購物功能正在開發中，敬請期待！
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/admin" className="btn btn-primary">
              管理後台
            </Link>
            <Link href="/telegram" className="btn btn-secondary">
              Telegram Bot
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
