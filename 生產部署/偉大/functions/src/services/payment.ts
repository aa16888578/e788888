import { DatabaseService } from './database';
import { Payment, Order, User } from '../types';
import { OrderService } from './order';

// 支付服務類
export class PaymentService {
  private static db = new DatabaseService();

  // 創建支付訂單
  static async createPaymentOrder(orderId: string, paymentMethod: 'usdt_trc20' | 'usdt_erc20' | 'trx'): Promise<Payment> {
    try {
      const order = await OrderService.getOrder(orderId);
      if (!order) {
        throw new Error('訂單不存在');
      }

      if (order.paymentStatus !== 'pending') {
        throw new Error('訂單支付狀態不正確');
      }

      // 檢查是否已有支付記錄
      const existingPayment = await this.getPaymentByOrderId(orderId);
      if (existingPayment) {
        throw new Error('該訂單已有支付記錄');
      }

      // 獲取匯率
      const exchangeRate = await this.getExchangeRate('USDT', 'USD');
      
      // 創建支付記錄
      const payment: Omit<Payment, 'id'> = {
        orderId: order.id,
        userId: order.userId,
        telegramId: order.telegramId,
        amount: order.total,
        currency: order.currency,
        paymentMethod,
        walletAddress: this.getWalletAddress(paymentMethod),
        confirmations: 0,
        requiredConfirmations: this.getRequiredConfirmations(paymentMethod),
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 分鐘後過期
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await this.db.db.collection('payments').add(payment);
      const newPayment = { ...payment, id: docRef.id };

      // 更新訂單支付狀態
      await OrderService.updateOrderStatus(orderId, 'pending');

      return newPayment;
    } catch (error) {
      console.error('創建支付訂單失敗:', error);
      throw error;
    }
  }

  // 獲取支付記錄
  static async getPayment(paymentId: string): Promise<Payment | null> {
    try {
      const paymentDoc = await this.db.db.collection('payments').doc(paymentId).get();
      if (!paymentDoc.exists) {
        return null;
      }

      const paymentData = paymentDoc.data() as Payment;
      return {
        ...paymentData,
        id: paymentDoc.id,
        expiresAt: paymentData.expiresAt.toDate(),
        paidAt: paymentData.paidAt?.toDate(),
        createdAt: paymentData.createdAt.toDate(),
        updatedAt: paymentData.updatedAt.toDate()
      };
    } catch (error) {
      console.error('獲取支付記錄失敗:', error);
      throw error;
    }
  }

  // 根據訂單ID獲取支付記錄
  static async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
    try {
      const paymentsSnapshot = await this.db.db.collection('payments')
        .where('orderId', '==', orderId)
        .limit(1)
        .get();

      if (paymentsSnapshot.empty) {
        return null;
      }

      const paymentData = paymentsSnapshot.docs[0].data() as Payment;
      return {
        ...paymentData,
        id: paymentsSnapshot.docs[0].id,
        expiresAt: paymentData.expiresAt.toDate(),
        paidAt: paymentData.paidAt?.toDate(),
        createdAt: paymentData.createdAt.toDate(),
        updatedAt: paymentData.updatedAt.toDate()
      };
    } catch (error) {
      console.error('根據訂單ID獲取支付記錄失敗:', error);
      throw error;
    }
  }

