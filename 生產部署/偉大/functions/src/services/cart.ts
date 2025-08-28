import { DatabaseService } from './database';
import { Cart, CartItem, Product, User } from '../types';

// 購物車服務類
export class CartService {
  private static db = new DatabaseService();

  // 獲取用戶購物車
  static async getUserCart(telegramId: number): Promise<Cart | null> {
    try {
      const user = await this.db.getUserByTelegramId(telegramId);
      if (!user) {
        throw new Error('用戶不存在');
      }

      const cartDoc = await this.db.db
        .collection('carts')
        .where('telegramId', '==', telegramId)
        .limit(1)
        .get();

      if (cartDoc.empty) {
        // 創建新的購物車
        return await this.createCart(user);
      }

      const cartData = cartDoc.docs[0].data() as Cart;
      const cart: Cart = {
        ...cartData,
        id: cartDoc.docs[0].id,
        createdAt: cartData.createdAt.toDate(),
        updatedAt: cartData.updatedAt.toDate(),
        items: cartData.items.map(item => ({
          ...item,
          addedAt: item.addedAt.toDate(),
          updatedAt: item.updatedAt.toDate()
        }))
      };

      return cart;
    } catch (error) {
      console.error('獲取購物車失敗:', error);
      throw error;
    }
  }

  // 創建新購物車
  private static async createCart(user: User): Promise<Cart> {
    const cart: Omit<Cart, 'id'> = {
      userId: user.id,
      telegramId: user.telegramId,
      items: [],
      totalItems: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      currency: 'USDT',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await this.db.db.collection('carts').add(cart);
    return { ...cart, id: docRef.id };
  }

  // 添加商品到購物車
  static async addToCart(telegramId: number, productId: string, quantity: number = 1): Promise<Cart> {
    try {
      const user = await this.db.getUserByTelegramId(telegramId);
      if (!user) {
        throw new Error('用戶不存在');
      }

      const product = await this.db.getProduct(productId);
      if (!product) {
        throw new Error('商品不存在');
      }

      if (product.stock < quantity) {
        throw new Error('庫存不足');
      }

      let cart = await this.getUserCart(telegramId);
      if (!cart) {
        cart = await this.createCart(user);
      }

      // 檢查商品是否已在購物車中
      const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
      
      if (existingItemIndex >= 0) {
        // 更新現有商品數量
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].subtotal = cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].price;
        cart.items[existingItemIndex].updatedAt = new Date();
      } else {
        // 添加新商品
        const newItem: Omit<CartItem, 'id'> = {
          productId,
          userId: user.id,
          telegramId,
          product,
          quantity,
          price: product.price,
          subtotal: product.price * quantity,
          addedAt: new Date(),
          updatedAt: new Date()
        };
        cart.items.push(newItem as CartItem);
      }

      // 重新計算購物車總計
      cart = this.calculateCartTotals(cart);
      cart.updatedAt = new Date();

      // 更新數據庫
      await this.db.db.collection('carts').doc(cart.id).update({
        items: cart.items,
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        total: cart.total,
        updatedAt: new Date()
      });

      return cart;
    } catch (error) {
      console.error('添加商品到購物車失敗:', error);
      throw error;
    }
  }

  // 從購物車移除商品
  static async removeFromCart(telegramId: number, productId: string): Promise<Cart> {
    try {
      const cart = await this.getUserCart(telegramId);
      if (!cart) {
        throw new Error('購物車不存在');
      }

      cart.items = cart.items.filter(item => item.productId !== productId);
      cart = this.calculateCartTotals(cart);
      cart.updatedAt = new Date();

      await this.db.db.collection('carts').doc(cart.id).update({
        items: cart.items,
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        total: cart.total,
        updatedAt: new Date()
      });

      return cart;
    } catch (error) {
      console.error('從購物車移除商品失敗:', error);
      throw error;
    }
  }

  // 更新購物車商品數量
  static async updateCartItemQuantity(telegramId: number, productId: string, quantity: number): Promise<Cart> {
    try {
      const cart = await this.getUserCart(telegramId);
      if (!cart) {
        throw new Error('購物車不存在');
      }

      const itemIndex = cart.items.findIndex(item => item.productId === productId);
      if (itemIndex === -1) {
        throw new Error('商品不在購物車中');
      }

      if (quantity <= 0) {
        return await this.removeFromCart(telegramId, productId);
      }

      const product = await this.db.getProduct(productId);
      if (!product || product.stock < quantity) {
        throw new Error('庫存不足');
      }

      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].subtotal = product.price * quantity;
      cart.items[itemIndex].updatedAt = new Date();

      cart = this.calculateCartTotals(cart);
      cart.updatedAt = new Date();

      await this.db.db.collection('carts').doc(cart.id).update({
        items: cart.items,
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        total: cart.total,
        updatedAt: new Date()
      });

      return cart;
    } catch (error) {
      console.error('更新購物車商品數量失敗:', error);
      throw error;
    }
  }

  // 清空購物車
  static async clearCart(telegramId: number): Promise<Cart> {
    try {
      const cart = await this.getUserCart(telegramId);
      if (!cart) {
        throw new Error('購物車不存在');
      }

      cart.items = [];
      cart = this.calculateCartTotals(cart);
      cart.updatedAt = new Date();

      await this.db.db.collection('carts').doc(cart.id).update({
        items: cart.items,
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        total: cart.total,
        updatedAt: new Date()
      });

      return cart;
    } catch (error) {
      console.error('清空購物車失敗:', error);
      throw error;
    }
  }

  // 計算購物車總計
  private static calculateCartTotals(cart: Cart): Cart {
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    
    // 計算稅費 (假設 5%)
    cart.tax = cart.subtotal * 0.05;
    
    // 計算運費 (假設固定 10 USDT)
    cart.shipping = cart.totalItems > 0 ? 10 : 0;
    
    // 計算總計
    cart.total = cart.subtotal + cart.tax + cart.shipping;
    
    return cart;
  }

  // 檢查購物車商品庫存
  static async checkCartStock(telegramId: number): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const cart = await this.getUserCart(telegramId);
      if (!cart || cart.items.length === 0) {
        return { valid: true, errors: [] };
      }

      const errors: string[] = [];

      for (const item of cart.items) {
        const product = await this.db.getProduct(item.productId);
        if (!product) {
          errors.push(`商品 ${item.product.name} 已下架`);
        } else if (product.stock < item.quantity) {
          errors.push(`商品 ${item.product.name} 庫存不足 (需要 ${item.quantity}，可用 ${product.stock})`);
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('檢查購物車庫存失敗:', error);
      throw error;
    }
  }

  // 獲取購物車摘要
  static async getCartSummary(telegramId: number): Promise<{
    totalItems: number;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    currency: string;
  }> {
    try {
      const cart = await this.getUserCart(telegramId);
      if (!cart) {
        return {
          totalItems: 0,
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0,
          currency: 'USDT'
        };
      }

      return {
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        total: cart.total,
        currency: cart.currency
      };
    } catch (error) {
      console.error('獲取購物車摘要失敗:', error);
      throw error;
    }
  }
}
