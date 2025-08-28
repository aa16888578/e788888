import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { User, Product, Order, Payment, Category, Session } from '../types';

// 初始化 Firebase Admin
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

// 數據庫服務類
export class DatabaseService {
  // 用戶相關操作
  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const userRef = db.collection('users').doc();
    const now = new Date();
    
    const user: User = {
      id: userRef.id,
      ...userData,
      createdAt: now,
      updatedAt: now
    };
    
    await userRef.set(user);
    return user;
  }

  static async getUserByTelegramId(telegramId: number): Promise<User | null> {
    const snapshot = await db.collection('users')
      .where('telegramId', '==', telegramId)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      ...updates,
      updatedAt: new Date()
    });
  }

  // 商品相關操作
  static async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const productRef = db.collection('products').doc();
    const now = new Date();
    
    const product: Product = {
      id: productRef.id,
      ...productData,
      createdAt: now,
      updatedAt: now
    };
    
    await productRef.set(product);
    return product;
  }

  static async getProducts(filters: any = {}, pagination: any = {}): Promise<Product[]> {
    let query = db.collection('products').where('status', '==', 'active');
    
    // 應用過濾器
    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }
    if (filters.featured !== undefined) {
      query = query.where('featured', '==', filters.featured);
    }
    
    // 應用分頁
    if (pagination.limit) {
      query = query.limit(pagination.limit);
    }
    if (pagination.startAfter) {
      query = query.startAfter(pagination.startAfter);
    }
    
    const snapshot = await query.orderBy('sortOrder', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product);
  }

  static async getProductById(productId: string): Promise<Product | null> {
    const doc = await db.collection('products').doc(productId).get();
    if (!doc.exists) return null;
    
    return { id: doc.id, ...doc.data() } as Product;
  }

  // 獲取單個商品 (別名方法)
  static async getProduct(productId: string): Promise<Product | null> {
    return this.getProductById(productId);
  }

  // 根據分類獲取商品
  static async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const snapshot = await db.collection('products')
      .where('category', '==', categoryId)
      .where('status', '==', 'active')
      .orderBy('sortOrder', 'asc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product);
  }

  // 訂單相關操作
  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const orderRef = db.collection('orders').doc();
    const now = new Date();
    
    const order: Order = {
      id: orderRef.id,
      ...orderData,
      createdAt: now,
      updatedAt: now
    };
    
    await orderRef.set(order);
    return order;
  }

  static async getOrdersByUserId(userId: string): Promise<Order[]> {
    const snapshot = await db.collection('orders')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Order);
  }

  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const orderRef = db.collection('orders').doc(orderId);
    await orderRef.update({
      status,
      updatedAt: new Date()
    });
  }

  // 支付相關操作
  static async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const paymentRef = db.collection('payments').doc();
    const now = new Date();
    
    const payment: Payment = {
      id: paymentRef.id,
      ...paymentData,
      createdAt: now,
      updatedAt: now
    };
    
    await paymentRef.set(payment);
    return payment;
  }

  static async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
    const snapshot = await db.collection('payments')
      .where('orderId', '==', orderId)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Payment;
  }

  static async updatePaymentStatus(paymentId: string, status: Payment['status']): Promise<void> {
    const paymentRef = db.collection('payments').doc(paymentId);
    await paymentRef.update({
      status,
      updatedAt: new Date()
    });
  }

  // 分類相關操作
  static async getCategories(): Promise<Category[]> {
    const snapshot = await db.collection('categories')
      .where('status', '==', 'active')
      .orderBy('sortOrder', 'asc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Category);
  }

  // 獲取單個分類
  static async getCategory(categoryId: string): Promise<Category | null> {
    const doc = await db.collection('categories').doc(categoryId).get();
    if (!doc.exists) return null;
    
    return { id: doc.id, ...doc.data() } as Category;
  }

  // 會話相關操作
  static async createSession(sessionData: Omit<Session, 'id' | 'createdAt'>): Promise<Session> {
    const sessionRef = db.collection('sessions').doc();
    const now = new Date();
    
    const session: Session = {
      id: sessionRef.id,
      ...sessionData,
      createdAt: now
    };
    
    await sessionRef.set(session);
    return session;
  }

  static async getSessionByToken(sessionToken: string): Promise<Session | null> {
    const snapshot = await db.collection('sessions')
      .where('sessionToken', '==', sessionToken)
      .where('expiresAt', '>', new Date())
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Session;
  }

  static async deleteSession(sessionId: string): Promise<void> {
    await db.collection('sessions').doc(sessionId).delete();
  }

  // 批量操作
  static async batchWrite(operations: Array<{ type: 'set' | 'update' | 'delete', collection: string, doc: string, data?: any }>): Promise<void> {
    const batch = db.batch();
    
    operations.forEach(op => {
      const ref = db.collection(op.collection).doc(op.doc);
      
      switch (op.type) {
        case 'set':
          batch.set(ref, op.data);
          break;
        case 'update':
          batch.update(ref, op.data);
          break;
        case 'delete':
          batch.delete(ref);
          break;
      }
    });
    
    await batch.commit();
  }

  // 事務操作
  static async runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
    return await db.runTransaction(updateFunction);
  }
}
