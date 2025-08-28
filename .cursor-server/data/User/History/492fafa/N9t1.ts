/**
 * CVV 卡片服務層 - 處理所有 CVV 相關業務邏輯
 */

import { db as firestore, FieldValue } from '../utils/firebase-admin';
import {
  CVVCard,
  CVVStatus,
  CVVType,
  CVVLevel,
  CVVBatch,
  CVVImportRequest,
  CVVSearchFilter,
  CVVStats,
  CVVOrder,
  CVVTransaction,
  CVVApiResponse
} from '../types/cvv';
import * as crypto from 'crypto';

// 集合名稱
const COLLECTIONS = {
  CARDS: 'cvv_cards',
  BATCHES: 'cvv_batches',
  ORDERS: 'cvv_orders',
  TRANSACTIONS: 'cvv_transactions'
};

// 加密密鑰 (生產環境應從環境變量獲取)
const ENCRYPTION_KEY = process.env.CVV_ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

/**
 * CVV 服務類
 */
export class CVVService {
  private db = firestore;

  /**
   * 加密敏感數據
   */
  private encrypt(text: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * 解密敏感數據
   */
  private decrypt(text: string): string {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
      let decrypted = decipher.update(text, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('解密失敗:', error);
      return '';
    }
  }

  /**
   * 導入 CVV 卡片數據
   */
  async importCards(request: CVVImportRequest, userId: string): Promise<CVVApiResponse<CVVBatch>> {
    try {
      // 創建批次記錄
      const batch: CVVBatch = {
        name: `Import_${new Date().toISOString()}`,
        importDate: new Date(),
        totalCards: 0,
        validCards: 0,
        invalidCards: 0,
        duplicates: 0,
        source: request.format,
        status: 'processing',
        userId: userId,
        errorLog: []
      };

      // 保存批次記錄
      const batchRef = await this.db.collection(COLLECTIONS.BATCHES).add(batch);
      const batchId = batchRef.id;

      // 解析數據
      const cards = await this.parseImportData(request);
      batch.totalCards = cards.length;

      // 處理每張卡片
      const importedCards: CVVCard[] = [];
      const errors: string[] = [];

      for (const cardData of cards) {
        try {
          // 驗證卡片數據
          const validationResult = this.validateCard(cardData);
          if (!validationResult.valid) {
            batch.invalidCards++;
            errors.push(`卡片驗證失敗: ${validationResult.errors.join(', ')}`);
            continue;
          }

          // 檢查重複
          if (request.options?.skipDuplicates && cardData.cardNumber) {
            const isDuplicate = await this.checkDuplicate(cardData.cardNumber);
            if (isDuplicate) {
              batch.duplicates++;
              continue;
            }
          }

          // 準備卡片數據
          const card: CVVCard = {
            ...cardData as CVVCard,
            cardNumber: this.encrypt(cardData.cardNumber || ''),
            cvv: this.encrypt(cardData.cvv || ''),
            status: CVVStatus.AVAILABLE,
            batchId: batchId,
            importDate: new Date(),
            quality: this.calculateQuality(cardData),
            price: request.options?.autoPrice 
              ? this.calculateAutoPrice(cardData)
              : (cardData.price || request.options?.defaultPrice || 10),
            tags: request.options?.tags || []
          };

          // 保存卡片
          const cardRef = await this.db.collection(COLLECTIONS.CARDS).add(card);
          card.id = cardRef.id;
          importedCards.push(card);
          batch.validCards++;

        } catch (error) {
          batch.invalidCards++;
          errors.push(`處理卡片失敗: ${error}`);
        }
      }

      // 更新批次狀態
      batch.status = 'completed';
      batch.errorLog = errors;
      await this.db.collection(COLLECTIONS.BATCHES).doc(batchId).update({
        status: batch.status,
        errorLog: batch.errorLog,
        totalCards: batch.totalCards,
        validCards: batch.validCards,
        invalidCards: batch.invalidCards,
        duplicates: batch.duplicates
      });

      return {
        success: true,
        data: batch,
        message: `成功導入 ${batch.validCards} 張卡片`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message || '導入失敗',
        message: '處理導入請求時發生錯誤'
      };
    }
  }

  /**
   * 解析導入數據
   */
  private async parseImportData(request: CVVImportRequest): Promise<Partial<CVVCard>[]> {
    const cards: Partial<CVVCard>[] = [];

    switch (request.format) {
      case 'json':
        // JSON 格式直接解析
        if (Array.isArray(request.data)) {
          cards.push(...request.data);
        }
        break;

      case 'csv':
        // CSV 格式解析
        const lines = request.data.toString().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length !== headers.length) continue;
          
          const card: any = {};
          headers.forEach((header, index) => {
            card[header] = values[index];
          });
          cards.push(this.mapToCardFormat(card));
        }
        break;

      case 'txt':
        // TXT 格式解析 (假設格式為: 卡號|CVV|月|年|國家|價格)
        const txtLines = request.data.toString().split('\n');
        for (const line of txtLines) {
          const parts = line.split('|').map(p => p.trim());
          if (parts.length >= 4) {
            cards.push({
              cardNumber: parts[0],
              cvv: parts[1],
              expiryMonth: parts[2],
              expiryYear: parts[3],
              country: parts[4] || request.options?.defaultCountry || 'US',
              price: parseFloat(parts[5]) || request.options?.defaultPrice
            });
          }
        }
        break;

      default:
        throw new Error(`不支持的格式: ${request.format}`);
    }

