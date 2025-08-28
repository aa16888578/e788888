// AI 分類系統類型定義

export interface ClassificationCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  parentId?: string; // 支持層級分類
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassificationRule {
  id: string;
  name: string;
  description: string;
  categories: string[]; // 可選分類的 ID 列表
  prompt: string; // AI 提示詞
  systemPrompt?: string; // 系統提示詞
  temperature: number; // AI 創造性參數 (0-1)
  maxTokens: number; // 最大回應長度
  isActive: boolean;
  priority: number; // 優先級，數字越小優先級越高
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface AIProvider {
  id: string;
  name: string;
  type: 'openai' | 'claude' | 'gemini' | 'custom';
  apiEndpoint: string;
  model: string;
  isActive: boolean;
  rateLimitPerMinute: number;
  costPerToken: number;
}

export interface ClassificationTask {
  id: string;
  ruleId: string;
  providerId: string;
  inputData: string; // 待分類的數據
  inputType: 'text' | 'image' | 'file';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: ClassificationResult;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  processingTime?: number; // 毫秒
  tokenUsed?: number;
  cost?: number;
}

export interface ClassificationResult {
  categoryId: string;
  categoryName: string;
  confidence: number; // 0-1 置信度
  reasoning?: string; // AI 的推理過程
  alternatives?: Array<{
    categoryId: string;
    categoryName: string;
    confidence: number;
  }>;
  metadata?: Record<string, any>;
}

export interface ClassificationBatch {
  id: string;
  name: string;
  description?: string;
  ruleId: string;
  providerId: string;
  tasks: ClassificationTask[];
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  successRate: number;
  totalCost: number;
  totalTokens: number;
  averageProcessingTime: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdBy: string;
}

export interface ClassificationStats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  successRate: number;
  totalCost: number;
  totalTokens: number;
  averageProcessingTime: number;
  
  // 按分類統計
  categoryStats: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
    percentage: number;
  }>;
  
  // 按規則統計
  ruleStats: Array<{
    ruleId: string;
    ruleName: string;
    tasks: number;
    successRate: number;
    averageConfidence: number;
  }>;
  
  // 按提供商統計
  providerStats: Array<{
    providerId: string;
    providerName: string;
    tasks: number;
    cost: number;
    tokens: number;
    averageTime: number;
  }>;
}

// API 響應類型
export interface ClassificationApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// AI API 配置
export interface AIApiConfig {
  provider: 'openai' | 'claude' | 'gemini';
  apiKey: string;
  model: string;
  baseURL?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}
