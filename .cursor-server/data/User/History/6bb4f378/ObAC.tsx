'use client';

import { useState } from 'react';
import Link from 'next/link';

// CVV 卡片數據 (基於圖片中的國家/地區)
const cvvCards = [
  { code: 'AR', name: '阿根廷', flag: '🇦🇷', rate: '40%-70%', stock: 2417, type: 'basic', price: 2.5 },
  { code: 'BH', name: '巴林', flag: '🇧🇭', rate: '40%-70%', stock: 255, type: 'basic', price: 3.0 },
  { code: 'BO', name: '玻利維亞', flag: '🇧🇴', rate: '55%-75%', stock: 2269, type: 'premium', price: 4.0 },
  { code: 'BR', name: '巴西', flag: '🇧🇷', rate: '20%-50%', stock: 28373, type: 'premium', price: 2.0 },
  { code: 'CL', name: '智利', flag: '🇨🇱', rate: '45%-75%', stock: 9848, type: 'premium', price: 3.5 },
  { code: 'CL_FULL', name: '智利_全資', flag: '🇨🇱', rate: '40%-70%', stock: 1169, type: 'basic', price: 5.0 },
  { code: 'DE', name: '德國', flag: '🇩🇪', rate: '50%-80%', stock: 2109, type: 'hot', price: 8.0 },
  { code: 'DO', name: '多米尼加', flag: '🇩🇴', rate: '55%-75%', stock: 1475, type: 'premium', price: 3.5 },
  { code: 'EC', name: '厄瓜多爾', flag: '🇪🇨', rate: '40%-70%', stock: 2883, type: 'premium', price: 2.8 },
  { code: 'EE', name: '愛沙尼亞', flag: '🇪🇪', rate: '55%-75%', stock: 451, type: 'basic', price: 4.5 },
  { code: 'ES', name: '西班牙', flag: '🇪🇸', rate: '50%-80%', stock: 22291, type: 'premium', price: 6.0 },
  { code: 'ES_TOP', name: '西班牙_頂級全資', flag: '🇪🇸', rate: '50%-80%', stock: 7091, type: 'hot', price: 12.0 },
  { code: 'FI', name: '芬蘭', flag: '🇫🇮', rate: '55%-75%', stock: 594, type: 'basic', price: 5.5 },
  { code: 'FR', name: '法國', flag: '🇫🇷', rate: '40%-70%', stock: 16965, type: 'premium', price: 5.0 },
  { code: 'FR_FULL', name: '法國_全資', flag: '🇫🇷', rate: '40%-70%', stock: 9278, type: 'basic', price: 8.0 },
  { code: 'GB', name: '英國', flag: '🇬🇧', rate: '40%-70%', stock: 22320, type: 'premium', price: 7.0 },
];

const categories = [
  { id: 'all', name: '全資庫', icon: '🌍' },
  { id: 'course', name: '課資庫', icon: '📚' },
  { id: 'special', name: '特價庫', icon: '💎' },
  { id: 'global', name: '全球卡頭庫存', icon: '🌐' },
  { id: 'query', name: '卡頭查詢|購買', icon: '🔍' },
  { id: 'merchant', name: '🔥 商家基地', icon: '🏪' },
  { id: 'recharge', name: '充值', icon: '💰' },
  { id: 'balance', name: '餘額查詢', icon: '💳' },
  { id: 'english', name: '🇺🇸 English', icon: '🌏' },
];