  // 獲取用戶支付記錄
  static async getUserPayments(telegramId: number, page: number = 1, limit: number = 10): Promise<{
    payments: Payment[];
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    try {
      const paymentsQuery = this.db.db.collection('payments')
        .where('telegramId', '==', telegramId)
        .orderBy('createdAt', 'desc');

      const snapshot = await paymentsQuery.get();
      const payments = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        expiresAt: doc.data().expiresAt.toDate(),
        paidAt: doc.data().paidAt?.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Payment[];

      const total = payments.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPayments = payments.slice(startIndex, endIndex);

      return {
        payments: paginatedPayments,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      console.error('獲取用戶支付記錄失敗:', error);
      throw error;
    }
  }

  // 更新支付狀態
  static async updatePaymentStatus(paymentId: string, status: Payment['status'], transactionHash?: string, confirmations?: number): Promise<Payment> {
    try {
      const paymentRef = this.db.db.collection('payments').doc(paymentId);
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (transactionHash) {
        updateData.transactionHash = transactionHash;
      }

      if (confirmations !== undefined) {
        updateData.confirmations = confirmations;
      }

      if (status === 'confirmed') {
        updateData.paidAt = new Date();
      }

      await paymentRef.update(updateData);

      // 如果支付確認，更新訂單狀態
      if (status === 'confirmed') {
        const payment = await this.getPayment(paymentId);
        if (payment) {
          await OrderService.updateOrderStatus(payment.orderId, 'processing');
        }
      }

      const updatedPayment = await this.getPayment(paymentId);
      if (!updatedPayment) {
        throw new Error('支付記錄不存在');
      }

      return updatedPayment;
    } catch (error) {
      console.error('更新支付狀態失敗:', error);
      throw error;
    }
  }

  // 驗證支付交易
  static async verifyPayment(transactionHash: string, expectedAmount: number, expectedAddress: string): Promise<{
    valid: boolean;
    confirmations: number;
    amount: number;
    from: string;
    to: string;
    blockNumber: number;
    timestamp: number;
  }> {
    try {
      // 這裡應該調用區塊鏈API來驗證交易
      // 暫時返回模擬數據
      const mockTransaction = {
        valid: true,
        confirmations: 25,
        amount: expectedAmount,
        from: 'TUserWalletAddress',
        to: expectedAddress,
        blockNumber: 12345678,
        timestamp: Date.now()
      };

      return mockTransaction;
    } catch (error) {
      console.error('驗證支付交易失敗:', error);
      throw error;
    }
  }

  // 處理支付確認
  static async processPaymentConfirmation(paymentId: string, transactionHash: string): Promise<Payment> {
    try {
      const payment = await this.getPayment(paymentId);
      if (!payment) {
        throw new Error('支付記錄不存在');
      }

      if (payment.status !== 'pending') {
        throw new Error('支付狀態不正確');
      }

      // 驗證交易
      const verification = await this.verifyPayment(
        transactionHash,
        payment.amount,
        payment.walletAddress
      );

      if (!verification.valid) {
        throw new Error('交易驗證失敗');
      }

      // 檢查確認數
      if (verification.confirmations < payment.requiredConfirmations) {
        // 更新確認數，但保持pending狀態
        return await this.updatePaymentStatus(paymentId, 'pending', transactionHash, verification.confirmations);
      }

      // 確認支付
      return await this.updatePaymentStatus(paymentId, 'confirmed', transactionHash, verification.confirmations);
    } catch (error) {
      console.error('處理支付確認失敗:', error);
      throw error;
    }
  }

  // 獲取匯率
  static async getExchangeRate(from: string, to: string): Promise<number> {
    try {
      // 這裡應該調用匯率API
      // 暫時返回固定匯率
      const rates: { [key: string]: number } = {
        'USDT_USD': 1.0,
        'USDT_CNY': 7.2,
        'USDT_TWD': 32.0
      };

      const key = `${from}_${to}`;
      return rates[key] || 1.0;
    } catch (error) {
      console.error('獲取匯率失敗:', error);
      return 1.0;
    }
  }

  // 獲取錢包地址
  private static getWalletAddress(paymentMethod: string): string {
    const wallets: { [key: string]: string } = {
      'usdt_trc20': process.env.TRON_WALLET_ADDRESS || 'TDefaultTronWallet',
      'usdt_erc20': process.env.ETHEREUM_WALLET_ADDRESS || '0xDefaultEthereumWallet',
      'trx': process.env.TRON_WALLET_ADDRESS || 'TDefaultTronWallet'
    };

    return wallets[paymentMethod] || wallets['usdt_trc20'];
  }

  // 獲取所需確認數
  private static getRequiredConfirmations(paymentMethod: string): number {
    const confirmations: { [key: string]: number } = {
      'usdt_trc20': 20,
      'usdt_erc20': 12,
      'trx': 20
    };

    return confirmations[paymentMethod] || 20;
  }

  // 檢查支付是否過期
  static async checkPaymentExpiration(): Promise<void> {
    try {
      const now = new Date();
      const expiredPaymentsSnapshot = await this.db.db.collection('payments')
        .where('status', '==', 'pending')
        .where('expiresAt', '<', now)
        .get();

      for (const doc of expiredPaymentsSnapshot.docs) {
        const payment = doc.data() as Payment;
        
        // 更新支付狀態為過期
        await this.updatePaymentStatus(payment.id || doc.id, 'expired');
        
        // 取消相關訂單
        try {
          await OrderService.cancelOrder(payment.orderId, '支付超時');
        } catch (error) {
          console.error(`取消過期支付訂單失敗: ${payment.orderId}`, error);
        }
      }
    } catch (error) {
      console.error('檢查支付過期失敗:', error);
    }
  }

  // 獲取支付統計
  static async getPaymentStats(telegramId: number): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    failed: number;
    expired: number;
    totalAmount: number;
  }> {
    try {
      const paymentsSnapshot = await this.db.db.collection('payments')
        .where('telegramId', '==', telegramId)
        .get();

      const payments = paymentsSnapshot.docs.map(doc => doc.data() as Payment);
      
      const stats = {
        total: payments.length,
        pending: payments.filter(p => p.status === 'pending').length,
        confirmed: payments.filter(p => p.status === 'confirmed').length,
        failed: payments.filter(p => p.status === 'failed').length,
        expired: payments.filter(p => p.status === 'expired').length,
        totalAmount: payments
          .filter(p => p.status === 'confirmed')
          .reduce((sum, p) => sum + p.amount, 0)
      };

      return stats;
    } catch (error) {
      console.error('獲取支付統計失敗:', error);
      throw error;
    }
  }

