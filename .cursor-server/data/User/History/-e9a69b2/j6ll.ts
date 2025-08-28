/**
 * CVV API 路由處理器
 */

import { Request, Response, Router } from 'express';
import { cvvService } from '../services/cvv';
import {
  CVVImportRequest,
  CVVSearchFilter,
  CVVStatus
} from '../types/cvv';

const router = Router();

/**
 * 健康檢查端點
 * GET /api/cvv/health
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'CVV API',
    timestamp: new Date().toISOString()
  });
});

/**
 * 批量導入 CVV 卡片
 * POST /api/cvv/import
 */
router.post('/import', async (req: Request, res: Response) => {
  try {
    const importRequest: CVVImportRequest = req.body;
    const userId = (req as any).user?.uid || 'system';

    if (!importRequest.data || !importRequest.format) {
      return res.status(400).json({
        success: false,
        error: '缺少必要的導入數據或格式'
      });
    }

    const result = await cvvService.importCards(importRequest, userId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('導入錯誤:', error);
    res.status(500).json({
      success: false,
      error: error.message || '導入失敗'
    });
  }
});

/**
 * 搜索 CVV 卡片
 * GET /api/cvv/search
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const filter: CVVSearchFilter = {
      cardTypes: req.query.cardTypes ? (req.query.cardTypes as string).split(',') as any : undefined,
      cardLevels: req.query.cardLevels ? (req.query.cardLevels as string).split(',') as any : undefined,
      countries: req.query.countries ? (req.query.countries as string).split(',') : undefined,
      banks: req.query.banks ? (req.query.banks as string).split(',') : undefined,
      bins: req.query.bins ? (req.query.bins as string).split(',') : undefined,
      status: req.query.status ? (req.query.status as string).split(',') as any : [CVVStatus.AVAILABLE],
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      minBalance: req.query.minBalance ? parseFloat(req.query.minBalance as string) : undefined,
      hasBalance: req.query.hasBalance === 'true',
      refundable: req.query.refundable === 'true' ? true : req.query.refundable === 'false' ? false : undefined,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      searchText: req.query.searchText as string,
      sortBy: req.query.sortBy as any || 'importDate',
      sortOrder: req.query.sortOrder as any || 'desc',
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20
    };

    const result = await cvvService.searchCards(filter);
    res.json(result);
  } catch (error: any) {
    console.error('搜索錯誤:', error);
    res.status(500).json({
      success: false,
      error: error.message || '搜索失敗'
    });
  }
});

/**
 * 獲取單張卡片詳情
 * GET /api/cvv/cards/:id
 */
router.get('/cards/:id', async (req: Request, res: Response) => {
  try {
    const cardId = req.params.id;
    // 只有購買後或管理員才能看到完整數據
    const decrypt = (req as any).user?.role === 'admin' || 
                   req.query.decrypt === 'true';
    
    const result = await cvvService.getCard(cardId, decrypt);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error: any) {
    console.error('獲取卡片錯誤:', error);
    res.status(500).json({
      success: false,
      error: error.message || '獲取卡片失敗'
    });
  }
});

/**
 * 更新卡片狀態
 * PATCH /api/cvv/cards/:id/status
 */
router.patch('/cards/:id/status', async (req: Request, res: Response) => {
  try {
    const cardId = req.params.id;
    const { status } = req.body;

    if (!status || !Object.values(CVVStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        error: '無效的狀態值'
      });
    }

    const result = await cvvService.updateCardStatus(cardId, status);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('更新狀態錯誤:', error);
    res.status(500).json({
      success: false,
      error: error.message || '更新狀態失敗'
    });
  }
});

/**
 * 批量更新卡片狀態
 * PATCH /api/cvv/cards/batch-status
 */
router.patch('/cards/batch-status', async (req: Request, res: Response) => {
  try {
    const { cardIds, status } = req.body;

    if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: '請提供卡片ID數組'
      });
    }

    if (!status || !Object.values(CVVStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        error: '無效的狀態值'
      });
    }

    const result = await cvvService.batchUpdateStatus(cardIds, status);
    res.json(result);
  } catch (error: any) {
    console.error('批量更新錯誤:', error);
    res.status(500).json({
      success: false,
      error: error.message || '批量更新失敗'
    });
  }
});

/**
 * 刪除卡片
 * DELETE /api/cvv/cards/:id
 */
router.delete('/cards/:id', async (req: Request, res: Response) => {
  try {
    const cardId = req.params.id;
    const result = await cvvService.deleteCard(cardId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('刪除錯誤:', error);
    res.status(500).json({
      success: false,
      error: error.message || '刪除失敗'
    });
  }
});

/**
 * 獲取庫存統計
 * GET /api/cvv/stats/inventory
 */
router.get('/stats/inventory', async (req: Request, res: Response) => {
  try {
    const result = await cvvService.getInventoryStats();
    res.json(result);
  } catch (error: any) {
    console.error('統計錯誤:', error);
    res.status(500).json({
      success: false,
      error: error.message || '獲取統計失敗'
    });
  }
});

/**
 * 檢查卡片餘額
 * POST /api/cvv/cards/:id/check-balance
 */
router.post('/cards/:id/check-balance', async (req: Request, res: Response) => {
  try {
    const cardId = req.params.id;
    const result = await cvvService.checkBalance(cardId);
    res.json(result);
  } catch (error: any) {
    console.error('檢查餘額錯誤:', error);
    res.status(500).json({
      success: false,
      error: error.message || '檢查餘額失敗'
    });
  }
});

/**
 * 獲取支持的配置選項
 * GET /api/cvv/config
 */
router.get('/config', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      cardTypes: Object.values(CVVStatus),
      cardLevels: ['classic', 'gold', 'platinum', 'business', 'corporate'],
      statuses: Object.values(CVVStatus),
      importFormats: ['csv', 'json', 'txt', 'xlsx'],
      sortOptions: ['price', 'date', 'quality', 'balance'],
      priceRange: {
        min: 1,
        max: 1000
      },
      maxImportSize: 10000,
      supportedCountries: [
        { code: 'US', name: '美國' },
        { code: 'UK', name: '英國' },
        { code: 'CA', name: '加拿大' },
        { code: 'AU', name: '澳大利亞' },
        { code: 'JP', name: '日本' },
        { code: 'KR', name: '韓國' },
        { code: 'CN', name: '中國' },
        { code: 'TW', name: '台灣' },
        { code: 'HK', name: '香港' },
        { code: 'SG', name: '新加坡' }
      ]
    }
  });
});

export default router;
