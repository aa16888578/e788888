import { db } from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';
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

/**
 * 代理系統服務
 * 負責代理註冊、管理、佣金計算、團隊管理等核心功能
 */
export class AgentService {
  
  /**
   * 創建新代理
   */
  async createAgent(agentData: Partial<Agent>): Promise<Agent> {
    // 1. 進行輸入驗證，避免使用不安全的 '!'
    if (!agentData.userId || !agentData.telegramId || !agentData.firstName) {
      throw new Error('創建代理失敗：缺少 userId, telegramId, 或 firstName。');
    }

    const agentRef = db.collection('agents').doc(); // 讓 Firestore 自動生成 ID
    const parentAgentRef = agentData.parentAgentId ? db.collection('agents').doc(agentData.parentAgentId) : null;

    try {
      // 2. 使用 Firestore 交易確保操作的原子性
      return await db.runTransaction(async (transaction) => {
        if (parentAgentRef) {
          const parentDoc = await transaction.get(parentAgentRef);
          if (!parentDoc.exists) {
            throw new Error(`上級代理 (ID: ${agentData.parentAgentId}) 不存在。`);
          }
        }

        const referralCode = generateReferralCode();
        const now = new Date();
        
        const newAgent: Agent = {
          id: agentRef.id, // 使用自動生成的 ID
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
        
        // 如果有上級代理，創建團隊關係並原子性地更新團隊人數
        if (parentAgentRef && agentData.parentAgentId) {
          const teamMemberRef = db.collection('agentTeams').doc();
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
          transaction.update(parentAgentRef, { teamSize: FieldValue.increment(1) });
        }

        return newAgent;
      });
    } catch (error) {
      console.error('創建代理失敗:', error);
      // 3. 重新拋出原始錯誤以保留堆疊追蹤，方便偵錯
      throw error;
    }
  }

  /**
   * 獲取代理信息
   */
  async getAgent(agentId: string): Promise<Agent | null> {
    try {
      const doc = await db.collection('agents').doc(agentId).get();
      return doc.exists ? doc.data() as Agent : null;
    } catch (error) {
      console.error('獲取代理信息失敗:', error);
      throw new Error('獲取代理信息失敗');
    }
  }

  /**
   * 根據Telegram ID獲取代理
   */
  async getAgentByTelegramId(telegramId: number): Promise<Agent | null> {
    try {
      const query = await db.collection('agents')
        .where('telegramId', '==', telegramId)
        .where('status', '==', AgentStatus.ACTIVE)
        .limit(1)
        .get();
      
      return query.empty ? null : query.docs[0].data() as Agent;
    } catch (error) {
      console.error('根據Telegram ID獲取代理失敗:', error);
      throw new Error('獲取代理信息失敗');
    }
  }

  /**
   * 更新代理信息
   */
  async updateAgent(agentId: string, updates: Partial<Agent>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await db.collection('agents').doc(agentId).update(updateData);
    } catch (error) {
      console.error('更新代理信息失敗:', error);
      throw new Error('更新代理信息失敗');
    }
  }

  /**
   * 更新代理等級
   */
  async updateAgentLevel(agentId: string): Promise<void> {
    try {
      const agent = await this.getAgent(agentId);
      if (!agent) throw new Error('代理不存在');

      // 計算新等級
      const newLevel = this.calculateAgentLevel(agent.totalSales, agent.teamSize);
      
      if (newLevel.level > agent.level.level) {
        await this.updateAgent(agentId, {
          level: newLevel,
          commissionRate: newLevel.commissionRate
        });
        
        // 記錄等級升級
        await this.recordLevelUpgrade(agentId, agent.level, newLevel);
      }
    } catch (error) {
      console.error('更新代理等級失敗:', error);
      throw new Error('更新代理等級失敗');
    }
  }

