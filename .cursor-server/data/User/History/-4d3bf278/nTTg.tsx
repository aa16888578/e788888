'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AdminOnly, AgentOnly } from '@/components/PermissionGate';
import { toast } from 'react-hot-toast';

interface CVVClassificationRule {
  id: string;
  name: string;
  description: string;
  prompt: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CVVParseResult {
  countryCode?: string;
  country?: string;
  countryFlag?: string;
  dataType?: string; // 全資、庫存等
  activityRate?: string;
  qualityLevel?: string; // 頂級全資等
  stock?: number;
  hasSpecialFeature?: boolean; // 是否有鑽石等特殊標記
  confidence: number;
  // 敏感數據不在前端顯示
  safePreview: string; // 安全預覽格式
}

export default function CVVClassifierPage() {
  const { user } = useAuth();
  const [rules, setRules] = useState<CVVClassificationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [activeTab, setActiveTab] = useState('rules');

  // 測試數據
  const [testInput, setTestInput] = useState('');
  const [parseResult, setParseResult] = useState<CVVParseResult | null>(null);

  // 預設的 CVV 分類規則
  const defaultRules: Omit<CVVClassificationRule, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'CVV 數據解析規則',
      description: '解析真實 CVV 數據格式，如：AR_阿根廷🇦🇷_全資 40%-70% [2417]',
      prompt: `請分析以下 CVV 卡片數據並提取各個欄位信息。

真實數據格式範例：
- AR_阿根廷🇦🇷_全資 40%-70% [2417]
- DE_德國🇩🇪_頂級全資 50%-80% 🔥 [2109]
- BO_玻利維亞🇧🇴_55%-75% 💎 [2269]

請按照以下 JSON 格式回答，只回答 JSON 不要其他內容：
{
  "countryCode": "國家代碼（如 AR, DE, BO）",
  "country": "國家名稱",
  "countryFlag": "國旗符號",
  "dataType": "數據類型（全資、庫存等）",
  "qualityLevel": "品質等級（頂級全資、標準等）",
  "activityRate": "活率範圍（如 40%-70%）",
  "stock": "庫存數量（方括號內的數字）",
  "hasSpecialFeature": "是否有特殊標記（🔥💎等）",
  "confidence": "解析置信度（0-1之間）",
  "safePreview": "安全預覽格式（隱藏敏感信息）"
}

注意：絕對不要在回答中包含完整的卡號、CVV碼或其他敏感信息！

待解析數據：
{text}`,
      isActive: true
    },
    {
      name: 'CVV 品質評估規則',
      description: '根據 CVV 數據評估卡片品質等級',
      prompt: `請根據以下 CVV 卡片信息評估其品質等級。

評估標準：
- 高品質（Premium）: 全資料 + 活率>80% + 熱門國家
- 中品質（Standard）: 部分資料 + 活率60-80%
- 低品質（Basic）: 基本資料 + 活率<60%

請按照以下 JSON 格式回答：
{
  "qualityLevel": "Premium/Standard/Basic",
  "score": "品質分數（1-100）",
  "reasoning": "評估理由",
  "recommendations": "建議（如定價建議、庫存管理建議）"
}

CVV 數據：
{text}`,
      isActive: true
    },
    {
      name: 'CVV 定價建議規則',
      description: '根據 CVV 數據特徵提供定價建議',
      prompt: `請根據以下 CVV 卡片信息提供定價建議。

定價參考因素：
- 國家等級：美國/英國/加拿大（高價）、歐盟（中高價）、其他（標準價）
- 卡片類型：Visa/Mastercard（標準）、Amex（高價）
- 活率：>80%（+20%）、60-80%（標準）、<60%（-20%）
- 全資料：有（+30%）、無（標準）
- 庫存稀缺度：低庫存（+10%）

請按照以下 JSON 格式回答：
{
  "suggestedPrice": "建議價格（USDT）",
  "priceRange": "價格區間（最低-最高）",
  "factors": "定價因素分析",
  "marketPosition": "市場定位（高端/中端/入門）"
}

CVV 數據：
{text}`,
      isActive: true
    }
  ];

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = () => {
    // 從 localStorage 載入規則
    const savedRules = localStorage.getItem('cvv_classification_rules');
    if (savedRules) {
      setRules(JSON.parse(savedRules));
    } else {
      // 如果沒有保存的規則，使用預設規則
      const initialRules = defaultRules.map(rule => ({
        ...rule,
        id: Date.now().toString() + Math.random().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      setRules(initialRules);
      localStorage.setItem('cvv_classification_rules', JSON.stringify(initialRules));
    }
  };

  const handleClassify = async () => {
    if (!testInput.trim()) {
      toast.error('請輸入 CVV 數據');
      return;
    }

    setClassifying(true);
    try {
      // 模擬 AI 解析過程
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 模擬解析結果（基於真實格式）
      const mockResult: CVVParseResult = {
        countryCode: 'DE',
        country: '德國',
        countryFlag: '🇩🇪',
        dataType: '全資',
        qualityLevel: '頂級全資',
        activityRate: '50%-80%',
        stock: 2109,
        hasSpecialFeature: true, // 有🔥標記
        confidence: 0.95,
        safePreview: 'DE_德國🇩🇪_頂級全資 50%-80% 🔥 [****]'
      };

      setParseResult(mockResult);
      toast.success('CVV 數據解析完成！');
    } catch (error: any) {
      toast.error('解析失敗: ' + error.message);
    } finally {
      setClassifying(false);
    }
  };

  const renderRulesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">CVV 分類規則</h2>
        <button
          onClick={() => toast('規則管理功能開發中...', { icon: 'ℹ️' })}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 新增規則
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
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
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">提示詞預覽</h4>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                {rule.prompt.substring(0, 300)}...
              </pre>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                <button
                  onClick={() => toast('編輯功能開發中...', { icon: 'ℹ️' })}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  編輯規則
                </button>
                <button
                  onClick={() => toast('測試功能開發中...', { icon: 'ℹ️' })}
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  測試規則
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTestTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">CVV 數據測試</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左側：輸入區域 */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">輸入 CVV 數據</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                真實數據格式範例
              </label>
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800 space-y-1">
                <div>AR_阿根廷🇦🇷_全資 40%-70% [2417]</div>
                <div>DE_德國🇩🇪_頂級全資 50%-80% 🔥 [2109]</div>
                <div>BO_玻利維亞🇧🇴_55%-75% 💎 [2269]</div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                待解析的 CVV 數據
              </label>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="請輸入 CVV 數據，格式：國家代碼_國家🏳️_數據類型 活率範圍 特殊標記 [庫存數量]"
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            <button
              onClick={handleClassify}
              disabled={classifying || !testInput.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {classifying ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  解析中...
                </div>
              ) : (
                '🔍 解析 CVV 數據'
              )}
            </button>
          </div>

          {/* 格式說明 */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">📋 真實數據格式說明</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <div><strong>國家代碼</strong>: AR, DE, BO, BR, CL 等</div>
              <div><strong>國家（國旗）</strong>: 阿根廷🇦🇷, 德國🇩🇪, 玻利維亞🇧🇴 等</div>
              <div><strong>數據類型</strong>: 全資、庫存、標準 等</div>
              <div><strong>品質等級</strong>: 頂級全資、普通 等</div>
              <div><strong>活率範圍</strong>: 40%-70%, 50%-80% 等</div>
              <div><strong>特殊標記</strong>: 🔥 (熱門), 💎 (高品質) 等</div>
              <div><strong>庫存數量</strong>: [方括號內的數字]</div>
            </div>
            <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
              <strong>⚠️ 安全提醒</strong>: 系統不會在前端顯示完整的卡號、CVV 碼等敏感信息
            </div>
          </div>
        </div>

        {/* 右側：結果區域 */}
        <div className="space-y-4">
          {parseResult ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">解析結果</h3>
              
              <div className="space-y-4">
                {/* 基本信息 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">國家信息</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {parseResult.countryFlag} {parseResult.country}
                    </div>
                    <div className="text-sm text-gray-500">({parseResult.countryCode})</div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">數據類型</div>
                    <div className="text-lg font-semibold text-gray-900">{parseResult.dataType || '標準'}</div>
                    <div className="text-sm text-gray-500">{parseResult.qualityLevel || '普通品質'}</div>
                  </div>
                </div>

                {/* 詳細信息 */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-600">活率範圍</div>
                    <div className="text-xl font-bold text-blue-900">{parseResult.activityRate}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-600">庫存數量</div>
                    <div className="text-xl font-bold text-green-900">{parseResult.stock}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-600">特殊標記</div>
                    <div className="text-xl font-bold text-purple-900">
                      {parseResult.hasSpecialFeature ? '🔥💎' : '無'}
                    </div>
                  </div>
                </div>

                {/* 狀態標籤 */}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    parseResult.dataType === '全資' || parseResult.qualityLevel?.includes('全資')
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {parseResult.dataType === '全資' || parseResult.qualityLevel?.includes('全資') ? '✅ 全資料' : '⚠️ 標準資料'}
                  </span>
                  
                  {parseResult.hasSpecialFeature && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      ⭐ 特殊標記
                    </span>
                  )}
                  
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    🎯 置信度: {(parseResult.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                {/* 安全預覽 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-600 mb-2">安全預覽格式</div>
                  <div className="bg-gray-100 rounded p-2 text-sm font-mono text-gray-800">
                    {parseResult.safePreview}
                  </div>
                  <div className="text-xs text-red-600 mt-1">
                    ⚠️ 敏感信息已隱藏，實際卡號和 CVV 不會在前端顯示
                  </div>
                </div>

                {/* 操作按鈕 */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => toast.success('數據已保存到 CVV 庫存')}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    💾 保存到庫存
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(parseResult, null, 2));
                      toast.success('結果已複製到剪貼板');
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    📋 複製結果
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🤖</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  等待解析 CVV 數據
                </h3>
                <p className="text-gray-600">
                  請在左側輸入 CVV 數據，然後點擊解析按鈕
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'rules', name: '分類規則', icon: '⚙️' },
    { id: 'test', name: '數據測試', icon: '🧪' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'rules':
        return renderRulesTab();
      case 'test':
        return renderTestTab();
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
              <h1 className="text-3xl font-bold text-gray-900">CVV 數據分類器</h1>
              <p className="mt-2 text-gray-600">
                專門用於解析和分類 CVV 卡片數據的 AI 系統
              </p>
            </div>

            {/* 功能說明 */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-400">💡</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    系統功能說明
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>自動解析 CVV 數據格式：國家代碼_國家（國徽）_全資（庫）_卡號_有效日期_安全碼_活率_庫存_價格</li>
                      <li>提取各個欄位信息並進行結構化處理</li>
                      <li>評估卡片品質等級和提供定價建議</li>
                      <li>支持批量處理和結果導出</li>
                    </ul>
                  </div>
                </div>
              </div>
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
