// CVV 卡片庫存管理服務

import { 
  CVVCard, 
  CVVBatch, 
  CVVOrder, 
  CVVTransaction, 
  CVVInventoryStats,
  CVVImportRequest,
  CVVImportResult,
  CVVSearchFilters,
  CVVSearchResult,
  CVVApiResponse
} from '@/types/cvv';

class CVVService {
  private apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/ccvbot-8578/asia-east1';

  // ============ AI 入庫功能 ============

  /**
   * AI 智能導入 CVV 卡片
   */
  async importCards(request: CVVImportRequest): Promise<CVVImportResult> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/cvv/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result: CVVApiResponse<CVVImportResult> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '導入失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('CVV 卡片導入失敗:', error);
      throw error;
    }
  }

  /**
   * 檢查卡片餘額
   */
  async checkBalance(cardId: string): Promise<number> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/cvv/cards/${cardId}/check-balance`, {
        method: 'POST',
      });

      const result: CVVApiResponse<number> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '檢查餘額失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('檢查卡片餘額失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取配置選項
   */
  async getConfig(): Promise<{
    cardTypes: string[];
    cardLevels: string[];
    statuses: string[];
    importFormats: string[];
    sortOptions: string[];
    priceRange: { min: number; max: number };
    maxImportSize: number;
    supportedCountries: Array<{ code: string; name: string }>;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/cvv/config`);
      const result: CVVApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '獲取配置失敗');
      }

      return result.data;
    } catch (error) {
      console.error('獲取配置失敗:', error);
      throw error;
    }
  }

  // ============ 庫存管理功能 ============

  /**
   * 搜索 CVV 卡片
   */
  async searchCards(filters: CVVSearchFilters, page = 1, limit = 20): Promise<CVVSearchResult> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = Array.isArray(value) ? value.join(',') : value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      });

      const response = await fetch(`${this.apiBaseUrl}/api/cvv/search?${queryParams}`);
      const result: CVVApiResponse<CVVSearchResult> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '搜索失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('CVV 卡片搜索失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取單個 CVV 卡片詳情
   */
  async getCard(cardId: string): Promise<CVVCard> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/cvv/cards/${cardId}`);
      const result: CVVApiResponse<CVVCard> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '獲取卡片失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('獲取 CVV 卡片失敗:', error);
      throw error;
    }
  }

  /**
   * 更新 CVV 卡片狀態
   */
  async updateCardStatus(cardId: string, status: CVVCard['status']): Promise<CVVCard> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/cvv/cards/${cardId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const result: CVVApiResponse<CVVCard> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '更新狀態失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('更新 CVV 卡片狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 批量更新卡片狀態
   */
  async batchUpdateStatus(cardIds: string[], status: CVVCard['status']): Promise<number> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/cvv/cards/batch-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardIds, status }),
      });

      const result: CVVApiResponse<{ updated: number }> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '批量更新失敗');
      }

      return result.data!.updated;
    } catch (error) {
      console.error('批量更新 CVV 卡片狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 刪除 CVV 卡片
   */
  async deleteCard(cardId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/cvv/cards/${cardId}`, {
        method: 'DELETE',
      });

      const result: CVVApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '刪除失敗');
      }
    } catch (error) {
      console.error('刪除 CVV 卡片失敗:', error);
      throw error;
    }
  }

  // ============ 出庫/交易功能 ============

  /**
   * 創建訂單
   */
  async createOrder(items: Array<{
    country: string;
    cardType: string;
    category: string;
    quantity: number;
  }>): Promise<CVVOrder> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/cvv/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      const result: CVVApiResponse<CVVOrder> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '創建訂單失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('創建 CVV 訂單失敗:', error);
      throw error;
    }
  }

  /**
   * 處理訂單支付
   */
  async processPayment(orderId: string, paymentTxHash: string): Promise<CVVOrder> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/cvv/orders/${orderId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentTxHash }),
      });

      const result: CVVApiResponse<CVVOrder> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '支付處理失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('處理 CVV 訂單支付失敗:', error);
      throw error;
    }
  }

  /**
   * 自動發貨 - 分配卡片給訂單
   */
  async deliverOrder(orderId: string): Promise<CVVOrder> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/cvv/orders/${orderId}/deliver`, {
        method: 'POST',
      });

      const result: CVVApiResponse<CVVOrder> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '自動發貨失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('CVV 訂單自動發貨失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取訂單詳情
   */
  async getOrder(orderId: string): Promise<CVVOrder> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/cvv/orders/${orderId}`);
      const result: CVVApiResponse<CVVOrder> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '獲取訂單失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('獲取 CVV 訂單失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取用戶訂單列表
   */
  async getUserOrders(userId: string, page = 1, limit = 20): Promise<{
    orders: CVVOrder[];
    total: number;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/cvv/users/${userId}/orders?page=${page}&limit=${limit}`);
      const result: CVVApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '獲取訂單列表失敗');
      }

      return result.data;
    } catch (error) {
      console.error('獲取用戶 CVV 訂單列表失敗:', error);
      throw error;
    }
  }

  // ============ 統計功能 ============

  /**
   * 獲取庫存統計
   */
  async getInventoryStats(): Promise<CVVInventoryStats> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/cvv/stats/inventory`);
      const result: CVVApiResponse<CVVInventoryStats> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '獲取統計失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('獲取 CVV 庫存統計失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取銷售統計
   */
  async getSalesStats(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    totalRevenue: number;
    totalOrders: number;
    totalCards: number;
    averageOrderValue: number;
    topCountries: Array<{ country: string; revenue: number; orders: number }>;
    topCategories: Array<{ category: string; revenue: number; orders: number }>;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/cvv/stats/sales?period=${period}`);
      const result: CVVApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '獲取銷售統計失敗');
      }

      return result.data;
    } catch (error) {
      console.error('獲取 CVV 銷售統計失敗:', error);
      throw error;
    }
  }

  // ============ 工具功能 ============

  /**
   * 檢查卡片重複
   */
  async checkDuplicates(cards: Partial<CVVCard>[]): Promise<{
    duplicates: Array<{ card: Partial<CVVCard>; existingId: string }>;
    unique: Partial<CVVCard>[];
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/cvv/check-duplicates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cards }),
      });

      const result: CVVApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '檢查重複失敗');
      }

      return result.data;
    } catch (error) {
      console.error('檢查 CVV 卡片重複失敗:', error);
      throw error;
    }
  }

  /**
   * 導出庫存數據
   */
  async exportInventory(filters?: CVVSearchFilters, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams({
        format,
        ...Object.entries(filters || {}).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = Array.isArray(value) ? value.join(',') : value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      });

      const response = await fetch(`${this.apiBaseUrl}/api/cvv/export?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('導出失敗');
      }

      return await response.blob();
    } catch (error) {
      console.error('導出 CVV 庫存失敗:', error);
      throw error;
    }
  }
}

// 創建單例實例
export const cvvService = new CVVService();
export default cvvService;
