'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'agent' | 'admin';
  requiredPermission?: string;
  redirectTo?: string;
  fallbackComponent?: React.ComponentType;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'user',
  requiredPermission,
  redirectTo = '/auth/login',
  fallbackComponent: FallbackComponent
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, isAgent, isUser, hasPermission, canAccessRoute } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
      return;
    }

    if (!loading && user) {
      let hasAccess = false;
      
      // 如果指定了特定權限，優先檢查權限
      if (requiredPermission) {
        hasAccess = hasPermission(requiredPermission);
      } else {
        // 否則按角色檢查
        switch (requiredRole) {
          case 'user':
            hasAccess = isUser;
            break;
          case 'agent':
            hasAccess = isAgent;
            break;
          case 'admin':
            hasAccess = isAdmin;
            break;
          default:
            hasAccess = isUser;
        }
      }

      if (!hasAccess) {
        // 根據用戶角色重定向到適當頁面
        if (isAdmin) {
          router.push('/admin');
        } else if (isAgent) {
          router.push('/agent');
        } else {
          router.push('/bot');
        }
        return;
      }
    }
  }, [user, loading, isAdmin, isAgent, isUser, requiredRole, requiredPermission, hasPermission, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null; // 正在重定向
  }

  // 檢查用戶是否有權限訪問此頁面
  let hasAccess = false;
  
  // 如果指定了特定權限，優先檢查權限
  if (requiredPermission) {
    hasAccess = hasPermission(requiredPermission);
  } else {
    // 否則按角色檢查
    switch (requiredRole) {
      case 'user':
        hasAccess = isUser;
        break;
      case 'agent':
        hasAccess = isAgent;
        break;
      case 'admin':
        hasAccess = isAdmin;
        break;
      default:
        hasAccess = isUser;
    }
  }

  if (!hasAccess) {
    // 如果提供了自定義的無權限組件，使用它
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    
    // 否則顯示無權限訊息
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-4">
              <span className="text-6xl">🚫</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              權限不足
            </h2>
            <p className="text-gray-600 mb-6">
              您沒有權限訪問此頁面
            </p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              返回上一頁
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