  // 創建退款
  static async createRefund(paymentId: string, reason: string): Promise<Payment> {
    try {
      const payment = await this.getPayment(paymentId);
      if (!payment) {
        throw new Error('支付記錄不存在');
      }

      if (payment.status !== 'confirmed') {
        throw new Error('只能對已確認的支付進行退款');
      }

      // 更新支付狀態為退款
      const updatedPayment = await this.updatePaymentStatus(paymentId, 'refunded');
      
      // 更新訂單狀態
      await OrderService.updateOrderStatus(payment.orderId, 'cancelled', `退款原因: ${reason}`);

      return updatedPayment;
    } catch (error) {
      console.error('創建退款失敗:', error);
      throw error;
    }
  }

  // 獲取支付QR碼數據
  static async getPaymentQRCode(paymentId: string): Promise<{
    address: string;
    amount: number;
    currency: string;
    memo?: string;
  }> {
    try {
      const payment = await this.getPayment(paymentId);
      if (!payment) {
        throw new Error('支付記錄不存在');
      }

      return {
        address: payment.walletAddress,
        amount: payment.amount,
        currency: payment.currency,
        memo: `Order: ${payment.orderId}`
      };
    } catch (error) {
      console.error('獲取支付QR碼數據失敗:', error);
      throw error;
    }
  }

  // 檢查支付狀態
  static async checkPaymentStatus(paymentId: string): Promise<{
    status: Payment['status'];
    confirmations: number;
    requiredConfirmations: number;
    expiresAt: Date;
    estimatedTime: string;
  }> {
    try {
      const payment = await this.getPayment(paymentId);
      if (!payment) {
        throw new Error('支付記錄不存在');
      }

      const now = new Date();
      const timeLeft = payment.expiresAt.getTime() - now.getTime();
      const minutesLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60)));

      let estimatedTime = '';
      if (payment.status === 'pending') {
        if (minutesLeft > 0) {
          estimatedTime = `剩餘 ${minutesLeft} 分鐘`;
        } else {
          estimatedTime = '即將過期';
        }
      } else {
        estimatedTime = '支付完成';
      }

      return {
        status: payment.status,
        confirmations: payment.confirmations,
        requiredConfirmations: payment.requiredConfirmations,
        expiresAt: payment.expiresAt,
        estimatedTime
      };
    } catch (error) {
      console.error('檢查支付狀態失敗:', error);
      throw error;
    }
  }
}
