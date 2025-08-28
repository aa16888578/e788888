// AI 智能篩選服務
// 為前端用戶提供智能 CVV 卡片篩選和信息提取

import { CVVCard } from '@/types/cvv';

export interface AIFilterRequest {
  category: 'all_cards' | 'global_inventory' | 'premium_cards' | 'hot_deals';
  filters?: {
    country?: string;
    cardType?: string;
    priceRange?: [number, number];
    successRateMin?: number;
    balanceMin?: number;
  };
  extractFields: string[]; // 需要提取的字段，如 ['bankBin', 'country', 'successRate']
  limit?: number;
  showSensitiveInfo?: boolean; // 是否顯示敏感信息（僅管理員）
}

export interface AIFilterResult {
  cards: CVVCardSummary[];
  summary: {
    totalCount: number;
    averagePrice: number;
    averageSuccessRate: number;
    topCountries: Array<{ country: string; count: number; }>;
    topBins: Array<{ bin: string; bank: string; count: number; }>;
  };
  aiInsights: {
    recommendation: string;
    qualityScore: number;
    riskAssessment: string;
    bestValue: string;
  };
}

export interface CVVCardSummary {
  id: string;
  // 安全信息（前端可顯示）
  bankBin: string;           // 卡號前6碼
  cardType: string;          // 卡片類型
  bankName: string;          // 銀行名稱
  country: string;           // 國家代碼
  countryName: string;       // 國家名稱
  
  // 商業信息
  price: number;
  successRate: string;
  category: string;
  quality: string;
  
  // AI 評估
  aiScore: number;           // AI 品質評分 (0-100)
  aiRecommendation: string;  // AI 推薦理由
  
  // 脫敏顯示
  maskedCardNumber: string;  // 如 "4532****1234"
  safePreview: string;       // 安全預覽格式
}

class AIFilterService {
  private apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  /**
   * AI 智能篩選 CVV 卡片
   */
  async filterCards(request: AIFilterRequest): Promise<AIFilterResult> {
    try {
      // 模擬 AI 篩選邏輯（實際應該調用後端 API）
      const mockCards = this.generateMockCards(request);
      const summary = this.generateSummary(mockCards);
      const aiInsights = await this.generateAIInsights(mockCards, request);

      return {
        cards: mockCards,
        summary,
        aiInsights
      };
    } catch (error) {
      console.error('AI 篩選失敗:', error);
      throw new Error('AI 篩選服務暫時不可用');
    }
  }

  /**
   * 根據分類獲取 CVV 卡片
   */
  async getCardsByCategory(category: string, limit: number = 20): Promise<AIFilterResult> {
    const request: AIFilterRequest = {
      category: category as any,
      extractFields: ['bankBin', 'country', 'successRate', 'price'],
      limit,
      showSensitiveInfo: false
    };

    return this.filterCards(request);
  }

  /**
   * 生成模擬卡片數據
   */
  private generateMockCards(request: AIFilterRequest): CVVCardSummary[] {
    const countries = [
      { code: 'US', name: '美國', flag: '🇺🇸' },
      { code: 'CA', name: '加拿大', flag: '🇨🇦' },
      { code: 'GB', name: '英國', flag: '🇬🇧' },
      { code: 'AU', name: '澳洲', flag: '🇦🇺' },
      { code: 'DE', name: '德國', flag: '🇩🇪' },
      { code: 'FR', name: '法國', flag: '🇫🇷' },
      { code: 'AR', name: '阿根廷', flag: '🇦🇷' },
      { code: 'BR', name: '巴西', flag: '🇧🇷' },
    ];

    const banks = [
      { bin: '453201', name: 'Chase Bank', type: 'visa' },
      { bin: '542312', name: 'Bank of America', type: 'mastercard' },
      { bin: '411234', name: 'Wells Fargo', type: 'visa' },
      { bin: '523456', name: 'Citibank', type: 'mastercard' },
      { bin: '478901', name: 'Capital One', type: 'visa' },
      { bin: '556789', name: 'TD Bank', type: 'mastercard' },
      { bin: '434567', name: 'HSBC', type: 'visa' },
      { bin: '515234', name: 'RBC Royal Bank', type: 'mastercard' },
    ];

    const cards: CVVCardSummary[] = [];
    const limit = request.limit || 20;

    for (let i = 0; i < limit; i++) {
      const country = countries[Math.floor(Math.random() * countries.length)];
      const bank = banks[Math.floor(Math.random() * banks.length)];
      const price = Math.floor(Math.random() * 50) + 10; // $10-$60
      const successRate = Math.floor(Math.random() * 40) + 60; // 60%-100%
      const aiScore = Math.floor(Math.random() * 30) + 70; // 70-100

      cards.push({
        id: `card_${i + 1}`,
        bankBin: bank.bin,
        cardType: bank.type,
        bankName: bank.name,
        country: country.code,
        countryName: `${country.flag} ${country.name}`,
        price,
        successRate: `${successRate}%`,
        category: this.getCategoryByPrice(price),
        quality: this.getQualityByScore(aiScore),
        aiScore,
        aiRecommendation: this.generateRecommendation(aiScore, successRate),
        maskedCardNumber: `${bank.bin}****${Math.floor(Math.random() * 9000) + 1000}`,
        safePreview: `${country.flag} ${country.name} | ${bank.name} | $${price} | ${successRate}% 成功率`
      });
    }

    return cards.sort((a, b) => b.aiScore - a.aiScore); // 按 AI 評分排序
  }

