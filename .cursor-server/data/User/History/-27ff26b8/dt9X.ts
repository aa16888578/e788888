// CVV 卡片交易系統類型定義

export interface CVVCard {
  id: string;
  
  // 基本卡片信息
  cardNumber: string;        // 卡號 (脫敏顯示)
  expiryMonth: string;       // 有效期月份
  expiryYear: string;        // 有效期年份
  cvvCode: string;           // CVV 安全碼
  
  // 卡片詳情
  cardType: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';
  cardLevel: 'classic' | 'gold' | 'platinum' | 'black' | 'business';
  bankName: string;          // 發卡銀行
  bankBin: string;           // 銀行識別碼 (前6位)
  
  // 地理信息
  country: string;           // 國家代碼 (如 US, CA, GB)
  countryName: string;       // 國家名稱
  state?: string;            // 州/省
  city?: string;             // 城市
  zipCode?: string;          // 郵編
  
  // 商業信息
  price: number;             // 售價 (USDT)
  balanceRange: string;      // 餘額範圍 (如 "$100-$500")
  successRate: string;       // 成功率 (如 "85%")
  category: 'basic' | 'premium' | 'hot' | 'vip';
  
  // 狀態管理
  status: 'available' | 'sold' | 'reserved' | 'invalid' | 'checking';
  quality: 'high' | 'medium' | 'low';
  isFullInfo: boolean;       // 是否為全資料卡片
  
  // 時間戳記
  createdAt: Date;
  updatedAt: Date;
  soldAt?: Date;
  
  // 元數據
  source?: string;           // 數據來源
  batchId?: string;          // 批次ID
  checkCount: number;        // 檢查次數
  lastChecked?: Date;        // 最後檢查時間
  
  // 購買相關
  purchasedBy?: string;      // 購買者ID
  orderId?: string;          // 訂單ID
  
  // 附加信息
  notes?: string;            // 備註
  tags?: string[];           // 標籤
}

export interface CVVBatch {
  id: string;
  name: string;
  description?: string;
  totalCards: number;
  importedCards: number;
  validCards: number;
  invalidCards: number;
  status: 'importing' | 'completed' | 'failed' | 'cancelled';
  source: string;
  createdAt: Date;
  completedAt?: Date;
  errorLog?: string[];
}

export interface CVVOrder {
  id: string;
  userId: string;
  
  // 訂單詳情
  items: CVVOrderItem[];
  totalAmount: number;       // 總金額 (USDT)
  totalCards: number;        // 總卡片數
  
  // 狀態
  status: 'pending' | 'paid' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'completed' | 'failed';
  deliveryStatus: 'pending' | 'delivered' | 'partial';
  
  // 支付信息
  paymentMethod: 'usdt-trc20';
  paymentTxHash?: string;
  paymentAddress?: string;
  
  // 時間戳記
  createdAt: Date;
  paidAt?: Date;
  deliveredAt?: Date;
  
  // 交付信息
  deliveredCards?: CVVCard[];
  deliveryNotes?: string;
}

export interface CVVOrderItem {
  cardId: string;
  country: string;
  cardType: string;
  category: string;
  price: number;
  quantity: number;
}

export interface CVVTransaction {
  id: string;
  type: 'purchase' | 'refund' | 'adjustment';
  userId: string;
  orderId?: string;
  
  // 交易詳情
  amount: number;            // 金額 (USDT)
  cardCount: number;         // 卡片數量
  description: string;
  
  // 狀態
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  
  // 支付信息
  paymentTxHash?: string;
  paymentAddress?: string;
  
  // 時間戳記
  createdAt: Date;
  completedAt?: Date;
  
  // 元數據
  metadata?: Record<string, any>;
}

export interface CVVInventoryStats {
  total: number;
  available: number;
  sold: number;
  reserved: number;
  invalid: number;
  
  // 按分類統計
  byCountry: Record<string, number>;
  byCardType: Record<string, number>;
  byCategory: Record<string, number>;
  byBank: Record<string, number>;
  
  // 收入統計
  totalRevenue: number;
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
}

export interface CVVImportRequest {
  source: 'file' | 'api' | 'manual';
  format: 'csv' | 'json' | 'txt';
  data: string | CVVCard[];
  batchName?: string;
  validateOnly?: boolean;
  autoProcess?: boolean;
  options?: {
    skipDuplicates?: boolean;
    autoPrice?: boolean;
    defaultCategory?: string;
    defaultCountry?: string;
  };
}

export interface CVVImportResult {
  batchId: string;
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  duplicateCount: number;
  errors: CVVImportError[];
  validCards: CVVCard[];
}

export interface CVVImportError {
  line: number;
  field: string;
  value: string;
  error: string;
}

export interface CVVSearchFilters {
  countries?: string[];
  cardTypes?: string[];
  categories?: string[];
  banks?: string[];
  priceMin?: number;
  priceMax?: number;
  balanceMin?: string;
  balanceMax?: string;
  successRateMin?: number;
  quality?: string[];
  isFullInfo?: boolean;
  status?: string[];
  limit?: number;
  offset?: number;
}

export interface CVVSearchResult {
  cards: CVVCard[];
  total: number;
  page: number;
  limit: number;
  filters: CVVSearchFilters;
}

// API 響應類型
export interface CVVApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// 常量定義
export const CVV_CARD_TYPES = {
  visa: 'Visa',
  mastercard: 'Mastercard', 
  amex: 'American Express',
  discover: 'Discover',
  other: '其他'
} as const;

export const CVV_CATEGORIES = {
  basic: '基礎版',
  premium: '高級版', 
  hot: '熱門版',
  vip: 'VIP版'
} as const;

export const CVV_COUNTRIES = {
  US: '美國',
  CA: '加拿大',
  GB: '英國',
  AU: '澳洲',
  DE: '德國',
  FR: '法國',
  ES: '西班牙',
  IT: '義大利',
  BR: '巴西',
  AR: '阿根廷',
  CL: '智利',
  MX: '墨西哥',
  // 更多國家...
} as const;

export type CVVCardType = keyof typeof CVV_CARD_TYPES;
export type CVVCategory = keyof typeof CVV_CATEGORIES;
export type CVVCountryCode = keyof typeof CVV_COUNTRIES;