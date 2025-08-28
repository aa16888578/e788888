'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AdminOnly } from '@/components/PermissionGate';
import { toast } from 'react-hot-toast';

interface AIConfig {
  id: string;
  provider: 'openai' | 'claude' | 'gemini';
  name: string;
  apiKey: string;
  baseURL: string;
  model: string;
  maxTokens: number;
  temperature: number;
  isActive: boolean;
  rateLimitPerMinute: number;
  costPerToken: number;
}

export default function APIConfigPage() {
  const { user } = useAuth();
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    provider: 'openai' as const,
    name: '',
    apiKey: '',
    baseURL: '',
    model: '',
    maxTokens: 4000,
    temperature: 0.7,
    isActive: true,
    rateLimitPerMinute: 60,
    costPerToken: 0.00002
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      // 從 localStorage 載入配置（實際應用中應該從後端載入）
      const savedConfigs = localStorage.getItem('ai_configs');
      if (savedConfigs) {
        setConfigs(JSON.parse(savedConfigs));
      }
    } catch (error) {
      toast.error('載入配置失敗');
    } finally {
      setLoading(false);
    }
  };

  const saveConfigs = (newConfigs: AIConfig[]) => {
    localStorage.setItem('ai_configs', JSON.stringify(newConfigs));
    setConfigs(newConfigs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.apiKey || !formData.model) {
      toast.error('請填寫所有必要欄位');
      return;
    }

    const newConfig: AIConfig = {
      id: editingConfig?.id || Date.now().toString(),
      ...formData
    };

    let newConfigs;
    if (editingConfig) {
      newConfigs = configs.map(config => 
        config.id === editingConfig.id ? newConfig : config
      );
      toast.success('配置已更新');
    } else {
      newConfigs = [...configs, newConfig];
      toast.success('配置已添加');
    }

    saveConfigs(newConfigs);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      provider: 'openai',
      name: '',
      apiKey: '',
      baseURL: '',
      model: '',
      maxTokens: 4000,
      temperature: 0.7,
      isActive: true,
      rateLimitPerMinute: 60,
      costPerToken: 0.00002
    });
    setEditingConfig(null);
    setShowForm(false);
  };

  const handleEdit = (config: AIConfig) => {
    setFormData({
      provider: config.provider,
      name: config.name,
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      model: config.model,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      isActive: config.isActive,
      rateLimitPerMinute: config.rateLimitPerMinute,
      costPerToken: config.costPerToken
    });
    setEditingConfig(config);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('確定要刪除此配置嗎？')) return;
    
    const newConfigs = configs.filter(config => config.id !== id);
    saveConfigs(newConfigs);
    toast.success('配置已刪除');
  };

  const handleToggleActive = (id: string) => {
    const newConfigs = configs.map(config =>
      config.id === id ? { ...config, isActive: !config.isActive } : config
    );
    saveConfigs(newConfigs);
    toast.success('狀態已更新');
  };

  const handleTestConnection = async (config: AIConfig) => {
    setTestingProvider(config.id);
    
    try {
      // 模擬 API 測試
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 這裡應該調用實際的 API 測試
      const testResult = Math.random() > 0.2; // 80% 成功率
      
      if (testResult) {
        toast.success(`${config.name} 連接成功！`);
      } else {
        toast.error(`${config.name} 連接失敗`);
      }
    } catch (error) {
      toast.error('測試連接時發生錯誤');
    } finally {
      setTestingProvider(null);
    }
  };

  const getProviderDefaults = (provider: string) => {
    switch (provider) {
      case 'openai':
        return {
          baseURL: 'https://api.openai.com/v1',
          model: 'gpt-3.5-turbo',
          rateLimitPerMinute: 60,
          costPerToken: 0.00002
        };
      case 'claude':
        return {
          baseURL: 'https://api.anthropic.com/v1',
          model: 'claude-3-sonnet-20240229',
          rateLimitPerMinute: 50,
          costPerToken: 0.00003
        };
      case 'gemini':
        return {
          baseURL: 'https://generativelanguage.googleapis.com/v1',
          model: 'gemini-pro',
          rateLimitPerMinute: 60,
          costPerToken: 0.000001
        };
      default:
        return {
          baseURL: '',
          model: '',
          rateLimitPerMinute: 60,
          costPerToken: 0.00002
        };
    }
  };

  const handleProviderChange = (provider: string) => {
    const defaults = getProviderDefaults(provider);
    setFormData(prev => ({
      ...prev,
      provider: provider as any,
      baseURL: defaults.baseURL,
      model: defaults.model,
      rateLimitPerMinute: defaults.rateLimitPerMinute,
      costPerToken: defaults.costPerToken
    }));
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return '🤖';
      case 'claude': return '🧠';
      case 'gemini': return '💎';
      default: return '⚙️';
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminOnly>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 頁面標題 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">AI API 配置</h1>
              <p className="mt-2 text-gray-600">
                配置和管理 AI 提供商的 API 金鑰和參數
              </p>
            </div>

            {/* 重要提示 */}
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    安全提醒
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>請妥善保管您的 API 金鑰，不要與他人分享</li>
                      <li>建議定期更換 API 金鑰以確保安全</li>
                      <li>監控 API 使用量以控制成本</li>
                      <li>測試連接時會消耗少量 API 額度</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 左側：配置列表 */}
              <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">API 配置列表</h2>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + 新增配置
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {configs.map((config) => (
                      <div key={config.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{getProviderIcon(config.provider)}</span>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{config.name}</h3>
                              <p className="text-sm text-gray-600">{config.provider.toUpperCase()} • {config.model}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              config.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {config.isActive ? '啟用' : '停用'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">速率限制:</span>
                            <p className="text-gray-900">{config.rateLimitPerMinute}/分鐘</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">最大字符:</span>
                            <p className="text-gray-900">{config.maxTokens}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">溫度:</span>
                            <p className="text-gray-900">{config.temperature}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">成本:</span>
                            <p className="text-gray-900">${config.costPerToken}/token</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between">
                            <button
                              onClick={() => handleTestConnection(config)}
                              disabled={testingProvider === config.id}
                              className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
                            >
                              {testingProvider === config.id ? (
                                <>
                                  <div className="animate-spin w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full mr-2"></div>
                                  測試中...
                                </>
                              ) : (
                                <>
                                  <span className="mr-2">🔍</span>
                                  測試連接
                                </>
                              )}
                            </button>
                            
                            <div className="flex space-x-4">
                              <button
                                onClick={() => handleToggleActive(config.id)}
                                className={`text-sm font-medium ${
                                  config.isActive 
                                    ? 'text-red-600 hover:text-red-800' 
                                    : 'text-green-600 hover:text-green-800'
                                }`}
                              >
                                {config.isActive ? '停用' : '啟用'}
                              </button>
                              <button
                                onClick={() => handleEdit(config)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                編輯
                              </button>
                              <button
                                onClick={() => handleDelete(config.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                刪除
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {configs.length === 0 && (
                      <div className="text-center py-12">
                        <span className="text-6xl mb-4 block">🤖</span>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          尚未配置 AI 提供商
                        </h3>
                        <p className="text-gray-600 mb-4">
                          請添加至少一個 AI 提供商配置以開始使用分類功能
                        </p>
                        <button
                          onClick={() => setShowForm(true)}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          立即配置
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 右側：配置表單 */}
              {showForm && (
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {editingConfig ? '編輯配置' : '新增配置'}
                      </h3>
                      <button
                        onClick={resetForm}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          提供商 *
                        </label>
                        <select
                          value={formData.provider}
                          onChange={(e) => handleProviderChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="openai">OpenAI</option>
                          <option value="claude">Claude (Anthropic)</option>
                          <option value="gemini">Gemini (Google)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          配置名稱 *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="例如：OpenAI GPT-3.5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API 金鑰 *
                        </label>
                        <input
                          type="password"
                          value={formData.apiKey}
                          onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                          placeholder="sk-..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API 端點
                        </label>
                        <input
                          type="url"
                          value={formData.baseURL}
                          onChange={(e) => setFormData(prev => ({ ...prev, baseURL: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          模型 *
                        </label>
                        <input
                          type="text"
                          value={formData.model}
                          onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            最大字符
                          </label>
                          <input
                            type="number"
                            value={formData.maxTokens}
                            onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            溫度
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="2"
                            value={formData.temperature}
                            onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            速率限制(/分)
                          </label>
                          <input
                            type="number"
                            value={formData.rateLimitPerMinute}
                            onChange={(e) => setFormData(prev => ({ ...prev, rateLimitPerMinute: parseInt(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            成本/Token
                          </label>
                          <input
                            type="number"
                            step="0.000001"
                            value={formData.costPerToken}
                            onChange={(e) => setFormData(prev => ({ ...prev, costPerToken: parseFloat(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">啟用此配置</span>
                        </label>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            {editingConfig ? '更新配置' : '添加配置'}
                          </button>
                          <button
                            type="button"
                            onClick={resetForm}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminOnly>
    </ProtectedRoute>
  );
}
