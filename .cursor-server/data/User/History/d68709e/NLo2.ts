// 電商管理後台類型定義

// 用戶相關類型
export interface User {
  id: string;
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  languageCode?: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 商品相關類型
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  images: string[];
  status: 'active' | 'inactive' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
}

// 訂單相關類型
export interface Order {
  id: string;
  userId: string;
  products: OrderProduct[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderProduct {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// 代理相關類型
export interface Agent {
  id: string;
  telegramId: number;
  agentCode: string;
  agentLevel: 1 | 2 | 3;
  parentAgentId?: string;
  childAgents: string[];
  commissionRate: number;
  totalSales: number;
  totalCommission: number;
  monthlyTarget: number;
  monthlyAchievement: number;
  status: 'pending' | 'active' | 'suspended' | 'terminated';
  joinDate: Date;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 支付相關類型
export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  agentId?: string;
  amount: number;
  amountFiat: number;
  exchangeRate: number;
  currency: 'USD' | 'CNY' | 'TWD';
  paymentMethod: 'usdt_trc20' | 'usdt_erc20' | 'trx';
  walletAddress: string;
  userWalletAddress?: string;
  transactionHash?: string;
  blockNumber?: number;
  confirmations: number;
  requiredConfirmations: number;
  paymentStatus: 'pending' | 'processing' | 'confirmed' | 'failed' | 'expired' | 'refunded';
  expiresAt: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 儀表板數據類型
export interface DashboardMetrics {
  realTime: {
    activeUsers: number;
    currentOrders: number;
    revenue: number;
    conversionRate: number;
  };
  daily: {
    sales: number;
    orders: number;
    newUsers: number;
    pageViews: number;
  };
  weekly: {
    growth: number;
    topProducts: Product[];
    userRetention: number;
    averageOrderValue: number;
  };
}

// API 響應類型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  requestId: string;
}

// 分頁類型
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 篩選類型
export interface ProductFilters {
  category?: string;
  status?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  userId?: string;
}

// 統計圖表數據類型
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }[];
}
