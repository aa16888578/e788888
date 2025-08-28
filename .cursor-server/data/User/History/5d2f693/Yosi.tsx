'use client';

import { useDashboardData } from '@/hooks/useData';
import { 
  UsersIcon, 
  CubeIcon, 
  ShoppingCartIcon, 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/lib/utils';

const stats = [
  { name: '總用戶數', icon: UsersIcon, color: 'bg-blue-500' },
  { name: '總商品數', icon: CubeIcon, color: 'bg-green-500' },
  { name: '總訂單數', icon: ShoppingCartIcon, color: 'bg-purple-500' },
  { name: '總收入', icon: CurrencyDollarIcon, color: 'bg-yellow-500' },
  { name: '待處理訂單', icon: ClockIcon, color: 'bg-orange-500' },
  { name: '庫存不足', icon: ExclamationTriangleIcon, color: 'bg-red-500' },
];

export default function Dashboard() {
  const { metrics, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">錯誤: {error}</p>
      </div>
    );
  }

  const statValues = [
    metrics.totalUsers,
    metrics.totalProducts,
    metrics.totalOrders,
    metrics.totalRevenue,
    metrics.pendingOrders,
    metrics.lowStockProducts,
  ];

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">儀表板</h1>
        <p className="mt-2 text-sm text-gray-600">
          歡迎來到 ShopBot 管理後台，這裡是您的業務概覽
        </p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.name === '總收入' 
                        ? formatCurrency(statValues[index], 'USD')
                        : statValues[index].toLocaleString()
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 快速操作 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">快速操作</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              新增商品
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors">
              處理訂單
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors">
              管理代理
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 transition-colors">
              查看報表
            </button>
          </div>
        </div>
      </div>

      {/* 最近活動 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">最近活動</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UsersIcon className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  新用戶註冊
                </p>
                <p className="text-sm text-gray-500">
                  用戶 ID: 12345 已成功註冊
                </p>
              </div>
              <div className="text-sm text-gray-500">
                2 分鐘前
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <ShoppingCartIcon className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  新訂單創建
                </p>
                <p className="text-sm text-gray-500">
                  訂單 #ORD-001 已創建，金額: $99.99
                </p>
              </div>
              <div className="text-sm text-gray-500">
                5 分鐘前
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <CurrencyDollarIcon className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  支付確認
                </p>
                <p className="text-sm text-gray-500">
                  訂單 #ORD-001 支付已確認
                </p>
              </div>
              <div className="text-sm text-gray-500">
                10 分鐘前
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
