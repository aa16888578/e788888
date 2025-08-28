// 信用卡數據類型
export interface CreditCard {
  id: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardType: CardType;
  bank: string;
  country: string;
  countryCode: string;
  quality: QualityLevel;
  successRate: number;
  price: number;
  status: CardStatus;
  category: CardCategory;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
  usageCount: number;
  aiScore: number;
  riskLevel: RiskLevel;
}

// 卡片類型
export enum CardType {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  AMEX = 'AMEX',
  DISCOVER = 'DISCOVER',
  JCB = 'JCB',
  UNIONPAY = 'UNIONPAY'
}

// 質量等級
export enum QualityLevel {
  PREMIUM = 'PREMIUM',      // 頂級全資
  HIGH = 'HIGH',           // 高質量
  MEDIUM = 'MEDIUM',       // 中等質量
  STANDARD = 'STANDARD',   // 標準
  BASIC = 'BASIC'          // 基礎
}

// 卡片狀態
export enum CardStatus {
  ACTIVE = 'ACTIVE',       // 活躍
  INACTIVE = 'INACTIVE',   // 非活躍
  SOLD = 'SOLD',          // 已售出
  RESERVED = 'RESERVED',   // 預留
  EXPIRED = 'EXPIRED',     // 過期
  BLOCKED = 'BLOCKED'      // 封鎖
}

// 卡片分類
export enum CardCategory {
  FULL_FUND = 'FULL_FUND',     // 全資庫
  NAKED_FUND = 'NAKED_FUND',   // 裸資庫
  SPECIAL_OFFER = 'SPECIAL_OFFER', // 特價庫
  GLOBAL_BIN = 'GLOBAL_BIN',   // 全球卡頭庫存
  MERCHANT_BASE = 'MERCHANT_BASE' // 商家基地
}

// 風險等級
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// 國家信息
export interface Country {
  code: string;
  name: string;
  flag: string;
  region: string;
  cardQuality: QualityLevel;
  successRateRange: {
    min: number;
    max: number;
  };
}

// AI分類結果
export interface AIClassification {
  cardId: string;
  predictedCategory: CardCategory;
  predictedQuality: QualityLevel;
  confidence: number;
  features: {
    cardType: number;
    country: number;
    bank: number;
    expiryDate: number;
    price: number;
  };
  recommendations: string[];
  riskAssessment: RiskLevel;
  aiScore: number;
}

// 庫存操作
export interface InventoryOperation {
  id: string;
  type: 'IN' | 'OUT';
  cardIds: string[];
  quantity: number;
  operator: string;
  timestamp: Date;
  reason: string;
  notes?: string;
}

// 搜尋過濾器
export interface SearchFilter {
  cardType?: CardType[];
  country?: string[];
  quality?: QualityLevel[];
  priceRange?: {
    min: number;
    max: number;
  };
  successRateRange?: {
    min: number;
    max: number;
  };
  status?: CardStatus[];
  category?: CardCategory[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// 統計數據
export interface Statistics {
  totalCards: number;
  activeCards: number;
  soldCards: number;
  totalValue: number;
  averagePrice: number;
  topCountries: Array<{
    country: string;
    count: number;
    value: number;
  }>;
  qualityDistribution: Array<{
    quality: QualityLevel;
    count: number;
    percentage: number;
  }>;
  monthlySales: Array<{
    month: string;
    sales: number;
    revenue: number;
  }>;
}

// 用戶權限
export interface User {
  id: string;
  username: string;
  role: UserRole;
  permissions: Permission[];
  lastLogin: Date;
  isActive: boolean;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER'
}

export enum Permission {
  VIEW_CARDS = 'VIEW_CARDS',
  ADD_CARDS = 'ADD_CARDS',
  EDIT_CARDS = 'EDIT_CARDS',
  DELETE_CARDS = 'DELETE_CARDS',
  MANAGE_INVENTORY = 'MANAGE_INVENTORY',
  VIEW_STATISTICS = 'VIEW_STATISTICS',
  MANAGE_USERS = 'MANAGE_USERS',
  AI_CLASSIFICATION = 'AI_CLASSIFICATION'
}
