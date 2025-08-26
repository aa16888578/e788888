'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Database, 
  Search, 
  Plus, 
  Download, 
  Upload,
  Brain,
  TrendingUp,
  Shield,
  Users,
  Settings
} from 'lucide-react';
import { CreditCard as CreditCardType, CardCategory, QualityLevel, CardType, CardStatus, RiskLevel } from '@/types';

// 模擬數據
const mockCards: CreditCardType[] = [
  {
    id: '1',
    cardNumber: '4111111111111111',
    expiryDate: '2025-12-31',
    cvv: '123',
    cardType: CardType.VISA,
    bank: 'Chase',
    country: 'US',
    countryCode: 'US',
    quality: QualityLevel.PREMIUM,
    successRate: 85,
    price: 150,
    status: CardStatus.ACTIVE,
    category: CardCategory.FULL_FUND,
    tags: ['premium', 'high-success'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    usageCount: 0,
    aiScore: 92.5,
    riskLevel: RiskLevel.LOW
  },
  {
    id: '2',
    cardNumber: '5555555555554444',
    expiryDate: '2025-06-30',
    cvv: '456',
    cardType: CardType.MASTERCARD,
    bank: 'Bank of America',
    country: 'GB',
    countryCode: 'GB',
    quality: QualityLevel.HIGH,
    successRate: 75,
    price: 120,
    status: CardStatus.ACTIVE,
    category: CardCategory.FULL_FUND,
    tags: ['high-quality', 'verified'],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    usageCount: 2,
    aiScore: 87.3,
    riskLevel: RiskLevel.LOW
  },
  {
    id: '3',
    cardNumber: '378282246310005',
    expiryDate: '2025-03-31',
    cvv: '789',
    cardType: CardType.AMEX,
    bank: 'American Express',
    country: 'DE',
    countryCode: 'DE',
    quality: QualityLevel.PREMIUM,
    successRate: 90,
    price: 180,
    status: CardStatus.ACTIVE,
    category: CardCategory.FULL_FUND,
    tags: ['premium', 'top-tier'],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    usageCount: 0,
    aiScore: 95.8,
    riskLevel: RiskLevel.LOW
  }
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<CardCategory>(CardCategory.FULL_FUND);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCards, setFilteredCards] = useState<CreditCardType[]>(mockCards);

  // 過濾卡片
  useEffect(() => {
    let filtered = mockCards.filter(card => card.category === selectedCategory);
    
    if (searchTerm) {
      filtered = filtered.filter(card => 
        card.cardNumber.includes(searchTerm) ||
        card.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCards(filtered);
  }, [selectedCategory, searchTerm]);

  const getCategoryDisplayName = (category: CardCategory) => {
    const names = {
      [CardCategory.FULL_FUND]: '全資庫',
      [CardCategory.NAKED_FUND]: '裸資庫',
      [CardCategory.SPECIAL_OFFER]: '特價庫',
      [CardCategory.GLOBAL_BIN]: '全球卡頭庫存',
      [CardCategory.MERCHANT_BASE]: '商家基地'
    };
    return names[category];
  };

  const getQualityDisplayName = (quality: QualityLevel) => {
    const names = {
      [QualityLevel.PREMIUM]: '頂級全資',
      [QualityLevel.HIGH]: '高質量',
      [QualityLevel.MEDIUM]: '中等質量',
      [QualityLevel.STANDARD]: '標準',
      [QualityLevel.BASIC]: '基礎'
    };
    return names[quality];
  };

  const getQualityColor = (quality: QualityLevel) => {
    switch (quality) {
      case QualityLevel.PREMIUM: return 'text-red-500';
      case QualityLevel.HIGH: return 'text-blue-500';
      case QualityLevel.MEDIUM: return 'text-yellow-500';
      case QualityLevel.STANDARD: return 'text-green-500';
      case QualityLevel.BASIC: return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* 頂部狀態欄 */}
      <div className="bg-black bg-opacity-50 text-white px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm">15:46</span>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm">5G</span>
          <div className="w-6 h-3 border border-white rounded-sm">
            <div className="w-4 h-1 bg-white rounded-sm m-0.5"></div>
          </div>
        </div>
      </div>

      {/* 主標題區域 */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button className="text-purple-400 hover:text-purple-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="bg-purple-600 rounded-full px-3 py-1">
              <span className="text-white text-sm font-medium">316</span>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">GMS CVV CARDING</h1>
            <p className="text-purple-300 text-sm">機器人</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-center">
              <div className="text-white text-lg font-bold">31</div>
              <div className="text-purple-300 text-xs">今天</div>
            </div>
            <div className="bg-blue-500 rounded-lg px-3 py-2">
              <div className="text-white text-sm font-medium">全資庫 15:46 ✓</div>
            </div>
          </div>
        </div>

        {/* 功能按鈕網格 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button 
            onClick={() => setSelectedCategory(CardCategory.FULL_FUND)}
            className={`p-4 rounded-lg text-center transition-all duration-200 ${
              selectedCategory === CardCategory.FULL_FUND 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Database className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">全資庫</div>
          </button>
          
          <button 
            onClick={() => setSelectedCategory(CardCategory.NAKED_FUND)}
            className={`p-4 rounded-lg text-center transition-all duration-200 ${
              selectedCategory === CardCategory.NAKED_FUND 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Shield className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">裸資庫</div>
          </button>
          
          <button 
            onClick={() => setSelectedCategory(CardCategory.SPECIAL_OFFER)}
            className={`p-4 rounded-lg text-center transition-all duration-200 ${
              selectedCategory === CardCategory.SPECIAL_OFFER 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">特價庫</div>
          </button>
          
          <button 
            onClick={() => setSelectedCategory(CardCategory.GLOBAL_BIN)}
            className={`p-4 rounded-lg text-center transition-all duration-200 ${
              selectedCategory === CardCategory.GLOBAL_BIN 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <CreditCard className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">全球卡頭庫存</div>
          </button>
          
          <button 
            onClick={() => setSelectedCategory(CardCategory.MERCHANT_BASE)}
            className={`p-4 rounded-lg text-center transition-all duration-200 ${
              selectedCategory === CardCategory.MERCHANT_BASE 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Users className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">商家基地</div>
          </button>
          
          <button className="p-4 rounded-lg text-center bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all duration-200">
            <Brain className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">AI分類</div>
          </button>
        </div>

        {/* 搜尋和過濾 */}
        <div className="flex space-x-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜尋卡片號碼、銀行、國家..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors duration-200">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* 快速操作按鈕 */}
        <div className="flex space-x-3 mb-6">
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
            <Plus className="w-4 h-4" />
            <span>入庫</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200">
            <Upload className="w-4 h-4" />
            <span>出庫</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            <Download className="w-4 h-4" />
            <span>導出</span>
          </button>
        </div>
      </div>

      {/* 卡片列表 */}
      <div className="px-4 pb-20">
        <h2 className="text-xl font-bold text-white mb-4">{getCategoryDisplayName(selectedCategory)}</h2>
        
        <div className="space-y-3">
          {filteredCards.map((card) => (
            <div key={card.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-6 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{card.countryCode}</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {card.countryCode}_{card.country}
                    </div>
                    <div className={`text-sm ${getQualityColor(card.quality)}`}>
                      {getQualityDisplayName(card.quality)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-medium">
                    {card.successRate}%-{Math.min(card.successRate + 20, 100)}%
                  </div>
                  <div className="text-gray-400 text-sm">
                    ${card.price}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {card.quality === QualityLevel.PREMIUM ? (
                    <div className="text-red-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="text-blue-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className="text-gray-400 text-sm">
                    [{card.id}]
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部導航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-4 py-3">
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>三選單</span>
          </button>
          
          <button className="p-2 text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          
          <div className="flex-1 bg-gray-700 rounded-lg px-3 py-2">
            <span className="text-gray-400 text-sm">輸入訊息</span>
          </div>
          
          <button className="p-2 text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          
          <button className="p-2 text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
