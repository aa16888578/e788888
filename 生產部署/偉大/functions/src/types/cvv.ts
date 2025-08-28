/**
 * CVV 卡片交易系統類型定義
 */

// CVV 卡片狀態
export enum CVVStatus {
  AVAILABLE = 'available',     // 可用
  SOLD = 'sold',               // 已售出
  RESERVED = 'reserved',       // 保留中
  INVALID = 'invalid',         // 無效
  EXPIRED = 'expired'          // 已過期
}

// CVV 卡片類型
export enum CVVType {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  AMEX = 'AMEX',
  DISCOVER = 'DISCOVER',
  UNIONPAY = 'UNIONPAY',
  JCB = 'JCB',
  OTHER = 'OTHER'
}

// CVV 卡片等級
export enum CVVLevel {
  CLASSIC = 'classic',         // 普通卡
  GOLD = 'gold',              // 金卡
  PLATINUM = 'platinum',       // 白金卡
  BUSINESS = 'business',       // 商業卡
  CORPORATE = 'corporate'      // 企業卡
}

// CVV 卡片數據結構
export interface CVVCard {
  id?: string;                 // 唯一識別碼
  cardNumber: string;          // 卡號 (加密存儲)
  cvv: string;                 // CVV 碼 (加密存儲)
  expiryMonth: string;         // 到期月份
  expiryYear: string;          // 到期年份
  cardholderName?: string;     // 持卡人姓名
  cardType: CVVType;           // 卡片類型
  cardLevel?: CVVLevel;        // 卡片等級
  country: string;             // 發卡國家
  bank?: string;               // 發卡銀行
  bin?: string;                // BIN 號碼
  zipCode?: string;            // 郵遞區號
  state?: string;              // 州/省
  city?: string;               // 城市
  address?: string;            // 地址
  phone?: string;              // 電話
  email?: string;              // 郵箱
  balance?: number;            // 餘額
  status: CVVStatus;           // 狀態
  price: number;               // 售價
  cost?: number;               // 成本
  quality?: number;            // 品質評分 (0-100)
  refundable?: boolean;        // 是否可退款
  batchId?: string;            // 批次ID
  importDate: Date;            // 導入日期
  soldDate?: Date;             // 售出日期
  lastCheckedDate?: Date;      // 最後檢查日期
  checkCount?: number;         // 檢查次數
  tags?: string[];             // 標籤
  notes?: string;              // 備註
  metadata?: Record<string, any>; // 其他元數據
}

// CVV 導入批次
export interface CVVBatch {
  id?: string;                 // 批次ID
  name: string;                // 批次名稱
  importDate: Date;            // 導入日期
  totalCards: number;          // 總卡數
  validCards: number;          // 有效卡數
  invalidCards: number;        // 無效卡數
  duplicates: number;          // 重複卡數
  source?: string;             // 數據來源
  status: 'pending' | 'processing' | 'completed' | 'failed';
  userId: string;              // 導入用戶ID
  notes?: string;              // 備註
  errorLog?: string[];         // 錯誤日誌
}

// CVV 導入請求
export interface CVVImportRequest {
  format: 'csv' | 'json' | 'txt' | 'xlsx';
  data: string | any[];        // 原始數據
  options?: {
    skipDuplicates?: boolean;  // 跳過重複
    validateBalance?: boolean; // 驗證餘額
    autoPrice?: boolean;       // 自動定價
    defaultCountry?: string;   // 默認國家
    defaultPrice?: number;     // 默認價格
    tags?: string[];          // 批次標籤
  };
}

// CVV 搜索過濾器
export interface CVVSearchFilter {
  cardTypes?: CVVType[];      // 卡片類型
  cardLevels?: CVVLevel[];    // 卡片等級
  countries?: string[];        // 國家
  banks?: string[];            // 銀行
  bins?: string[];             // BIN 號碼
  status?: CVVStatus[];        // 狀態
  minPrice?: number;           // 最低價格
  maxPrice?: number;           // 最高價格
  minBalance?: number;         // 最低餘額
  hasBalance?: boolean;        // 是否有餘額
  refundable?: boolean;        // 是否可退款
  tags?: string[];             // 標籤
  searchText?: string;         // 搜索文本
  sortBy?: 'price' | 'date' | 'quality' | 'balance';
  sortOrder?: 'asc' | 'desc';
  page?: number;               // 頁碼
  limit?: number;              // 每頁數量
}

// CVV 統計數據
export interface CVVStats {
  total: number;               // 總數量
  available: number;           // 可用數量
  sold: number;                // 已售數量
  reserved: number;            // 保留數量
  invalid: number;             // 無效數量
  expired: number;             // 過期數量
  totalValue: number;          // 總價值
  averagePrice: number;        // 平均價格
  byCountry: Record<string, number>;     // 按國家統計
  byCardType: Record<string, number>;    // 按卡類型統計
  byCardLevel: Record<string, number>;   // 按卡等級統計
  byBank: Record<string, number>;        // 按銀行統計
  dailySales: Array<{         // 每日銷售
    date: string;
    count: number;
    revenue: number;
  }>;
  topSelling: CVVCard[];      // 熱銷卡片
}

// CVV 訂單
export interface CVVOrder {
  id?: string;                 // 訂單ID
  userId: string;              // 用戶ID
  cards: CVVCard[];            // 購買的卡片
  totalAmount: number;         // 總金額
  paymentMethod: 'USDT' | 'BTC' | 'ETH' | 'CREDIT';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionHash?: string;    // 區塊鏈交易哈希
  walletAddress?: string;      // 錢包地址
  orderDate: Date;             // 訂單日期
  completedDate?: Date;        // 完成日期
  notes?: string;              // 備註
  refundReason?: string;       // 退款原因
  metadata?: Record<string, any>;
}

// CVV 交易記錄
export interface CVVTransaction {
  id?: string;                 // 交易ID
  orderId: string;             // 訂單ID
  userId: string;              // 用戶ID
  cardId: string;              // 卡片ID
  type: 'purchase' | 'refund' | 'replace';
  amount: number;              // 交易金額
  status: 'success' | 'failed' | 'pending';
  transactionDate: Date;       // 交易日期
  description?: string;        // 描述
  metadata?: Record<string, any>;
}

// API 響應格式
export interface CVVApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: Date;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 數據驗證規則
export interface CVVValidationRules {
  cardNumber: {
    required: boolean;
    minLength: number;
    maxLength: number;
    pattern?: RegExp;
  };
  cvv: {
    required: boolean;
    minLength: number;
    maxLength: number;
    pattern?: RegExp;
  };
  expiryDate: {
    required: boolean;
    futureDate?: boolean;
    format?: string;
  };
  price: {
    required: boolean;
    min?: number;
    max?: number;
  };
}
