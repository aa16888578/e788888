'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'react-hot-toast';
import { updateProfile, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  phoneNumber?: string;
  bio?: string;
  location?: string;
  website?: string;
  telegramId?: string;
  role: 'user' | 'agent' | 'admin';
  joinDate: string;
  lastActive: string;
}

export default function ProfilePage() {
  const { user, isAdmin, isAgent } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    photoURL: '',
    phoneNumber: '',
    bio: '',
    location: '',
    website: '',
    telegramId: '',
    role: 'user',
    joinDate: '',
    lastActive: ''
  });

  useEffect(() => {
    if (user) {
      // 從 localStorage 獲取 Telegram 用戶信息
      const telegramUserStr = localStorage.getItem('telegram_user');
      const telegramUser = telegramUserStr ? JSON.parse(telegramUserStr) : null;

      setProfile({
        displayName: user.displayName || telegramUser?.first_name || '未設定',
        email: user.email || 'telegram@user.com',
        photoURL: user.photoURL || '',
        phoneNumber: user.phoneNumber || '',
        bio: '我是 CVV Bot 的用戶',
        location: '',
        website: '',
        telegramId: telegramUser?.id?.toString() || '',
        role: isAdmin ? 'admin' : isAgent ? 'agent' : 'user',
        joinDate: user.metadata.creationTime || new Date().toISOString(),
        lastActive: user.metadata.lastSignInTime || new Date().toISOString()
      });
    }
  }, [user, isAdmin, isAgent]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // 更新 Firebase Auth 用戶資料
      await updateProfile(user, {
        displayName: profile.displayName,
        photoURL: profile.photoURL
      });

      // 如果電子郵件有變更，需要重新認證
      if (profile.email !== user.email && user.email) {
        const credential = EmailAuthProvider.credential(
          user.email,
          prompt('請輸入當前密碼以確認身份:') || ''
        );
        
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, profile.email);
      }

      // 這裡可以將額外的資料保存到 Firestore
      // await updateDoc(doc(db, 'users', user.uid), {
      //   bio: profile.bio,
      //   location: profile.location,
      //   website: profile.website,
      //   telegramId: profile.telegramId
      // });

      setEditing(false);
      toast.success('個人資料更新成功！');
    } catch (error: any) {
      console.error('更新資料失敗:', error);
      toast.error('更新失敗: ' + (error.message || '未知錯誤'));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 這裡應該上傳到 Firebase Storage
      // 暫時使用 FileReader 預覽
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({
          ...prev,
          photoURL: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
      toast.info('頭像預覽已更新，請點擊保存以確認');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'agent': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return '管理員';
      case 'agent': return '代理';
      default: return '用戶';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 頁面標題 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">個人資料</h1>
            <p className="mt-2 text-gray-600">管理您的帳戶信息和偏好設置</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左側：基本信息 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  {/* 頭像 */}
                  <div className="relative mb-4">
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {profile.photoURL ? (
                        <img
                          src={profile.photoURL}
                          alt="用戶頭像"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl text-gray-400">👤</span>
                      )}
                    </div>
                    {editing && (
                      <label className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                        <span className="text-sm">📷</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* 基本信息 */}
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {profile.displayName}
                  </h2>
                  <p className="text-gray-600 mb-4">{profile.email}</p>
                  
                  {/* 角色徽章 */}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(profile.role)}`}>
                    {getRoleDisplayName(profile.role)}
                  </span>

                  {/* Telegram 信息 */}
                  {profile.telegramId && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-center text-sm text-blue-800">
                        <span className="mr-2">📱</span>
                        Telegram ID: {profile.telegramId}
                      </div>
                    </div>
                  )}

                  {/* 統計信息 */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {new Date(profile.joinDate).toLocaleDateString('zh-TW', { 
                          year: 'numeric', 
                          month: 'short' 
                        })}
                      </div>
                      <div className="text-sm text-gray-600">加入時間</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {new Date(profile.lastActive).toLocaleDateString('zh-TW', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-gray-600">最後活動</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右側：詳細信息 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">詳細信息</h3>
                  <button
                    onClick={() => editing ? handleUpdateProfile() : setEditing(true)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      editing
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } disabled:opacity-50`}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        保存中...
                      </div>
                    ) : editing ? (
                      '保存更改'
                    ) : (
                      '編輯資料'
                    )}
                  </button>
                </div>

                <div className="space-y-6">
                  {/* 基本信息表單 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        顯示名稱
                      </label>
                      <input
                        type="text"
                        value={profile.displayName}
                        onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                        disabled={!editing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        電子郵件
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!editing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        手機號碼
                      </label>
                      <input
                        type="tel"
                        value={profile.phoneNumber}
                        onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        disabled={!editing}
                        placeholder="請輸入手機號碼"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        所在地區
                      </label>
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                        disabled={!editing}
                        placeholder="例如：台北市"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      個人網站
                    </label>
                    <input
                      type="url"
                      value={profile.website}
                      onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                      disabled={!editing}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      個人簡介
                    </label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!editing}
                      rows={4}
                      placeholder="介紹一下您自己..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                {/* 取消編輯按鈕 */}
                {editing && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 帳戶安全 */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">帳戶安全</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">密碼</h4>
                  <p className="text-sm text-gray-600">上次更新：30天前</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  更改密碼
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">兩步驟驗證</h4>
                  <p className="text-sm text-gray-600">增強帳戶安全性</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  設置
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
