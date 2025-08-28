'use client';

import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-primary-600 hover:text-primary-700">
              ← 返回首頁
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">管理後台</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🖥️</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            電商管理系統
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            完整的電商管理功能 - 商品、訂單、用戶、數據分析一站式管理
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="text-3xl mb-4">📦</div>
            <h3 className="text-lg font-semibold mb-2">商品管理</h3>
            <p className="text-gray-600 text-sm mb-4">新增、編輯、分類管理</p>
            <button className="btn btn-primary w-full">管理商品</button>
          </div>

          <div className="card p-6 text-center">
            <div className="text-3xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-2">訂單管理</h3>
            <p className="text-gray-600 text-sm mb-4">處理、追蹤、分析訂單</p>
            <button className="btn btn-primary w-full">管理訂單</button>
          </div>

          <div className="card p-6 text-center">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-lg font-semibold mb-2">用戶管理</h3>
            <p className="text-gray-600 text-sm mb-4">用戶資訊、權限管理</p>
            <button className="btn btn-primary w-full">管理用戶</button>
          </div>

          <div className="card p-6 text-center">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">數據分析</h3>
            <p className="text-gray-600 text-sm mb-4">銷售、流量、轉換分析</p>
            <button className="btn btn-primary w-full">查看數據</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-4 text-success-600">系統狀態</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Firebase Functions</span>
                <span className="inline-flex items-center px-2 py-1 bg-success-100 text-success-800 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 bg-success-500 rounded-full mr-1"></span>
                  運行中
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Telegram Bot</span>
                <span className="inline-flex items-center px-2 py-1 bg-success-100 text-success-800 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 bg-success-500 rounded-full mr-1"></span>
                  已整合
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>支付系統</span>
                <span className="inline-flex items-center px-2 py-1 bg-success-100 text-success-800 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 bg-success-500 rounded-full mr-1"></span>
                  已整合
                </span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-4 text-primary-600">快速統計</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>總用戶數</span>
                <span className="font-semibold">-</span>
              </div>
              <div className="flex items-center justify-between">
                <span>總商品數</span>
                <span className="font-semibold">-</span>
              </div>
              <div className="flex items-center justify-between">
                <span>總訂單數</span>
                <span className="font-semibold">-</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-4 text-warning-600">快速操作</h3>
            <div className="space-y-2">
              <button className="btn btn-warning w-full text-sm">新增商品</button>
              <button className="btn btn-secondary w-full text-sm">匯出數據</button>
              <button className="btn btn-secondary w-full text-sm">系統設定</button>
            </div>
          </div>
        </div>

        <div className="bg-primary-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-primary-900 mb-4">
            管理功能開發中
          </h3>
          <p className="text-primary-700 mb-6">
            完整的管理後台功能正在開發中，核心架構已完成！
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/payments" className="btn btn-primary">
              支付管理
            </Link>
            <Link href="/agents" className="btn btn-secondary">
              代理管理
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
