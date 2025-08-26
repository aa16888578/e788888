import { CreditCard, AIClassification, CardCategory, QualityLevel, RiskLevel } from '@/types';

// AI分類服務
export class AIClassificationService {
  private static instance: AIClassificationService;
  
  private constructor() {}
  
  public static getInstance(): AIClassificationService {
    if (!AIClassificationService.instance) {
      AIClassificationService.instance = new AIClassificationService();
    }
    return AIClassificationService.instance;
  }

  // 智能分類信用卡
  public async classifyCard(card: CreditCard): Promise<AIClassification> {
    try {
      // 模擬AI處理時間
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 特徵提取
      const features = this.extractFeatures(card);
      
      // 預測分類
      const predictedCategory = this.predictCategory(features);
      
      // 預測質量
      const predictedQuality = this.predictQuality(features);
      
      // 計算置信度
      const confidence = this.calculateConfidence(features);
      
      // 風險評估
      const riskAssessment = this.assessRisk(features);
      
      // 計算AI分數
      const aiScore = this.calculateAIScore(features, confidence);
      
      // 生成建議
      const recommendations = this.generateRecommendations(features, predictedCategory, predictedQuality);
      
      return {
        cardId: card.id,
        predictedCategory,
        predictedQuality,
        confidence,
        features,
        recommendations,
        riskAssessment,
        aiScore
      };
    } catch (error) {
      console.error('AI分類失敗:', error);
      throw new Error('AI分類服務暫時不可用');
    }
  }

  // 批量分類
  public async classifyBatch(cards: CreditCard[]): Promise<AIClassification[]> {
    const results: AIClassification[] = [];
    
    for (const card of cards) {
      try {
        const classification = await this.classifyCard(card);
        results.push(classification);
      } catch (error) {
        console.error(`卡片 ${card.id} 分類失敗:`, error);
      }
    }
    
    return results;
  }

  // 特徵提取
  private extractFeatures(card: CreditCard) {
    const now = new Date();
    const expiryDate = new Date(card.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      cardType: this.encodeCardType(card.cardType),
      country: this.encodeCountry(card.country),
      bank: this.encodeBank(card.bank),
      expiryDate: Math.max(0, daysUntilExpiry),
      price: card.price,
      successRate: card.successRate,
      usageCount: card.usageCount
    };
  }

