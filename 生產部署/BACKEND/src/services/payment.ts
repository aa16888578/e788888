import { v4 as uuidv4 } from 'uuid';
import { getFirestore } from './firebase';
import { getTronWeb } from './tron';
import { getExchangeRate } from './exchange';
import logger from '../config/logger';
import config from '../config';
import { 
  Payment, 
  PaymentStatus, 
  Order, 
  ApiResponse,
  CreatePaymentRequest 
} from '../types';

export class PaymentService {
  private db = getFirestore();
  private tronWeb = getTronWeb();

  /**
   * 創建支付
   */
  async createPayment(request: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
    try {
      logger.info('創建支付請求:', { orderId: request.orderId, amount: request.amount });

      // 驗證訂單
      const order = await this.validateOrder(request.orderId);
      if (!order) {
        return {
          success: false,
          error: '訂單不存在或已失效',
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        };
      }

      // 獲取匯率
      const exchangeRate = await getExchangeRate(request.currency, 'USDT');
      
      // 計算 USDT 金額
      const usdtAmount = request.amount / exchangeRate;

      // 驗證金額限制
      if (usdtAmount < config.payment.minAmount || usdtAmount > config.payment.maxAmount) {
        return {
          success: false,
          error: `金額超出限制範圍 (${config.payment.minAmount}-${config.payment.maxAmount} USDT)`,
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        };
      }

      // 生成支付地址
      const paymentAddress = await this.generatePaymentAddress();

      // 創建支付記錄
      const payment: Payment = {
        id: uuidv4(),
        orderId: request.orderId,
        userId: request.userId,
        amount: request.amount,
        usdtAmount,
        exchangeRate,
        currency: request.currency,
        status: PaymentStatus.PENDING,
        paymentAddress,
        requiredConfirmations: config.payment.requiredConfirmations,
        confirmations: 0,
        expiresAt: new Date(Date.now() + config.payment.timeout * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 保存到數據庫
      await this.db.collection('payments').doc(payment.id).set(payment);

      // 更新訂單狀態
      await this.db.collection('orders').doc(request.orderId).update({
        paymentId: payment.id,
        status: 'pending_payment',
        updatedAt: new Date(),
      });

      logger.info('支付創建成功:', { paymentId: payment.id, paymentAddress });

      return {
        success: true,
        data: payment,
        message: '支付創建成功',
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      };

    } catch (error) {
      logger.error('創建支付失敗:', error);
      return {
        success: false,
        error: '創建支付失敗',
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      };
    }
  }

  /**
   * 檢查支付狀態
   */
  async checkPaymentStatus(paymentId: string): Promise<ApiResponse<Payment>> {
    try {
      const paymentDoc = await this.db.collection('payments').doc(paymentId).get();
      
      if (!paymentDoc.exists) {
        return {
          success: false,
          error: '支付記錄不存在',
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        };
      }

      const payment = paymentDoc.data() as Payment;

      // 檢查是否過期
      if (payment.status === PaymentStatus.PENDING && new Date() > payment.expiresAt) {
        await this.updatePaymentStatus(paymentId, PaymentStatus.EXPIRED);
        payment.status = PaymentStatus.EXPIRED;
      }

      return {
        success: true,
        data: payment,
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      };

    } catch (error) {
      logger.error('檢查支付狀態失敗:', error);
      return {
        success: false,
        error: '檢查支付狀態失敗',
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      };
    }
  }

  /**
   * 更新支付狀態
   */
  async updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<void> {
    try {
      const updateData: Partial<Payment> = {
        status,
        updatedAt: new Date(),
      };

      // 根據狀態設置特定時間戳
      switch (status) {
        case PaymentStatus.CONFIRMED:
          updateData.confirmedAt = new Date();
          break;
        case PaymentStatus.FAILED:
          updateData.failedAt = new Date();
          break;
        case PaymentStatus.REFUNDED:
          updateData.refundedAt = new Date();
          break;
      }

      await this.db.collection('payments').doc(paymentId).update(updateData);
      logger.info('支付狀態更新成功:', { paymentId, status });

    } catch (error) {
      logger.error('更新支付狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 處理支付確認
   */
  async processPaymentConfirmation(paymentId: string, transactionHash: string): Promise<void> {
    try {
      logger.info('處理支付確認:', { paymentId, transactionHash });

      // 獲取支付記錄
      const paymentDoc = await this.db.collection('payments').doc(paymentId).get();
      if (!paymentDoc.exists) {
        throw new Error('支付記錄不存在');
      }

      const payment = paymentDoc.data() as Payment;

      // 驗證交易
      const transaction = await this.tronWeb.trx.getTransaction(transactionHash);
      if (!transaction) {
        throw new Error('交易不存在');
      }

      // 檢查確認數
      const confirmations = await this.getTransactionConfirmations(transactionHash);
      
      if (confirmations >= payment.requiredConfirmations) {
        // 更新支付狀態
        await this.updatePaymentStatus(paymentId, PaymentStatus.CONFIRMED);
        
        // 更新訂單狀態
        await this.db.collection('orders').doc(payment.orderId).update({
          status: 'paid',
          updatedAt: new Date(),
        });

        // 觸發後續業務流程
        await this.triggerPostPaymentProcess(payment);

        logger.info('支付確認完成:', { paymentId, confirmations });
      } else {
        // 更新確認數
        await this.db.collection('payments').doc(paymentId).update({
          confirmations,
          updatedAt: new Date(),
        });
      }

    } catch (error) {
      logger.error('處理支付確認失敗:', error);
      throw error;
    }
  }

  /**
   * 驗證訂單
   */
  private async validateOrder(orderId: string): Promise<Order | null> {
    try {
      const orderDoc = await this.db.collection('orders').doc(orderId).get();
      if (!orderDoc.exists) {
        return null;
      }

      const order = orderDoc.data() as Order;
      
      // 檢查訂單狀態
      if (order.status !== 'pending') {
        return null;
      }

      return order;
    } catch (error) {
      logger.error('驗證訂單失敗:', error);
      return null;
    }
  }

  /**
   * 生成支付地址
   */
  private async generatePaymentAddress(): Promise<string> {
    // 這裡應該調用錢包服務生成新的收款地址
    // 暫時返回配置的地址
    return config.blockchain.usdtContractAddress;
  }

  /**
   * 獲取交易確認數
   */
  private async getTransactionConfirmations(transactionHash: string): Promise<number> {
    try {
      const transaction = await this.tronWeb.trx.getTransaction(transactionHash);
      if (!transaction) {
        return 0;
      }

      const currentBlock = await this.tronWeb.trx.getCurrentBlock();
      return currentBlock.block_header.raw_data.number - transaction.blockNumber;
    } catch (error) {
      logger.error('獲取交易確認數失敗:', error);
      return 0;
    }
  }

  /**
   * 觸發後續業務流程
   */
  private async triggerPostPaymentProcess(payment: Payment): Promise<void> {
    try {
      // 這裡可以觸發各種後續流程：
      // 1. 發送確認通知
      // 2. 更新庫存
      // 3. 分配代理佣金
      // 4. 記錄交易歷史
      
      logger.info('觸發後續業務流程:', { paymentId: payment.id });
      
    } catch (error) {
      logger.error('觸發後續業務流程失敗:', error);
    }
  }
}

export default new PaymentService();
