// 核心數據類型定義
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

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  stock: number;
  images: string[];
  tags?: string[];
  status: 'active' | 'inactive' | 'deleted';
  featured: boolean;
  sortOrder: number;
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

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  telegramId: number;
  products: OrderProduct[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'usdt_trc20' | 'usdt_erc20' | 'trx';
  shippingAddress?: any;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  telegramId: number;
  amount: number;
  currency: string;
  paymentMethod: 'usdt_trc20' | 'usdt_erc20' | 'trx';
  walletAddress: string;
  transactionHash?: string;
  confirmations: number;
  requiredConfirmations: number;
  status: 'pending' | 'processing' | 'confirmed' | 'failed' | 'expired' | 'refunded';
  expiresAt: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  image?: string;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  telegramId: number;
  sessionToken: string;
  expiresAt: Date;
  lastActivity: Date;
  createdAt: Date;
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

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 查詢過濾類型
export interface ProductFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  status?: string;
  tags?: string[];
}

export interface OrderFilters {
  userId?: string;
  telegramId?: number;
  status?: string;
  paymentStatus?: string;
  startDate?: Date;
  endDate?: Date;
}

// 認證類型
export interface TelegramAuth {
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  languageCode?: string;
}

export interface AuthToken {
  telegramId: number;
  role: string;
  permissions: string[];
  exp: number;
  iat: number;
}
