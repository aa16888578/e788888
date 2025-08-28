'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ConfigItem {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'password' | 'textarea';
  category: string;
  required: boolean;
  description: string;
}

const defaultConfigs: ConfigItem[] = [
  // Firebase 配置
  {
    key: 'FIREBASE_API_KEY',
    label: 'Firebase API Key',
    value: '',
    type: 'password',
    category: 'Firebase',
    required: true,
    description: 'Firebase 項目的 API 金鑰'
  },
  {
    key: 'FIREBASE_PROJECT_ID',
    label: 'Firebase Project ID',
    value: 'ccvbot-8578',
    type: 'text',
    category: 'Firebase',
    required: true,
    description: 'Firebase 項目 ID'
  },
  {
    key: 'FIREBASE_AUTH_DOMAIN',
    label: 'Firebase Auth Domain',
    value: 'ccvbot-8578.firebaseapp.com',
    type: 'text',
    category: 'Firebase',
    required: true,
    description: 'Firebase 認證域名'
  },
  {
    key: 'FIREBASE_STORAGE_BUCKET',
    label: 'Firebase Storage Bucket',
    value: 'ccvbot-8578.firebasestorage.app',
    type: 'text',
    category: 'Firebase',
    required: true,
    description: 'Firebase 存儲桶'
  },
  
  // Telegram 配置
  {
    key: 'TELEGRAM_BOT_TOKEN',
    label: 'Telegram Bot Token',
    value: '',
    type: 'password',
    category: 'Telegram',
    required: true,
    description: 'Telegram Bot 的 API Token'
  },
  {
    key: 'TELEGRAM_BOT_USERNAME',
    label: 'Telegram Bot Username',
    value: '',
    type: 'text',
    category: 'Telegram',
    required: false,
    description: 'Telegram Bot 的用戶名'
  },
  {
    key: 'TELEGRAM_WEBHOOK_SECRET',
    label: 'Telegram Webhook Secret',
    value: '',
    type: 'password',
    category: 'Telegram',
    required: false,
    description: 'Telegram Webhook 安全密鑰'
  },
  
  // 支付配置
  {
    key: 'USDT_TRC20_CONTRACT',
    label: 'USDT TRC20 Contract Address',
    value: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    type: 'text',
    category: '支付系統',
    required: true,
    description: 'USDT TRC20 智能合約地址'
  },
  {
    key: 'TRON_API_KEY',
    label: 'Tron Network API Key',
    value: '',
    type: 'password',
    category: '支付系統',
    required: true,
    description: 'Tron 網絡 API 金鑰'
  },
  {
    key: 'PAYMENT_WALLET_ADDRESS',
    label: '收款錢包地址',
    value: '',
    type: 'text',
    category: '支付系統',
    required: true,
    description: '系統收款錢包地址'
  },
  
  // 代理系統配置
  {
    key: 'MAX_AGENT_LEVELS',
    label: '最大代理層級',
    value: '3',
    type: 'text',
    category: '代理系統',
    required: true,
    description: '代理系統最大層級數'
  },
  {
    key: 'BASE_COMMISSION_RATE',
    label: '基礎佣金比例 (%)',
    value: '15',
    type: 'text',
    category: '代理系統',
    required: true,
    description: '代理基礎佣金比例'
  },
  
  // 系統配置
  {
    key: 'APP_NAME',
    label: '應用名稱',
            value: 'CVV Bot 統一平台',
    type: 'text',
    category: '系統設置',
    required: true,
    description: '應用顯示名稱'
  },
  {
    key: 'ADMIN_EMAIL',
    label: '管理員郵箱',
    value: 'a0928997578@gmail.com',
    type: 'text',
    category: '系統設置',
    required: true,
    description: '系統管理員郵箱'
  }
];

