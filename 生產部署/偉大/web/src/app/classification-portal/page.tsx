'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AdminOnly, AgentOnly } from '@/components/PermissionGate';
import { toast } from 'react-hot-toast';

interface CVVClassificationData {
  id: string;
  rawData: string;
  parsedData: {
    countryCode?: string;
    country?: string;
    countryFlag?: string;
    dataType?: string;
    activityRate?: string;
    qualityLevel?: string;
    stock?: number;
    hasSpecialFeature?: boolean;
    confidence: number;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

export default function ClassificationPortalPage() {
  const { user, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('classify');
  const [loading, setLoading] = useState(false);
  
  // 分類數據
  const [inputData, setInputData] = useState('');
  const [classificationResults, setClassificationResults] = useState<CVVClassificationData[]>([]);
  const [batchProcessing, setBatchProcessing] = useState(false);

  // 快速分類功能
  const handleQuickClassify = async () => {
    if (!inputData.trim()) {
      toast.error('請輸入要分類的數據');
      return;
    }

    setLoading(true);
    try {
      // 模擬分類處理
      const lines = inputData.split('\n').filter(line => line.trim());
      const results: CVVClassificationData[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // 解析 CVV 數據格式
        const parsed = parseCSVData(line);
        
        results.push({
          id: `classify_${Date.now()}_${i}`,
          rawData: line,
          parsedData: parsed,
          status: 'completed',
          createdAt: new Date()
        });
      }

      setClassificationResults(results);
      toast.success(`成功分類 ${results.length} 條數據`);
      
    } catch (error) {
      console.error('分類失敗:', error);
      toast.error('分類處理失敗');
    } finally {
      setLoading(false);
    }
  };

  // 解析 CVV 數據
  const parseCSVData = (data: string) => {
    const result: any = { confidence: 0.85 };

    try {
      // 解析國家代碼和名稱 (例: AR_阿根廷🇦🇷)
      const countryMatch = data.match(/([A-Z]{2})_([^_]+)([\u{1F1E6}-\u{1F1FF}]{2}|🏳️|🏴)/u);
      if (countryMatch) {
        result.countryCode = countryMatch[1];
        result.country = countryMatch[2];
        result.countryFlag = countryMatch[3];
      }

      // 解析數據類型 (例: 全資, 頂級全資)
      const typeMatch = data.match(/(全資|頂級全資|庫存|標準)/);
      if (typeMatch) {
        result.dataType = typeMatch[1];
        result.qualityLevel = typeMatch[1].includes('頂級') ? 'Premium' : 'Standard';
      }

      // 解析活率範圍 (例: 40%-70%)
      const rateMatch = data.match(/(\d+)%-(\d+)%/);
      if (rateMatch) {
        result.activityRate = `${rateMatch[1]}-${rateMatch[2]}%`;
      }

      // 解析庫存數量 (例: [2417])
      const stockMatch = data.match(/\[(\d+)\]/);
      if (stockMatch) {
        result.stock = parseInt(stockMatch[1]);
      }

      // 檢查特殊標記
      result.hasSpecialFeature = data.includes('💎') || data.includes('🔥');

    } catch (error) {
      console.error('解析數據失敗:', error);
      result.confidence = 0.5;
    }

    return result;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 頁面標題 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">CVV 入庫分類系統</h1>
            <p className="mt-2 text-gray-600">智能分類和數據處理平台</p>
          </div>

          {/* 標籤導航 */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('classify')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'classify'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🔍 數據分類
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'results'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📊 分類結果
              </button>
              <AdminOnly>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'settings'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ⚙️ 系統設置
                </button>
              </AdminOnly>
            </nav>
          </div>

          {/* 內容區域 */}
          {activeTab === 'classify' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">數據分類處理</h2>
              
              {/* 輸入區域 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  輸入 CVV 數據（每行一條）
                </label>
                <textarea
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`請輸入 CVV 數據，例如：
AR_阿根廷🇦🇷_全資 40%-70% [2417]
DE_德國🇩🇪_頂級全資 50%-80% 🔥 [2109]
BR_巴西🇧🇷_20%-50% 💎 [28373]`}
                />
              </div>

              {/* 操作按鈕 */}
              <div className="flex gap-4">
                <button
                  onClick={handleQuickClassify}
                  disabled={loading || !inputData.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '處理中...' : '🔍 開始分類'}
                </button>
                <button
                  onClick={() => setInputData('')}
                  className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  🗑️ 清空
                </button>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">分類結果</h2>
              
              {classificationResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>暫無分類結果</p>
                  <p className="text-sm">請先在"數據分類"標籤頁處理數據</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {classificationResults.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-500">原始數據</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.status === 'completed' ? 'bg-green-100 text-green-800' :
                          result.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          result.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {result.status}
                        </span>
                      </div>
                      <p className="font-mono text-sm mb-3 bg-gray-50 p-2 rounded">
                        {result.rawData}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">國家:</span>
                          <p>{result.parsedData.countryFlag} {result.parsedData.country} ({result.parsedData.countryCode})</p>
                        </div>
                        <div>
                          <span className="font-medium">類型:</span>
                          <p>{result.parsedData.dataType}</p>
                        </div>
                        <div>
                          <span className="font-medium">活率:</span>
                          <p>{result.parsedData.activityRate}</p>
                        </div>
                        <div>
                          <span className="font-medium">庫存:</span>
                          <p>{result.parsedData.stock}</p>
                        </div>
                        <div>
                          <span className="font-medium">品質:</span>
                          <p>{result.parsedData.qualityLevel}</p>
                        </div>
                        <div>
                          <span className="font-medium">特殊標記:</span>
                          <p>{result.parsedData.hasSpecialFeature ? '是' : '否'}</p>
                        </div>
                        <div>
                          <span className="font-medium">置信度:</span>
                          <p>{(result.parsedData.confidence * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <AdminOnly>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">系統設置</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">分類規則配置</h3>
                    <p className="text-gray-600 mb-4">配置自動分類的規則和 AI 模型</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      配置分類規則
                    </button>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">API 配置</h3>
                    <p className="text-gray-600 mb-4">配置外部 AI 服務和 API 密鑰</p>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                      API 設置
                    </button>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">數據導出</h3>
                    <p className="text-gray-600 mb-4">導出分類結果和統計數據</p>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                      導出數據
                    </button>
                  </div>
                </div>
              </div>
            </AdminOnly>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
