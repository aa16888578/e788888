// API 客戶端配置 (VM 環境)
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? process.env.NEXT_PUBLIC_API_BASE_URL || 'http://10.140.0.2:5001/ccvbot-8578/asia-east1'
  : process.env.NEXT_PUBLIC_API_BASE_URL_PROD || 'https://asia-east1-ccvbot-8578.cloudfunctions.net';

// API 響應類型
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// HTTP 客戶端類
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // 通用請求方法
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API 請求錯誤:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'API 請求失敗',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // GET 請求
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST 請求
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT 請求
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE 請求
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // PATCH 請求
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// 創建 API 客戶端實例
export const apiClient = new ApiClient();

// 健康檢查 API
export const healthAPI = {
  check: () => apiClient.get('/healthCheck'),
  test: () => apiClient.get('/test'),
  status: () => apiClient.get('/apiStatus'),
};

// 用戶 API
export const userAPI = {
  getAll: () => apiClient.get('/api/users'),
  getById: (id: string) => apiClient.get(`/api/users/${id}`),
  create: (data: any) => apiClient.post('/api/users', data),
  update: (id: string, data: any) => apiClient.put(`/api/users/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/users/${id}`),
};

// 商品 API
export const productAPI = {
  getAll: () => apiClient.get('/api/products'),
  getById: (id: string) => apiClient.get(`/api/products/${id}`),
  create: (data: any) => apiClient.post('/api/products', data),
  update: (id: string, data: any) => apiClient.put(`/api/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/products/${id}`),
  search: (query: string) => apiClient.get(`/api/products/search?q=${query}`),
};

// 訂單 API
export const orderAPI = {
  getAll: () => apiClient.get('/api/orders'),
  getById: (id: string) => apiClient.get(`/api/orders/${id}`),
  create: (data: any) => apiClient.post('/api/orders', data),
  updateStatus: (id: string, status: string) => apiClient.patch(`/api/orders/${id}/status`, { status }),
  getUserOrders: (telegramId: number) => apiClient.get(`/api/orders/user/${telegramId}`),
};

// 購物車 API
export const cartAPI = {
  get: (telegramId: number) => apiClient.get(`/api/cart/${telegramId}`),
  add: (telegramId: number, productId: string, quantity: number) => 
    apiClient.post('/api/cart/add', { telegramId, productId, quantity }),
  update: (telegramId: number, productId: string, quantity: number) => 
    apiClient.put('/api/cart/update', { telegramId, productId, quantity }),
  remove: (telegramId: number, productId: string) => 
    apiClient.delete(`/api/cart/remove?telegramId=${telegramId}&productId=${productId}`),
  clear: (telegramId: number) => apiClient.delete(`/api/cart/clear/${telegramId}`),
};

// 代理 API
export const agentAPI = {
  getAll: () => apiClient.get('/api/agent'),
  getById: (id: string) => apiClient.get(`/api/agent/profile/${id}`),
  getByTelegram: (telegramId: number) => apiClient.get(`/api/agent/telegram/${telegramId}`),
  register: (data: any) => apiClient.post('/api/agent/register', data),
  updateStatus: (id: string, status: string) => apiClient.put(`/api/agent/status/${id}`, { status }),
  getCommission: (id: string) => apiClient.get(`/api/agent/commission/${id}`),
  withdrawal: (data: any) => apiClient.post('/api/agent/withdrawal', data),
  search: (query: string) => apiClient.get(`/api/agent/search?q=${query}`),
};

// 支付 API
export const paymentAPI = {
  create: (data: any) => apiClient.post('/api/payments/create', data),
  getById: (id: string) => apiClient.get(`/api/payments/${id}`),
  updateStatus: (id: string, status: string) => apiClient.put(`/api/payments/${id}/status`, { status }),
  refund: (id: string, data: any) => apiClient.post(`/api/payments/${id}/refund`, data),
  getHistory: (userId: string) => apiClient.get(`/api/payments/history/${userId}`),
};

// Telegram Bot API
export const telegramAPI = {
  sendMessage: (data: any) => apiClient.post('/api/telegram/send', data),
  getStatus: () => apiClient.get('/api/telegram/status'),
  setWebhook: (url: string) => apiClient.post('/api/telegram/webhook', { url }),
  getBotInfo: () => apiClient.get('/api/telegram/info'),
};

// API 已在上面單獨導出
