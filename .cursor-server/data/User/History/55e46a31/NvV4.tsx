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
            <span className="text-2xl text-white font-bold">💳</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            CVV Bot 登入
          </h2>
          <p className="text-gray-600">
            登入您的帳戶以訪問 CVV 交易平台
          </p>
        </div>

        {/* 登入表單 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* 電子郵件 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                電子郵件
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="your@email.com"
              />
            </div>

            {/* 密碼 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密碼
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* 記住我和忘記密碼 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  記住我
                </label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
              >
                忘記密碼？
              </Link>
            </div>

            {/* 登入按鈕 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  登入中...
                </div>
              ) : (
                '登入'
              )}
            </button>
          </form>

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