  private getCategoryByPrice(price: number): string {
    if (price >= 40) return 'premium';
    if (price >= 25) return 'hot';
    return 'basic';
  }

  private getQualityByScore(score: number): string {
    if (score >= 90) return 'high';
    if (score >= 75) return 'medium';
    return 'low';
  }

  private generateRecommendation(aiScore: number, successRate: number): string {
    if (aiScore >= 90) return '🌟 頂級推薦 - 高品質卡片';
    if (aiScore >= 80) return '⭐ 強力推薦 - 性價比優秀';
    if (successRate >= 80) return '✅ 推薦 - 成功率高';
    return '💡 可考慮 - 價格實惠';
  }

  /**
   * 生成統計摘要
   */
  private generateSummary(cards: CVVCardSummary[]) {
    const totalCount = cards.length;
    const averagePrice = cards.reduce((sum, card) => sum + card.price, 0) / totalCount;
    const averageSuccessRate = cards.reduce((sum, card) => sum + parseInt(card.successRate), 0) / totalCount;

    // 統計國家分佈
    const countryStats = new Map<string, number>();
    cards.forEach(card => {
      countryStats.set(card.countryName, (countryStats.get(card.countryName) || 0) + 1);
    });

    // 統計 BIN 分佈
    const binStats = new Map<string, { bank: string; count: number }>();
    cards.forEach(card => {
      const key = card.bankBin;
      binStats.set(key, {
        bank: card.bankName,
        count: (binStats.get(key)?.count || 0) + 1
      });
    });

    return {
      totalCount,
      averagePrice: Math.round(averagePrice * 100) / 100,
      averageSuccessRate: Math.round(averageSuccessRate),
      topCountries: Array.from(countryStats.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      topBins: Array.from(binStats.entries())
        .map(([bin, data]) => ({ bin, bank: data.bank, count: data.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    };
  }

  /**
   * 生成 AI 洞察
   */
  private async generateAIInsights(cards: CVVCardSummary[], request: AIFilterRequest) {
    // 模擬 AI 分析
    const highQualityCards = cards.filter(card => card.aiScore >= 85);
    const averagePrice = cards.reduce((sum, card) => sum + card.price, 0) / cards.length;
    const topCard = cards[0];

    return {
      recommendation: highQualityCards.length > 0 
        ? `推薦選擇 ${highQualityCards.length} 張高品質卡片，平均成功率超過 85%`
        : `當前批次品質中等，建議關注成功率較高的選項`,
      qualityScore: Math.round(cards.reduce((sum, card) => sum + card.aiScore, 0) / cards.length),
      riskAssessment: averagePrice > 30 
        ? '中等風險 - 價格偏高但品質較好'
        : '低風險 - 價格合理，適合批量購買',
      bestValue: topCard 
        ? `最佳選擇: ${topCard.countryName} ${topCard.bankName} (評分: ${topCard.aiScore})`
        : '暫無推薦'
    };
  }

  /**
   * 根據 BIN 獲取銀行信息
   */
  async getBankInfoByBin(bin: string): Promise<{ bank: string; country: string; cardType: string } | null> {
    try {
      // 模擬 BIN 查詢 API
      const binDatabase = {
        '453201': { bank: 'Chase Bank', country: '🇺🇸 美國', cardType: 'Visa' },
        '542312': { bank: 'Bank of America', country: '🇺🇸 美國', cardType: 'MasterCard' },
        '411234': { bank: 'Wells Fargo', country: '🇺🇸 美國', cardType: 'Visa' },
        '523456': { bank: 'Citibank', country: '🇺🇸 美國', cardType: 'MasterCard' },
      };

      return binDatabase[bin as keyof typeof binDatabase] || null;
    } catch (error) {
      console.error('BIN 查詢失敗:', error);
      return null;
    }
  }
}

export const aiFilterService = new AIFilterService();
export default aiFilterService;
