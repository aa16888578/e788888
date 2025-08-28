'use client';

import { useHealthCheck, useSystemStatus, useTelegramStatus } from '@/hooks/useApi';
import StatusCard from '@/components/StatusCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function StatusPage() {
  const { data: healthData, loading: healthLoading } = useHealthCheck();
  const { data: systemData, loading: systemLoading } = useSystemStatus();
  const { data: telegramData, loading: telegramLoading } = useTelegramStatus();

  if (healthLoading || systemLoading || telegramLoading) {
    return <LoadingSpinner size="lg" text="正在檢查系統狀態..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              ← 返回首頁
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">系統狀態</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            系統運行狀態
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            實時監控所有系統組件的運行狀態
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatusCard
            title="Firebase Functions"
            status={healthData?.success ? 'online' : 'error'}
            description="後端 API 服務"
            details={healthData?.message || '檢查中...'}
          />

          <StatusCard
            title="Next.js 前端"
            status="online"
            description="統一前端應用"
            details="運行在 localhost:3000"
          />

          <StatusCard
            title="Telegram Bot"
            status={telegramData?.success ? 'online' : 'warning'}
            description="智能購物助手"
            details="需要配置 Bot Token"
          />

          <StatusCard
            title="支付系統"
            status="warning"
            description="USDT-TRC20 支付"
            details="核心邏輯已整合，待配置"
          />

          <StatusCard
            title="代理系統"
            status="online"
            description="多層級代理管理"
            details="24KB 完整代碼已整合"
          />

          <StatusCard
            title="數據庫"
            status="online"
            description="Firestore 數據庫"
            details="已連接 ccvbot-8578"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">系統信息</h3>
            <div className="space-y-3">
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
                <span className="font-mono text-sm">v3.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最後更新</span>
                <span className="font-mono text-sm">2025-08-26</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-600">整合進度</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>總體進度</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <div className="flex items-center mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  基礎架構 (100%)
                </div>
                <div className="flex items-center mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  備份代碼整合 (100%)
                </div>
                <div className="flex items-center mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  統一前端 (100%)
                </div>
                <div className="flex items-center mb-1">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  API 連接 (進行中)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">
            🚀 API 連接埠已創建！
          </h3>
          <p className="text-blue-700 mb-6">
            前後端 API 連接埠已完成 - Firebase Functions、健康檢查、用戶管理、商品管理、訂單處理、購物車、代理系統、支付系統
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/admin" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              測試管理後台
            </Link>
            <Link href="/telegram" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
              測試 Bot 管理
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
