import { 
  healthAPI, 
  userAPI, 
  productAPI, 
  orderAPI, 
  cartAPI, 
  agentAPI, 
  paymentAPI, 
  telegramAPI 
} from './api';
import type { 
  User, 
  Product, 
  Order, 
  Cart, 
  Agent, 
  Payment, 
  DashboardMetrics,
  Statistics 
} from '@/types';

// 健康檢查服務
export const healthService = {
  async checkHealth() {
    return await healthAPI.check();
  },

  async getStatus() {
    return await healthAPI.status();
  },

  async testConnection() {
    return await healthAPI.test();
  }
};

// 用戶服務
export const userService = {
  async getAllUsers() {
    return await userAPI.getAll();
  },

  async getUserById(id: string) {
    return await userAPI.getById(id);
  },

  async createUser(userData: Partial<User>) {
    return await userAPI.create(userData);
  },

  async updateUser(id: string, userData: Partial<User>) {
    return await userAPI.update(id, userData);
  },

  async deleteUser(id: string) {
    return await userAPI.delete(id);
  }
};

// 商品服務
export const productService = {
  async getAllProducts() {
    return await productAPI.getAll();
  },

  async getProductById(id: string) {
    return await productAPI.getById(id);
  },

  async createProduct(productData: Partial<Product>) {
    return await productAPI.create(productData);
  },

  async updateProduct(id: string, productData: Partial<Product>) {
    return await productAPI.update(id, productData);
  },

  async deleteProduct(id: string) {
    return await productAPI.delete(id);
  },

  async searchProducts(query: string) {
    return await productAPI.search(query);
  }
};

// 訂單服務
export const orderService = {
  async getAllOrders() {
    return await orderAPI.getAll();
  },

  async getOrderById(id: string) {
    return await orderAPI.getById(id);
  },

  async createOrder(orderData: Partial<Order>) {
    return await orderAPI.create(orderData);
  },

  async updateOrderStatus(id: string, status: string) {
    return await orderAPI.updateStatus(id, status);
  },

  async getUserOrders(telegramId: number) {
    return await orderAPI.getUserOrders(telegramId);
  }
};

// 購物車服務
export const cartService = {
  async getCart(telegramId: number) {
    return await cartAPI.get(telegramId);
  },

  async addToCart(telegramId: number, productId: string, quantity: number = 1) {
    return await cartAPI.add(telegramId, productId, quantity);
  },

  async updateCartItem(telegramId: number, productId: string, quantity: number) {
    return await cartAPI.update(telegramId, productId, quantity);
  },

  async removeFromCart(telegramId: number, productId: string) {
    return await cartAPI.remove(telegramId, productId);
  },

  async clearCart(telegramId: number) {
    return await cartAPI.clear(telegramId);
  }
};

// 代理服務
export const agentService = {
  async getAllAgents() {
    return await agentAPI.getAll();
  },

  async getAgentById(id: string) {
    return await agentAPI.getById(id);
  },

  async getAgentByTelegram(telegramId: number) {
    return await agentAPI.getByTelegram(telegramId);
  },

  async registerAgent(agentData: Partial<Agent>) {
    return await agentAPI.register(agentData);
  },

  async updateAgentStatus(id: string, status: string) {
    return await agentAPI.updateStatus(id, status);
  },

  async getAgentCommission(id: string) {
    return await agentAPI.getCommission(id);
  },

  async requestWithdrawal(withdrawalData: any) {
    return await agentAPI.withdrawal(withdrawalData);
  },

  async searchAgents(query: string) {
    return await agentAPI.search(query);
  }
};

// 支付服務
export const paymentService = {
  async createPayment(paymentData: Partial<Payment>) {
    return await paymentAPI.create(paymentData);
  },

  async getPaymentById(id: string) {
    return await paymentAPI.getById(id);
  },

  async updatePaymentStatus(id: string, status: string) {
    return await paymentAPI.updateStatus(id, status);
  },

  async refundPayment(id: string, refundData: any) {
    return await paymentAPI.refund(id, refundData);
  },

  async getPaymentHistory(userId: string) {
    return await paymentAPI.getHistory(userId);
  }
};

// Telegram 服務
export const telegramService = {
  async sendMessage(chatId: number, text: string, options?: any) {
    return await telegramAPI.sendMessage({ chatId, text, ...options });
  },

  async getBotStatus() {
    return await telegramAPI.getStatus();
  },

  async setWebhook(url: string) {
    return await telegramAPI.setWebhook(url);
  },

  async getBotInfo() {
    return await telegramAPI.getBotInfo();
  }
};

// 儀表板服務
export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    // 組合多個 API 調用來獲取儀表板數據
    const [users, products, orders] = await Promise.all([
      userService.getAllUsers(),
      productService.getAllProducts(),
      orderService.getAllOrders(),
    ]);

    return {
      totalUsers: users.data?.length || 0,
      totalProducts: products.data?.length || 0,
      totalOrders: orders.data?.length || 0,
      totalRevenue: 0, // TODO: 計算總收入
      pendingOrders: 0, // TODO: 計算待處理訂單
      lowStockProducts: 0, // TODO: 計算低庫存商品
      activeAgents: 0, // TODO: 計算活躍代理
      totalCommission: 0, // TODO: 計算總佣金
    };
  },

  async getStatistics(): Promise<Statistics> {
    // TODO: 實現統計數據獲取
    return {
      orders: {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        totalRevenue: 0,
      },
      payments: {
        pending: 0,
        confirmed: 0,
        failed: 0,
        expired: 0,
        totalAmount: 0,
      },
      agents: {
        active: 0,
        pending: 0,
        suspended: 0,
        totalCommission: 0,
      },
    };
  }
};

// 導出所有服務 - 避免重複導出