  // 預測分類
  private predictCategory(features: any): CardCategory {
    const scores = {
      [CardCategory.FULL_FUND]: 0,
      [CardCategory.NAKED_FUND]: 0,
      [CardCategory.SPECIAL_OFFER]: 0,
      [CardCategory.GLOBAL_BIN]: 0,
      [CardCategory.MERCHANT_BASE]: 0
    };

    // 基於特徵計算各分類的得分
    if (features.successRate >= 70) {
      scores[CardCategory.FULL_FUND] += 3;
      scores[CardCategory.PREMIUM] += 2;
    }
    
    if (features.price >= 100) {
      scores[CardCategory.FULL_FUND] += 2;
      scores[CardCategory.MERCHANT_BASE] += 1;
    }
    
    if (features.expiryDate <= 30) {
      scores[CardCategory.SPECIAL_OFFER] += 2;
    }
    
    if (features.usageCount === 0) {
      scores[CardCategory.NAKED_FUND] += 2;
    }

    // 返回得分最高的分類
    return Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0] as CardCategory;
  }

  // 預測質量
  private predictQuality(features: any): QualityLevel {
    let score = 0;
    
    // 基於成功率
    if (features.successRate >= 80) score += 4;
    else if (features.successRate >= 60) score += 3;
    else if (features.successRate >= 40) score += 2;
    else score += 1;
    
    // 基於價格
    if (features.price >= 150) score += 3;
    else if (features.price >= 100) score += 2;
    else if (features.price >= 50) score += 1;
    
    // 基於有效期
    if (features.expiryDate >= 365) score += 2;
    else if (features.expiryDate >= 180) score += 1;
    
    // 基於使用次數
    if (features.usageCount === 0) score += 1;

    if (score >= 8) return QualityLevel.PREMIUM;
    if (score >= 6) return QualityLevel.HIGH;
    if (score >= 4) return QualityLevel.MEDIUM;
    if (score >= 2) return QualityLevel.STANDARD;
    return QualityLevel.BASIC;
  }

  // 計算置信度
  private calculateConfidence(features: any): number {
    let confidence = 0.5; // 基礎置信度
    
    // 基於數據完整性
    if (features.cardType !== -1) confidence += 0.1;
    if (features.country !== -1) confidence += 0.1;
    if (features.bank !== -1) confidence += 0.1;
    
    // 基於數據一致性
    if (features.successRate > 0 && features.successRate <= 100) confidence += 0.1;
    if (features.price > 0) confidence += 0.1;
    
    // 基於數據新鮮度
    if (features.expiryDate > 0) confidence += 0.1;
    
    return Math.min(0.95, confidence);
  }

  // 風險評估
  private assessRisk(features: any): RiskLevel {
    let riskScore = 0;
    
    // 基於成功率
    if (features.successRate < 30) riskScore += 3;
    else if (features.successRate < 50) riskScore += 2;
    else if (features.successRate < 70) riskScore += 1;
    
    // 基於有效期
    if (features.expiryDate < 30) riskScore += 2;
    else if (features.expiryDate < 90) riskScore += 1;
    
    // 基於使用次數
    if (features.usageCount > 10) riskScore += 2;
    else if (features.usageCount > 5) riskScore += 1;
    
    // 基於價格異常
    if (features.price > 200 || features.price < 10) riskScore += 1;

    if (riskScore >= 6) return RiskLevel.CRITICAL;
    if (riskScore >= 4) return RiskLevel.HIGH;
    if (riskScore >= 2) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  // 計算AI分數
  private calculateAIScore(features: any, confidence: number): number {
    let score = 0;
    
    // 基礎分數
    score += features.successRate * 0.3;
    score += Math.min(features.price / 10, 10);
    score += Math.min(features.expiryDate / 30, 5);
    
    // 置信度加成
    score *= confidence;
    
    // 風險減分
    const riskLevel = this.assessRisk(features);
    switch (riskLevel) {
      case RiskLevel.CRITICAL: score *= 0.3; break;
      case RiskLevel.HIGH: score *= 0.6; break;
      case RiskLevel.MEDIUM: score *= 0.8; break;
      case RiskLevel.LOW: score *= 1.0; break;
    }
    
    return Math.round(score * 100) / 100;
  }

  // 生成建議
  private generateRecommendations(features: any, category: CardCategory, quality: QualityLevel): string[] {
    const recommendations: string[] = [];
    
    // 基於分類的建議
    switch (category) {
      case CardCategory.FULL_FUND:
        recommendations.push('建議優先推廣，高成功率保證');
        recommendations.push('適合高端客戶群體');
        break;
      case CardCategory.SPECIAL_OFFER:
        recommendations.push('建議快速銷售，避免過期');
        recommendations.push('可考慮批量優惠');
        break;
      case CardCategory.NAKED_FUND:
        recommendations.push('新卡數據，建議測試後推廣');
        break;
    }
    
    // 基於質量的建議
    if (quality === QualityLevel.PREMIUM) {
      recommendations.push('頂級品質，建議高價定位');
    } else if (quality === QualityLevel.BASIC) {
      recommendations.push('基礎品質，建議低價快速出貨');
    }
    
    // 基於風險的建議
    const riskLevel = this.assessRisk(features);
    if (riskLevel === RiskLevel.HIGH || riskLevel === RiskLevel.CRITICAL) {
      recommendations.push('高風險卡片，建議謹慎處理');
    }
    
    return recommendations;
  }

  // 編碼卡片類型
  private encodeCardType(cardType: string): number {
    const encoding: { [key: string]: number } = {
      'VISA': 1,
      'MASTERCARD': 2,
      'AMEX': 3,
      'DISCOVER': 4,
      'JCB': 5,
      'UNIONPAY': 6
    };
    return encoding[cardType] || -1;
  }

  // 編碼國家
  private encodeCountry(country: string): number {
    // 簡化的國家編碼，實際應用中可以使用更完整的映射
    const encoding: { [key: string]: number } = {
      'US': 1, 'GB': 2, 'DE': 3, 'FR': 4, 'JP': 5,
      'CN': 6, 'KR': 7, 'BR': 8, 'IN': 9, 'RU': 10
    };
    return encoding[country] || -1;
  }

  // 編碼銀行
  private encodeBank(bank: string): number {
    // 簡化的銀行編碼，實際應用中可以使用更完整的映射
    const encoding: { [key: string]: number } = {
      'Chase': 1, 'Bank of America': 2, 'Wells Fargo': 3,
      'Citibank': 4, 'Capital One': 5, 'American Express': 6
    };
    return encoding[bank] || -1;
  }

  // 獲取AI模型狀態
  public getModelStatus(): { status: string; version: string; lastUpdated: Date } {
    return {
      status: 'ACTIVE',
      version: '1.0.0',
      lastUpdated: new Date()
    };
  }

  // 更新AI模型
  public async updateModel(): Promise<boolean> {
    try {
      // 模擬模型更新過程
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    } catch (error) {
      console.error('模型更新失敗:', error);
      return false;
    }
  }
}

// 導出單例實例
export const aiClassificationService = AIClassificationService.getInstance();
