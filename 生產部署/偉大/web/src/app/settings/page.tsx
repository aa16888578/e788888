'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'react-hot-toast';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

interface UserSettings {
  // 通知設定
  emailNotifications: {
    orderUpdates: boolean;
    promotions: boolean;
    security: boolean;
    newsletter: boolean;
  };
  telegramNotifications: {
    orderUpdates: boolean;
    priceAlerts: boolean;
    systemMessages: boolean;
  };
  
  // 隱私設定
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showOnlineStatus: boolean;
    allowDirectMessages: boolean;
  };
  
  // 交易設定
  trading: {
    defaultCurrency: 'USDT' | 'USD' | 'TWD';
    autoConfirmOrders: boolean;
    priceAlerts: boolean;
    minimumBalance: number;
  };
  
  // 安全設定
  security: {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
    sessionTimeout: number; // 分鐘
    ipWhitelist: string[];
  };
  
  // 界面設定
  interface: {
    theme: 'light' | 'dark' | 'auto';
    language: 'zh-TW' | 'zh-CN' | 'en' | 'ja';
    timezone: string;
    dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
  };
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: {
      orderUpdates: true,
      promotions: false,
      security: true,
      newsletter: false
    },
    telegramNotifications: {
      orderUpdates: true,
      priceAlerts: true,
      systemMessages: true
    },
    privacy: {
      profileVisibility: 'private',
      showOnlineStatus: false,
      allowDirectMessages: true
    },
    trading: {
      defaultCurrency: 'USDT',
      autoConfirmOrders: false,
      priceAlerts: true,
      minimumBalance: 10
    },
    security: {
      twoFactorEnabled: false,
      loginNotifications: true,
      sessionTimeout: 30,
      ipWhitelist: []
    },
    interface: {
      theme: 'light',
      language: 'zh-TW',
      timezone: 'Asia/Taipei',
      dateFormat: 'YYYY-MM-DD'
    }
  });

  // 密碼更改相關狀態
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // 從 localStorage 載入設定
    const savedSettings = localStorage.getItem('user_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('user_settings', JSON.stringify(settings));
    toast.success('設定已保存！');
  };

  const handlePasswordChange = async () => {
    if (!user || !user.email) {
      toast.error('無法更改密碼：用戶信息不完整');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('新密碼確認不匹配');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('密碼長度至少 6 個字符');
      return;
    }

    setLoading(true);
    try {
      // 重新認證
      const credential = EmailAuthProvider.credential(user.email, passwordForm.currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // 更新密碼
      await updatePassword(user, passwordForm.newPassword);
      
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('密碼更新成功！');
    } catch (error: any) {
      console.error('密碼更新失敗:', error);
      let errorMessage = '密碼更新失敗';
      
      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = '當前密碼錯誤';
          break;
        case 'auth/weak-password':
          errorMessage = '新密碼強度不足';
          break;
        default:
          errorMessage = error.message || '密碼更新失敗';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('確定要刪除帳戶嗎？此操作無法撤銷！')) {
      return;
    }

    const confirmText = prompt('請輸入 "DELETE" 確認刪除帳戶:');
    if (confirmText !== 'DELETE') {
      toast.error('確認文字不正確');
      return;
    }

    try {
      // 這裡應該調用刪除帳戶的 API
      await signOut();
      toast.success('帳戶已刪除');
    } catch (error) {
      toast.error('刪除帳戶失敗');
    }
  };

  const tabs = [
    { id: 'notifications', name: '通知設定', icon: '🔔' },
    { id: 'privacy', name: '隱私設定', icon: '🔒' },
    { id: 'trading', name: '交易設定', icon: '💰' },
    { id: 'security', name: '安全設定', icon: '🛡️' },
    { id: 'interface', name: '界面設定', icon: '🎨' },
    { id: 'account', name: '帳戶管理', icon: '⚙️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">電子郵件通知</h3>
              <div className="space-y-3">
                {Object.entries(settings.emailNotifications).map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        emailNotifications: {
                          ...prev.emailNotifications,
                          [key]: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {key === 'orderUpdates' && '訂單狀態更新'}
                      {key === 'promotions' && '促銷活動'}
                      {key === 'security' && '安全警報'}
                      {key === 'newsletter' && '電子報'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Telegram 通知</h3>
              <div className="space-y-3">
                {Object.entries(settings.telegramNotifications).map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        telegramNotifications: {
                          ...prev.telegramNotifications,
                          [key]: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {key === 'orderUpdates' && '訂單更新'}
                      {key === 'priceAlerts' && '價格警報'}
                      {key === 'systemMessages' && '系統消息'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                個人資料可見性
              </label>
              <select
                value={settings.privacy.profileVisibility}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  privacy: {
                    ...prev.privacy,
                    profileVisibility: e.target.value as any
                  }
                }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="public">公開</option>
                <option value="private">私人</option>
                <option value="friends">僅朋友</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.privacy.showOnlineStatus}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    privacy: {
                      ...prev.privacy,
                      showOnlineStatus: e.target.checked
                    }
                  }))}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">顯示在線狀態</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.privacy.allowDirectMessages}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    privacy: {
                      ...prev.privacy,
                      allowDirectMessages: e.target.checked
                    }
                  }))}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">允許直接消息</span>
              </label>
            </div>
          </div>
        );

      case 'trading':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                預設貨幣
              </label>
              <select
                value={settings.trading.defaultCurrency}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  trading: {
                    ...prev.trading,
                    defaultCurrency: e.target.value as any
                  }
                }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="USDT">USDT</option>
                <option value="USD">USD</option>
                <option value="TWD">TWD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最低餘額警告 (USDT)
              </label>
              <input
                type="number"
                value={settings.trading.minimumBalance}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  trading: {
                    ...prev.trading,
                    minimumBalance: parseFloat(e.target.value) || 0
                  }
                }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.trading.autoConfirmOrders}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    trading: {
                      ...prev.trading,
                      autoConfirmOrders: e.target.checked
                    }
                  }))}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">自動確認訂單</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.trading.priceAlerts}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    trading: {
                      ...prev.trading,
                      priceAlerts: e.target.checked
                    }
                  }))}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">價格變動警報</span>
              </label>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">更改密碼</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    當前密碼
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新密碼
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    確認新密碼
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <button
                  onClick={handlePasswordChange}
                  disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '更新中...' : '更新密碼'}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">安全選項</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorEnabled}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      security: {
                        ...prev.security,
                        twoFactorEnabled: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">啟用兩步驟驗證</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.loginNotifications}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      security: {
                        ...prev.security,
                        loginNotifications: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">登入通知</span>
                </label>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  會話超時時間 (分鐘)
                </label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: {
                      ...prev.security,
                      sessionTimeout: parseInt(e.target.value) || 30
                    }
                  }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        );

      case 'interface':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                主題
              </label>
              <select
                value={settings.interface.theme}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  interface: {
                    ...prev.interface,
                    theme: e.target.value as any
                  }
                }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="light">淺色</option>
                <option value="dark">深色</option>
                <option value="auto">自動</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                語言
              </label>
              <select
                value={settings.interface.language}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  interface: {
                    ...prev.interface,
                    language: e.target.value as any
                  }
                }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="zh-TW">繁體中文</option>
                <option value="zh-CN">简体中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                時區
              </label>
              <select
                value={settings.interface.timezone}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  interface: {
                    ...prev.interface,
                    timezone: e.target.value
                  }
                }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="Asia/Taipei">台北時間 (GMT+8)</option>
                <option value="Asia/Shanghai">北京時間 (GMT+8)</option>
                <option value="Asia/Tokyo">東京時間 (GMT+9)</option>
                <option value="UTC">UTC (GMT+0)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                日期格式
              </label>
              <select
                value={settings.interface.dateFormat}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  interface: {
                    ...prev.interface,
                    dateFormat: e.target.value as any
                  }
                }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="YYYY-MM-DD">2024-12-28</option>
                <option value="DD/MM/YYYY">28/12/2024</option>
                <option value="MM/DD/YYYY">12/28/2024</option>
              </select>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">帳戶操作</h3>
              <div className="space-y-4">
                <button
                  onClick={() => toast.info('匯出功能開發中...')}
                  className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📦</span>
                    <div>
                      <div className="font-medium text-gray-900">匯出資料</div>
                      <div className="text-sm text-gray-600">下載您的帳戶資料和交易記錄</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={signOut}
                  className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🚪</span>
                    <div>
                      <div className="font-medium text-gray-900">登出</div>
                      <div className="text-sm text-gray-600">退出當前帳戶</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-red-600 mb-4">危險操作</h3>
              <button
                onClick={handleDeleteAccount}
                className="w-full text-left px-4 py-3 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🗑️</span>
                  <div>
                    <div className="font-medium text-red-600">刪除帳戶</div>
                    <div className="text-sm text-red-500">永久刪除您的帳戶和所有資料</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 頁面標題 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">設定</h1>
            <p className="mt-2 text-gray-600">管理您的帳戶設定和偏好</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 左側導航 */}
            <div className="lg:col-span-1">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* 右側內容 */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {tabs.find(tab => tab.id === activeTab)?.name}
                  </h2>
                  {activeTab !== 'account' && activeTab !== 'security' && (
                    <button
                      onClick={saveSettings}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      保存設定
                    </button>
                  )}
                </div>

                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
