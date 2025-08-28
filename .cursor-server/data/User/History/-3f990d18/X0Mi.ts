import { useState, useEffect, useCallback } from 'react';
import { 
  userService, 
  productService, 
  orderService, 
  agentService, 
  paymentService 
} from '@/lib/database';
import { 
  User, 
  Product, 
  Order, 
  Agent, 
  Payment, 
  PaginationParams, 
  PaginatedResponse,
  ProductFilters,
  OrderFilters
} from '@/types';

// 用戶數據 Hook
export function useUsers(pagination?: PaginationParams) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取用戶失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUser = async (id: string, data: Partial<User>) => {
    try {
      await userService.update(id, data);
      await fetchUsers(); // 重新獲取數據
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新用戶失敗');
      return false;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await userService.delete(id);
      await fetchUsers(); // 重新獲取數據
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除用戶失敗');
      return false;
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUser,
    deleteUser,
  };
}

// 商品數據 Hook
export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data: Product[];
      if (filters) {
        data = await productService.searchProducts(filters);
      } else {
        data = await productService.getAll();
      }
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取商品失敗');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (data: Omit<Product, 'id'>) => {
    try {
      await productService.create(data);
      await fetchProducts();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '創建商品失敗');
      return false;
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    try {
      await productService.update(id, data);
      await fetchProducts();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新商品失敗');
      return false;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.delete(id);
      await fetchProducts();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除商品失敗');
      return false;
    }
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

// 訂單數據 Hook
export function useOrders(filters?: OrderFilters) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data: Order[];
      if (filters?.status) {
        data = await orderService.getByStatus(filters.status);
      } else {
        data = await orderService.getAll();
      }
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取訂單失敗');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      await orderService.update(id, { status });
      await fetchOrders();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新訂單狀態失敗');
      return false;
    }
  };

  return {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrderStatus,
  };
}

// 代理數據 Hook
export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await agentService.getAll();
      setAgents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取代理失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const createAgent = async (data: Omit<Agent, 'id'>) => {
    try {
      await agentService.create(data);
      await fetchAgents();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '創建代理失敗');
      return false;
    }
  };

  const updateAgent = async (id: string, data: Partial<Agent>) => {
    try {
      await agentService.update(id, data);
      await fetchAgents();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新代理失敗');
      return false;
    }
  };

  return {
    agents,
    loading,
    error,
    fetchAgents,
    createAgent,
    updateAgent,
  };
}

// 支付數據 Hook
export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getAll();
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取支付失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const updatePaymentStatus = async (id: string, status: Payment['paymentStatus']) => {
    try {
      await paymentService.update(id, { paymentStatus: status });
      await fetchPayments();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新支付狀態失敗');
      return false;
    }
  };

  return {
    payments,
    loading,
    error,
    fetchPayments,
    updatePaymentStatus,
  };
}

// 儀表板數據 Hook
export function useDashboardData() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 並行獲取所有數據
      const [users, products, orders, payments] = await Promise.all([
        userService.getAll(),
        productService.getAll(),
        orderService.getAll(),
        paymentService.getAll(),
      ]);

      const totalRevenue = payments
        .filter(p => p.paymentStatus === 'confirmed')
        .reduce((sum, p) => sum + p.amount, 0);

      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const lowStockProducts = products.filter(p => p.stock <= 10).length;

      setMetrics({
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        lowStockProducts,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取儀表板數據失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    metrics,
    loading,
    error,
    fetchDashboardData,
  };
}
