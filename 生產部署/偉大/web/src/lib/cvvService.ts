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

  // ============ 測試功能 ============

  /**
   * 測試 API 連接
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/cvv/health`);
      const result = await response.json();
      return result.status === 'healthy';
    } catch (error) {
      console.error('API 連接測試失敗:', error);
      return false;
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


}

// 創建單例實例
export const cvvService = new CVVService();
export default cvvService;
