'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import UserNavbar from '@/components/UserNavbar';

export default function HomePage() {
  const { user, isUser } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-lg font-bold">💳</span>
              </div>
              <span className="text-xl font-bold text-gray-900">CVV Bot</span>
            </div>

            {/* 導航鏈接 */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/bot" className="text-gray-700 hover:text-blue-600 transition-colors">
                CVV 交易
              </Link>
              {user && (
                <>
                  <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                    管理後台
                  </Link>
                  <Link href="/telegram" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Telegram Bot
                  </Link>
                </>
              )}
              <Link href="/status" className="text-gray-700 hover:text-blue-600 transition-colors">
                系統狀態
              </Link>
            </div>

            {/* 用戶導航或直接訪問按鈕 */}
            <div>
              {isUser ? (
                <UserNavbar />
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/bot"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    💳 CVV Bot
                  </Link>
                  <Link
                    href="/telegram"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🤖 Bot 狀態
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            💳 CVV Bot 統一平台
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            多平台信用卡交易管理系統 - 整合 Telegram Bot、Web 管理和後台
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <Link href="/bot" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold mb-2">CVV 交易平台</h3>
              <p className="text-gray-600">輕量級信用卡交易體驗</p>
            </Link>
            
            <Link href="/admin" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🖥️</div>
              <h3 className="text-xl font-semibold mb-2">管理後台</h3>
              <p className="text-gray-600">完整的 CVV 交易管理系統</p>
            </Link>
            
            <Link href="/telegram" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">Telegram Bot</h3>
              <p className="text-gray-600">智能 CVV 交易助手</p>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link href="/payments" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-lg font-semibold mb-2">支付系統</h3>
              <p className="text-gray-600 text-sm">USDT-TRC20 支付管理</p>
            </Link>
            
            <Link href="/agents" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🏢</div>
              <h3 className="text-lg font-semibold mb-2">代理系統</h3>
              <p className="text-gray-600 text-sm">多層級代理管理</p>
            </Link>
          </div>

                           <div className="mt-12 text-center space-y-4">
                   <Link href="/status" className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors">
                     <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                     系統運行正常 - 查看詳細狀態
                   </Link>
                   
                   <div>
                     <Link href="/admin/api-test" className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors">
                       <span className="mr-2">🧪</span>
                       API 集成測試 - 開發工具
                     </Link>
                   </div>
                 </div>
        </div>
      </div>
    </div>
  );
}