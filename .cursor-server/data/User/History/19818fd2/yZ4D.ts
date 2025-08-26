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

// 第二階段新增類型定義
export interface CartItem {
  id: string;
  productId: string;
  userId: string;
  telegramId: number;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
  addedAt: Date;
  updatedAt: Date;
}

export interface Cart {
  id: string;
  userId: string;
  telegramId: number;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  filters: ProductFilters;
}

export interface SearchQuery {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface OrderStatus {
  orderId: string;
  status: Order['status'];
  paymentStatus: Order['paymentStatus'];
  trackingNumber?: string;
  estimatedDelivery?: Date;
  notes?: string;
  updatedAt: Date;
}

export interface PaymentStatus {
  paymentId: string;
  orderId: string;
  status: Payment['status'];
  confirmations: number;
  requiredConfirmations: number;
  transactionHash?: string;
  blockNumber?: number;
  expiresAt: Date;
  updatedAt: Date;
}

export interface TelegramCommand {
  command: string;
  description: string;
  handler: (chatId: number, args?: string[]) => Promise<void>;
}

export interface TelegramCallback {
  callbackData: string;
  handler: (chatId: number, data: string) => Promise<void>;
}

export interface BotState {
  userId: string;
  telegramId: number;
  currentState: 'main_menu' | 'browsing' | 'searching' | 'viewing_product' | 'cart' | 'checkout' | 'payment';
  context: any;
  lastActivity: Date;
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
