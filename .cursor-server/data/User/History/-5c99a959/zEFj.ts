import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp 
} from 'firebase/firestore';
import { Payment } from '@/types';

// 支付服務類
export class PaymentService {
  private collectionName = 'payments';

  // 獲取所有支付記錄
  async getAllPayments(): Promise<Payment[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        expiresAt: doc.data().expiresAt?.toDate() || new Date(),
        paidAt: doc.data().paidAt?.toDate(),
      } as Payment));
    } catch (error) {
      console.error('獲取支付記錄失敗:', error);
      throw error;
    }
  }

  // 根據狀態獲取支付記錄
  async getPaymentsByStatus(status: Payment['paymentStatus']): Promise<Payment[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('paymentStatus', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        expiresAt: doc.data().expiresAt?.toDate() || new Date(),
        paidAt: doc.data().paidAt?.toDate(),
      } as Payment));
    } catch (error) {
      console.error('根據狀態獲取支付記錄失敗:', error);
      throw error;
    }
  }

  // 根據用戶 ID 獲取支付記錄
  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        expiresAt: doc.data().expiresAt?.toDate() || new Date(),
        paidAt: doc.data().paidAt?.toDate(),
      } as Payment));
    } catch (error) {
      console.error('根據用戶 ID 獲取支付記錄失敗:', error);
      throw error;
    }
  }

  // 根據訂單 ID 獲取支付記錄
  async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('orderId', '==', orderId),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        expiresAt: doc.data().expiresAt?.toDate() || new Date(),
        paidAt: doc.data().paidAt?.toDate(),
      } as Payment;
    } catch (error) {
      console.error('根據訂單 ID 獲取支付記錄失敗:', error);
      throw error;
    }
  }

  // 創建支付記錄
  async createPayment(paymentData: Omit<Payment, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...paymentData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('創建支付記錄失敗:', error);
      throw error;
    }
  }

  // 更新支付狀態
  async updatePaymentStatus(paymentId: string, status: Payment['paymentStatus']): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, paymentId);
      await updateDoc(docRef, {
        paymentStatus: status,
        updatedAt: Timestamp.now(),
        ...(status === 'confirmed' && { paidAt: Timestamp.now() }),
      });
    } catch (error) {
      console.error('更新支付狀態失敗:', error);
      throw error;
    }
  }

  // 更新支付記錄
  async updatePayment(paymentId: string, updateData: Partial<Payment>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, paymentId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('更新支付記錄失敗:', error);
      throw error;
    }
  }

  // 刪除支付記錄
  async deletePayment(paymentId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, paymentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('刪除支付記錄失敗:', error);
      throw error;
    }
  }

  // 獲取支付統計
  async getPaymentStats(): Promise<{
    totalPayments: number;
    totalAmount: number;
    pendingPayments: number;
    confirmedPayments: number;
    failedPayments: number;
    averageAmount: number;
  }> {
    try {
      const allPayments = await this.getAllPayments();
      
      const totalAmount = allPayments.reduce((sum, p) => sum + p.amount, 0);
      const confirmedPayments = allPayments.filter(p => p.paymentStatus === 'confirmed').length;
      const pendingPayments = allPayments.filter(p => p.paymentStatus === 'pending').length;
      const failedPayments = allPayments.filter(p => p.paymentStatus === 'failed').length;
      
      return {
        totalPayments: allPayments.length,
        totalAmount,
        pendingPayments,
        confirmedPayments,
        failedPayments,
        averageAmount: allPayments.length > 0 ? totalAmount / allPayments.length : 0,
      };
    } catch (error) {
      console.error('獲取支付統計失敗:', error);
      throw error;
    }
  }

  // 獲取過期支付記錄
  async getExpiredPayments(): Promise<Payment[]> {
    try {
      const now = new Date();
      const allPayments = await this.getAllPayments();
      return allPayments.filter(payment => 
        payment.paymentStatus === 'pending' && 
        payment.expiresAt < now
      );
    } catch (error) {
      console.error('獲取過期支付記錄失敗:', error);
      throw error;
    }
  }

  // 批量更新過期支付狀態
  async updateExpiredPayments(): Promise<number> {
    try {
      const expiredPayments = await this.getExpiredPayments();
      let updatedCount = 0;
      
      for (const payment of expiredPayments) {
        await this.updatePaymentStatus(payment.id, 'expired');
        updatedCount++;
      }
      
      return updatedCount;
    } catch (error) {
      console.error('批量更新過期支付狀態失敗:', error);
      throw error;
    }
  }
}