    return cards;
  }

  /**
   * 映射到標準卡片格式
   */
  private mapToCardFormat(data: any): Partial<CVVCard> {
    return {
      cardNumber: data.cardNumber || data.card_number || data.number,
      cvv: data.cvv || data.cvv2 || data.cvc || data.securityCode,
      expiryMonth: data.expiryMonth || data.expiry_month || data.month || data.mm,
      expiryYear: data.expiryYear || data.expiry_year || data.year || data.yy,
      cardholderName: data.cardholderName || data.name || data.holder,
      country: data.country || data.countryCode || 'US',
      bank: data.bank || data.issuer,
      bin: data.bin || data.cardNumber?.substring(0, 6),
      zipCode: data.zipCode || data.zip || data.postalCode,
      state: data.state || data.province,
      city: data.city,
      address: data.address || data.street,
      phone: data.phone || data.phoneNumber,
      email: data.email,
      balance: parseFloat(data.balance || '0'),
      cardType: this.detectCardType(data.cardNumber || data.card_number || data.number),
      cardLevel: this.detectCardLevel(data)
    };
  }

  /**
   * 檢測卡片類型
   */
  private detectCardType(cardNumber: string): CVVType {
    if (!cardNumber) return CVVType.OTHER;
    
    const firstDigits = cardNumber.replace(/\s/g, '').substring(0, 4);
    
    if (firstDigits[0] === '4') return CVVType.VISA;
    if (firstDigits.startsWith('51') || firstDigits.startsWith('52') || 
        firstDigits.startsWith('53') || firstDigits.startsWith('54') || 
        firstDigits.startsWith('55')) return CVVType.MASTERCARD;
    if (firstDigits.startsWith('34') || firstDigits.startsWith('37')) return CVVType.AMEX;
    if (firstDigits.startsWith('6011') || firstDigits.startsWith('65')) return CVVType.DISCOVER;
    if (firstDigits.startsWith('62')) return CVVType.UNIONPAY;
    if (firstDigits.startsWith('35')) return CVVType.JCB;
    
    return CVVType.OTHER;
  }

  /**
   * 檢測卡片等級
   */
  private detectCardLevel(data: any): CVVLevel {
    const levelKeywords = {
      'platinum': CVVLevel.PLATINUM,
      'gold': CVVLevel.GOLD,
      'business': CVVLevel.BUSINESS,
      'corporate': CVVLevel.CORPORATE
    };

    const text = (data.level || data.cardLevel || data.type || '').toLowerCase();
    
    for (const [keyword, level] of Object.entries(levelKeywords)) {
      if (text.includes(keyword)) return level;
    }
    
    return CVVLevel.CLASSIC;
  }

  /**
   * 驗證卡片數據
   */
  private validateCard(card: Partial<CVVCard>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 驗證卡號
    if (!card.cardNumber || card.cardNumber.length < 13 || card.cardNumber.length > 19) {
      errors.push('無效的卡號長度');
    }

    // 驗證 CVV
    if (!card.cvv || card.cvv.length < 3 || card.cvv.length > 4) {
      errors.push('無效的 CVV 長度');
    }

    // 驗證有效期
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const expYear = parseInt(card.expiryYear || '0');
    const expMonth = parseInt(card.expiryMonth || '0');

    if (expMonth < 1 || expMonth > 12) {
      errors.push('無效的到期月份');
    }

    if (expYear < currentYear || 
        (expYear === currentYear && expMonth < currentMonth)) {
      errors.push('卡片已過期');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 檢查卡片是否重複
   */
  private async checkDuplicate(cardNumber: string): Promise<boolean> {
    const encryptedNumber = this.encrypt(cardNumber);
    const snapshot = await this.db.collection(COLLECTIONS.CARDS)
      .where('cardNumber', '==', encryptedNumber)
      .limit(1)
      .get();
    
    return !snapshot.empty;
  }

  /**
   * 計算卡片品質分數
   */
  private calculateQuality(card: Partial<CVVCard>): number {
    let score = 50; // 基礎分數

    // 有餘額加分
    if (card.balance && card.balance > 0) {
      score += Math.min(30, card.balance / 100);
    }

    // 高級卡片加分
    if (card.cardLevel === CVVLevel.PLATINUM) score += 15;
    else if (card.cardLevel === CVVLevel.GOLD) score += 10;
    else if (card.cardLevel === CVVLevel.BUSINESS) score += 10;
    else if (card.cardLevel === CVVLevel.CORPORATE) score += 15;

    // 有完整信息加分
    if (card.cardholderName) score += 2;
    if (card.address) score += 2;
    if (card.phone) score += 2;
    if (card.email) score += 2;
    if (card.zipCode) score += 2;

    return Math.min(100, Math.round(score));
  }

  /**
   * 自動計算價格
   */
  private calculateAutoPrice(card: Partial<CVVCard>): number {
    let basePrice = 10;

    // 根據卡片類型
    if (card.cardType === CVVType.AMEX) basePrice = 15;
    else if (card.cardType === CVVType.VISA || card.cardType === CVVType.MASTERCARD) basePrice = 12;

    // 根據卡片等級
    if (card.cardLevel === CVVLevel.PLATINUM) basePrice *= 2;
    else if (card.cardLevel === CVVLevel.GOLD) basePrice *= 1.5;
    else if (card.cardLevel === CVVLevel.BUSINESS) basePrice *= 1.3;
    else if (card.cardLevel === CVVLevel.CORPORATE) basePrice *= 1.8;

    // 根據餘額
    if (card.balance && card.balance > 0) {
      basePrice += card.balance * 0.01; // 每 100 美元餘額加 1 美元
    }

    // 根據國家 (美國卡片價格更高)
    if (card.country === 'US') basePrice *= 1.2;
    else if (card.country === 'UK' || card.country === 'CA') basePrice *= 1.1;

    return Math.round(basePrice);
  }

  /**
   * 搜索 CVV 卡片
   */
  async searchCards(filter: CVVSearchFilter): Promise<CVVApiResponse<CVVCard[]>> {
    try {
      let query = this.db.collection(COLLECTIONS.CARDS) as any;

      // 應用過濾器
      if (filter.status && filter.status.length > 0) {
        query = query.where('status', 'in', filter.status);
      }

      if (filter.cardTypes && filter.cardTypes.length > 0) {
        query = query.where('cardType', 'in', filter.cardTypes);
      }

      if (filter.countries && filter.countries.length > 0) {
        query = query.where('country', 'in', filter.countries);
      }

      if (filter.minPrice !== undefined) {
        query = query.where('price', '>=', filter.minPrice);
      }

      if (filter.maxPrice !== undefined) {
        query = query.where('price', '<=', filter.maxPrice);
      }

      if (filter.hasBalance) {
        query = query.where('balance', '>', 0);
      }

      if (filter.refundable !== undefined) {
        query = query.where('refundable', '==', filter.refundable);
      }

      // 排序
      const sortBy = filter.sortBy || 'importDate';
      const sortOrder = filter.sortOrder || 'desc';
      query = query.orderBy(sortBy, sortOrder);

      // 分頁
      const limit = filter.limit || 20;
      const page = filter.page || 1;
      const offset = (page - 1) * limit;
      
      query = query.limit(limit).offset(offset);

      // 執行查詢
      const snapshot = await query.get();
      const cards: CVVCard[] = [];

      snapshot.forEach((doc: any) => {
        const card = { id: doc.id, ...doc.data() } as CVVCard;
        // 不解密敏感數據在列表中
        card.cardNumber = '****' + card.cardNumber.slice(-4);
        card.cvv = '***';
        cards.push(card);
      });

      // 獲取總數
      const totalSnapshot = await this.db.collection(COLLECTIONS.CARDS)
        .where('status', '==', CVVStatus.AVAILABLE)
        .get();
      const total = totalSnapshot.size;

      return {
        success: true,
        data: cards,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };

    } catch (error: any) {
      return {
        success: false,
        error: error?.message || '搜索失敗',
        data: []
      };
    }
  }

  /**
   * 獲取單張卡片詳情
   */
  async getCard(cardId: string, decrypt: boolean = false): Promise<CVVApiResponse<CVVCard>> {
    try {
      const doc = await this.db.collection(COLLECTIONS.CARDS).doc(cardId).get();
      
      if (!doc.exists) {
        return {
          success: false,
          error: '卡片不存在'
        };
      }

      const card = { id: doc.id, ...doc.data() } as CVVCard;

      // 根據需要解密敏感數據
      if (decrypt) {
        card.cardNumber = this.decrypt(card.cardNumber);
        card.cvv = this.decrypt(card.cvv);
      } else {
        card.cardNumber = '****' + card.cardNumber.slice(-4);
        card.cvv = '***';
      }

      return {
        success: true,
        data: card
      };

    } catch (error: any) {
      return {
        success: false,
        error: error?.message || '獲取卡片失敗'
      };
    }
  }

  /**
   * 更新卡片狀態
   */
  async updateCardStatus(cardId: string, status: CVVStatus): Promise<CVVApiResponse<void>> {
    try {
      await this.db.collection(COLLECTIONS.CARDS).doc(cardId).update({
        status,
        lastUpdated: new Date()
      });

      return {
        success: true,
        message: '狀態更新成功'
      };

    } catch (error: any) {
      return {
        success: false,
        error: error?.message || '更新失敗'
      };
    }
  }

  /**
   * 批量更新卡片狀態
   */
  async batchUpdateStatus(cardIds: string[], status: CVVStatus): Promise<CVVApiResponse<void>> {
    try {
      const batch = this.db.batch();

      for (const cardId of cardIds) {
        const ref = this.db.collection(COLLECTIONS.CARDS).doc(cardId);
        batch.update(ref, {
          status,
          lastUpdated: new Date()
        });
      }

      await batch.commit();

      return {
        success: true,
        message: `成功更新 ${cardIds.length} 張卡片的狀態`
      };

    } catch (error: any) {
      return {
        success: false,
        error: error?.message || '批量更新失敗'
      };
    }
  }

  /**
   * 刪除卡片
   */
  async deleteCard(cardId: string): Promise<CVVApiResponse<void>> {
    try {
      await this.db.collection(COLLECTIONS.CARDS).doc(cardId).delete();

      return {
        success: true,
        message: '卡片刪除成功'
      };

    } catch (error: any) {
      return {
        success: false,
        error: error?.message || '刪除失敗'
      };
    }
  }

  /**
   * 獲取庫存統計
   */
  async getInventoryStats(): Promise<CVVApiResponse<CVVStats>> {
    try {
      const snapshot = await this.db.collection(COLLECTIONS.CARDS).get();
      
      const stats: CVVStats = {
        total: 0,
        available: 0,
        sold: 0,
        reserved: 0,
        invalid: 0,
        expired: 0,
        totalValue: 0,
        averagePrice: 0,
        byCountry: {},
        byCardType: {},
        byCardLevel: {},
        byBank: {},
        dailySales: [],
        topSelling: []
      };

      let totalPrice = 0;
      const cards: CVVCard[] = [];

      snapshot.forEach((doc: any) => {
        const card = doc.data() as CVVCard;
        cards.push(card);
        
        stats.total++;
        
        // 按狀態統計
        switch (card.status) {
          case CVVStatus.AVAILABLE:
            stats.available++;
            totalPrice += card.price;
            break;
          case CVVStatus.SOLD:
            stats.sold++;
            break;
          case CVVStatus.RESERVED:
            stats.reserved++;
            break;
          case CVVStatus.INVALID:
            stats.invalid++;
            break;
          case CVVStatus.EXPIRED:
            stats.expired++;
            break;
        }

        // 按國家統計
        stats.byCountry[card.country] = (stats.byCountry[card.country] || 0) + 1;

        // 按卡類型統計
        stats.byCardType[card.cardType] = (stats.byCardType[card.cardType] || 0) + 1;

        // 按卡等級統計
        if (card.cardLevel) {
          stats.byCardLevel[card.cardLevel] = (stats.byCardLevel[card.cardLevel] || 0) + 1;
        }

        // 按銀行統計
        if (card.bank) {
          stats.byBank[card.bank] = (stats.byBank[card.bank] || 0) + 1;
        }
      });

      stats.totalValue = totalPrice;
      stats.averagePrice = stats.available > 0 ? totalPrice / stats.available : 0;

      // 獲取最近 30 天的銷售數據
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const salesSnapshot = await this.db.collection(COLLECTIONS.ORDERS)
        .where('orderDate', '>=', thirtyDaysAgo)
        .where('paymentStatus', '==', 'completed')
        .orderBy('orderDate', 'desc')
        .get();

      const dailySalesMap = new Map<string, { count: number; revenue: number }>();

      salesSnapshot.forEach((doc: any) => {
        const order = doc.data() as CVVOrder;
        const dateKey = order.orderDate.toISOString().split('T')[0];
        
        const existing = dailySalesMap.get(dateKey) || { count: 0, revenue: 0 };
        existing.count += order.cards.length;
        existing.revenue += order.totalAmount;
        dailySalesMap.set(dateKey, existing);
      });

      stats.dailySales = Array.from(dailySalesMap.entries()).map(([date, data]) => ({
        date,
        count: data.count,
        revenue: data.revenue
      }));

      // 獲取熱銷卡片 (最近售出的前 10 張)
      const topSellingSnapshot = await this.db.collection(COLLECTIONS.CARDS)
        .where('status', '==', CVVStatus.SOLD)
        .orderBy('soldDate', 'desc')
        .limit(10)
        .get();

      topSellingSnapshot.forEach((doc: any) => {
        const card = { id: doc.id, ...doc.data() } as CVVCard;
        card.cardNumber = '****' + card.cardNumber.slice(-4);
        card.cvv = '***';
        stats.topSelling.push(card);
      });

      return {
        success: true,
        data: stats
      };

    } catch (error: any) {
      return {
        success: false,
        error: error?.message || '獲取統計失敗'
      };
    }
  }

  /**
   * 檢查卡片餘額 (模擬)
   */
  async checkBalance(cardId: string): Promise<CVVApiResponse<number>> {
    try {
      // 這裡應該調用實際的餘額檢查 API
      // 現在只是模擬
      const randomBalance = Math.random() * 1000;
      
      // 更新卡片餘額
      await this.db.collection(COLLECTIONS.CARDS).doc(cardId).update({
        balance: randomBalance,
        lastCheckedDate: new Date(),
        checkCount: FieldValue.increment(1)
      });

      return {
        success: true,
        data: randomBalance,
        message: `餘額: $${randomBalance.toFixed(2)}`
      };

    } catch (error: any) {
      return {
        success: false,
        error: error?.message || '檢查餘額失敗'
      };
    }
  }
}

// 導出單例實例
export const cvvService = new CVVService();
