'use client';

import { useHealthCheck } from '@/hooks/useHealthCheck';
import Link from 'next/link';

export default function StatusPage() {
  const { isLoading, isHealthy, data, error, lastChecked, refresh } = useHealthCheck(true, 15000);

  const getStatusColor = (status: 'online' | 'warning' | 'error') => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const StatusCard = ({ 
    title, 
    status, 
    description, 
    details 
  }: { 
    title: string; 
    status: 'online' | 'warning' | 'error'; 
    description: string; 
    details: string; 
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></span>
      </div>
      <p className="text-gray-600 mb-2">{description}</p>
      <p className="text-sm text-gray-500">{details}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              ← 返回首頁
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">系統狀態</h1>
            <button
              onClick={refresh}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '檢查中...' : '刷新狀態'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            CVV Bot 系統運行狀態
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            實時監控 CVV 卡片交易系統的所有組件運行狀態
          </p>
          {lastChecked && (
            <p className="text-sm text-gray-500 mt-2">
              最後檢查: {lastChecked.toLocaleString('zh-TW')}
            </p>
          )}
        </div>

        {/* 總體狀態 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className={`w-4 h-4 rounded-full mr-3 ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {isLoading ? '檢查中...' : isHealthy ? '系統運行正常' : '系統異常'}
                </h3>
                {data && (
                  <p className="text-gray-600">版本 {data.version} • {data.environment} 環境</p>
                )}
              </div>
            </div>
            {error && (
              <div className="text-red-600 text-sm">
                錯誤: {error}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatusCard
            title="CVV Bot 前端"
            status={isHealthy ? 'online' : 'error'}
            description="Next.js 統一前端應用"
            details={isHealthy ? '運行在 localhost:3000' : '服務異常'}
          />

          <StatusCard
            title="API 接口"
            status={data ? 'online' : 'error'}
            description="前端 API 路由"
            details={data ? `響應正常 (${data.status})` : '連接失敗'}
          />

          <StatusCard
            title="Firebase Functions"
            status="warning"
            description="後端 API 服務"
            details="開發中，待完成"
          />

          <StatusCard
            title="CVV 庫存管理"
            status="online"
            description="卡片庫存管理系統"
            details="前端界面已完成"
          />

          <StatusCard
            title="AI 入庫系統"
            status="online"
            description="智能批量導入功能"
            details="前端界面已完成"
          />

          <StatusCard
            title="Telegram Bot"
            status="warning"
            description="CVV 交易助手"
            details="需要配置 Bot Token"
          />

          <StatusCard
            title="USDT 支付系統"
            status="error"
            description="TRC20 加密貨幣支付"
            details="待開發"
          />

          <StatusCard
            title="代理系統"
            status="error"
            description="多層級代理管理"
            details="待開發"
          />

          <StatusCard
            title="Firestore 數據庫"
            status="warning"
            description="CVV 數據存儲"
            details="待連接配置"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">系統信息</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">項目名稱</span>
                <span className="font-mono text-sm">CVV Bot</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">項目 ID</span>
                <span className="font-mono text-sm">ccvbot-8578</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">區域</span>
                <span className="font-mono text-sm">asia-east1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">版本</span>
                <span className="font-mono text-sm">v4.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最後更新</span>
                <span className="font-mono text-sm">2025-08-26</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-600">開發進度</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>總體進度</span>
                  <span>95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <div className="flex items-center mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  平台統一 (100%)
                </div>
                <div className="flex items-center mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  前端界面 (100%)
                </div>
                <div className="flex items-center mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  數據模型 (100%)
                </div>
                <div className="flex items-center mb-1">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  後端 API (開發中)
                </div>
                <div className="flex items-center mb-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                  支付系統 (待開發)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CVV 系統功能狀態 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-6 text-purple-600">CVV 交易系統功能</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">🤖 AI 入庫</h4>
              <p className="text-sm text-gray-600 mb-2">智能批量導入 CVV 數據</p>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">前端完成</span>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">📦 庫存管理</h4>
              <p className="text-sm text-gray-600 mb-2">CVV 卡片庫存管理</p>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">前端完成</span>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">🛒 自動發貨</h4>
              <p className="text-sm text-gray-600 mb-2">支付後自動提供 CVV</p>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">待開發</span>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">💰 USDT 支付</h4>
              <p className="text-sm text-gray-600 mb-2">TRC20 加密貨幣支付</p>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">待開發</span>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">
            🚀 CVV Bot 開發進展
          </h3>
          <p className="text-blue-700 mb-6">
            前端統一平台已完成 95%，CVV 交易系統界面全部實現，正在進行後端 API 開發
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/admin/inventory" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              庫存管理
            </Link>
            <Link href="/admin/import" className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              AI 入庫
            </Link>
            <Link href="/bot" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              CVV 交易平台
            </Link>
          </div>
        </div>

        {/* 錯誤信息 */}
        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="font-medium text-red-800 mb-2">⚠️ 系統錯誤</h3>
            <p className="text-red-700 text-sm mb-3">{error}</p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              重試連接
            </button>
          </div>
        )}
      </div>
    </div>
  );
}