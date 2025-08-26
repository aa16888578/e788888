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
  startAfter,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  User, 
  Product, 
  Order, 
  Agent, 
  Payment, 
  PaginationParams, 
  PaginatedResponse,
  ProductFilters,
  OrderFilters
} from '@/types';

// 通用 CRUD 操作
export class DatabaseService<T> {
  constructor(private collectionName: string) {}

  // 獲取所有文檔
  async getAll(): Promise<T[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  }

  // 獲取單個文檔
  async getById(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }

  // 創建文檔
  async create(data: Omit<T, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  // 更新文檔
  async update(id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  }

  // 刪除文檔
  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  // 分頁查詢
  async getPaginated(params: PaginationParams, constraints: QueryConstraint[] = []): Promise<PaginatedResponse<T>> {
    const { page, limit: pageLimit, sortBy, sortOrder } = params;
    
    let q = collection(db, this.collectionName);
    
    // 添加排序
    if (sortBy) {
      q = query(q, orderBy(sortBy, sortOrder || 'desc'));
    }
    
    // 添加其他約束
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    
    // 添加分頁
    const offset = (page - 1) * pageLimit;
    if (offset > 0) {
      // 這裡需要實現游標分頁，暫時使用 limit
      q = query(q, limit(pageLimit));
    } else {
      q = query(q, limit(pageLimit));
    }
    
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    
    // 獲取總數（這裡需要優化，實際應該單獨查詢）
    const totalSnapshot = await getDocs(collection(db, this.collectionName));
    const total = totalSnapshot.size;
    
    return {
      data,
      pagination: {
        page,
        limit: pageLimit,
        total,
        totalPages: Math.ceil(total / pageLimit)
      }
    };
  }
}

// 用戶服務
export class UserService extends DatabaseService<User> {
  constructor() {
    super('users');
  }

  async getByTelegramId(telegramId: number): Promise<User | null> {
    const q = query(
      collection(db, 'users'),
      where('telegramId', '==', telegramId)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    }
    return null;
  }

  async getActiveUsers(): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }
}

// 商品服務
export class ProductService extends DatabaseService<Product> {
  constructor() {
    super('products');
  }

  async getByCategory(category: string): Promise<Product[]> {
    const q = query(
      collection(db, 'products'),
      where('category', '==', category),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }

  async getLowStock(threshold: number = 10): Promise<Product[]> {
    const q = query(
      collection(db, 'products'),
      where('stock', '<=', threshold),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }

  async searchProducts(filters: ProductFilters): Promise<Product[]> {
    let constraints: QueryConstraint[] = [];
    
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }
    
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    
    if (filters.priceRange) {
      constraints.push(where('price', '>=', filters.priceRange.min));
      constraints.push(where('price', '<=', filters.priceRange.max));
    }
    
    constraints.push(where('status', '!=', 'deleted'));
    
    const q = query(collection(db, 'products'), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }
}

// 訂單服務
export class OrderService extends DatabaseService<Order> {
  constructor() {
    super('orders');
  }

  async getByStatus(status: string): Promise<Order[]> {
    const q = query(
      collection(db, 'orders'),
      where('status', '==', status)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  }

  async getByUserId(userId: string): Promise<Order[]> {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    const q = query(
      collection(db, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate))
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  }
}

// 代理服務
export class AgentService extends DatabaseService<Agent> {
  constructor() {
    super('agents');
  }

  async getByLevel(level: number): Promise<Agent[]> {
    const q = query(
      collection(db, 'agents'),
      where('agentLevel', '==', level),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agent));
  }

  async getTopPerformers(limit: number = 10): Promise<Agent[]> {
    const q = query(
      collection(db, 'agents'),
      where('status', '==', 'active'),
      orderBy('totalSales', 'desc'),
      limit(limit)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agent));
  }
}

// 支付服務
export class PaymentService extends DatabaseService<Payment> {
  constructor() {
    super('payments');
  }

  async getByStatus(status: string): Promise<Payment[]> {
    const q = query(
      collection(db, 'payments'),
      where('paymentStatus', '==', status)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
  }

  async getPendingPayments(): Promise<Payment[]> {
    const q = query(
      collection(db, 'payments'),
      where('paymentStatus', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
  }
}

// 導出服務實例
export const userService = new UserService();
export const productService = new ProductService();
export const orderService = new OrderService();
export const agentService = new AgentService();
export const paymentService = new PaymentService();
