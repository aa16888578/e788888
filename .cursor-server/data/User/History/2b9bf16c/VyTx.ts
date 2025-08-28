import { Router } from 'express';
import { agentService } from '../services/agent';
import { authMiddleware } from '../middleware/auth';
import { AgentStatus, CommissionType } from '../types/agent';

const router: Router = Router();

/**
 * 代理系統API路由
 */

// 創建新代理
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const { telegramId, firstName, username, parentAgentId } = req.body;
    
    if (!telegramId || !firstName) {
      return res.status(400).json({
        success: false,
        message: '缺少必要參數'
      });
    }

    const agent = await agentService.createAgent({
      userId: req.user!.id,
      telegramId,
      firstName,
      username,
      parentAgentId
    });

    res.json({
      success: true,
      data: agent,
      message: '代理註冊成功'
    });
  } catch (error) {
    console.error('代理註冊失敗:', error);
    res.status(500).json({
      success: false,
      message: '代理註冊失敗'
    });
  }
});

// 獲取代理信息
router.get('/profile/:agentId', authMiddleware, async (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = await agentService.getAgent(agentId);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: '代理不存在'
      });
    }

    res.json({
      success: true,
      data: agent
    });
  } catch (error) {
    console.error('獲取代理信息失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取代理信息失敗'
    });
  }
});

// 根據Telegram ID獲取代理
router.get('/telegram/:telegramId', authMiddleware, async (req, res) => {
  try {
    const { telegramId } = req.params;
    const agent = await agentService.getAgentByTelegramId(parseInt(telegramId));
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: '代理不存在'
      });
    }

    res.json({
      success: true,
      data: agent
    });
  } catch (error) {
    console.error('獲取代理信息失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取代理信息失敗'
    });
  }
});

// 更新代理信息
router.put('/profile/:agentId', authMiddleware, async (req, res) => {
  try {
    const { agentId } = req.params;
    const updates = req.body;
    
    // 只允許更新特定字段
    const allowedUpdates = ['firstName', 'username'];
    const filteredUpdates: any = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    await agentService.updateAgent(agentId, filteredUpdates);

    res.json({
      success: true,
      message: '代理信息更新成功'
    });
  } catch (error) {
    console.error('更新代理信息失敗:', error);
    res.status(500).json({
      success: false,
      message: '更新代理信息失敗'
    });
  }
});

// 獲取代理團隊
router.get('/team/:agentId', authMiddleware, async (req, res) => {
  try {
    const { agentId } = req.params;
    const team = await agentService.getAgentTeam(agentId);

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('獲取代理團隊失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取代理團隊失敗'
    });
  }
});

// 獲取代理績效
router.get('/performance/:agentId', authMiddleware, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { period = 'monthly' } = req.query;
    
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const performance = await agentService.getAgentPerformance(
      agentId,
      period as any,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('獲取代理績效失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取代理績效失敗'
    });
  }
});

// 申請提現
router.post('/withdrawal', authMiddleware, async (req, res) => {
  try {
    const { agentId, amount, walletAddress, walletType } = req.body;
    
    if (!agentId || !amount || !walletAddress || !walletType) {
      return res.status(400).json({
        success: false,
        message: '缺少必要參數'
      });
    }

    const withdrawal = await agentService.requestWithdrawal(
      agentId,
      amount,
      walletAddress,
      walletType
    );

    res.json({
      success: true,
      data: withdrawal,
      message: '提現申請提交成功'
    });
  } catch (error) {
    console.error('申請提現失敗:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '申請提現失敗'
    });
  }
});

// 獲取提現記錄
router.get('/withdrawals/:agentId', authMiddleware, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // TODO: 實現獲取提現記錄的邏輯
    res.json({
      success: true,
      data: [],
      message: '功能開發中'
    });
  } catch (error) {
    console.error('獲取提現記錄失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取提現記錄失敗'
    });
  }
});

// 獲取佣金記錄
router.get('/commissions/:agentId', authMiddleware, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { limit = 20, offset = 0, status } = req.query;

    // TODO: 實現獲取佣金記錄的邏輯
    res.json({
      success: true,
      data: [],
      message: '功能開發中'
    });
  } catch (error) {
    console.error('獲取佣金記錄失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取佣金記錄失敗'
    });
  }
});

// 搜索代理
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: '請提供搜索關鍵詞'
      });
    }

    const agents = await agentService.searchAgents(q);

    res.json({
      success: true,
      data: agents
    });
  } catch (error) {
    console.error('搜索代理失敗:', error);
    res.status(500).json({
      success: false,
      message: '搜索代理失敗'
    });
  }
});

// 獲取所有代理（管理員功能）
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    // TODO: 檢查管理員權限
    const agents = await agentService.getAllAgents(
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      data: agents
    });
  } catch (error) {
    console.error('獲取所有代理失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取所有代理失敗'
    });
  }
});

// 更新代理狀態（管理員功能）
router.put('/status/:agentId', authMiddleware, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { status } = req.body;
    
    if (!status || !Object.values(AgentStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: '無效的狀態值'
      });
    }

    // TODO: 檢查管理員權限
    await agentService.updateAgent(agentId, { status });

    res.json({
      success: true,
      message: '代理狀態更新成功'
    });
  } catch (error) {
    console.error('更新代理狀態失敗:', error);
    res.status(500).json({
      success: false,
      message: '更新代理狀態失敗'
    });
  }
});

export default router;
