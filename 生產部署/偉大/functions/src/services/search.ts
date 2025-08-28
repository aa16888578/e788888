import { DatabaseService } from './database';
import { Product, SearchQuery, SearchResult, ProductFilters } from '../types';

// 商品搜尋服務類
export class SearchService {
  private static db = new DatabaseService();

  // 搜尋商品
  static async searchProducts(query: SearchQuery): Promise<SearchResult> {
    try {
      let productsQuery = this.db.db.collection('products')
        .where('status', '==', 'active');

      // 應用分類過濾
      if (query.category) {
        productsQuery = productsQuery.where('category', '==', query.category);
      }

      // 應用特色商品過濾
      if (query.featured !== undefined) {
        productsQuery = productsQuery.where('featured', '==', query.featured);
      }

      // 獲取所有符合條件的商品
      const snapshot = await productsQuery.get();
      let products = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Product[];

      // 應用文本搜尋
      if (query.query && query.query.trim()) {
        const searchTerm = query.query.toLowerCase().trim();
        products = products.filter(product => 
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
      }

      // 應用價格過濾
      if (query.minPrice !== undefined) {
        products = products.filter(product => product.price >= query.minPrice!);
      }
      if (query.maxPrice !== undefined) {
        products = products.filter(product => product.price <= query.maxPrice!);
      }

      // 應用排序
      products = this.sortProducts(products, query.sortBy, query.sortOrder);

      // 應用分頁
      const page = query.page || 1;
      const limit = query.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = products.slice(startIndex, endIndex);

      const total = products.length;
      const totalPages = Math.ceil(total / limit);

      return {
        products: paginatedProducts,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        filters: {
          category: query.category,
          minPrice: query.minPrice,
          maxPrice: query.maxPrice,
          featured: query.featured,
          status: 'active'
        }
      };
    } catch (error) {
      console.error('搜尋商品失敗:', error);
      throw error;
    }
  }

  // 排序商品
  private static sortProducts(products: Product[], sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): Product[] {
    const order = sortOrder === 'asc' ? 1 : -1;

    switch (sortBy) {
      case 'name':
        return products.sort((a, b) => a.name.localeCompare(b.name) * order);
      
      case 'price':
        return products.sort((a, b) => (a.price - b.price) * order);
      
      case 'createdAt':
        return products.sort((a, b) => (a.createdAt.getTime() - b.createdAt.getTime()) * order);
      
      case 'popularity':
        // 這裡可以根據實際需求實現熱門度排序
        return products.sort((a, b) => (a.sortOrder - b.sortOrder) * order);
      
      default:
        return products.sort((a, b) => (a.sortOrder - b.sortOrder) * order);
    }
  }

  // 搜尋建議
  static async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const searchTerm = query.toLowerCase().trim();
      const suggestions = new Set<string>();

      // 從商品名稱獲取建議
      const nameSnapshot = await this.db.db.collection('products')
        .where('status', '==', 'active')
        .get();

      nameSnapshot.docs.forEach(doc => {
        const product = doc.data() as Product;
        if (product.name.toLowerCase().includes(searchTerm)) {
          suggestions.add(product.name);
        }
      });

      // 從分類獲取建議
      const categorySnapshot = await this.db.db.collection('categories')
        .where('status', '==', 'active')
        .get();

      categorySnapshot.docs.forEach(doc => {
        const category = doc.data();
        if (category.name.toLowerCase().includes(searchTerm)) {
          suggestions.add(category.name);
        }
      });

      // 從標籤獲取建議
      const tagSnapshot = await this.db.db.collection('products')
        .where('status', '==', 'active')
        .get();

      tagSnapshot.docs.forEach(doc => {
        const product = doc.data() as Product;
        if (product.tags) {
          product.tags.forEach(tag => {
            if (tag.toLowerCase().includes(searchTerm)) {
              suggestions.add(tag);
            }
          });
        }
      });

      return Array.from(suggestions).slice(0, limit);
    } catch (error) {
      console.error('獲取搜尋建議失敗:', error);
      return [];
    }
  }

  // 熱門搜尋詞
  static async getPopularSearchTerms(limit: number = 10): Promise<string[]> {
    try {
      // 這裡可以實現基於用戶搜尋歷史的熱門詞統計
      // 暫時返回一些預設的熱門詞
      return [
        '手機',
        '電腦',
        '服裝',
        '鞋子',
        '包包',
        '化妝品',
        '數碼產品',
        '家居用品',
        '運動用品',
        '書籍'
      ].slice(0, limit);
    } catch (error) {
      console.error('獲取熱門搜尋詞失敗:', error);
      return [];
    }
  }

  // 相關商品推薦
  static async getRelatedProducts(productId: string, limit: number = 5): Promise<Product[]> {
    try {
      const product = await this.db.getProduct(productId);
      if (!product) {
        return [];
      }

      // 基於分類和標籤推薦相關商品
      const relatedQuery = this.db.db.collection('products')
        .where('status', '==', 'active')
        .where('category', '==', product.category)
        .limit(limit + 1); // +1 是為了排除當前商品

      const snapshot = await relatedQuery.get();
      let relatedProducts = snapshot.docs
        .map(doc => ({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate()
        }))
        .filter(p => p.id !== productId) as Product[];

      // 如果分類相關商品不足，添加標籤相關商品
      if (relatedProducts.length < limit && product.tags && product.tags.length > 0) {
        const tagQuery = this.db.db.collection('products')
          .where('status', '==', 'active')
          .limit(limit);

        const tagSnapshot = await tagQuery.get();
        const tagProducts = tagSnapshot.docs
          .map(doc => ({
            ...doc.data(),
            id: doc.id,
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate()
          }))
          .filter(p => p.id !== productId && !relatedProducts.find(rp => rp.id === p.id)) as Product[];

        relatedProducts = [...relatedProducts, ...tagProducts];
      }

      return relatedProducts.slice(0, limit);
    } catch (error) {
      console.error('獲取相關商品失敗:', error);
      return [];
    }
  }

  // 高級搜尋
  static async advancedSearch(filters: ProductFilters, sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): Promise<Product[]> {
    try {
      let query = this.db.db.collection('products')
        .where('status', '==', 'active');

      // 應用分類過濾
      if (filters.category) {
        query = query.where('category', '==', filters.category);
      }

      // 應用子分類過濾
      if (filters.subcategory) {
        query = query.where('subcategory', '==', filters.subcategory);
      }

      // 應用特色商品過濾
      if (filters.featured !== undefined) {
        query = query.where('featured', '==', filters.featured);
      }

      const snapshot = await query.get();
      let products = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Product[];

      // 應用價格過濾
      if (filters.minPrice !== undefined) {
        products = products.filter(product => product.price >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        products = products.filter(product => product.price <= filters.maxPrice!);
      }

      // 應用標籤過濾
      if (filters.tags && filters.tags.length > 0) {
        products = products.filter(product => 
          product.tags && filters.tags!.some(tag => product.tags!.includes(tag))
        );
      }

      // 應用排序
      return this.sortProducts(products, sortBy, sortOrder);
    } catch (error) {
      console.error('高級搜尋失敗:', error);
      throw error;
    }
  }

  // 搜尋統計
  static async getSearchStats(): Promise<{
    totalProducts: number;
    activeProducts: number;
    categories: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
  }> {
    try {
      const productsSnapshot = await this.db.db.collection('products').get();
      const categoriesSnapshot = await this.db.db.collection('categories').get();

      const products = productsSnapshot.docs.map(doc => doc.data() as Product);
      const activeProducts = products.filter(p => p.status === 'active');
      const prices = activeProducts.map(p => p.price);

      return {
        totalProducts: products.length,
        activeProducts: activeProducts.length,
        categories: categoriesSnapshot.size,
        averagePrice: prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0,
        priceRange: {
          min: prices.length > 0 ? Math.min(...prices) : 0,
          max: prices.length > 0 ? Math.max(...prices) : 0
        }
      };
    } catch (error) {
      console.error('獲取搜尋統計失敗:', error);
      throw error;
    }
  }
}
