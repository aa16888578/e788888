// 代理系統類型定義
export interface Agent {
  id: string;
  userId: string;                    // 關聯的用戶ID
  telegramId: number;                // Telegram用戶ID
  username?: string;                 // 代理用戶名
  firstName: string;                 // 代理名字
  lastName?: string;                 // 代理姓氏
  phone?: string;                    // 聯繫電話
  email?: string;                    // 電子郵件
  status: AgentStatus;               // 代理狀態
  level: AgentLevel;                 // 代理等級
  parentAgentId?: string;            // 上級代理ID
  referralCode: string;              // 推薦碼
  commissionRate: number;            // 佣金比例 (0-100)
  totalSales: number;                // 總銷售額
  totalCommission: number;           // 總佣金
  availableCommission: number;       // 可提現佣金
  teamSize: number;                  // 團隊人數
  teamSales: number;                 // 團隊總銷售額
  joinDate: Date;                    // 加入日期
  lastActive: Date;                  // 最後活躍時間
  isVerified: boolean;               // 是否已驗證
  verificationDate?: Date;           // 驗證日期
  notes?: string;                    // 備註
  createdAt: Date;                   // 創建時間
  updatedAt: Date;                   // 更新時間
}

export interface AgentLevel {
  id: string;
  name: string;                      // 等級名稱
  level: number;                     // 等級數字
  minSales: number;                  // 最低銷售額要求
  minTeamSize: number;               // 最低團隊人數要求
  commissionRate: number;            // 佣金比例
  benefits: string[];                // 等級權益
  icon: string;                      // 等級圖標
  color: string;                     // 等級顏色
}

export interface AgentTeam {
  id: string;
  agentId: string;                   // 代理ID
  memberId: string;                  // 成員ID
  memberType: 'direct' | 'indirect'; // 直接或間接成員
  level: number;                     // 層級 (1=直接, 2=間接)
  joinDate: Date;                    // 加入日期
  totalSales: number;                // 成員總銷售額
  totalCommission: number;           // 成員總佣金
  status: 'active' | 'inactive';     // 成員狀態
}

export interface AgentCommission {
  id: string;
  agentId: string;                   // 代理ID
  orderId: string;                   // 訂單ID
  userId: string;                    // 下單用戶ID
  orderAmount: number;               // 訂單金額
  commissionRate: number;            // 佣金比例
  commissionAmount: number;          // 佣金金額
  commissionType: CommissionType;    // 佣金類型
  status: CommissionStatus;          // 佣金狀態
  orderDate: Date;                   // 訂單日期
  commissionDate: Date;              // 佣金產生日期
  paidDate?: Date;                   // 支付日期
  notes?: string;                    // 備註
  createdAt: Date;                   // 創建時間
  updatedAt: Date;                   // 更新時間
}

export interface AgentWithdrawal {
  id: string;
  agentId: string;                   // 代理ID
  amount: number;                     // 提現金額
  walletAddress: string;             // 錢包地址
  walletType: 'usdt_trc20' | 'usdt_erc20' | 'trx';
  status: WithdrawalStatus;          // 提現狀態
  transactionHash?: string;          // 區塊鏈交易哈希
  fee: number;                       // 手續費
  netAmount: number;                 // 實際到賬金額
  requestDate: Date;                 // 申請日期
  processDate?: Date;                // 處理日期
  completeDate?: Date;               // 完成日期
  notes?: string;                    // 備註
  createdAt: Date;                   // 創建時間
  updatedAt: Date;                   // 更新時間
}

export interface AgentPerformance {
  agentId: string;                   // 代理ID
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;                   // 統計開始日期
  endDate: Date;                     // 統計結束日期
  totalOrders: number;               // 總訂單數
  totalSales: number;                // 總銷售額
  totalCommission: number;           // 總佣金
  newCustomers: number;              // 新客戶數
  teamGrowth: number;                // 團隊增長
  conversionRate: number;            // 轉換率
  averageOrderValue: number;         // 平均訂單價值
}

export interface AgentReferral {
  id: string;
  agentId: string;                   // 推薦代理ID
  referredUserId: string;            // 被推薦用戶ID
  referredUserTelegramId: number;    // 被推薦用戶Telegram ID
  referralCode: string;              // 使用的推薦碼
  status: ReferralStatus;            // 推薦狀態
  bonusAmount?: number;              // 推薦獎金
  bonusPaid: boolean;                // 獎金是否已支付
  referralDate: Date;                // 推薦日期
  bonusDate?: Date;                  // 獎金發放日期
  createdAt: Date;                   // 創建時間
  updatedAt: Date;                   // 更新時間
}

// 枚舉類型
export enum AgentStatus {
  PENDING = 'pending',               // 待審核
  ACTIVE = 'active',                 // 活躍
  SUSPENDED = 'suspended',           // 暫停
  TERMINATED = 'terminated',         // 終止
  INACTIVE = 'inactive'              // 不活躍
}

