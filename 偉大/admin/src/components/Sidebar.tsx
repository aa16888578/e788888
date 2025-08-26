'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  UsersIcon, 
  CubeIcon, 
  ShoppingCartIcon, 
  UserGroupIcon, 
  CreditCardIcon, 
  ChartBarIcon, 
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  WalletIcon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const navigation = [
  { name: '儀表板', href: '/', icon: HomeIcon },
  { name: '用戶管理', href: '/users', icon: UsersIcon },
  { name: '商品管理', href: '/products', icon: CubeIcon },
  { name: '訂單管理', href: '/orders', icon: ShoppingCartIcon },
  { name: '代理管理', href: '/agents', icon: UserGroupIcon },
  { 
    name: '支付系統', 
    href: '/payments', 
    icon: CreditCardIcon,
    children: [
      { name: '支付管理', href: '/payments', icon: CreditCardIcon },
      { name: '錢包管理', href: '/wallets', icon: WalletIcon },
      { name: '匯率管理', href: '/exchange-rates', icon: CurrencyDollarIcon },
      { name: '智能合約', href: '/smart-contracts', icon: DocumentTextIcon },
    ]
  },
  { name: '數據分析', href: '/analytics', icon: ChartBarIcon },
  { name: '系統設置', href: '/settings', icon: CogIcon },
];

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const isActive = (href: string) => pathname === href;
  const isChildActive = (children: any[]) => children.some(child => isActive(child.href));

  return (
    <>
      {/* 移動端側邊欄 */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">ShopBot 管理後台</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isItemActive = isActive(item.href) || (hasChildren && isChildActive(item.children));
              const isExpanded = expandedItems[item.name];

              return (
                <div key={item.name}>
                  {hasChildren ? (
                    <div>
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className={cn(
                          'group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                          isItemActive
                            ? 'bg-blue-100 text-blue-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'mr-3 h-5 w-5 flex-shrink-0',
                            isItemActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                          )}
                        />
                        <span className="flex-1 text-left">{item.name}</span>
                        <svg
                          className={cn(
                            'h-4 w-4 transition-transform',
                            isExpanded ? 'rotate-90' : ''
                          )}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                      {isExpanded && (
                        <div className="ml-6 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              onClick={() => setSidebarOpen(false)}
                              className={cn(
                                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                                isActive(child.href)
                                  ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              )}
                            >
                              <child.icon
                                className={cn(
                                  'mr-3 h-4 w-4 flex-shrink-0',
                                  isActive(child.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                )}
                              />
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'mr-3 h-5 w-5 flex-shrink-0',
                          isActive(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        )}
                      />
                      {item.name}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 桌面端側邊欄 */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">ShopBot 管理後台</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isItemActive = isActive(item.href) || (hasChildren && isChildActive(item.children));
              const isExpanded = expandedItems[item.name];

              return (
                <div key={item.name}>
                  {hasChildren ? (
                    <div>
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className={cn(
                          'group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                          isItemActive
                            ? 'bg-blue-100 text-blue-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'mr-3 h-5 w-5 flex-shrink-0',
                            isItemActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                          )}
                        />
                        <span className="flex-1 text-left">{item.name}</span>
                        <svg
                          className={cn(
                            'h-4 w-4 transition-transform',
                            isExpanded ? 'rotate-90' : ''
                          )}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                      {isExpanded && (
                        <div className="ml-6 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className={cn(
                                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                                isActive(child.href)
                                  ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              )}
                            >
                              <child.icon
                                className={cn(
                                  'mr-3 h-4 w-4 flex-shrink-0',
                                  isActive(child.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                )}
                              />
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'mr-3 h-5 w-5 flex-shrink-0',
                          isActive(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        )}
                      />
                      {item.name}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 移動端菜單按鈕 */}
      <div className="lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 bg-white rounded-md shadow-lg border"
        >
          <Bars3Icon className="h-6 w-6 text-gray-600" />
        </button>
      </div>
    </>
  );
}
