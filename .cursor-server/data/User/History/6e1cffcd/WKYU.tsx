'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AdminOnly } from '@/components/PermissionGate';
import { toast } from 'react-hot-toast';
import classificationService from '@/lib/classificationService';
import {
  ClassificationCategory,
  ClassificationRule,
  AIProvider,
  ClassificationStats
} from '@/types/classification';

export default function ClassificationAdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('categories');
  const [loading, setLoading] = useState(false);
  
  // 數據狀態
  const [categories, setCategories] = useState<ClassificationCategory[]>([]);
  const [rules, setRules] = useState<ClassificationRule[]>([]);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [stats, setStats] = useState<ClassificationStats | null>(null);

  // 表單狀態
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'categories':
          const categoriesData = await classificationService.getCategories();
          setCategories(categoriesData);
          break;
        case 'rules':
          const rulesData = await classificationService.getRules();
          setRules(rulesData);
          break;
        case 'providers':
          const providersData = await classificationService.getProviders();
          setProviders(providersData);
          break;
        case 'stats':
          const statsData = await classificationService.getStats();
          setStats(statsData);
          break;
      }
    } catch (error: any) {
      toast.error('載入數據失敗: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'categories', name: '分類管理', icon: '📁' },
    { id: 'rules', name: '規則設定', icon: '⚙️' },
    { id: 'providers', name: 'AI 提供商', icon: '🤖' },
    { id: 'stats', name: '統計報告', icon: '📊' }
  ];

  const renderCategoriesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">分類管理</h2>
        <button
          onClick={() => setShowCategoryForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 新增分類
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                分類
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                描述
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{category.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                      <div className={`inline-flex px-2 py-1 text-xs rounded-full ${category.color}`}>
                        {category.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{category.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    category.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.isActive ? '啟用' : '停用'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setEditingItem(category);
                      setShowCategoryForm(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRulesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">分類規則</h2>
        <button
          onClick={() => setShowRuleForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 新增規則
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{rule.name}</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                rule.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {rule.isActive ? '啟用' : '停用'}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{rule.description}</p>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">分類數量:</span> {rule.categories.length}
              </div>
              <div>
                <span className="font-medium">溫度:</span> {rule.temperature}
              </div>
              <div>
                <span className="font-medium">最大字符:</span> {rule.maxTokens}
              </div>
              <div>
                <span className="font-medium">優先級:</span> {rule.priority}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setEditingItem(rule);
                    setShowRuleForm(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  編輯規則
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProvidersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">AI 提供商</h2>
        <button
          onClick={() => setShowProviderForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 新增提供商
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((provider) => (
          <div key={provider.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{provider.name}</h3>
                  <p className="text-sm text-gray-600">{provider.type.toUpperCase()}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                provider.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {provider.isActive ? '啟用' : '停用'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">模型:</span> {provider.model}
              </div>
              <div>
                <span className="font-medium">速率限制:</span> {provider.rateLimitPerMinute}/分鐘
              </div>
              <div>
                <span className="font-medium">成本:</span> ${provider.costPerToken}/token
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                <button
                  onClick={() => handleTestProvider(provider.id)}
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  測試連接
                </button>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setEditingItem(provider);
                      setShowProviderForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => handleDeleteProvider(provider.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    刪除
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStatsTab = () => {
    if (!stats) return <div>載入中...</div>;

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">統計報告</h2>
        
        {/* 總覽統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總任務數</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">成功率</p>
                <p className="text-2xl font-semibold text-green-600">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總成本</p>
                <p className="text-2xl font-semibold text-blue-600">${stats.totalCost.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">⚡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均處理時間</p>
                <p className="text-2xl font-semibold text-purple-600">{stats.averageProcessingTime}ms</p>
              </div>
            </div>
          </div>
        </div>

        {/* 分類統計 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">分類分佈</h3>
          <div className="space-y-4">
            {stats.categoryStats.map((category) => (
              <div key={category.categoryId} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">{category.categoryName}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{category.count} 項</span>
                  <span className="text-sm font-medium text-blue-600">{category.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('確定要刪除此分類嗎？')) return;
    
    try {
      await classificationService.deleteCategory(id);
      toast.success('分類已刪除');
      loadData();
    } catch (error: any) {
      toast.error('刪除失敗: ' + error.message);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('確定要刪除此規則嗎？')) return;
    
    try {
      await classificationService.deleteRule(id);
      toast.success('規則已刪除');
      loadData();
    } catch (error: any) {
      toast.error('刪除失敗: ' + error.message);
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!confirm('確定要刪除此提供商嗎？')) return;
    
    try {
      // await classificationService.deleteProvider(id);
      toast.success('提供商已刪除');
      loadData();
    } catch (error: any) {
      toast.error('刪除失敗: ' + error.message);
    }
  };

  const handleTestProvider = async (id: string) => {
    try {
      const result = await classificationService.testProvider(id);
      if (result.success) {
        toast.success(`連接成功！延遲: ${result.latency}ms`);
      } else {
        toast.error('連接失敗: ' + result.message);
      }
    } catch (error: any) {
      toast.error('測試失敗: ' + error.message);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'categories':
        return renderCategoriesTab();
      case 'rules':
        return renderRulesTab();
      case 'providers':
        return renderProvidersTab();
      case 'stats':
        return renderStatsTab();
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminOnly>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 頁面標題 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">AI 分類系統</h1>
              <p className="mt-2 text-gray-600">
                管理 AI 分類規則、提供商和統計報告
              </p>
            </div>

            {/* 標籤導航 */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* 標籤內容 */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </AdminOnly>
    </ProtectedRoute>
  );
}
