// USDT-TRC20 支付系統核心類型定義

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  usdtAmount: number;
  exchangeRate: number;
  currency: string;
  status: PaymentStatus;
  paymentAddress: string;
  requiredConfirmations: number;
  confirmations: number;
  transactionHash?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  EXPIRED = 'expired',
  REFUNDED = 'refunded'
}

export interface CreatePaymentRequest {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface User {
  id: string;
  email: string;
  telegramId?: string;
  username: string;
  role: UserRole;
  walletAddress?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'user',
  AGENT = 'agent',
  ADMIN = 'admin'
}

export interface Agent {
  id: string;
  userId: string;
  level: number;
  commissionRate: number;
  totalCommission: number;
  availableCommission: number;
  referralCode: string;
  referredBy?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  address: string;
  type: WalletType;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum WalletType {
  HOT = 'hot',
  COLD = 'cold',
  COMMISSION = 'commission'
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: string;
  timestamp: Date;
}

export interface Transaction {
  id: string;
  paymentId: string;
  transactionHash: string;
  blockNumber: number;
  confirmations: number;
  amount: number;
  fromAddress: string;
  toAddress: string;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId: string;
}

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
    hasNext: boolean;
    hasPrev: boolean;
  };
}
