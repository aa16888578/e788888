'use client';

import { useState, useEffect } from 'react';
import { 
  healthService,
  userService,
  productService,
  orderService,
  cartService,
  agentService,
  paymentService,
  telegramService,
  dashboardService 
} from '@/lib/services';
import type { DashboardMetrics, Statistics } from '@/types';

// 通用 API Hook
export function useApi<T>(
  apiCall: () => Promise<any>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiCall();
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.error || '請求失敗');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知錯誤');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, deps);

  return { data, loading, error, refetch: () => useEffect(() => {}, deps) };
}

// 健康檢查 Hook
export function useHealthCheck() {
  return useApi(() => healthService.checkHealth());
}

// 系統狀態 Hook
export function useSystemStatus() {
  return useApi(() => healthService.getStatus());
}

// 儀表板數據 Hook
export function useDashboardData() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    activeAgents: 0,
    totalCommission: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getMetrics();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '獲取儀表板數據失敗');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { metrics, loading, error };
}

// 用戶數據 Hook
export function useUsers() {
  return useApi(() => userService.getAllUsers());
}

// 商品數據 Hook
export function useProducts() {
  return useApi(() => productService.getAllProducts());
}

// 訂單數據 Hook
export function useOrders() {
  return useApi(() => orderService.getAllOrders());
}

// 代理數據 Hook
export function useAgents() {
  return useApi(() => agentService.getAllAgents());
}

// Telegram Bot 狀態 Hook
export function useTelegramStatus() {
  return useApi(() => telegramService.getBotStatus());
}

// 購物車 Hook
export function useCart(telegramId: number) {
  return useApi(() => cartService.getCart(telegramId), [telegramId]);
}

// 統計數據 Hook
export function useStatistics() {
  return useApi<Statistics>(() => dashboardService.getStatistics());
}
