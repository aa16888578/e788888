'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: boolean;
  isAgent: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('登入成功！');
    } catch (error: any) {
      console.error('登入失敗:', error);
      let errorMessage = '登入失敗';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = '用戶不存在';
          break;
        case 'auth/wrong-password':
          errorMessage = '密碼錯誤';
          break;
        case 'auth/invalid-email':
          errorMessage = '電子郵件格式無效';
          break;
        case 'auth/too-many-requests':
          errorMessage = '嘗試次數過多，請稍後再試';
          break;
        case 'auth/user-disabled':
          errorMessage = '帳戶已被禁用';
          break;
        default:
          errorMessage = error.message || '登入失敗';
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      await updateProfile(newUser, { displayName });
      toast.success('註冊成功！');
    } catch (error: any) {
      console.error('註冊失敗:', error);
      let errorMessage = '註冊失敗';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = '此電子郵件已被使用';
          break;
        case 'auth/invalid-email':
          errorMessage = '電子郵件格式無效';
          break;
        case 'auth/weak-password':
          errorMessage = '密碼強度不足';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = '註冊功能已被禁用';
          break;
        default:
          errorMessage = error.message || '註冊失敗';
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success('已成功登出');
    } catch (error) {
      console.error('登出失敗:', error);
      toast.error('登出失敗');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('密碼重置郵件已發送，請檢查您的郵箱');
    } catch (error: any) {
      console.error('密碼重置失敗:', error);
      let errorMessage = '密碼重置失敗';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = '此電子郵件地址未註冊';
          break;
        case 'auth/invalid-email':
          errorMessage = '電子郵件格式無效';
          break;
        default:
          errorMessage = error.message || '密碼重置失敗';
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  // 用戶角色判斷 - 更完善的角色系統
  const getUserRole = (): 'admin' | 'agent' | 'user' | null => {
    if (!user) return null;
    
    // 檢查 Telegram 用戶信息
    const telegramUserStr = localStorage.getItem('telegram_user');
    const telegramUser = telegramUserStr ? JSON.parse(telegramUserStr) : null;
    
    // 管理員判斷邏輯
    const adminEmails = ['admin@cvvbot.com', 'administrator@cvvbot.com'];
    const adminTelegramIds = ['123456789', '987654321']; // 管理員的 Telegram ID
    
    if (adminEmails.includes(user.email || '') || 
        user.email?.includes('admin') ||
        (telegramUser && adminTelegramIds.includes(telegramUser.id?.toString()))) {
      return 'admin';
    }
    
    // 代理判斷邏輯
    const agentEmails = user.email?.includes('agent') || false;
    const agentTelegramIds = ['111111111', '222222222']; // 代理的 Telegram ID
    
    if (agentEmails || 
        (telegramUser && agentTelegramIds.includes(telegramUser.id?.toString()))) {
      return 'agent';
    }
    
    return 'user';
  };

  const userRole = getUserRole();
  const isAdmin: boolean = userRole === 'admin';
  const isAgent: boolean = userRole === 'agent' || userRole === 'admin';
  const isUser: boolean = !!user;

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAdmin,
    isAgent,
    isUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
