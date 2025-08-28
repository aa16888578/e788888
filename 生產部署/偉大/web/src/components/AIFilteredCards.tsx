'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import aiFilterService, { AIFilterResult, CVVCardSummary } from '@/services/aiFilterService';

interface AIFilteredCardsProps {
  category: 'all_cards' | 'global_inventory' | 'premium_cards' | 'hot_deals';
  title: string;
  description: string;
}

export default function AIFilteredCards({ category, title, description }: AIFilteredCardsProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AIFilterResult | null>(null);
  const [selectedCard, setSelectedCard] = useState<CVVCardSummary | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadCards();
  }, [category]);

  const loadCards = async () => {
    setLoading(true);
    try {
      const result = await aiFilterService.getCardsByCategory(category);
      setData(result);
    } catch (error) {
      console.error('載入失敗:', error);
      toast.error('載入卡片資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (card: CVVCardSummary) => {
    setSelectedCard(card);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">AI 正在智能篩選卡片...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">暫無資料</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 標題和描述 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
        
        {/* AI 洞察 */}
        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
          <div className="flex items-center mb-2">
            <span className="text-blue-600 font-semibold">🤖 AI 智能分析</span>
          </div>
          <p className="text-blue-800 mb-2">{data.aiInsights.recommendation}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">品質評分:</span>
              <span className="ml-2 text-blue-600">{data.aiInsights.qualityScore}/100</span>
            </div>
            <div>
              <span className="font-medium">風險評估:</span>
              <span className="ml-2 text-blue-600">{data.aiInsights.riskAssessment}</span>
            </div>
            <div>
              <span className="font-medium">推薦選擇:</span>
              <span className="ml-2 text-blue-600">{data.aiInsights.bestValue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 統計摘要 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📊 統計摘要</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.summary.totalCount}</div>
            <div className="text-sm text-gray-500">總卡片數</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">${data.summary.averagePrice}</div>
            <div className="text-sm text-gray-500">平均價格</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{data.summary.averageSuccessRate}%</div>
            <div className="text-sm text-gray-500">平均成功率</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{data.summary.topCountries.length}</div>
            <div className="text-sm text-gray-500">覆蓋國家</div>
          </div>
        </div>
      </div>

      {/* 卡片列表 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">💳 AI 篩選結果</h3>
          <p className="text-sm text-gray-500">點擊卡片查看詳細信息（已脫敏處理，保護隱私）</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {data.cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-mono text-lg font-semibold text-blue-600">
                      {card.bankBin}****
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {card.cardType.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600">{card.bankName}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {card.safePreview}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs">
                    <span className={`px-2 py-1 rounded ${
                      card.quality === 'high' ? 'bg-green-100 text-green-800' :
                      card.quality === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {card.quality === 'high' ? '高品質' : card.quality === 'medium' ? '中品質' : '基礎'}
                    </span>
                    <span className="text-gray-500">{card.aiRecommendation}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">${card.price}</div>
                  <div className="text-sm text-gray-500">{card.successRate} 成功率</div>
                  <div className="text-xs text-blue-600 font-medium">
                    AI 評分: {card.aiScore}/100
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 熱門統計 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">🌍 熱門國家</h3>
          <div className="space-y-2">
            {data.summary.topCountries.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-700">{item.country}</span>
                <span className="font-semibold text-blue-600">{item.count} 張</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">🏦 熱門銀行 BIN</h3>
          <div className="space-y-2">
            {data.summary.topBins.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <span className="font-mono text-sm text-blue-600">{item.bin}</span>
                  <span className="text-gray-600 text-sm ml-2">{item.bank}</span>
                </div>
                <span className="font-semibold text-blue-600">{item.count} 張</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 詳情彈窗 */}
      {showDetails && selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">卡片詳情</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="font-medium">卡號前綴:</span>
                <span className="ml-2 font-mono">{selectedCard.maskedCardNumber}</span>
              </div>
              <div>
                <span className="font-medium">銀行:</span>
                <span className="ml-2">{selectedCard.bankName}</span>
              </div>
              <div>
                <span className="font-medium">國家:</span>
                <span className="ml-2">{selectedCard.countryName}</span>
              </div>
              <div>
                <span className="font-medium">價格:</span>
                <span className="ml-2 text-green-600 font-semibold">${selectedCard.price} USDT</span>
              </div>
              <div>
                <span className="font-medium">成功率:</span>
                <span className="ml-2">{selectedCard.successRate}</span>
              </div>
              <div>
                <span className="font-medium">AI 評分:</span>
                <span className="ml-2 text-blue-600 font-semibold">{selectedCard.aiScore}/100</span>
              </div>
              <div>
                <span className="font-medium">AI 建議:</span>
                <span className="ml-2 text-gray-600">{selectedCard.aiRecommendation}</span>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                💳 購買此卡
              </button>
              <button className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
                ⭐ 收藏
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