export default function BotPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userInfo, setUserInfo] = useState({
    id: '5931779846',
    name: '偉 Wei',
    balance: 0
  });

  // 讀取 Telegram 用戶信息
  useEffect(() => {
    const telegramUser = localStorage.getItem('telegram_user');
    if (telegramUser) {
      try {
        const user = JSON.parse(telegramUser);
        setUserInfo({
          id: user.id.toString(),
          name: user.first_name || user.username || 'Telegram 用戶',
          balance: 0
        });
      } catch (error) {
        console.error('解析 Telegram 用戶信息失敗:', error);
      }
    }
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hot': return 'bg-red-600 text-white';
      case 'premium': return 'bg-blue-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hot': return '🔥';
      case 'premium': return '💎';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white" style={{
      backgroundImage: 'linear-gradient(45deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* 頭部 */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              ← 返回首頁
            </Link>
            <div className="text-center">
              <h1 className="text-lg font-bold text-white">GMS CVV CARDING</h1>
              <p className="text-sm text-gray-400">機器人</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">15:46</p>
              <p className="text-xs text-green-400">●</p>
            </div>
          </div>
        </div>
      </div>

      {/* 歡迎信息 */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 mb-6 border border-gray-700">
          <h2 className="text-yellow-400 font-bold mb-3">溫馨提示.售前必看！</h2>
          <div className="text-sm text-gray-300 space-y-2">
            <p><strong className="text-blue-400">歡迎【偉 Wei】機器人 ID:【{userInfo.id}】</strong></p>
            <p>1.機器人所有數據均為一手資源；二手直接刪檔，不出二手，直接買完刪檔</p>
            <p>2.購買請注意！機器人只支持 <span className="text-green-400 font-bold">USDT 充值</span>！卡號錯誤.日期過期.全補.</p>
            <p>3.GMS 永久承諾：充值未使用餘額可以聯繫客服退款。(如果有贈送額度-需扣除贈送額度再退)</p>
            <p>4.建議機器人用戶加入頻道，每天更新會在頻道第一時間通知，更新有需要的卡頭可第一時間搶先購買</p>
          </div>
        </div>

        {/* 教程鏈接 */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 mb-6 border border-gray-700">
          <div className="text-sm space-y-2">
            <div>
              <span className="text-purple-400">機器人充值教程: </span>
              <a href="https://t.me/GMS_CHANNEL2/3" className="text-purple-300 underline">
                https://t.me/GMS_CHANNEL2/3
              </a>
            </div>
            <div>
              <span className="text-purple-400">機器人使用教程: </span>
              <a href="https://t.me/GMS_CHANNEL2/4" className="text-purple-300 underline">
                https://t.me/GMS_CHANNEL2/4
              </a>
            </div>
            <div>
              <span className="text-purple-400">購卡前注意事項: </span>
              <a href="https://t.me/GMS_CHANNEL2/8" className="text-purple-300 underline">
                https://t.me/GMS_CHANNEL2/8
              </a>
            </div>
            <div>
              <span className="text-purple-400">售後規則 - 標準: </span>
              <a href="https://t.me/GMS_CHANNEL2/5" className="text-purple-300 underline">
                https://t.me/GMS_CHANNEL2/5
              </a>
            </div>
          </div>
        </div>

        {/* 聯繫方式 */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 mb-6 border border-gray-700">
          <div className="text-sm space-y-1">
            <p><span className="text-green-400">GMS • 24小時客服:</span> @GMS_CVV_55</p>
            <p><span className="text-blue-400">GMS • 官方頻道:</span> @CVV2D3Dsystem1688</p>
            <p><span className="text-orange-400">GMS • 交流群:</span> @GMSCVVCARDING555</p>
          </div>
        </div>

        {/* CVV 卡片列表 */}
        <div className="space-y-3 mb-6">
          {cvvCards.map((card) => (
            <div
              key={card.code}
              className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{card.flag}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{card.code}_{card.name}</span>
                      {card.type === 'hot' && <span className="text-red-500">🔥</span>}
                      {card.type === 'premium' && <span className="text-blue-400">💎</span>}
                    </div>
                    <div className="text-sm text-gray-400">
                      全資 {card.rate} 【{card.stock}】
                    </div>
                    <div className="text-xs text-green-400">
                      ${card.price} USDT
                    </div>
                  </div>
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                  購買
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 功能按鈕 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg border transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-black/40 border-gray-600 text-gray-300 hover:border-blue-500'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{category.icon}</div>
                <div className="text-sm font-medium">{category.name}</div>
              </div>
            </button>
          ))}
        </div>

        {/* 輸入區域 */}
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-gray-600">
          <div className="flex items-center space-x-3">
            <button className="p-3 bg-purple-600 rounded-full text-white">
              ☰ 選單
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="輸入訊息"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button className="p-3 bg-gray-600 rounded-full text-white hover:bg-gray-500 transition-colors">
              🎤
            </button>
          </div>
        </div>

        {/* 用戶信息顯示 */}
        <div className="fixed top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400">當前用戶</div>
          <div className="text-sm text-white font-medium">{userInfo.name}</div>
          <div className="text-xs text-blue-400">ID: {userInfo.id}</div>
          <div className="text-xs text-green-400">餘額: ${userInfo.balance}</div>
        </div>

        {/* 管理員快速操作 */}
        <div className="fixed bottom-4 right-4">
          <Link 
            href="/admin/config" 
            className="inline-block p-3 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors shadow-lg"
            title="管理員配置"
          >
            ⚙️
          </Link>
        </div>
      </div>
    </div>
  );
}
