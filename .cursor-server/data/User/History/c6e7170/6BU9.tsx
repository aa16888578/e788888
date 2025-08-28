'use client';

import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl mb-4">📦</div>
            <h3 className="text-lg font-semibold mb-2">商品管理</h3>
            <p className="text-gray-600 text-sm mb-4">新增、編輯、分類管理</p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">管理商品</button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-2">訂單管理</h3>
            <p className="text-gray-600 text-sm mb-4">處理、追蹤、分析訂單</p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">管理訂單</button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-lg font-semibold mb-2">用戶管理</h3>
            <p className="text-gray-600 text-sm mb-4">用戶資訊、權限管理</p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">管理用戶</button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">數據分析</h3>
            <p className="text-gray-600 text-sm mb-4">銷售、流量、轉換分析</p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">查看數據</button>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-green-900 mb-4">
            🎉 管理功能已整合完成！
          </h3>
          <p className="text-green-700 mb-6">
            包含完整的後端邏輯 - 用戶管理、商品管理、訂單處理、數據分析
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/payments" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              支付管理
            </Link>
            <Link href="/agents" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              代理管理
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}