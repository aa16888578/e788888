'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface PaymentOrder {
  payment_id: string;
  order_id: string;
  amount: number;
  currency: string;
  payment_address: string;
  network: string;
  expires_at: string;
  qr_code_data: string;
  status: string;
}

interface PaymentHistory {
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  order_type: string;
  created_at: string;
  confirmed_at?: string;
  transaction_hash?: string;
}

export default function PaymentPage() {
  const [activeTab, setActiveTab] = useState<'recharge' | 'history'>('recharge');
  const [rechargeAmount, setRechargeAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [currentOrder, setCurrentOrder] = useState<PaymentOrder | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);

  // 預設充值金額
  const presetAmounts = [10, 50, 100, 500, 1000];

  useEffect(() => {
    loadUserBalance();
    loadPaymentHistory();
  }, []);

  const loadUserBalance = async () => {
    try {
      // 這裡應該調用實際的 API
      // const response = await fetch('/api/user/balance');
      // const data = await response.json();
      // setUserBalance(data.balance);
      
      // 暫時使用模擬數據
      setUserBalance(128.50);
    } catch (error) {
      console.error('載入用戶餘額失敗:', error);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      // 這裡應該調用實際的 API
      // const response = await fetch('/api/payment/history');
      // const data = await response.json();
      // setPaymentHistory(data);
      
      // 暫時使用模擬數據
      setPaymentHistory([
        {
          order_id: 'PAY_20250127120001_ABC123',
          amount: 100,
          currency: 'USDT',
          status: 'confirmed',
          order_type: 'recharge',
          created_at: '2025-01-27T12:00:00Z',
          confirmed_at: '2025-01-27T12:05:00Z',
          transaction_hash: '0x1234...5678'
        },
        {
          order_id: 'PAY_20250126180001_DEF456',
          amount: 50,
          currency: 'USDT',
          status: 'confirmed',
          order_type: 'recharge',
          created_at: '2025-01-26T18:00:00Z',
          confirmed_at: '2025-01-26T18:03:00Z',
          transaction_hash: '0x8765...4321'
        }
      ]);
    } catch (error) {
      console.error('載入支付歷史失敗:', error);
    }
  };

  const createPaymentOrder = async (amount: number) => {
    setIsLoading(true);
    try {
      // 這裡應該調用實際的 API
      // const response = await fetch('/api/payment/create', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount, order_type: 'recharge' })
      // });
      // const data = await response.json();
      
      // 暫時使用模擬數據
      const mockOrder: PaymentOrder = {
        payment_id: 'pay_' + Date.now(),
        order_id: `PAY_${new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '')}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        amount: amount,
        currency: 'USDT',
        payment_address: 'TQn9Y2khEsLMWtWxG8rWXcZKMnFmZKZdKj',
        network: 'TRC20',
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2小時後過期
        qr_code_data: `tron:TQn9Y2khEsLMWtWxG8rWXcZKMnFmZKZdKj?amount=${amount}&token=USDT`,
        status: 'pending'
      };
      
      setCurrentOrder(mockOrder);
      toast.success('支付訂單創建成功！');
      
    } catch (error) {
      console.error('創建支付訂單失敗:', error);
      toast.error('創建支付訂單失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!currentOrder) return;
    
    try {
      // 這裡應該調用實際的 API
      // const response = await fetch(`/api/payment/status/${currentOrder.order_id}`);
      // const data = await response.json();
      
      // 模擬支付狀態檢查
      const random = Math.random();
      if (random > 0.7) { // 30% 機會模擬支付成功
        setCurrentOrder(null);
        await loadUserBalance();
        await loadPaymentHistory();
        toast.success('支付確認成功！餘額已更新。');
      } else {
        toast.info('支付確認中，請稍候...');
      }
      
    } catch (error) {
      console.error('檢查支付狀態失敗:', error);
      toast.error('檢查支付狀態失敗');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('已複製到剪貼板');
    } catch (error) {
      console.error('複製失敗:', error);
      toast.error('複製失敗');
    }
  };

  const handlePresetAmountClick = (amount: number) => {
    setRechargeAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setRechargeAmount(numValue);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return '已確認';
      case 'pending': return '待確認';
      case 'expired': return '已過期';
      default: return '未知';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頭部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">支付中心</h1>
          <p className="text-gray-600 mt-1">管理您的 USDT 充值和支付記錄</p>
          
          {/* 餘額顯示 */}
          <div className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">當前餘額</p>
                <p className="text-2xl font-bold">${userBalance.toFixed(2)} USDT</p>
              </div>
              <div className="text-right">
                <p className="text-blue-100">支付網絡</p>
                <p className="font-semibold">TRON (TRC20)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 標籤切換 */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('recharge')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'recharge'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💰 充值
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 記錄
          </button>
        </div>

        {/* 充值標籤內容 */}
        {activeTab === 'recharge' && (
          <div className="space-y-6">
            {!currentOrder ? (
              <>
                {/* 預設金額選擇 */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">選擇充值金額</h2>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                    {presetAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handlePresetAmountClick(amount)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          rechargeAmount === amount
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold">${amount}</div>
                        <div className="text-sm text-gray-500">USDT</div>
                      </button>
                    ))}
                  </div>

                  {/* 自定義金額 */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      自定義金額 (最低 $10 USDT)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="10"
                        step="0.01"
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        placeholder="輸入充值金額"
                        className="w-full pl-3 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                        USDT
                      </div>
                    </div>
                  </div>

                  {/* 充值按鈕 */}
                  <button
                    onClick={() => createPaymentOrder(rechargeAmount)}
                    disabled={rechargeAmount < 10 || isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? '創建訂單中...' : `充值 $${rechargeAmount} USDT`}
                  </button>
                </div>

                {/* 充值說明 */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 重要提醒</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• 僅支持 USDT-TRC20 網絡充值</li>
                    <li>• 最低充值金額為 $10 USDT</li>
                    <li>• 到賬時間：1-3 個區塊確認</li>
                    <li>• 請務必確認地址正確後再轉賬</li>
                    <li>• 建議小額測試後再大額充值</li>
                  </ul>
                </div>
              </>
            ) : (
              /* 支付訂單詳情 */
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">USDT-TRC20 充值</h2>
                  <p className="text-gray-600">請向以下地址轉賬 {currentOrder.amount} USDT</p>
                </div>

                {/* 訂單信息 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">訂單號：</span>
                    <span className="font-mono text-sm">{currentOrder.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">充值金額：</span>
                    <span className="font-bold text-lg">${currentOrder.amount} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">網絡：</span>
                    <span className="font-semibold">TRON (TRC20)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">過期時間：</span>
                    <span className="text-red-600">{formatDateTime(currentOrder.expires_at)}</span>
                  </div>
                </div>

                {/* 支付地址 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    支付地址 (TRON TRC20)
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={currentOrder.payment_address}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(currentOrder.payment_address)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
                    >
                      複製
                    </button>
                  </div>
                </div>

                {/* 操作按鈕 */}
                <div className="flex space-x-3">
                  <button
                    onClick={checkPaymentStatus}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    ✅ 我已轉賬，確認支付
                  </button>
                  <button
                    onClick={() => setCurrentOrder(null)}
                    className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    ❌ 取消訂單
                  </button>
                </div>

                {/* 支付步驟 */}
                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">📱 支付步驟</h3>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>複製上方支付地址</li>
                    <li>打開您的 USDT 錢包應用</li>
                    <li>選擇 USDT-TRC20 轉賬</li>
                    <li>粘貼地址並輸入金額 {currentOrder.amount} USDT</li>
                    <li>確認轉賬並等待區塊鏈確認</li>
                    <li>點擊「我已轉賬，確認支付」按鈕</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 支付記錄標籤內容 */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">支付記錄</h2>
              <p className="text-gray-600">查看您的充值和支付歷史</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {paymentHistory.length > 0 ? (
                paymentHistory.map((record) => (
                  <div key={record.order_id} className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-lg">💰</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {record.order_type === 'recharge' ? '充值' : '購買'}
                          </p>
                          <p className="text-sm text-gray-500 font-mono">{record.order_id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${record.amount} {record.currency}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {getStatusText(record.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>創建時間：{formatDateTime(record.created_at)}</p>
                      {record.confirmed_at && (
                        <p>確認時間：{formatDateTime(record.confirmed_at)}</p>
                      )}
                      {record.transaction_hash && (
                        <p className="flex items-center space-x-2">
                          <span>交易哈希：</span>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {record.transaction_hash}
                          </span>
                          <button
                            onClick={() => copyToClipboard(record.transaction_hash!)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            複製
                          </button>
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📋</span>
                  </div>
                  <p>暫無支付記錄</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