// 錢包服務類
export class WalletService {
  private collectionName = 'wallets';

  // 獲取錢包餘額
  async getWalletBalance(walletAddress: string): Promise<number> {
    try {
      // 這裡應該調用區塊鏈 API 獲取實際餘額
      // 暫時返回模擬數據
      return Math.random() * 10000;
    } catch (error) {
      console.error('獲取錢包餘額失敗:', error);
      throw error;
    }
  }

  // 同步錢包餘額
  async syncWalletBalance(walletAddress: string): Promise<number> {
    try {
      const balance = await this.getWalletBalance(walletAddress);
      // 更新數據庫中的餘額
      return balance;
    } catch (error) {
      console.error('同步錢包餘額失敗:', error);
      throw error;
    }
  }

  // 驗證錢包地址
  async validateWalletAddress(address: string, network: string): Promise<boolean> {
    try {
      // 這裡應該調用區塊鏈 API 驗證地址格式
      if (network === 'tron') {
        return address.startsWith('T') && address.length === 34;
      } else if (network === 'ethereum') {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      }
      return false;
    } catch (error) {
      console.error('驗證錢包地址失敗:', error);
      return false;
    }
  }
}

// 匯率服務類
export class ExchangeRateService {
  // 獲取當前匯率
  async getCurrentRate(fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      // 這裡應該調用外部 API 獲取實時匯率
      // 暫時返回模擬數據
      const rates: Record<string, number> = {
        'USDT_USD': 1.00,
        'USDT_CNY': 7.25,
        'USDT_TWD': 31.50,
        'USDT_EUR': 0.92,
        'USDT_JPY': 150.25,
      };
      
      const key = `${fromCurrency}_${toCurrency}`;
      return rates[key] || 1.0;
    } catch (error) {
      console.error('獲取匯率失敗:', error);
      throw error;
    }
  }

  // 更新匯率
  async updateExchangeRates(): Promise<void> {
    try {
      // 這裡應該調用外部 API 更新匯率
      console.log('匯率更新完成');
    } catch (error) {
      console.error('更新匯率失敗:', error);
      throw error;
    }
  }

  // 獲取匯率歷史
  async getRateHistory(fromCurrency: string, toCurrency: string, days: number): Promise<Array<{date: Date, rate: number}>> {
    try {
      // 這裡應該調用外部 API 獲取歷史匯率
      // 暫時返回模擬數據
      const history = [];
      const now = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        history.push({
          date,
          rate: 1.0 + Math.random() * 0.1 - 0.05, // 模擬匯率波動
        });
      }
      
      return history;
    } catch (error) {
      console.error('獲取匯率歷史失敗:', error);
      throw error;
    }
  }
}

// 智能合約服務類
export class SmartContractService {
  // 部署智能合約
  async deployContract(contractType: string, network: string, parameters: any): Promise<string> {
    try {
      // 這裡應該調用區塊鏈 API 部署合約
      // 暫時返回模擬合約地址
      const mockAddress = `TR${Math.random().toString(36).substring(2, 34)}`;
      console.log(`合約 ${contractType} 已部署到 ${network}，地址: ${mockAddress}`);
      return mockAddress;
    } catch (error) {
      console.error('部署智能合約失敗:', error);
      throw error;
    }
  }

  // 調用智能合約
  async callContract(contractAddress: string, functionName: string, parameters: any[]): Promise<any> {
    try {
      // 這裡應該調用區塊鏈 API 執行合約函數
      console.log(`調用合約 ${contractAddress} 的 ${functionName} 函數`);
      return { success: true, transactionHash: `0x${Math.random().toString(36).substring(2, 66)}` };
    } catch (error) {
      console.error('調用智能合約失敗:', error);
      throw error;
    }
  }

  // 獲取合約狀態
  async getContractStatus(contractAddress: string): Promise<{
    isActive: boolean;
    balance: number;
    transactionCount: number;
    lastUpdate: Date;
  }> {
    try {
      // 這裡應該調用區塊鏈 API 獲取合約狀態
      return {
        isActive: true,
        balance: Math.random() * 10000,
        transactionCount: Math.floor(Math.random() * 1000),
        lastUpdate: new Date(),
      };
    } catch (error) {
      console.error('獲取合約狀態失敗:', error);
      throw error;
    }
  }
}

// 導出服務實例
export const paymentService = new PaymentService();
export const walletService = new WalletService();
export const exchangeRateService = new ExchangeRateService();
export const smartContractService = new SmartContractService();