  /**
   * 計算代理等級
   */
  private calculateAgentLevel(totalSales: number, teamSize: number): AgentLevel {
    for (let i = AGENT_LEVELS.length - 1; i >= 0; i--) {
      const level = AGENT_LEVELS[i];
      if (totalSales >= level.minSales && teamSize >= level.minTeamSize) {
        return level;
      }
    }
    return AGENT_LEVELS[0]; // 默認銅牌等級
  }

  /**
   * 記錄等級升級
   */
  private async recordLevelUpgrade(agentId: string, oldLevel: AgentLevel, newLevel: AgentLevel): Promise<void> {
    try {
      await db.collection('agentLevelUpgrades').add({
        agentId,
        oldLevel: oldLevel.id,
        newLevel: newLevel.id,
        upgradeDate: new Date(),
        createdAt: new Date()
      });
    } catch (error) {
      console.error('記錄等級升級失敗:', error);
    }
  }

  /**
   * 添加團隊成員
   */
  async addTeamMember(agentId: string, memberId: string, memberType: 'direct' | 'indirect'): Promise<void> {
    const agentRef = db.collection('agents').doc(agentId);
    const memberRef = db.collection('agents').doc(memberId);
    const teamMemberRef = db.collection('agentTeams').doc();

    try {
      await db.runTransaction(async (transaction) => {
        const [agentDoc, memberDoc] = await transaction.getAll(agentRef, memberRef);

        if (!agentDoc.exists) {
          throw new Error(`代理 (ID: ${agentId}) 不存在。`);
        }
        if (!memberDoc.exists) {
          throw new Error(`團隊成員 (ID: ${memberId}) 不存在。`);
        }

        const teamMember: AgentTeam = {
          id: teamMemberRef.id,
          agentId,
          memberId,
          memberType,
          level: memberType === 'direct' ? 1 : 2,
          joinDate: new Date(),
          totalSales: 0,
          totalCommission: 0,
          status: 'active'
        };

        transaction.set(teamMemberRef, teamMember);
        transaction.update(agentRef, { teamSize: FieldValue.increment(1) });
      });
    } catch (error) {
      console.error('添加團隊成員失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取代理團隊
   */
  async getAgentTeam(agentId: string): Promise<AgentTeam[]> {
    try {
      const query = await db.collection('agentTeams')
        .where('agentId', '==', agentId)
        .where('status', '==', 'active')
        .get();
      
      return query.docs.map(doc => doc.data() as AgentTeam);
    } catch (error) {
      console.error('獲取代理團隊失敗:', error);
      throw new Error('獲取代理團隊失敗');
    }
  }

  /**
   * 計算佣金
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
      if (!agent) throw new Error('代理不存在');

      let commissionRate = 0;
      let commissionAmount = 0;

      switch (commissionType) {
        case CommissionType.DIRECT_SALE:
          commissionRate = agent.commissionRate;
          break;
        case CommissionType.TEAM_SALE:
          commissionRate = DEFAULT_AGENT_CONFIG.commission.teamSaleRate;
          break;
        case CommissionType.REFERRAL_BONUS:
          commissionRate = DEFAULT_AGENT_CONFIG.commission.referralBonus;
          break;
        case CommissionType.LEVEL_BONUS:
          commissionRate = DEFAULT_AGENT_CONFIG.commission.levelBonus;
          break;
      }

      commissionAmount = (orderAmount * commissionRate) / 100;

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
        orderDate: new Date(),
        commissionDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('agentCommissions').add(commission);
      
      // 更新代理統計信息
      await this.updateAgentStats(agentId);
      
      return commission;
    } catch (error) {
      console.error('計算佣金失敗:', error);
      throw new Error('計算佣金失敗');
    }
  }

  /**
   * 更新代理統計信息
   */
  async updateAgentStats(agentId: string): Promise<void> {
    try {
      const agent = await this.getAgent(agentId);
      if (!agent) return;

      // 計算總銷售額
      const salesQuery = await db.collection('agentCommissions')
        .where('agentId', '==', agentId)
        .where('status', 'in', [CommissionStatus.EARNED, CommissionStatus.PAID])
        .get();
      
      const totalSales = salesQuery.docs.reduce((sum, doc) => {
        const commission = doc.data() as AgentCommission;
        return sum + commission.orderAmount;
      }, 0);

      // 計算總佣金
      const totalCommission = salesQuery.docs.reduce((sum, doc) => {
        const commission = doc.data() as AgentCommission;
        return sum + commission.commissionAmount;
      }, 0);

      // 計算可提現佣金
      const availableQuery = await db.collection('agentCommissions')
        .where('agentId', '==', agentId)
        .where('status', '==', CommissionStatus.EARNED)
        .get();
      
      const availableCommission = availableQuery.docs.reduce((sum, doc) => {
        const commission = doc.data() as AgentCommission;
        return sum + commission.commissionAmount;
      }, 0);

      // 計算團隊人數
      const teamQuery = await db.collection('agentTeams')
        .where('agentId', '==', agentId)
        .where('status', '==', 'active')
        .get();
      
      const teamSize = teamQuery.size;

      // 計算團隊銷售額
      const teamSales = await this.calculateTeamSales(agentId);

      // 更新代理信息
      await this.updateAgent(agentId, {
        totalSales,
        totalCommission,
        availableCommission,
        teamSize,
        teamSales,
        lastActive: new Date()
      });

      // 檢查是否需要升級等級
      await this.updateAgentLevel(agentId);
    } catch (error) {
      console.error('更新代理統計信息失敗:', error);
    }
  }

  /**
   * 計算團隊銷售額
   */
  private async calculateTeamSales(agentId: string): Promise<number> {
    try {
      const teamSnapshot = await db.collection('agentTeams')
        .where('agentId', '==', agentId)
        .where('status', '==', 'active')
        .get();
      
      if (teamSnapshot.empty) {
        return 0;
      }

      const memberIds = teamSnapshot.docs.map(doc => (doc.data() as AgentTeam).memberId);

      // 使用 'in' 查詢一次性獲取所有團隊成員的佣金
      const commissionsSnapshot = await db.collection('agentCommissions')
        .where('agentId', 'in', memberIds)
        .where('status', 'in', [CommissionStatus.EARNED, CommissionStatus.PAID])
        .get();

      return commissionsSnapshot.docs.reduce((sum, doc) => {
        const commission = doc.data() as AgentCommission;
        return sum + commission.orderAmount;
      }, 0);
    } catch (error) {
      console.error('計算團隊銷售額失敗:', error);
      return 0;
    }
  }

  /**
   * 申請提現
   */
  async requestWithdrawal(
    agentId: string, 
    amount: number, 
    walletAddress: string, 
    walletType: 'usdt_trc20' | 'usdt_erc20' | 'trx'
  ): Promise<AgentWithdrawal> {
    const agentRef = db.collection('agents').doc(agentId);
      const agent = await this.getAgent(agentId);
      if (!agent) throw new Error('代理不存在');
    try {
      if (amount < DEFAULT_AGENT_CONFIG.withdrawal.minAmount) {
        throw new Error(`提現金額不能少於 ${DEFAULT_AGENT_CONFIG.withdrawal.minAmount} USDT`);
      }
          throw new Error('代理不存在');
      if (amount > DEFAULT_AGENT_CONFIG.withdrawal.maxAmount) {
        throw new Error(`提現金額不能超過 ${DEFAULT_AGENT_CONFIG.withdrawal.maxAmount} USDT`);
      }
        if (amount < DEFAULT_AGENT_CONFIG.withdrawal.minAmount) {
      if (amount > agent.availableCommission) {
        throw new Error('可提現佣金不足');
      }
        if (amount > DEFAULT_AGENT_CONFIG.withdrawal.maxAmount) {
      const fee = (amount * DEFAULT_AGENT_CONFIG.withdrawal.fee) / 100;
      const netAmount = amount - fee;

      const withdrawal: AgentWithdrawal = {
        id: `withdrawal_${Date.now()}`,
        agentId,
        amount,
        walletAddress,
        walletType,
        status: WithdrawalStatus.PENDING,
        fee,
        netAmount,
        requestDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
          status: WithdrawalStatus.PENDING,
      await db.collection('agentWithdrawals').add(withdrawal);
      
      // 扣除可提現佣金
      await this.updateAgent(agentId, {
        availableCommission: agent.availableCommission - amount
        };

      return withdrawal;
        transaction.update(agentRef, {
          availableCommission: FieldValue.increment(-amount)
      throw new Error('申請提現失敗');

        return withdrawal;
      });
    } catch (error) {
      console.error('申請提現失敗:', error);
      throw error;
    }
  }

  /**
   * 處理提現
   */
  async processWithdrawal(withdrawalId: string, status: WithdrawalStatus, transactionHash?: string): Promise<void> {
    try {
      const updateData: Partial<AgentWithdrawal> = {
        status,
        updatedAt: new Date()
      };

      if (status === WithdrawalStatus.PROCESSING) {
        updateData.processDate = new Date();
      } else if (status === WithdrawalStatus.COMPLETED) {
        updateData.completeDate = new Date();
        updateData.transactionHash = transactionHash;
      }

      await db.collection('agentWithdrawals').doc(withdrawalId).update(updateData);
    } catch (error) {
      console.error('處理提現失敗:', error);
      throw new Error('處理提現失敗');
    }
  }

  /**
   * 獲取代理績效
   */
  async getAgentPerformance(
    agentId: string, 
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate: Date,
    endDate: Date
  ): Promise<AgentPerformance> {
    try {
      const commissions = await db.collection('agentCommissions')
        .where('agentId', '==', agentId)
        .where('commissionDate', '>=', startDate)
        .where('commissionDate', '<=', endDate)
        .where('status', 'in', [CommissionStatus.EARNED, CommissionStatus.PAID])
        .get();

      const totalOrders = commissions.size;
      const totalSales = commissions.docs.reduce((sum, doc) => {
        const commission = doc.data() as AgentCommission;
        return sum + commission.orderAmount;
      }, 0);
      
      const totalCommission = commissions.docs.reduce((sum, doc) => {
        const commission = doc.data() as AgentCommission;
        return sum + commission.commissionAmount;
      }, 0);

      const performance: AgentPerformance = {
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

      return performance;
    } catch (error) {
      console.error('獲取代理績效失敗:', error);
      throw new Error('獲取代理績效失敗');
    }
  }

  /**
   * 創建推薦記錄
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
        referralDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('agentReferrals').add(referral);
      return referral;
    } catch (error) {
      console.error('創建推薦記錄失敗:', error);
      throw new Error('創建推薦記錄失敗');
    }
  }

  /**
   * 確認推薦
   */
  async confirmReferral(referralId: string): Promise<void> {
    try {
      await db.collection('agentReferrals').doc(referralId).update({
        status: ReferralStatus.CONFIRMED,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('確認推薦失敗:', error);
      throw new Error('確認推薦失敗');
    }
  }

  /**
   * 獲取所有代理
   */
  async getAllAgents(limit: number = 50, offset: number = 0): Promise<Agent[]> {
    try {
      const query = await db.collection('agents')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();
      
      return query.docs.map(doc => doc.data() as Agent);
    } catch (error) {
      console.error('獲取所有代理失敗:', error);
      throw new Error('獲取所有代理失敗');
    }
  }

  /**
   * 搜索代理
   */
  async searchAgents(query: string): Promise<Agent[]> {
    try {
      // 注意：Firestore 不支持全文搜索，這裡使用簡單的字符串匹配
      const agents = await this.getAllAgents(1000, 0);
      
      return agents.filter(agent => 
        agent.firstName.toLowerCase().includes(query.toLowerCase()) ||
        agent.username?.toLowerCase().includes(query.toLowerCase()) ||
        agent.referralCode.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('搜索代理失敗:', error);
      throw new Error('搜索代理失敗');
    }
  }
}

// 導出單例實例
export const agentService = new AgentService();
