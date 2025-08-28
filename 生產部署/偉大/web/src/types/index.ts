// 電商系統類型定義

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
  tags?: string[];
  rating?: number;
  reviews?: number;
  discount?: number;
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

// 購物車類型
export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  addedAt: Date;
  updatedAt: Date;
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

// API 響應類型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// 分頁參數
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 分頁響應
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 儀表板數據類型
export interface DashboardMetrics {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  activeAgents: number;
  totalCommission: number;
}

// 統計數據類型
export interface Statistics {
  orders: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    totalRevenue: number;
  };
  payments: {
    pending: number;
    confirmed: number;
    failed: number;
    expired: number;
    totalAmount: number;
  };
  agents: {
    active: number;
    pending: number;
    suspended: number;
    totalCommission: number;
  };
}
