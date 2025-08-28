'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isTelegramAvailable, setIsTelegramAvailable] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 檢查 Telegram Web App 是否可用
    if (window.Telegram?.WebApp) {
      setIsTelegramAvailable(true);
      const tg = window.Telegram.WebApp;
      
      if (tg.initDataUnsafe?.user) {
        setTelegramUser(tg.initDataUnsafe.user);
      }
    }
  }, []);

  const handleTelegramLogin = async () => {
    if (!isTelegramAvailable) {
      toast.error('請在 Telegram 中打開此頁面');
      return;
    }

    setLoading(true);
    
    try {
      const tg = window.Telegram.WebApp;
      const user = tg.initDataUnsafe?.user;
      
      if (!user) {
        toast.error('無法獲取 Telegram 用戶信息');
        return;
      }

      // 模擬登入過程
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 保存用戶信息到 localStorage
      localStorage.setItem('telegram_user', JSON.stringify({
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        is_bot: user.is_bot,
        language_code: user.language_code,
        loginTime: new Date().toISOString()
      }));

      toast.success(`歡迎回來，${user.first_name || user.username || 'Telegram 用戶'}！`);
      
      // 重定向到 CVV Bot 頁面
      router.push('/bot');
    } catch (error: any) {
      console.error('Telegram 登入失敗:', error);
      toast.error('登入失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = () => {
    // 手動輸入 Telegram 用戶 ID
    const userId = prompt('請輸入您的 Telegram 用戶 ID:');
    if (userId && /^\d+$/.test(userId)) {
      const mockUser = {
        id: parseInt(userId),
        username: `user_${userId}`,
        first_name: 'Telegram',
        last_name: '用戶',
        is_bot: false,
        language_code: 'zh',
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('telegram_user', JSON.stringify(mockUser));
      toast.success('登入成功！');
      router.push('/bot');
    } else if (userId) {
      toast.error('用戶 ID 格式錯誤');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo 和標題 */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl text-white font-bold">🤖</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            CVV Bot Telegram 登入
          </h2>
          <p className="text-gray-600">
            使用您的 Telegram 帳戶登入 CVV 交易平台
          </p>
        </div>

        {/* 登入選項 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Telegram 登入 */}
          <div className="space-y-6">
            {isTelegramAvailable ? (
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl text-white">📱</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Telegram 自動登入
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    檢測到您在 Telegram 中，點擊下方按鈕自動登入
                  </p>
                </div>
                
                <button
                  onClick={handleTelegramLogin}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      登入中...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">📱</span>
                      使用 Telegram 登入
                    </div>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl text-white">❌</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Telegram 不可用
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    請在 Telegram 中打開此頁面，或使用手動登入
                  </p>
                </div>
              </div>
            )}

            {/* 分隔線 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或</span>
              </div>
            </div>

            {/* 手動登入 */}
            <div className="text-center">
              <button
                onClick={handleManualLogin}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
              >
                <span className="mr-2">🔑</span>
                手動輸入用戶 ID
              </button>
              <p className="text-xs text-gray-500 mt-2">
                如果您知道自己的 Telegram 用戶 ID，可以使用此方式登入
              </p>
            </div>
          </div>

          {/* 分隔線 */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或</span>
              </div>
            </div>
          </div>

          {/* 其他登入方式 */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center"
            >
              <span className="mr-2">🔐</span>
              Telegram 登入
            </button>
            
            <button
              type="button"
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center"
            >
              <span className="mr-2">👤</span>
              Agent 登入
            </button>
          </div>

          {/* 註冊鏈接 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              還沒有帳戶？{' '}
              <Link
                href="/auth/register"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                立即註冊
              </Link>
            </p>
          </div>
        </div>

        {/* 返回首頁 */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← 返回首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
