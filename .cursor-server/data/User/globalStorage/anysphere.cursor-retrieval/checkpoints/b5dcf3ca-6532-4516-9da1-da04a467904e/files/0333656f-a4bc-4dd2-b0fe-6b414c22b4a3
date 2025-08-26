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
  Settings,
  BarChart3,
  Filter,
  Edit,
  Trash2,
  Eye,
  DollarSign
} from 'lucide-react';
import { CreditCard as CreditCardType, CardCategory, QualityLevel, CardType, CardStatus, RiskLevel } from '@/types';

// 模擬信用卡數據
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

export default function AdminDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<CardCategory | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCards, setFilteredCards] = useState<CreditCardType[]>(mockCards);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCardType | null>(null);

  // 過濾卡片
  useEffect(() => {
    let filtered = mockCards;
    
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(card => card.category === selectedCategory);
    }
    
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

  const getStatusColor = (status: CardStatus) => {
    switch (status) {
      case CardStatus.ACTIVE: return 'bg-green-100 text-green-800';
      case CardStatus.SOLD: return 'bg-blue-100 text-blue-800';
      case CardStatus.EXPIRED: return 'bg-red-100 text-red-800';
      case CardStatus.BLOCKED: return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusDisplayName = (status: CardStatus) => {
    const names = {
      [CardStatus.ACTIVE]: '活躍',
      [CardStatus.INACTIVE]: '非活躍',
      [CardStatus.SOLD]: '已售出',
      [CardStatus.RESERVED]: '預留',
      [CardStatus.EXPIRED]: '過期',
      [CardStatus.BLOCKED]: '封鎖'
    };
    return names[status];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航欄 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <CreditCard className="h-8 w-8 text-purple-600" />
                <h1 className="ml-2 text-xl font-bold text-gray-900">GMS 信用卡管理後台</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                <Brain className="w-4 h-4 inline mr-2" />
                AI分類
              </button>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總卡片數</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">活躍卡片</p>
                <p className="text-2xl font-bold text-gray-900">987</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總價值</p>
                <p className="text-2xl font-bold text-gray-900">$45,678</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">今日新增</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
            </div>
          </div>
        </div>

        {/* 操作區域 */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">信用卡管理</h2>
          </div>
          
          <div className="p-6">
            {/* 分類選擇 */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'ALL'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              {Object.values(CardCategory).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getCategoryDisplayName(category)}
                </button>
              ))}
            </div>

            {/* 搜尋和操作 */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="搜尋卡片號碼、銀行、國家..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-2">
                <button className="flex items-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  入庫
                </button>
                <button className="flex items-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  出庫
                </button>
                <button className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  導出
                </button>
              </div>
            </div>

            {/* 數據表格 */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      卡片信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      分類
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      質量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      成功率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      價格
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
                  {filteredCards.map((card) => (
                    <tr key={card.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {card.cardNumber.substring(0, 4)}****{card.cardNumber.substring(-4)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {card.bank} • {card.country}
                          </div>
                          <div className="text-xs text-gray-400">
                            過期: {card.expiryDate}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {getCategoryDisplayName(card.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          card.quality === QualityLevel.PREMIUM ? 'bg-red-100 text-red-800' :
                          card.quality === QualityLevel.HIGH ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getQualityDisplayName(card.quality)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{card.successRate}%</div>
                        <div className="text-xs text-gray-500">AI評分: {card.aiScore}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${card.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(card.status)}`}>
                          {getStatusDisplayName(card.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
