import { db, FieldValue } from '../utils/firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';
import {
  Agent,
  AgentStatus,
  AgentLevel,
  AgentTeam,
  AgentCommission,
  AgentWithdrawal,
  AgentPerformance,
  AgentReferral,
  CommissionType,
  CommissionStatus,
  WithdrawalStatus,
  ReferralStatus,
  AGENT_LEVELS,
  DEFAULT_AGENT_CONFIG
} from '../types/agent';
import { generateReferralCode } from '../utils/referral';

// 自定義錯誤類別
class AgentError extends Error {
  constructor(message: string, public code: string = 'AGENT_ERROR') {
    super(message);
    this.name = 'AgentError';
  }
}

class ValidationError extends AgentError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

class NotFoundError extends AgentError {
  constructor(message: string) {
    super(message, 'NOT_FOUND_ERROR');
  }
}

class DatabaseError extends AgentError {
  constructor(message: string, originalError?: Error) {
    super(message, 'DATABASE_ERROR');
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

/**
 * 代理系統服務
 * 負責代理註冊、管理、佣金計算、團隊管理等核心功能
 */
export class AgentService {
  private db: Firestore;
  private readonly AGENTS_COLLECTION = 'agents';
  private readonly AGENT_TEAMS_COLLECTION = 'agentTeams';
  private readonly AGENT_COMMISSIONS_COLLECTION = 'agentCommissions';
  private readonly AGENT_WITHDRAWALS_COLLECTION = 'agentWithdrawals';
  private readonly AGENT_REFERRALS_COLLECTION = 'agentReferrals';
  private readonly AGENT_LEVEL_UPGRADES_COLLECTION = 'agentLevelUpgrades';

  constructor() {
    this.db = db;
  }

  /**
   * 創建新代理
   * @param agentData 代理資料
   * @returns 創建的代理物件
   * @throws ValidationError 當輸入資料不完整時
   * @throws NotFoundError 當上級代理不存在時
   * @throws DatabaseError 當資料庫操作失敗時
   */
  async createAgent(agentData: Partial<Agent>): Promise<Agent> {
    this.validateRequiredFields(agentData, ['userId', 'telegramId', 'firstName']);

    const agentRef = this.db.collection(this.AGENTS_COLLECTION).doc();
    const parentAgentRef = agentData.parentAgentId
      ? this.db.collection(this.AGENTS_COLLECTION).doc(agentData.parentAgentId)
      : null;

    try {
      return await this.db.runTransaction(async (transaction) => {
        // 驗證上級代理是否存在
        if (parentAgentRef) {
          const parentDoc = await transaction.get(parentAgentRef);
          if (!parentDoc.exists) {
            throw new NotFoundError(`上級代理 (ID: ${agentData.parentAgentId}) 不存在。`);
          }
        }

        const now = new Date();
        const referralCode = generateReferralCode();

        const newAgent: Agent = {
          id: agentRef.id,
          userId: agentData.userId!,
          telegramId: agentData.telegramId!,
          username: agentData.username,
          firstName: agentData.firstName!,
          status: AgentStatus.PENDING,
          level: AGENT_LEVELS[0],
          parentAgentId: agentData.parentAgentId,
          referralCode,
          commissionRate: AGENT_LEVELS[0].commissionRate,
          totalSales: 0,
          totalCommission: 0,
          availableCommission: 0,
          teamSize: 0,
          teamSales: 0,
          joinDate: now,
          lastActive: now,
          createdAt: now,
          updatedAt: now
        };

        transaction.set(agentRef, newAgent);

        // 如果有上級代理，創建團隊關係
        if (parentAgentRef && agentData.parentAgentId) {
          const teamMemberRef = this.db.collection(this.AGENT_TEAMS_COLLECTION).doc();
          const teamMember: AgentTeam = {
            id: teamMemberRef.id,
            agentId: agentData.parentAgentId,
            memberId: newAgent.id,
            memberType: 'direct',
            level: 1,
            joinDate: now,
            totalSales: 0,
            totalCommission: 0,
            status: 'active'
          };
          transaction.set(teamMemberRef, teamMember);
          transaction.update(parentAgentRef, {
            teamSize: FieldValue.increment(1),
            updatedAt: now
          });
        }

        return newAgent;
      });
    } catch (error) {
      this.handleError(error, '創建代理失敗');
      throw error;
    }
  }

  /**
   * 驗證必填欄位
   * @param data 要驗證的資料
   * @param fields 必填欄位清單
   * @throws ValidationError 當有欄位缺失時
   */
  private validateRequiredFields<T>(data: T, fields: (keyof T)[]): void {
    const missingFields = fields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      throw new ValidationError(`缺少必填欄位: ${missingFields.join(', ')}`);
    }
  }

  /**
   * 統一錯誤處理
   * @param error 原始錯誤
   * @param context 操作上下文
   * @throws AgentError 統一的錯誤類型
   */
  private handleError(error: unknown, context: string): never {
    if (error instanceof AgentError) {
      console.error(`${context}:`, error.message);
      throw error;
    } else if (error instanceof Error) {
      console.error(`${context}:`, error);
      throw new DatabaseError(`${context}: ${error.message}`, error);
    } else {
      const message = typeof error === 'string' ? error : '未知錯誤';
      console.error(`${context}:`, message);
      throw new DatabaseError(`${context}: ${message}`);
    }
  }

  /**
   * 獲取代理信息
   * @param agentId 代理ID
   * @returns 代理物件或null
   * @throws DatabaseError 當資料庫操作失敗時
   */
  async getAgent(agentId: string): Promise<Agent | null> {
    try {
      const doc = await this.db.collection(this.AGENTS_COLLECTION).doc(agentId).get();
      return doc.exists ? doc.data() as Agent : null;
    } catch (error) {
      this.handleError(error, '獲取代理信息失敗');
    }
  }

  /**
   * 根據Telegram ID獲取代理
   * @param telegramId Telegram用戶ID
   * @returns 代理物件或null
   * @throws DatabaseError 當資料庫操作失敗時
   */
  async getAgentByTelegramId(telegramId: number): Promise<Agent | null> {
    try {
      const query = await this.db.collection(this.AGENTS_COLLECTION)
        .where('telegramId', '==', telegramId)
        .where('status', '==', AgentStatus.ACTIVE)
        .limit(1)
        .get();

      return query.empty ? null : query.docs[0].data() as Agent;
    } catch (error) {
      this.handleError(error, '根據Telegram ID獲取代理失敗');
    }
  }

  /**
   * 更新代理信息
   * @param agentId 代理ID
   * @param updates 要更新的資料
   * @throws NotFoundError 當代理不存在時
   * @throws DatabaseError 當資料庫操作失敗時
   */
  async updateAgent(agentId: string, updates: Partial<Agent>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: FieldValue.serverTimestamp()
      };

      await this.db.collection(this.AGENTS_COLLECTION).doc(agentId).update(updateData);
    } catch (error) {
      this.handleError(error, '更新代理信息失敗');
    }
  }

  /**
   * 更新代理等級
   * @param agentId 代理ID
   * @throws NotFoundError 當代理不存在時
   * @throws DatabaseError 當資料庫操作失敗時
   */
  async updateAgentLevel(agentId: string): Promise<void> {
    try {
      const agent = await this.getAgent(agentId);
      if (!agent) throw new NotFoundError('代理不存在');

      const newLevel = this.calculateAgentLevel(agent.totalSales, agent.teamSize);

      if (newLevel.level > agent.level.level) {
        await this.updateAgent(agentId, {
          level: newLevel,
          commissionRate: newLevel.commissionRate,
          updatedAt: FieldValue.serverTimestamp()
        });

        await this.recordLevelUpgrade(agentId, agent.level, newLevel);
      }
    } catch (error) {
      this.handleError(error, '更新代理等級失敗');
    }
  }

  /**
   * 計算代理等級
   * @param totalSales 總銷售額
   * @param teamSize 團隊人數
   * @returns 適用的代理等級
   */
  private calculateAgentLevel(totalSales: number, teamSize: number): AgentLevel {
    return AGENT_LEVELS.slice().reverse().find(level =>
      totalSales >= level.minSales && teamSize >= level.minTeamSize
    ) || AGENT_LEVELS[0];
  }

  /**
   * 記錄等級升級
   * @param agentId 代理ID
   * @param oldLevel 舊等級
   * @param newLevel 新等級
   */
  private async recordLevelUpgrade(
    agentId: string,
    oldLevel: AgentLevel,
    newLevel: AgentLevel
  ): Promise<void> {
    try {
      await this.db.collection(this.AGENT_LEVEL_UPGRADES_COLLECTION).add({
        agentId,
        oldLevel: oldLevel.id,
        newLevel: newLevel.id,
        upgradeDate: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('記錄等級升級失敗:', error);
      // 不拋出錯誤，因為這不是核心功能
    }
  }

  /**
   * 添加團隊成員
   * @param agentId 代理ID
   * @param memberId 成員ID
   * @param memberType 成員類型
   * @throws NotFoundError 當代理或成員不存在時
   * @throws DatabaseError 當資料庫操作失敗時
   */
  async addTeamMember(
    agentId: string,
    memberId: string,
    memberType: 'direct' | 'indirect'
  ): Promise<void> {
    const agentRef = this.db.collection(this.AGENTS_COLLECTION).doc(agentId);
    const memberRef = this.db.collection(this.AGENTS_COLLECTION).doc(memberId);
    const teamMemberRef = this.db.collection(this.AGENT_TEAMS_COLLECTION).doc();

    try {
      await this.db.runTransaction(async (transaction) => {
        const [agentDoc, memberDoc] = await transaction.getAll(agentRef, memberRef);

        if (!agentDoc.exists) {
          throw new NotFoundError(`代理 (ID: ${agentId}) 不存在。`);
        }

        if (!memberDoc.exists) {
          throw new NotFoundError(`團隊成員 (ID: ${memberId}) 不存在。`);
        }

        const now = new Date();
        const teamMember: AgentTeam = {
          id: teamMemberRef.id,
          agentId,
          memberId,
          memberType,
          level: memberType === 'direct' ? 1 : 2,
          joinDate: now,
          totalSales: 0,
          totalCommission: 0,
          status: 'active'
        };

        transaction.set(teamMemberRef, teamMember);
        transaction.update(agentRef, {
          teamSize: FieldValue.increment(1),
          updatedAt: now
        });
      });
    } catch (error) {
      this.handleError(error, '添加團隊成員失敗');
    }
  }

  /**
   * 獲取代理團隊
   * @param agentId 代理ID
   * @returns 團隊成員清單
   * @throws DatabaseError 當資料庫操作失敗時
   */
  async getAgentTeam(agentId: string): Promise<AgentTeam[]> {
    try {
      const query = await this.db.collection(this.AGENT_TEAMS_COLLECTION)
        .where('agentId', '==', agentId)
        .where('status', '==', 'active')
        .get();

      return query.docs.map(doc => doc.data() as AgentTeam);
    } catch (error) {
      this.handleError(error, '獲取代理團隊失敗');
    }
  }

  /**
   * 計算佣金
   * @param agentId 代理ID
   * @param orderId 訂單ID
   * @param userId 用戶ID
   * @param orderAmount 訂單金額
   * @param commissionType 佣金類型
   * @returns 佣金記錄
   * @throws NotFoundError 當代理不存在時
   * @throws DatabaseError 當資料庫操作失敗時
   */
  async calculateCommission(
    agentId: string,
    orderId: string,
    userId: string,
    orderAmount: number,
    commissionType: CommissionType
  ): Promise<AgentCommission> {
    try {
      const agent = await this.getAgent(agentId);
      if (!agent) throw new NotFoundError('代理不存在');

      const commissionRate = this.getCommissionRate(agent, commissionType);
      const commissionAmount = (orderAmount * commissionRate) / 100;

      const commission: AgentCommission = {
        id: `commission_${Date.now()}`,
        agentId,
        orderId,
        userId,
        orderAmount,
        commissionRate,
        commissionAmount,
        commissionType,
        status: CommissionStatus.PENDING,
        orderDate: FieldValue.serverTimestamp(),
        commissionDate: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      await this.db.collection(this.AGENT_COMMISSIONS_COLLECTION).add(commission);
      await this.updateAgentStats(agentId);

      return commission;
    } catch (error) {
      this.handleError(error, '計算佣金失敗');
    }
  }

  /**
   * 獲取佣金比率
   * @param agent 代理物件
   * @param commissionType 佣金類型
   * @returns 佣金比率
   */
  private getCommissionRate(agent: Agent, commissionType: CommissionType): number {
    switch (commissionType) {
      case CommissionType.DIRECT_SALE:
        return agent.commissionRate;
      case CommissionType.TEAM_SALE:
        return DEFAULT_AGENT_CONFIG.commission.teamSaleRate;
      case CommissionType.REFERRAL_BONUS:
        return DEFAULT_AGENT_CONFIG.commission.referralBonus;
      case CommissionType.LEVEL_BONUS:
        return DEFAULT_AGENT_CONFIG.commission.levelBonus;
      default:
        return 0;
    }
  }

  /**
   * 更新代理統計信息
   * @param agentId 代理ID
   */
  async updateAgentStats(agentId: string): Promise<void> {
    try {
      const [salesSnapshot, teamSnapshot] = await Promise.all([
        this.db.collection(this.AGENT_COMMISSIONS_COLLECTION)
          .where('agentId', '==', agentId)
          .where('status', 'in', [CommissionStatus.EARNED, CommissionStatus.PAID])
          .get(),
        this.db.collection(this.AGENT_TEAMS_COLLECTION)
          .where('agentId', '==', agentId)
          .where('status', '==', 'active')
          .get()
      ]);

      const totalSales = salesSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data() as AgentCommission).orderAmount,
        0
      );

      const totalCommission = salesSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data() as AgentCommission).commissionAmount,
        0
      );

      const availableSnapshot = await this.db.collection(this.AGENT_COMMISSIONS_COLLECTION)
        .where('agentId', '==', agentId)
        .where('status', '==', CommissionStatus.EARNED)
        .get();

      const availableCommission = availableSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data() as AgentCommission).commissionAmount,
        0
      );

      const teamSize = teamSnapshot.size;
      const teamSales = await this.calculateTeamSales(agentId);

      await this.updateAgent(agentId, {
        totalSales,
        totalCommission,
        availableCommission,
        teamSize,
        teamSales,
        lastActive: FieldValue.serverTimestamp()
      });

      await this.updateAgentLevel(agentId);
    } catch (error) {
      console.error('更新代理統計信息失敗:', error);
      // 不拋出錯誤，因為這不是核心功能
    }
  }

  /**
   * 計算團隊銷售額
   * @param agentId 代理ID
   * @returns 團隊總銷售額
   */
  private async calculateTeamSales(agentId: string): Promise<number> {
    try {
      const teamSnapshot = await this.db.collection(this.AGENT_TEAMS_COLLECTION)
        .where('agentId', '==', agentId)
        .where('status', '==', 'active')
        .get();

      if (teamSnapshot.empty) return 0;

      const memberIds = teamSnapshot.docs.map(doc => (doc.data() as AgentTeam).memberId);
      const commissionsSnapshot = await this.db.collection(this.AGENT_COMMISSIONS_COLLECTION)
        .where('agentId', 'in', memberIds)
        .where('status', 'in', [CommissionStatus.EARNED, CommissionStatus.PAID])
        .get();

      return commissionsSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data() as AgentCommission).orderAmount,
        0
      );
    } catch (error) {
      console.error('計算團隊銷售額失敗:', error);
      return 0;
    }
  }

  /**
   * 申請提現
   * @param agentId 代理ID
   * @param amount 提現金額
   * @param walletAddress 錢包地址
   * @param walletType 錢包類型
   * @returns 提現記錄
   * @throws ValidationError 當提現金額不符合規定時
   * @throws NotFoundError 當代理不存在時
   * @throws DatabaseError 當資料庫操作失敗時
   */
  async requestWithdrawal(
    agentId: string,
    amount: number,
    walletAddress: string,
    walletType: 'usdt_trc20' | 'usdt_erc20' | 'trx'
  ): Promise<AgentWithdrawal> {
    const agentRef = this.db.collection(this.AGENTS_COLLECTION).doc(agentId);
    const withdrawalRef = this.db.collection(this.AGENT_WITHDRAWALS_COLLECTION).doc();

    try {
      return await this.db.runTransaction(async (transaction) => {
        const agentDoc = await transaction.get(agentRef);
        if (!agentDoc.exists) {
          throw new NotFoundError('代理不存在');
        }

        const agent = agentDoc.data() as Agent;
        this.validateWithdrawalAmount(amount, agent.availableCommission);

        const fee = (amount * DEFAULT_AGENT_CONFIG.withdrawal.fee) / 100;
        const netAmount = amount - fee;

        const withdrawal: AgentWithdrawal = {
          id: withdrawalRef.id,
          agentId,
          amount,
          walletAddress,
          walletType,
          status: WithdrawalStatus.PENDING,
          fee,
          netAmount,
          requestDate: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        };

        transaction.set(withdrawalRef, withdrawal);
        transaction.update(agentRef, {
          availableCommission: agent.availableCommission - amount,
          updatedAt: FieldValue.serverTimestamp()
        });

        return withdrawal;
      });
    } catch (error) {
      this.handleError(error, '申請提現失敗');
    }
  }

  /**
   * 驗證提現金額
   * @param amount 提現金額
   * @param availableCommission 可用佣金
   * @throws ValidationError 當金額不符合規定時
   */
  private validateWithdrawalAmount(amount: number, availableCommission: number): void {
    if (amount < DEFAULT_AGENT_CONFIG.withdrawal.minAmount) {
      throw new ValidationError(
        `提現金額不能少於 ${DEFAULT_AGENT_CONFIG.withdrawal.minAmount} USDT`
      );
    }

    if (amount > DEFAULT_AGENT_CONFIG.withdrawal.maxAmount) {
      throw new ValidationError(
        `提現金額不能超過 ${DEFAULT_AGENT_CONFIG.withdrawal.maxAmount} USDT`
      );
    }

    if (amount > availableCommission) {
      throw new ValidationError('可提現佣金不足');
    }
  }

  /**
   * 處理提現
   * @param withdrawalId 提現記錄ID
   * @param status 提現狀態
   * @param transactionHash 交易哈希
   */
  async processWithdrawal(
    withdrawalId: string,
    status: WithdrawalStatus,
    transactionHash?: string
  ): Promise<void> {
    try {
      const updateData: Partial<AgentWithdrawal> = {
        status,
        updatedAt: FieldValue.serverTimestamp()
      };

      if (status === WithdrawalStatus.PROCESSING) {
        updateData.processDate = FieldValue.serverTimestamp();
      } else if (status === WithdrawalStatus.COMPLETED) {
        updateData.completeDate = FieldValue.serverTimestamp();
        updateData.transactionHash = transactionHash;
      }

      await this.db.collection(this.AGENT_WITHDRAWALS_COLLECTION)
        .doc(withdrawalId)
        .update(updateData);
    } catch (error) {
      this.handleError(error, '處理提現失敗');
    }
  }

  /**
   * 獲取代理績效
   * @param agentId 代理ID
   * @param period 統計週期
   * @param startDate 開始日期
   * @param endDate 結束日期
   * @returns 績效報告
   * @throws DatabaseError 當資料庫操作失敗時
   */
  async getAgentPerformance(
    agentId: string,
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate: Date,
    endDate: Date
  ): Promise<AgentPerformance> {
    try {
      const commissionsSnapshot = await this.db.collection(this.AGENT_COMMISSIONS_COLLECTION)
        .where('agentId', '==', agentId)
        .where('commissionDate', '>=', startDate)
        .where('commissionDate', '<=', endDate)
        .where('status', 'in', [CommissionStatus.EARNED, CommissionStatus.PAID])
        .get();

      const totalOrders = commissionsSnapshot.size;
      const totalSales = commissionsSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data() as AgentCommission).orderAmount,
        0
      );

      const totalCommission = commissionsSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data() as AgentCommission).commissionAmount,
        0
      );

      return {
        agentId,
        period,
        startDate,
        endDate,
        totalOrders,
        totalSales,
        totalCommission,
        newCustomers: 0, // TODO: 實現新客戶統計
        teamGrowth: 0,   // TODO: 實現團隊增長統計
        conversionRate: 0, // TODO: 實現轉換率計算
        averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0
      };
    } catch (error) {
      this.handleError(error, '獲取代理績效失敗');
    }
  }

  /**
   * 創建推薦記錄
   * @param agentId 代理ID
   * @param referredUserId 被推薦用戶ID
   * @param referredUserTelegramId 被推薦用戶Telegram ID
   * @param referralCode 推薦碼
   * @returns 推薦記錄
   * @throws DatabaseError 當資料庫操作失敗時
   */
  async createReferral(
    agentId: string,
    referredUserId: string,
    referredUserTelegramId: number,
    referralCode: string
  ): Promise<AgentReferral> {
    try {
      const referral: AgentReferral = {
        id: `referral_${Date.now()}`,
        agentId,
        referredUserId,
        referredUserTelegramId,
        referralCode,
        status: ReferralStatus.PENDING,
        bonusAmount: DEFAULT_AGENT_CONFIG.referral.bonusAmount,
        bonusPaid: false,
        referralDate: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      await this.db.collection(this.AGENT_REFERRALS_COLLECTION).add(referral);
      return referral;
    } catch (error) {
      this.handleError(error, '創建推薦記錄失敗');
    }
  }

  /**
   * 確認推薦
   * @param referralId 推薦記錄ID
   */
  async confirmReferral(referralId: string): Promise<void> {
    try {
      await this.db.collection(this.AGENT_REFERRALS_COLLECTION)
        .doc(referralId)
        .update({
          status: ReferralStatus.CONFIRMED,
          updatedAt: FieldValue.serverTimestamp()
        });
    } catch (error) {
      this.handleError(error, '確認推薦失敗');
    }
  }

  /**
   * 獲取所有代理
   * @param limit 每頁數量
   * @param offset 偏移量
   * @returns 代理清單
   * @throws DatabaseError 當資料庫操作失敗時
   */
  async getAllAgents(limit: number = 50, offset: number = 0): Promise<Agent[]> {
    try {
      const query = await this.db.collection(this.AGENTS_COLLECTION)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

      return query.docs.map(doc => doc.data() as Agent);
    } catch (error) {
      this.handleError(error, '獲取所有代理失敗');
    }
  }

  /**
   * 搜索代理
   * @param query 搜索關鍵字
   * @returns 匹配的代理清單
   * @throws DatabaseError 當資料庫操作失敗時
   */
  async searchAgents(query: string): Promise<Agent[]> {
    try {
      const allAgents = await this.getAllAgents(1000, 0);
      const searchTerm = query.toLowerCase();

      return allAgents.filter(agent =>
        agent.firstName.toLowerCase().includes(searchTerm) ||
        agent.username?.toLowerCase().includes(searchTerm) ||
        agent.referralCode.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      this.handleError(error, '搜索代理失敗');
    }
  }
}

// 導出單例實例
export const agentService = new AgentService();
