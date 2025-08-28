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
  ClassificationTask,
  ClassificationResult
} from '@/types/classification';

export default function ClassifyPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ClassificationCategory[]>([]);
  const [rules, setRules] = useState<ClassificationRule[]>([]);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);

  // 表單狀態
  const [selectedRule, setSelectedRule] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [inputText, setInputText] = useState('');
  const [batchInput, setBatchInput] = useState('');
  const [mode, setMode] = useState<'single' | 'batch'>('single');

  // 結果狀態
  const [singleResult, setSingleResult] = useState<ClassificationTask | null>(null);
  const [batchResults, setBatchResults] = useState<ClassificationTask[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesData, rulesData] = await Promise.all([
        classificationService.getCategories(),
        classificationService.getRules()
      ]);
      
      setCategories(categoriesData);
      setRules(rulesData.filter(rule => rule.isActive));

      // 從 localStorage 載入提供商配置
      const savedProviders = localStorage.getItem('ai_configs');
      if (savedProviders) {
        const providersData = JSON.parse(savedProviders);
        setProviders(providersData.filter((p: AIProvider) => p.isActive));
      }
    } catch (error: any) {
      toast.error('載入數據失敗: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleClassify = async () => {
    if (!selectedRule || !selectedProvider || !inputText.trim()) {
      toast.error('請填寫所有必要欄位');
      return;
    }

    setClassifying(true);
    try {
      // 模擬 AI 分類過程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模擬分類結果
      const selectedRuleData = rules.find(r => r.id === selectedRule);
      const availableCategories = selectedRuleData?.categories || [];
      const randomCategoryId = availableCategories[Math.floor(Math.random() * availableCategories.length)];
      const category = categories.find(c => c.id === randomCategoryId);
      
      const mockResult: ClassificationTask = {
        id: Date.now().toString(),
        ruleId: selectedRule,
        providerId: selectedProvider,
        inputData: inputText,
        inputType: 'text',
        status: 'completed',
        result: {
          categoryId: randomCategoryId || 'unknown',
          categoryName: category?.name || '未知分類',
          confidence: 0.85 + Math.random() * 0.15,
          reasoning: `基於文本內容分析，此文本最符合 "${category?.name}" 分類的特徵。關鍵詞匹配度高，語義相似性強。`,
          alternatives: availableCategories.slice(0, 3).map(catId => {
            const altCategory = categories.find(c => c.id === catId);
            return {
              categoryId: catId,
              categoryName: altCategory?.name || '未知',
              confidence: 0.3 + Math.random() * 0.5
            };
          })
        },
        startedAt: new Date(Date.now() - 2000),
        completedAt: new Date(),
        processingTime: 2000,
        tokenUsed: Math.floor(inputText.length / 4),
        cost: (Math.floor(inputText.length / 4) * 0.00002)
      };

      setSingleResult(mockResult);
      setShowResults(true);
      toast.success('分類完成！');
    } catch (error: any) {
      toast.error('分類失敗: ' + error.message);
    } finally {
      setClassifying(false);
    }
  };

  const handleBatchClassify = async () => {
    if (!selectedRule || !selectedProvider || !batchInput.trim()) {
      toast.error('請填寫所有必要欄位');
      return;
    }

    const lines = batchInput.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      toast.error('請輸入至少一行文本');
      return;
    }

    setClassifying(true);
    try {
      const results: ClassificationTask[] = [];
      const selectedRuleData = rules.find(r => r.id === selectedRule);
      const availableCategories = selectedRuleData?.categories || [];

      // 模擬批量處理
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // 模擬處理延遲
        await new Promise(resolve => setTimeout(resolve, 500));

        const randomCategoryId = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        const category = categories.find(c => c.id === randomCategoryId);

        const mockResult: ClassificationTask = {
          id: `${Date.now()}_${i}`,
          ruleId: selectedRule,
          providerId: selectedProvider,
          inputData: line,
          inputType: 'text',
          status: 'completed',
          result: {
            categoryId: randomCategoryId || 'unknown',
            categoryName: category?.name || '未知分類',
            confidence: 0.7 + Math.random() * 0.3,
            reasoning: `文本 "${line.substring(0, 50)}..." 被分類為 "${category?.name}"`
          },
          startedAt: new Date(Date.now() - 500),
          completedAt: new Date(),
          processingTime: 500,
          tokenUsed: Math.floor(line.length / 4),
          cost: (Math.floor(line.length / 4) * 0.00002)
        };

        results.push(mockResult);
      }

      setBatchResults(results);
      setShowResults(true);
      toast.success(`批量分類完成！處理了 ${results.length} 個項目`);
    } catch (error: any) {
      toast.error('批量分類失敗: ' + error.message);
    } finally {
      setClassifying(false);
    }
  };

  const exportResults = () => {
    const results = mode === 'single' ? [singleResult].filter(Boolean) : batchResults;
    const csv = [
      ['文本', '分類', '置信度', '處理時間', 'Token使用', '成本'].join(','),
      ...results.map(result => [
        `"${result?.inputData}"`,
        `"${result?.result?.categoryName}"`,
        result?.result?.confidence?.toFixed(3),
        `${result?.processingTime}ms`,
        result?.tokenUsed,
        `$${result?.cost?.toFixed(6)}`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `classification_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('結果已導出');
  };

  const clearResults = () => {
    setSingleResult(null);
    setBatchResults([]);
    setShowResults(false);
    setInputText('');
    setBatchInput('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminOnly>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 頁面標題 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">AI 文本分類</h1>
              <p className="mt-2 text-gray-600">
                使用 AI 對文本進行自動分類，支持單個和批量處理
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 左側：分類設定 */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">分類設定</h2>

                  {/* 模式選擇 */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      處理模式
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setMode('single')}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          mode === 'single'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <span className="block text-2xl mb-1">📝</span>
                          <span className="text-sm font-medium">單個分類</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setMode('batch')}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          mode === 'batch'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <span className="block text-2xl mb-1">📚</span>
                          <span className="text-sm font-medium">批量分類</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 規則選擇 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      分類規則 *
                    </label>
                    <select
                      value={selectedRule}
                      onChange={(e) => setSelectedRule(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">請選擇規則</option>
                      {rules.map((rule) => (
                        <option key={rule.id} value={rule.id}>
                          {rule.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 提供商選擇 */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI 提供商 *
                    </label>
                    <select
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">請選擇提供商</option>
                      {providers.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 規則詳情 */}
                  {selectedRule && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-900 mb-2">規則詳情</h3>
                      {(() => {
                        const rule = rules.find(r => r.id === selectedRule);
                        return rule ? (
                          <div className="text-sm text-blue-800">
                            <p className="mb-2">{rule.description}</p>
                            <div className="space-y-1">
                              <div>可選分類: {rule.categories.length} 個</div>
                              <div>溫度: {rule.temperature}</div>
                              <div>最大字符: {rule.maxTokens}</div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}

                  {/* 操作按鈕 */}
                  <div className="space-y-3">
                    <button
                      onClick={mode === 'single' ? handleSingleClassify : handleBatchClassify}
                      disabled={classifying || !selectedRule || !selectedProvider}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {classifying ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          分類中...
                        </div>
                      ) : (
                        `🚀 開始${mode === 'single' ? '分類' : '批量分類'}`
                      )}
                    </button>

                    {showResults && (
                      <div className="flex space-x-2">
                        <button
                          onClick={exportResults}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          📊 導出結果
                        </button>
                        <button
                          onClick={clearResults}
                          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          🗑️ 清除
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 右側：輸入和結果 */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {/* 輸入區域 */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      {mode === 'single' ? '文本輸入' : '批量文本輸入'}
                    </h2>

                    {mode === 'single' ? (
                      <div>
                        <textarea
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="請輸入要分類的文本..."
                          className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                        <div className="mt-2 text-sm text-gray-500">
                          字符數: {inputText.length}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <textarea
                          value={batchInput}
                          onChange={(e) => setBatchInput(e.target.value)}
                          placeholder="請輸入要分類的文本，每行一個..."
                          className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                        <div className="mt-2 text-sm text-gray-500">
                          行數: {batchInput.split('\n').filter(line => line.trim()).length}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 結果區域 */}
                  {showResults && (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">分類結果</h2>

                      {mode === 'single' && singleResult ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-lg font-medium text-green-900">
                                {singleResult.result?.categoryName}
                              </h3>
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                置信度: {(singleResult.result?.confidence! * 100).toFixed(1)}%
                              </span>
                            </div>
                            
                            <p className="text-sm text-green-700 mb-3">
                              {singleResult.result?.reasoning}
                            </p>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">處理時間:</span>
                                <p className="text-gray-900">{singleResult.processingTime}ms</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Token 使用:</span>
                                <p className="text-gray-900">{singleResult.tokenUsed}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">成本:</span>
                                <p className="text-gray-900">${singleResult.cost?.toFixed(6)}</p>
                              </div>
                            </div>

                            {singleResult.result?.alternatives && singleResult.result.alternatives.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-green-200">
                                <h4 className="text-sm font-medium text-green-900 mb-2">其他可能的分類:</h4>
                                <div className="space-y-1">
                                  {singleResult.result.alternatives.map((alt, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                      <span className="text-green-700">{alt.categoryName}</span>
                                      <span className="text-green-600">{(alt.confidence * 100).toFixed(1)}%</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {batchResults.map((result, index) => (
                            <div key={result.id} className="p-4 border border-gray-200 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {result.inputData}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    分類: <span className="font-medium text-blue-600">{result.result?.categoryName}</span>
                                    {' • '}
                                    置信度: <span className="font-medium">{(result.result?.confidence! * 100).toFixed(1)}%</span>
                                  </p>
                                </div>
                                <div className="ml-4 text-xs text-gray-500">
                                  {result.processingTime}ms
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* 批量統計 */}
                          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">批量處理統計</h4>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-blue-700">總數:</span>
                                <p className="text-blue-900">{batchResults.length}</p>
                              </div>
                              <div>
                                <span className="font-medium text-blue-700">平均置信度:</span>
                                <p className="text-blue-900">
                                  {(batchResults.reduce((sum, r) => sum + (r.result?.confidence || 0), 0) / batchResults.length * 100).toFixed(1)}%
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-blue-700">總 Token:</span>
                                <p className="text-blue-900">{batchResults.reduce((sum, r) => sum + (r.tokenUsed || 0), 0)}</p>
                              </div>
                              <div>
                                <span className="font-medium text-blue-700">總成本:</span>
                                <p className="text-blue-900">${batchResults.reduce((sum, r) => sum + (r.cost || 0), 0).toFixed(4)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminOnly>
    </ProtectedRoute>
  );
}
