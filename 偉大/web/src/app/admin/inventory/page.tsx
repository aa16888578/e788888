'use client';

import { useState, useEffect } from 'react';
import { cvvService } from '@/lib/cvvService';
import { 
  CVVCard, 
  CVVInventoryStats, 
  CVVSearchFilters,
  CVV_COUNTRIES,
  CVV_CARD_TYPES,
  CVV_CATEGORIES
} from '@/types/cvv';

export default function InventoryManagementPage() {
  const [stats, setStats] = useState<CVVInventoryStats | null>(null);
  const [cards, setCards] = useState<CVVCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [filters, setFilters] = useState<CVVSearchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 加載庫存統計
  useEffect(() => {
    loadStats();
  }, []);

  // 加載卡片列表
  useEffect(() => {
    loadCards();
  }, [filters, currentPage]);

  const loadStats = async () => {
    try {
      const data = await cvvService.getInventoryStats();
      setStats(data);
    } catch (error) {
      console.error('加載統計失敗:', error);
    }
  };

  const loadCards = async () => {
    try {
      setLoading(true);
      const result = await cvvService.searchCards(filters, currentPage, 20);
      setCards(result.cards);
      setTotalPages(Math.ceil(result.total / 20));
    } catch (error) {
      console.error('加載卡片失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchStatusUpdate = async (status: CVVCard['status']) => {
    if (selectedCards.length === 0) return;
    
    try {
      await cvvService.batchUpdateStatus(selectedCards, status);
      setSelectedCards([]);
      loadCards();
      loadStats();
    } catch (error) {
      console.error('批量更新失敗:', error);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedCards.length === 0) return;
    
    if (!confirm(`確定要刪除 ${selectedCards.length} 張卡片嗎？`)) return;
    
    try {
      for (const cardId of selectedCards) {
        await cvvService.deleteCard(cardId);
      }
      setSelectedCards([]);
      loadCards();
      loadStats();
    } catch (error) {
      console.error('刪除失敗:', error);
    }
  };

  const getStatusColor = (status: CVVCard['status']) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      sold: 'bg-gray-100 text-gray-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      invalid: 'bg-red-100 text-red-800',
      checking: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: CVVCard['category']) => {
    const colors = {
      basic: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      hot: 'bg-red-100 text-red-800',
      vip: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">💳 CVV 庫存管理</h1>
          <p className="text-gray-600 mt-2">管理 CVV 卡片庫存、狀態和批量操作</p>
        </div>

        {/* 統計卡片 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">總庫存</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">可售</p>
                  <p className="text-2xl font-bold text-green-600">{stats.available.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gray-100">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">已售</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.sold.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <span className="text-2xl">⏳</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">預留</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.reserved.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <span className="text-2xl">💵</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">今日收入</p>
                  <p className="text-2xl font-bold text-purple-600">${stats.todayRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 篩選器 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">篩選條件</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">國家</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                onChange={(e) => setFilters({
                  ...filters,
                  countries: e.target.value ? [e.target.value] : undefined
                })}
              >
                <option value="">全部國家</option>
                {Object.entries(CVV_COUNTRIES).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">卡片類型</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                onChange={(e) => setFilters({
                  ...filters,
                  cardTypes: e.target.value ? [e.target.value] : undefined
                })}
              >
                <option value="">全部類型</option>
                {Object.entries(CVV_CARD_TYPES).map(([type, name]) => (
                  <option key={type} value={type}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">分類</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                onChange={(e) => setFilters({
                  ...filters,
                  categories: e.target.value ? [e.target.value] : undefined
                })}
              >
                <option value="">全部分類</option>
                {Object.entries(CVV_CATEGORIES).map(([cat, name]) => (
                  <option key={cat} value={cat}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">狀態</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                onChange={(e) => setFilters({
                  ...filters,
                  status: e.target.value ? [e.target.value] : undefined
                })}
              >
                <option value="">全部狀態</option>
                <option value="available">可售</option>
                <option value="sold">已售</option>
                <option value="reserved">預留</option>
                <option value="invalid">無效</option>
                <option value="checking">檢查中</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => {
                setFilters({});
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              清除篩選
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              搜索
            </button>
          </div>
        </div>

        {/* 批量操作 */}
        {selectedCards.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                已選擇 {selectedCards.length} 張卡片
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBatchStatusUpdate('available')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  標記可售
                </button>
                <button
                  onClick={() => handleBatchStatusUpdate('invalid')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  標記無效
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  刪除選中
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 卡片列表 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">卡片列表</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">載入中...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedCards.length === cards.length && cards.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCards(cards.map(card => card.id));
                          } else {
                            setSelectedCards([]);
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      卡片信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      地區/銀行
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      價格/分類
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      狀態
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      創建時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cards.map((card) => (
                    <tr key={card.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCards.includes(card.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCards([...selectedCards, card.id]);
                            } else {
                              setSelectedCards(selectedCards.filter(id => id !== card.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {card.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {card.expiryMonth}/{card.expiryYear} • CVV: {card.cvvCode}
                          </div>
                          <div className="text-sm text-gray-500">
                            {CVV_CARD_TYPES[card.cardType]} • {card.cardLevel}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {CVV_COUNTRIES[card.country as keyof typeof CVV_COUNTRIES] || card.country}
                          </div>
                          <div className="text-sm text-gray-500">{card.bankName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">${card.price}</div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(card.category)}`}>
                            {CVV_CATEGORIES[card.category]}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(card.status)}`}>
                          {card.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(card.createdAt).toLocaleDateString('zh-TW')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          編輯
                        </button>
                        <button 
                          onClick={() => cvvService.deleteCard(card.id).then(() => loadCards())}
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
          )}

          {/* 分頁 */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                顯示第 {((currentPage - 1) * 20) + 1} 到 {Math.min(currentPage * 20, cards.length)} 項
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一頁
                </button>
                <span className="px-3 py-1 text-sm">
                  第 {currentPage} 頁，共 {totalPages} 頁
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一頁
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
