// CVV 信用卡交易系統類型定義

// CVV 卡片信息
export interface CVVCard {
  id: string;
  cardNumber: string;           // 卡號 (加密存儲)
  expiryMonth: string;          // 過期月份
  expiryYear: string;           // 過期年份
  cvv: string;                  // CVV 碼 (加密存儲)
  cardholderName: string;       // 持卡人姓名
  country: string;              // 發卡國家
  countryCode: string;          // 國家代碼 (如 AR, BR, US)
  cardType: 'visa' | 'mastercard' | 'amex' | 'discover'; // 卡片類型
  bankName: string;             // 發卡銀行
  cardLevel: 'classic' | 'gold' | 'platinum' | 'black'; // 卡片等級
  balance: number;              // 卡片餘額 (USD)
  successRate: string;          // 成功率 (如 "40%-70%")
  price: number;                // 售價 (USDT)
  status: 'active' | 'sold' | 'invalid' | 'expired'; // 卡片狀態
  createdAt: Date;
  updatedAt: Date;
}

// CVV 商品分類
export interface CVVCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  countries: string[];          // 支持的國家
  successRate: string;          // 平均成功率
  priceRange: string;           // 價格範圍
  stockCount: number;           // 庫存數量
  isHot: boolean;              // 是否熱門
  isPremium: boolean;          // 是否高級
}

// CVV 訂單
export interface CVVOrder {
  id: string;
  userId: string;
  telegramId: number;
  cards: CVVOrderItem[];        // 購買的卡片
  totalAmount: number;          // 總金額 (USDT)
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryStatus: 'pending' | 'delivered' | 'failed';
  orderType: 'instant' | 'bulk'; // 訂單類型
  notes?: string;               // 備註
  createdAt: Date;
  updatedAt: Date;
}

export interface CVVOrderItem {
  cardId: string;
  country: string;
  countryCode: string;
  cardType: string;
  price: number;                // 單價 (USDT)
  successRate: string;
  deliveredAt?: Date;           // 交付時間
}

// CVV 用戶
export interface CVVUser {
  id: string;
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  role: 'admin' | 'user' | 'vip' | 'reseller';
  status: 'active' | 'suspended' | 'banned';
  balance: number;              // USDT 餘額
  totalPurchased: number;       // 總購買金額
  totalCards: number;           // 總購買卡片數
  successRate: number;          // 個人成功率
  joinDate: Date;
  lastActive: Date;
  vipExpiry?: Date;             // VIP 到期時間
  resellerLevel?: number;       // 分销商等級
}

// CVV 統計
export interface CVVStatistics {
  totalCards: number;           // 總卡片數
  activeCards: number;          // 可用卡片數
  soldCards: number;            // 已售卡片數
  totalRevenue: number;         // 總收入 (USDT)
  totalUsers: number;           // 總用戶數
  activeUsers: number;          // 活躍用戶數
  averageSuccessRate: number;   // 平均成功率
  topCountries: CountryStats[]; // 熱門國家
}

export interface CountryStats {
  countryCode: string;
  countryName: string;
  flag: string;
  cardCount: number;
  successRate: string;
  averagePrice: number;
}

// CVV 庫存管理
export interface CVVInventory {
  countryCode: string;
  countryName: string;
  flag: string;
  totalStock: number;
  availableStock: number;
  soldToday: number;
  successRate: string;
  priceRange: string;
  lastUpdated: Date;
  isHot: boolean;               // 是否熱門
  isPremium: boolean;           // 是否高級
  isLowStock: boolean;          // 是否低庫存
}

// CVV 交易記錄
export interface CVVTransaction {
  id: string;
  userId: string;
  telegramId: number;
  type: 'purchase' | 'refund' | 'recharge'; // 交易類型
  amount: number;               // 金額 (USDT)
  cardCount?: number;           // 卡片數量 (購買時)
  description: string;          // 交易描述
  status: 'completed' | 'pending' | 'failed';
  transactionHash?: string;     // 區塊鏈交易哈希
  createdAt: Date;
}

// CVV Bot 配置
export interface CVVBotConfig {
  botToken: string;
  botUsername: string;
  webhookUrl: string;
  adminUsers: number[];         // 管理員用戶 ID
  
  // 交易配置
  minPurchase: number;          // 最小購買金額
  maxPurchase: number;          // 最大購買金額
  autoDelivery: boolean;        // 自動交付
  
  // 支付配置
  usdtWalletAddress: string;    // USDT 收款地址
  paymentTimeout: number;       // 支付超時時間 (分鐘)
  
  // 分销配置
  resellerEnabled: boolean;     // 是否啟用分销
  resellerCommission: number;   // 分销佣金比例
  
  // 安全配置
  maxDailyPurchase: number;     // 每日最大購買限額
  requireVerification: boolean;  // 是否需要驗證
}

// CVV API 響應
export interface CVVApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  cardCount?: number;           // 卡片數量
  totalAmount?: number;         // 總金額
}

// CVV 搜索參數
export interface CVVSearchParams {
  country?: string;             // 國家篩選
  cardType?: string;            // 卡片類型篩選
  minBalance?: number;          // 最小餘額
  maxBalance?: number;          // 最大餘額
  minPrice?: number;            // 最小價格
  maxPrice?: number;            // 最大價格
  successRate?: string;         // 成功率篩選
  sortBy?: 'price' | 'balance' | 'country' | 'updated';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// CVV 儀表板指標
export interface CVVDashboardMetrics {
  totalCards: number;
  availableCards: number;
  soldToday: number;
  revenueToday: number;
  totalUsers: number;
  activeUsers: number;
  averageSuccessRate: number;
  topCountries: CountryStats[];
  recentTransactions: CVVTransaction[];
  lowStockCountries: string[];
}