export enum CommissionType {
  DIRECT_SALE = 'direct_sale',       // 直接銷售
  TEAM_SALE = 'team_sale',          // 團隊銷售
  REFERRAL_BONUS = 'referral_bonus', // 推薦獎金
  LEVEL_BONUS = 'level_bonus',      // 等級獎金
  SPECIAL_BONUS = 'special_bonus'   // 特殊獎金
}

export enum CommissionStatus {
  PENDING = 'pending',               // 待結算
  EARNED = 'earned',                 // 已獲得
  PAID = 'paid',                     // 已支付
  CANCELLED = 'cancelled',           // 已取消
  EXPIRED = 'expired'                // 已過期
}

export enum WithdrawalStatus {
  PENDING = 'pending',               // 待處理
  PROCESSING = 'processing',         // 處理中
  COMPLETED = 'completed',           // 已完成
  FAILED = 'failed',                 // 失敗
  CANCELLED = 'cancelled'            // 已取消
}

export enum ReferralStatus {
  PENDING = 'pending',               // 待確認
  CONFIRMED = 'confirmed',           // 已確認
  ACTIVE = 'active',                 // 活躍
  INACTIVE = 'inactive'              // 不活躍
}

// 代理等級配置
export const AGENT_LEVELS: AgentLevel[] = [
  {
    id: 'bronze',
    name: '銅牌代理',
    level: 1,
    minSales: 0,
    minTeamSize: 0,
    commissionRate: 5,
    benefits: ['基礎佣金5%', '團隊支持'],
    icon: '🥉',
    color: '#CD7F32'
  },
  {
    id: 'silver',
    name: '銀牌代理',
    level: 2,
    minSales: 1000,
    minTeamSize: 5,
    commissionRate: 8,
    benefits: ['佣金提升至8%', '團隊獎勵', '專屬支持'],
    icon: '🥈',
    color: '#C0C0C0'
  },
  {
    id: 'gold',
    name: '金牌代理',
    level: 3,
    minSales: 5000,
    minTeamSize: 15,
    commissionRate: 12,
    benefits: ['佣金提升至12%', '高級團隊獎勵', 'VIP支持', '培訓資源'],
    icon: '🥇',
    color: '#FFD700'
  },
  {
    id: 'platinum',
    name: '白金代理',
    level: 4,
    minSales: 15000,
    minTeamSize: 30,
    commissionRate: 15,
    benefits: ['佣金提升至15%', '頂級團隊獎勵', '專屬經理', '優先支持'],
    icon: '💎',
    color: '#E5E4E2'
  },
  {
    id: 'diamond',
    name: '鑽石代理',
    level: 5,
    minSales: 50000,
    minTeamSize: 50,
    commissionRate: 18,
    benefits: ['佣金提升至18%', '最高團隊獎勵', '專屬服務', '合作夥伴地位'],
    icon: '💎',
    color: '#B9F2FF'
  }
];

// 代理系統配置
export interface AgentSystemConfig {
  // 佣金配置
  commission: {
    directSaleRate: number;          // 直接銷售佣金比例
    teamSaleRate: number;            // 團隊銷售佣金比例
    referralBonus: number;           // 推薦獎金
    levelBonus: number;              // 等級獎金
    maxLevel: number;                // 最大層級
  };
  
  // 等級要求
  levelRequirements: {
    silver: { sales: number; teamSize: number; };
    gold: { sales: number; teamSize: number; };
    platinum: { sales: number; teamSize: number; };
    diamond: { sales: number; teamSize: number; };
  };
  
  // 提現配置
  withdrawal: {
    minAmount: number;               // 最小提現金額
    maxAmount: number;               // 最大提現金額
    fee: number;                     // 提現手續費
    processingTime: number;          // 處理時間(小時)
  };
  
  // 推薦系統
  referral: {
    bonusAmount: number;             // 推薦獎金金額
    requiredOrders: number;          // 獲得獎金所需訂單數
    validityDays: number;            // 推薦碼有效期(天)
  };
}

// 默認代理系統配置
export const DEFAULT_AGENT_CONFIG: AgentSystemConfig = {
  commission: {
    directSaleRate: 5,
    teamSaleRate: 2,
    referralBonus: 10,
    levelBonus: 1,
    maxLevel: 5
  },
  levelRequirements: {
    silver: { sales: 1000, teamSize: 5 },
    gold: { sales: 5000, teamSize: 15 },
    platinum: { sales: 15000, teamSize: 30 },
    diamond: { sales: 50000, teamSize: 50 }
  },
  withdrawal: {
    minAmount: 50,
    maxAmount: 10000,
    fee: 2,
    processingTime: 24
  },
  referral: {
    bonusAmount: 10,
    requiredOrders: 1,
    validityDays: 30
  }
};
