import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import paymentService from '../services/payment';
import logger from '../config/logger';
import { ApiResponse } from '../types';

export class PaymentController {
  /**
   * 創建支付
   */
  async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, amount, currency } = req.body;
      const userId = req.user?.id; // 從 JWT 中獲取

      if (!userId) {
        res.status(401).json({
          success: false,
          error: '未授權訪問',
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
        return;
      }

      if (!orderId || !amount || !currency) {
        res.status(400).json({
          success: false,
          error: '缺少必要參數',
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
        return;
      }

      const result = await paymentService.createPayment({
        orderId,
        userId,
        amount: parseFloat(amount),
        currency,
      });

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      logger.error('創建支付控制器錯誤:', error);
      res.status(500).json({
        success: false,
        error: '內部服務器錯誤',
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }

  /**
   * 檢查支付狀態
   */
  async checkPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: '未授權訪問',
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
        return;
      }

      if (!paymentId) {
        res.status(400).json({
          success: false,
          error: '缺少支付ID',
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
        return;
      }

      const result = await paymentService.checkPaymentStatus(paymentId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }

    } catch (error) {
      logger.error('檢查支付狀態控制器錯誤:', error);
      res.status(500).json({
        success: false,
        error: '內部服務器錯誤',
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }

  /**
   * 獲取支付歷史
   */
  async getPaymentHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 10 } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: '未授權訪問',
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
        return;
      }

      // 這裡應該實現獲取支付歷史的邏輯
      // 暫時返回空結果
      res.status(200).json({
        success: true,
        data: [],
        message: '支付歷史獲取成功',
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });

    } catch (error) {
      logger.error('獲取支付歷史控制器錯誤:', error);
      res.status(500).json({
        success: false,
        error: '內部服務器錯誤',
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }

  /**
   * 處理支付回調
   */
  async handlePaymentCallback(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId, transactionHash, status } = req.body;

      logger.info('收到支付回調:', { paymentId, transactionHash, status });

      if (!paymentId || !transactionHash) {
        res.status(400).json({
          success: false,
          error: '缺少必要參數',
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
        return;
      }

      // 處理支付確認
      await paymentService.processPaymentConfirmation(paymentId, transactionHash);

      res.status(200).json({
        success: true,
        message: '支付回調處理成功',
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });

    } catch (error) {
      logger.error('處理支付回調控制器錯誤:', error);
      res.status(500).json({
        success: false,
        error: '內部服務器錯誤',
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }

  /**
   * 獲取支付統計
   */
  async getPaymentStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: '未授權訪問',
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        });
        return;
      }

      // 這裡應該實現獲取支付統計的邏輯
      // 暫時返回模擬數據
      const stats = {
        totalPayments: 0,
        totalAmount: 0,
        successRate: 0,
        averageConfirmationTime: 0,
      };

      res.status(200).json({
        success: true,
        data: stats,
        message: '支付統計獲取成功',
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });

    } catch (error) {
      logger.error('獲取支付統計控制器錯誤:', error);
      res.status(500).json({
        success: false,
        error: '內部服務器錯誤',
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
  }
}

export default new PaymentController();
