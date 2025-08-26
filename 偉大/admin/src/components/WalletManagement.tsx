'use client';

import { useState } from 'react';
import { 
  WalletIcon, 
  PlusIcon, 
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  QrCodeIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/lib/utils';

interface Wallet {
  id: string;
  name: string;
  address: string;
  type: 'hot' | 'cold' | 'commission';
  balance: number;
  currency: string;
  isActive: boolean;
  lastSync: Date;
}

const mockWallets: Wallet[] = [
  {
    id: '1',
    name: '熱錢包',
    address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    type: 'hot',
    balance: 1250.50,
    currency: 'USDT',
    isActive: true,
    lastSync: new Date(),
  },
  {
    id: '2',
    name: '冷錢包',
    address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    type: 'cold',
    balance: 5000.00,
    currency: 'USDT',
    isActive: true,
    lastSync: new Date(Date.now() - 86400000), // 1天前
  },
  {
    id: '3',
    name: '佣金錢包',
    address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    type: 'commission',
    balance: 750.25,
    currency: 'USDT',
    isActive: true,
    lastSync: new Date(),
  },
];

export default function WalletManagement() {
  const [wallets, setWallets] = useState<Wallet[]>(mockWallets);
  const [showAddresses, setShowAddresses] = useState<Record<string, boolean>>({});
  const [isAddingWallet, setIsAddingWallet] = useState(false);

  const toggleAddressVisibility = (walletId: string) => {
    setShowAddresses(prev => ({
      ...prev,
      [walletId]: !prev[walletId]
    }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 這裡可以添加一個 toast 通知
      console.log('地址已複製到剪貼板');
    } catch (err) {
      console.error('複製失敗:', err);
    }
  };

  const getWalletTypeColor = (type: string) => {
    switch (type) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      case 'commission': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWalletTypeName = (type: string) => {
    switch (type) {
      case 'hot': return '熱錢包';
      case 'cold': return '冷錢包';
      case 'commission': return '佣金錢包';
      default: return '未知';
    }
  };

  const syncWallet = async (walletId: string) => {
    // 這裡應該調用 API 同步錢包餘額
    console.log('同步錢包:', walletId);
    // 模擬同步過程
    const updatedWallets = wallets.map(wallet => 
      wallet.id === walletId 
        ? { ...wallet, lastSync: new Date() }
        : wallet
    );
    setWallets(updatedWallets);
  };

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">錢包管理</h1>
        <p className="mt-2 text-sm text-gray-600">
          管理系統錢包、監控餘額和同步區塊鏈數據
        </p>
      </div>

      {/* 總餘額卡片 */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-md bg-green-500">
                <WalletIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-lg font-medium text-gray-500 truncate">
                  總錢包餘額
                </dt>
                <dd className="text-3xl font-bold text-gray-900">
                  {formatCurrency(totalBalance, 'USD')}
                </dd>
                <dd className="text-sm text-gray-500">
                  {wallets.length} 個錢包 • 最後同步: {new Date().toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* 錢包列表 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">錢包列表</h3>
            <button
              onClick={() => setIsAddingWallet(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              新增錢包
            </button>
          </div>

          <div className="space-y-4">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-md ${getWalletTypeColor(wallet.type)}`}>
                      <WalletIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{wallet.name}</h4>
                      <p className="text-xs text-gray-500">{getWalletTypeName(wallet.type)}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-medium text-gray-900">
                      {formatCurrency(wallet.balance, wallet.currency)}
                    </p>
                    <p className="text-xs text-gray-500">
                      最後同步: {wallet.lastSync.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">地址:</span>
                    <span className="text-sm font-mono text-gray-900">
                      {showAddresses[wallet.id] 
                        ? wallet.address 
                        : `${wallet.address.slice(0, 8)}...${wallet.address.slice(-8)}`
                      }
                    </span>
                    <button
                      onClick={() => toggleAddressVisibility(wallet.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showAddresses[wallet.id] ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(wallet.address)}
                      className="text-gray-400 hover:text-gray-600"
                      title="複製地址"
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      title="顯示 QR 碼"
                    >
                      <QrCodeIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => syncWallet(wallet.id)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <ArrowPathIcon className="h-3 w-3 mr-1" />
                      同步
                    </button>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      wallet.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {wallet.isActive ? '活躍' : '非活躍'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 錢包統計 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-red-500">
                  <WalletIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    熱錢包餘額
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(
                      wallets.filter(w => w.type === 'hot').reduce((sum, w) => sum + w.balance, 0),
                      'USD'
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-blue-500">
                  <WalletIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    冷錢包餘額
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(
                      wallets.filter(w => w.type === 'cold').reduce((sum, w) => sum + w.balance, 0),
                      'USD'
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-green-500">
                  <WalletIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    佣金錢包餘額
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(
                      wallets.filter(w => w.type === 'commission').reduce((sum, w) => sum + w.balance, 0),
                      'USD'
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