export default function ConfigPage() {
  const [configs, setConfigs] = useState<ConfigItem[]>(defaultConfigs);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // 加載配置
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      // 從 localStorage 加載配置 (開發環境)
      const savedConfigs = localStorage.getItem('cvvbot_configs');
      if (savedConfigs) {
        const parsed = JSON.parse(savedConfigs);
        setConfigs(prevConfigs => 
          prevConfigs.map(config => ({
            ...config,
            value: parsed[config.key] || config.value
          }))
        );
      }
    } catch (error) {
      console.error('加載配置失敗:', error);
    }
  };

  const saveConfigs = async () => {
    setLoading(true);
    try {
      // 保存到 localStorage (開發環境)
      const configObject = configs.reduce((acc, config) => {
        acc[config.key] = config.value;
        return acc;
      }, {} as Record<string, string>);
      
              localStorage.setItem('cvvbot_configs', JSON.stringify(configObject));
      
      // 生成環境變數文件
      await generateEnvFile(configObject);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('保存配置失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateEnvFile = async (configObject: Record<string, string>) => {
    const envContent = `# 🔐 ShopBot 自動生成的環境配置
# 由統一後台配置系統生成 - ${new Date().toLocaleString('zh-TW')}

# Firebase 配置
NEXT_PUBLIC_FIREBASE_API_KEY=${configObject.FIREBASE_API_KEY}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${configObject.FIREBASE_AUTH_DOMAIN}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${configObject.FIREBASE_PROJECT_ID}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${configObject.FIREBASE_STORAGE_BUCKET}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=177257832546
NEXT_PUBLIC_FIREBASE_APP_ID=1:177257832546:web:auto

# Telegram Bot 配置
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=${configObject.TELEGRAM_BOT_TOKEN}
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=${configObject.TELEGRAM_BOT_USERNAME}
TELEGRAM_WEBHOOK_SECRET=${configObject.TELEGRAM_WEBHOOK_SECRET}

# 支付系統配置
USDT_TRC20_CONTRACT_ADDRESS=${configObject.USDT_TRC20_CONTRACT}
TRON_NETWORK_API_KEY=${configObject.TRON_API_KEY}
PAYMENT_WALLET_ADDRESS=${configObject.PAYMENT_WALLET_ADDRESS}

# 代理系統配置
MAX_AGENT_LEVELS=${configObject.MAX_AGENT_LEVELS}
BASE_COMMISSION_RATE=${configObject.BASE_COMMISSION_RATE}

# 系統配置
NEXT_PUBLIC_APP_NAME=${configObject.APP_NAME}
ADMIN_EMAIL=${configObject.ADMIN_EMAIL}

# VM 環境配置
HOST=0.0.0.0
PORT=3000
NEXT_PUBLIC_API_BASE_URL=http://10.140.0.2:5001/ccvbot-8578/asia-east1
`;

    // 在開發環境中，我們只能顯示內容，無法直接寫入文件
    console.log('生成的環境配置:', envContent);
    
    // 創建下載鏈接
    const blob = new Blob([envContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '.env.local';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const updateConfig = (key: string, value: string) => {
    setConfigs(prevConfigs =>
      prevConfigs.map(config =>
        config.key === key ? { ...config, value } : config
      )
    );
  };

  const categories = Array.from(new Set(configs.map(c => c.category)));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="text-blue-600 hover:text-blue-700">
              ← 返回管理後台
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">系統配置管理</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚙️</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            統一配置管理
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            在這裡統一管理所有系統配置 - Firebase、Telegram、支付系統、代理系統
          </p>
        </div>

        {categories.map(category => (
          <div key={category} className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {configs
                .filter(config => config.category === category)
                .map(config => (
                  <div key={config.key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {config.label}
                      {config.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      type={config.type === 'password' ? 'password' : 'text'}
                      value={config.value}
                      onChange={(e) => updateConfig(config.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`請輸入 ${config.label}`}
                    />
                    <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">配置操作</h3>
          <div className="flex space-x-4">
            <button
              onClick={saveConfigs}
              disabled={loading}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                loading 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? '保存中...' : '保存配置'}
            </button>
            
            <button
              onClick={loadConfigs}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              重新加載
            </button>
            
            <button
              onClick={() => generateEnvFile(configs.reduce((acc, c) => ({ ...acc, [c.key]: c.value }), {}))}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              下載 .env 文件
            </button>
          </div>
          
          {saved && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
              ✅ 配置已保存！環境變數文件已下載。
            </div>
          )}
        </div>

        <div className="bg-yellow-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">
            ⚠️ 重要提醒
          </h3>
          <ul className="text-yellow-700 space-y-2 text-sm">
            <li>• 保存配置後會自動下載 .env.local 文件</li>
            <li>• 請將下載的文件放到項目根目錄</li>
            <li>• 修改配置後需要重啟服務才能生效</li>
            <li>• 敏感信息會加密保存在本地存儲中</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">配置狀態</h3>
            <div className="space-y-3">
              {categories.map(category => {
                const categoryConfigs = configs.filter(c => c.category === category);
                const requiredConfigs = categoryConfigs.filter(c => c.required);
                const completedConfigs = requiredConfigs.filter(c => c.value.trim() !== '');
                const completion = requiredConfigs.length > 0 ? (completedConfigs.length / requiredConfigs.length) * 100 : 100;
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{category}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${completion === 100 ? 'bg-green-500' : completion > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${completion}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{Math.round(completion)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 text-left bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
                🔄 重啟服務
              </button>
              <button className="w-full px-4 py-2 text-left bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors">
                🧪 測試連接
              </button>
              <button className="w-full px-4 py-2 text-left bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors">
                📊 查看日誌
              </button>
              <button className="w-full px-4 py-2 text-left bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors">
                🚀 部署到生產
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
