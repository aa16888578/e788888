'use client';

import { useState, useEffect } from 'react';
import { cvvService } from '@/lib/cvvService';

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');

  // 檢查後端狀態
  const checkBackendStatus = async () => {
    try {
      const isOnline = await cvvService.testConnection();
      setBackendStatus(isOnline ? 'online' : 'offline');
    } catch (error) {
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    checkBackendStatus();
  }, []);

  // API 測試用例
  const testCases = [
    {
      name: '獲取庫存統計',
      description: '測試 GET /api/cvv/stats/inventory',
      test: async () => {
        const stats = await cvvService.getInventoryStats();
        return { success: true, data: stats };
      }
    },
    {
      name: '獲取庫存統計',
      description: '測試 GET /api/cvv/stats/inventory',
      test: async () => {
        const stats = await cvvService.getInventoryStats();
        return { success: true, data: stats };
      }
    },
    {
      name: '搜索 CVV 卡片',
      description: '測試 GET /api/cvv/search',
      test: async () => {
        const result = await cvvService.searchCards({
          countries: ['US']
        }, 1, 10);
        return { success: true, data: result };
      }
    },
    {
      name: '測試 AI 導入格式驗證',
      description: '測試 POST /api/cvv/import (驗證模式)',
      test: async () => {
        const result = await cvvService.importCards({
          source: 'api',
          data: '4111111111111111,12,25,123,US,Test Bank',
          format: 'csv',
          batchName: 'API 測試批次',
          validateOnly: true,
          autoProcess: true
        });
        return { success: true, data: result };
      }
    }
  ];

  // 執行單個測試
  const runSingleTest = async (testCase: any, index: number) => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const result = await testCase.test();
      const endTime = Date.now();
      const duration = endTime - startTime;

      const testResult = {
        index,
        name: testCase.name,
        description: testCase.description,
        status: 'success',
        duration: `${duration}ms`,
        result: result,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [...prev, testResult]);
    } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      const testResult = {
        index,
        name: testCase.name,
        description: testCase.description,
        status: 'error',
        duration: `${duration}ms`,
        error: error.message || '未知錯誤',
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [...prev, testResult]);
    } finally {
      setLoading(false);
    }
  };

  // 執行所有測試
  const runAllTests = async () => {
    setTestResults([]);
    setLoading(true);

    for (let i = 0; i < testCases.length; i++) {
      await runSingleTest(testCases[i], i);
      // 測試間隔 500ms
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setLoading(false);
  };

  // 清除結果
  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 CVV Bot API 集成測試
          </h1>
          <p className="text-gray-600">
            測試前端與後端 API 的集成狀況
          </p>
        </div>

        {/* 後端狀態 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">後端 API 狀態</h2>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(backendStatus)}`}>
                  {backendStatus === 'online' ? '🟢 在線' : backendStatus === 'offline' ? '🔴 離線' : '🟡 檢查中'}
                </span>
                <span className="text-gray-500 text-sm">
                  Firebase Functions API
                </span>
              </div>
            </div>
            <button
              onClick={checkBackendStatus}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              重新檢查
            </button>
          </div>
        </div>

        {/* 測試控制 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">API 測試套件</h2>
            <div className="flex space-x-3">
              <button
                onClick={clearResults}
                disabled={loading || testResults.length === 0}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                清除結果
              </button>
              <button
                onClick={runAllTests}
                disabled={loading || backendStatus !== 'online'}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>測試中...</span>
                  </>
                ) : (
                  <span>🚀 執行所有測試</span>
                )}
              </button>
            </div>
          </div>

          {/* 測試用例列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testCases.map((testCase, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-1">{testCase.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{testCase.description}</p>
                <button
                  onClick={() => runSingleTest(testCase, index)}
                  disabled={loading || backendStatus !== 'online'}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  單獨測試
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 測試結果 */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">測試結果</h2>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(result.status)}`}>
                        {result.status === 'success' ? '✅ 成功' : '❌ 失敗'}
                      </span>
                      <span className="font-medium">{result.name}</span>
                      <span className="text-sm text-gray-500">{result.duration}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {result.status === 'success' && result.result && (
                    <div className="mt-3">
                      <details className="cursor-pointer">
                        <summary className="text-sm text-gray-600 hover:text-gray-800">
                          查看響應數據
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                          {JSON.stringify(result.result, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}

                  {result.status === 'error' && (
                    <div className="mt-3 p-3 bg-red-50 rounded">
                      <p className="text-sm text-red-700">
                        <strong>錯誤：</strong> {result.error}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用說明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📖 使用說明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 確保後端 Firebase Functions 已啟動</li>
            <li>• 後端狀態顯示"在線"時才能執行測試</li>
            <li>• 可以執行單個測試或所有測試</li>
            <li>• 測試結果會顯示響應時間和數據內容</li>
            <li>• 如果測試失敗，請檢查後端 API 實現</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
