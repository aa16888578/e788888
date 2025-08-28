// AI 分類系統服務層

import {
  ClassificationCategory,
  ClassificationRule,
  AIProvider,
  ClassificationTask,
  ClassificationBatch,
  ClassificationStats,
  ClassificationApiResponse,
  AIApiConfig
} from '@/types/classification';

class ClassificationService {
  private apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/ccvbot-8578/asia-east1';

  // ============ 分類管理 ============

  /**
   * 獲取所有分類
   */
  async getCategories(): Promise<ClassificationCategory[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/classification/categories`);
      const result: ClassificationApiResponse<ClassificationCategory[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '獲取分類失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('獲取分類失敗:', error);
      throw error;
    }
  }

  /**
   * 創建分類
   */
  async createCategory(category: Omit<ClassificationCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClassificationCategory> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/classification/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });

      const result: ClassificationApiResponse<ClassificationCategory> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '創建分類失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('創建分類失敗:', error);
      throw error;
    }
  }

  /**
   * 更新分類
   */
  async updateCategory(id: string, updates: Partial<ClassificationCategory>): Promise<ClassificationCategory> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/classification/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result: ClassificationApiResponse<ClassificationCategory> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '更新分類失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('更新分類失敗:', error);
      throw error;
    }
  }

  /**
   * 刪除分類
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/classification/categories/${id}`, {
        method: 'DELETE',
      });

      const result: ClassificationApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '刪除分類失敗');
      }
    } catch (error) {
      console.error('刪除分類失敗:', error);
      throw error;
    }
  }

  // ============ 分類規則管理 ============

  /**
   * 獲取所有分類規則
   */
  async getRules(): Promise<ClassificationRule[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/classification/rules`);
      const result: ClassificationApiResponse<ClassificationRule[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '獲取規則失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('獲取規則失敗:', error);
      throw error;
    }
  }

  /**
   * 創建分類規則
   */
  async createRule(rule: Omit<ClassificationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClassificationRule> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/classification/rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rule),
      });

      const result: ClassificationApiResponse<ClassificationRule> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '創建規則失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('創建規則失敗:', error);
      throw error;
    }
  }

  /**
   * 更新分類規則
   */
  async updateRule(id: string, updates: Partial<ClassificationRule>): Promise<ClassificationRule> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/classification/rules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result: ClassificationApiResponse<ClassificationRule> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '更新規則失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('更新規則失敗:', error);
      throw error;
    }
  }

  /**
   * 刪除分類規則
   */
  async deleteRule(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/classification/rules/${id}`, {
        method: 'DELETE',
      });

      const result: ClassificationApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '刪除規則失敗');
      }
    } catch (error) {
      console.error('刪除規則失敗:', error);
      throw error;
    }
  }

  // ============ AI 提供商管理 ============

  /**
   * 獲取 AI 提供商
   */
  async getProviders(): Promise<AIProvider[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/classification/providers`);
      const result: ClassificationApiResponse<AIProvider[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '獲取提供商失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('獲取提供商失敗:', error);
      throw error;
    }
  }

  /**
   * 創建 AI 提供商
   */
  async createProvider(provider: Omit<AIProvider, 'id'>): Promise<AIProvider> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/classification/providers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(provider),
      });

      const result: ClassificationApiResponse<AIProvider> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '創建提供商失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('創建提供商失敗:', error);
      throw error;
    }
  }

  /**
   * 測試 AI 提供商連接
   */
  async testProvider(id: string): Promise<{ success: boolean; message: string; latency?: number }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/classification/providers/${id}/test`, {
        method: 'POST',
      });

      const result: ClassificationApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '測試提供商失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('測試提供商失敗:', error);
      throw error;
    }
  }

  // ============ 分類執行 ============

  /**
   * 執行單個分類任務
   */
  async classifyText(ruleId: string, providerId: string, text: string): Promise<ClassificationTask> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/classification/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ruleId,
          providerId,
          inputData: text,
          inputType: 'text'
        }),
      });

      const result: ClassificationApiResponse<ClassificationTask> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '分類失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('分類失敗:', error);
      throw error;
    }
  }

  /**
   * 創建批量分類任務
   */
  async createBatch(batch: {
    name: string;
    description?: string;
    ruleId: string;
    providerId: string;
    inputData: string[];
  }): Promise<ClassificationBatch> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/classification/batches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });

      const result: ClassificationApiResponse<ClassificationBatch> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '創建批次失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('創建批次失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取批次狀態
   */
  async getBatchStatus(batchId: string): Promise<ClassificationBatch> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/classification/batches/${batchId}`);
      const result: ClassificationApiResponse<ClassificationBatch> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '獲取批次狀態失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('獲取批次狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 取消批次任務
   */
  async cancelBatch(batchId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/classification/batches/${batchId}/cancel`, {
        method: 'POST',
      });

      const result: ClassificationApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '取消批次失敗');
      }
    } catch (error) {
      console.error('取消批次失敗:', error);
      throw error;
    }
  }

  // ============ 統計和報告 ============

  /**
   * 獲取分類統計
   */
  async getStats(timeRange?: { start: Date; end: Date }): Promise<ClassificationStats> {
    try {
      const queryParams = new URLSearchParams();
      if (timeRange) {
        queryParams.set('start', timeRange.start.toISOString());
        queryParams.set('end', timeRange.end.toISOString());
      }

      const response = await fetch(`${this.apiBaseUrl}/api/classification/stats?${queryParams}`);
      const result: ClassificationApiResponse<ClassificationStats> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '獲取統計失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('獲取統計失敗:', error);
      throw error;
    }
  }

  /**
   * 導出分類結果
   */
  async exportResults(filters: {
    ruleId?: string;
    categoryId?: string;
    startDate?: Date;
    endDate?: Date;
    format: 'csv' | 'json' | 'xlsx';
  }): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.set(key, value instanceof Date ? value.toISOString() : value.toString());
        }
      });

      const response = await fetch(`${this.apiBaseUrl}/api/classification/export?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('導出失敗');
      }

      return await response.blob();
    } catch (error) {
      console.error('導出失敗:', error);
      throw error;
    }
  }

  // ============ 工具方法 ============

  /**
   * 驗證提示詞
   */
  async validatePrompt(prompt: string, categories: string[]): Promise<{
    isValid: boolean;
    suggestions?: string[];
    warnings?: string[];
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/classification/validate-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, categories }),
      });

      const result: ClassificationApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '驗證提示詞失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('驗證提示詞失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取提示詞模板
   */
  async getPromptTemplates(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    prompt: string;
    category: string;
  }>> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/classification/prompt-templates`);
      const result: ClassificationApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '獲取模板失敗');
      }

      return result.data!;
    } catch (error) {
      console.error('獲取模板失敗:', error);
      throw error;
    }
  }
}

// 創建單例實例
export const classificationService = new ClassificationService();
export default classificationService;
