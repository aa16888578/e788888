'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    telegramUsername: '',
    userType: 'user' // user, agent, admin
  });
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error('請填寫所有必填欄位');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('密碼至少需要 6 個字符');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('密碼確認不匹配');
      return false;
    }

    if (!agreedToTerms) {
      toast.error('請同意服務條款和隱私政策');
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // 創建用戶帳戶
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;

      // 更新用戶資料
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });

      // 這裡可以添加額外的用戶資料到 Firestore
      // await addDoc(collection(db, 'users'), {
      //   uid: user.uid,
      //   firstName: formData.firstName,
      //   lastName: formData.lastName,
      //   email: formData.email,
      //   phone: formData.phone,
      //   telegramUsername: formData.telegramUsername,
      //   userType: formData.userType,
      //   createdAt: new Date(),
      //   status: 'active'
      // });

      toast.success(`註冊成功！歡迎 ${formData.firstName}`);
      
      // 重定向到相應頁面
      if (formData.userType === 'admin') {
        router.push('/admin');
      } else if (formData.userType === 'agent') {
        router.push('/agent');
      } else {
        router.push('/bot');
      }
    } catch (error: any) {
      console.error('註冊失敗:', error);
      
      let errorMessage = '註冊失敗';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = '此電子郵件已被使用';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '電子郵件格式無效';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = '密碼強度不足';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Logo 和標題 */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl text-white font-bold">💳</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            CVV Bot 註冊
          </h2>
          <p className="text-gray-600">
            創建您的帳戶以開始使用 CVV 交易平台
          </p>
        </div>

        {/* 註冊表單 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleRegister} className="space-y-6">
            {/* 姓名行 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  名字 <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="您的名字"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  姓氏 <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="您的姓氏"
                />
              </div>
            </div>

            {/* 電子郵件 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                電子郵件 <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="your@email.com"
              />
            </div>

            {/* 密碼行 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  密碼 <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">至少 6 個字符</p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  確認密碼 <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* 聯繫信息行 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  手機號碼
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="+886 912 345 678"
                />
              </div>
              
              <div>
                <label htmlFor="telegramUsername" className="block text-sm font-medium text-gray-700 mb-2">
                  Telegram 用戶名
                </label>
                <input
                  id="telegramUsername"
                  name="telegramUsername"
                  type="text"
                  value={formData.telegramUsername}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="@username"
                />
              </div>
            </div>

            {/* 用戶類型 */}
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-2">
                帳戶類型
              </label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                <option value="user">一般用戶</option>
                <option value="agent">代理用戶</option>
                <option value="admin">管理員</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.userType === 'user' && '可以瀏覽和購買 CVV 卡片'}
                {formData.userType === 'agent' && '可以管理下級用戶和查看統計'}
                {formData.userType === 'admin' && '擁有完整的管理權限'}
              </p>
            </div>

            {/* 條款同意 */}
            <div className="flex items-start">
              <input
                id="agreedToTerms"
                name="agreedToTerms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="agreedToTerms" className="ml-2 block text-sm text-gray-700">
                我同意{' '}
                <Link
                  href="/terms"
                  className="text-green-600 hover:text-green-500 underline"
                >
                  服務條款
                </Link>
                {' '}和{' '}
                <Link
                  href="/privacy"
                  className="text-green-600 hover:text-green-500 underline"
                >
                  隱私政策
                </Link>
                <span className="text-red-500">*</span>
              </label>
            </div>

            {/* 註冊按鈕 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  註冊中...
                </div>
              ) : (
                '創建帳戶'
              )}
            </button>
          </form>

          {/* 登入鏈接 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              已有帳戶？{' '}
              <Link
                href="/auth/login"
                className="font-medium text-green-600 hover:text-green-500 transition-colors"
              >
                立即登入
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
