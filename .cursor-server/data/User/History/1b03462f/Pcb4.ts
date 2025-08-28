import { DatabaseService } from './database';
import { Order, OrderProduct, Cart, User, Payment } from '../types';
import { CartService } from './cart';

// 訂單服務類
export class OrderService {
  private static db = new DatabaseService();

  // 創建訂單
  static async createOrder(telegramId: number, cart: Cart, paymentMethod: 'usdt_trc20' | 'usdt_erc20' | 'trx'): Promise<Order> {
    try {
      const user = await this.db.getUserByTelegramId(telegramId);
      if (!user) {
        throw new Error('用戶不存在');
      }

      // 檢查購物車庫存
      const stockCheck = await CartService.checkCartStock(telegramId);
      if (!stockCheck.valid) {
        throw new Error(`庫存檢查失敗: ${stockCheck.errors.join(', ')}`);
      }

      // 生成訂單號
      const orderNumber = this.generateOrderNumber();

      // 創建訂單產品列表
      const orderProducts: OrderProduct[] = cart.items.map(item => ({
        productId: item.productId,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal
      }));

      // 創建訂單
      const order: Omit<Order, 'id'> = {
        orderNumber,
        userId: user.id,
        telegramId: user.telegramId,
        products: orderProducts,
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        total: cart.total,
        currency: cart.currency,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await this.db.db.collection('orders').add(order);
      const newOrder = { ...order, id: docRef.id };

      // 更新商品庫存
      await this.updateProductStock(orderProducts);

      // 清空購物車
      await CartService.clearCart(telegramId);

      // 創建支付記錄
      await this.createPayment(newOrder);

      return newOrder;
    } catch (error) {
      console.error('創建訂單失敗:', error);
      throw error;
    }
  }

  // 生成訂單號
  private static generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SB${timestamp}${random}`;
  }

  // 更新商品庫存
  private static async updateProductStock(orderProducts: OrderProduct[]): Promise<void> {
    for (const item of orderProducts) {
      const productRef = this.db.db.collection('products').doc(item.productId);
      await this.db.db.runTransaction(async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (productDoc.exists) {
          const currentStock = productDoc.data()!.stock;
          if (currentStock >= item.quantity) {
            transaction.update(productRef, {
              stock: currentStock - item.quantity,
              updatedAt: new Date()
            });
          } else {
            throw new Error(`商品 ${item.name} 庫存不足`);
          }
        }
      });
    }
  }

  // 創建支付記錄
  private static async createPayment(order: Order): Promise<Payment> {
    const payment: Omit<Payment, 'id'> = {
      orderId: order.id,
      userId: order.userId,
      telegramId: order.telegramId,
      amount: order.total,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      walletAddress: process.env.SYSTEM_WALLET_ADDRESS || 'TDefaultWalletAddress',
      confirmations: 0,
      requiredConfirmations: 20, // TRC20 需要 20 個確認
      status: 'pending',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 分鐘後過期
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await this.db.db.collection('payments').add(payment);
    return { ...payment, id: docRef.id };
  }

  // 獲取用戶訂單列表
  static async getUserOrders(telegramId: number, page: number = 1, limit: number = 10): Promise<{
    orders: Order[];
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    try {
      const user = await this.db.getUserByTelegramId(telegramId);
      if (!user) {
        throw new Error('用戶不存在');
      }

      const ordersQuery = this.db.db.collection('orders')
        .where('telegramId', '==', telegramId)
        .orderBy('createdAt', 'desc');

      const snapshot = await ordersQuery.get();
      const orders = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Order[];

      const total = orders.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedOrders = orders.slice(startIndex, endIndex);

      return {
        orders: paginatedOrders,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      console.error('獲取用戶訂單失敗:', error);
      throw error;
    }
  }

  // 獲取訂單詳情
  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      const orderDoc = await this.db.db.collection('orders').doc(orderId).get();
      if (!orderDoc.exists) {
        return null;
      }

      const orderData = orderDoc.data() as Order;
      return {
        ...orderData,
        id: orderDoc.id,
        createdAt: orderData.createdAt.toDate(),
        updatedAt: orderData.updatedAt.toDate()
      };
    } catch (error) {
      console.error('獲取訂單詳情失敗:', error);
      throw error;
    }
  }

  // 更新訂單狀態
  static async updateOrderStatus(orderId: string, status: Order['status'], notes?: string): Promise<Order> {
    try {
      const orderRef = this.db.db.collection('orders').doc(orderId);
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (notes) {
        updateData.notes = notes;
      }

      await orderRef.update(updateData);

      const updatedOrder = await this.getOrder(orderId);
      if (!updatedOrder) {
        throw new Error('訂單不存在');
      }

      return updatedOrder;
    } catch (error) {
      console.error('更新訂單狀態失敗:', error);
      throw error;
    }
  }

  // 更新支付狀態
  static async updatePaymentStatus(paymentId: string, status: Payment['status'], transactionHash?: string): Promise<Payment> {
    try {
      const paymentRef = this.db.db.collection('payments').doc(paymentId);
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (transactionHash) {
        updateData.transactionHash = transactionHash;
      }

      if (status === 'confirmed') {
        updateData.paidAt = new Date();
      }

      await paymentRef.update(updateData);

      // 如果支付確認，更新訂單狀態
      if (status === 'confirmed') {
        const paymentDoc = await paymentRef.get();
        const paymentData = paymentDoc.data() as Payment;
        await this.updateOrderStatus(paymentData.orderId, 'processing');
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

  // 取消訂單
  static async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('訂單不存在');
      }

      if (order.status !== 'pending') {
        throw new Error('只能取消待處理的訂單');
      }

      // 更新訂單狀態
      const updatedOrder = await this.updateOrderStatus(orderId, 'cancelled', reason);

      // 恢復商品庫存
      await this.restoreProductStock(order.products);

      // 取消支付記錄
      await this.cancelPayment(orderId);

      return updatedOrder;
    } catch (error) {
      console.error('取消訂單失敗:', error);
      throw error;
    }
  }

  // 恢復商品庫存
  private static async restoreProductStock(orderProducts: OrderProduct[]): Promise<void> {
    for (const item of orderProducts) {
      const productRef = this.db.db.collection('products').doc(item.productId);
      await this.db.db.runTransaction(async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (productDoc.exists) {
          const currentStock = productDoc.data()!.stock;
          transaction.update(productRef, {
            stock: currentStock + item.quantity,
            updatedAt: new Date()
          });
        }
      });
    }
  }

  // 取消支付記錄
  private static async cancelPayment(orderId: string): Promise<void> {
    try {
      const paymentsSnapshot = await this.db.db.collection('payments')
        .where('orderId', '==', orderId)
        .get();

      if (!paymentsSnapshot.empty) {
        const paymentDoc = paymentsSnapshot.docs[0];
        await paymentDoc.ref.update({
          status: 'cancelled',
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('取消支付記錄失敗:', error);
    }
  }

  // 獲取訂單統計
  static async getOrderStats(telegramId: number): Promise<{
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    totalSpent: number;
  }> {
    try {
      const ordersSnapshot = await this.db.db.collection('orders')
        .where('telegramId', '==', telegramId)
        .get();

      const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);
      
      const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        totalSpent: orders
          .filter(o => o.status === 'delivered')
          .reduce((sum, o) => sum + o.total, 0)
      };

      return stats;
    } catch (error) {
      console.error('獲取訂單統計失敗:', error);
      throw error;
    }
  }

  // 檢查訂單是否可取消
  static async canCancelOrder(orderId: string): Promise<boolean> {
    try {
      const order = await this.getOrder(orderId);
      if (!order) {
        return false;
      }

      // 只能取消待處理的訂單
      return order.status === 'pending';
    } catch (error) {
      console.error('檢查訂單是否可取消失敗:', error);
      return false;
    }
  }

  // 獲取訂單追蹤信息
  static async getOrderTracking(orderId: string): Promise<{
    orderId: string;
    status: Order['status'];
    paymentStatus: Order['paymentStatus'];
    estimatedDelivery?: Date;
    notes?: string;
    updatedAt: Date;
  }> {
    try {
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('訂單不存在');
      }

      // 這裡可以集成實際的物流追蹤系統
      const estimatedDelivery = new Date(order.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7天後

      return {
        orderId: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        estimatedDelivery,
        notes: order.notes,
        updatedAt: order.updatedAt
      };
    } catch (error) {
      console.error('獲取訂單追蹤信息失敗:', error);
      throw error;
    }
  }
}
