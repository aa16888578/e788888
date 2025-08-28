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
  redirectTo = '/auth/login'
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, isAgent, isUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
      return;
    }

    if (!loading && user) {
      let hasAccess = false;
      
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
  }, [user, loading, isAdmin, isAgent, isUser, requiredRole, router, redirectTo]);

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

  if (!hasAccess) {
    return null; // 正在重定向
  }

  return <>{children}</>;
}
