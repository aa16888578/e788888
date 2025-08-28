'use client';

import { useAuth } from '@/contexts/AuthContext';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  role?: 'user' | 'agent' | 'admin';
  fallback?: React.ReactNode;
  requireAll?: boolean; // 如果同時指定 permission 和 role，是否需要同時滿足
}

/**
 * 權限閘門組件 - 根據用戶權限決定是否顯示子組件
 * 
 * @param permission - 所需的權限字符串 (例如: 'cvv.import', 'admin.users')
 * @param role - 所需的角色 ('user' | 'agent' | 'admin')
 * @param fallback - 無權限時顯示的替代內容
 * @param requireAll - 如果同時指定 permission 和 role，是否需要同時滿足
 * @param children - 有權限時顯示的內容
 */
export default function PermissionGate({
  children,
  permission,
  role,
  fallback = null,
  requireAll = false
}: PermissionGateProps) {
  const { user, userRole, hasPermission, isAdmin, isAgent, isUser } = useAuth();

  // 如果用戶未登入，不顯示任何內容
  if (!user) {
    return <>{fallback}</>;
  }

  let hasAccess = false;

  // 檢查權限和角色
  const hasRequiredPermission = permission ? hasPermission(permission) : true;
  let hasRequiredRole = true;

  if (role) {
    switch (role) {
      case 'user':
        hasRequiredRole = isUser;
        break;
      case 'agent':
        hasRequiredRole = isAgent;
        break;
      case 'admin':
        hasRequiredRole = isAdmin;
        break;
    }
  }

  // 決定訪問權限
  if (permission && role) {
    // 如果同時指定了權限和角色
    hasAccess = requireAll 
      ? (hasRequiredPermission && hasRequiredRole)  // 同時滿足
      : (hasRequiredPermission || hasRequiredRole); // 滿足其一
  } else if (permission) {
    // 只檢查權限
    hasAccess = hasRequiredPermission;
  } else if (role) {
    // 只檢查角色
    hasAccess = hasRequiredRole;
  } else {
    // 如果都沒指定，則允許已登入用戶訪問
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// 快捷組件
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate role="admin" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function AgentOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate role="agent" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function UserOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate role="user" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

// 權限按鈕組件
interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission?: string;
  role?: 'user' | 'agent' | 'admin';
  fallbackText?: string;
  children: React.ReactNode;
}

export function PermissionButton({
  permission,
  role,
  fallbackText = '權限不足',
  children,
  ...buttonProps
}: PermissionButtonProps) {
  const { hasPermission, isAdmin, isAgent, isUser } = useAuth();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (role) {
    switch (role) {
      case 'user':
        hasAccess = isUser;
        break;
      case 'agent':
        hasAccess = isAgent;
        break;
      case 'admin':
        hasAccess = isAdmin;
        break;
    }
  } else {
    hasAccess = true;
  }

  if (!hasAccess) {
    return (
      <button
        {...buttonProps}
        disabled={true}
        className={`${buttonProps.className || ''} opacity-50 cursor-not-allowed`}
        title={fallbackText}
      >
        {fallbackText}
      </button>
    );
  }

  return <button {...buttonProps}>{children}</button>;
}
