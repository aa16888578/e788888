import { Router } from 'express';
import { authenticateUser, requireRole } from '../services/auth';
import { DatabaseService } from '../services/database';
import { ApiResponse } from '../types';

const router = Router();

// 健康檢查端點
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API 服務運行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 用戶相關 API
router.post('/auth/telegram', async (req, res) => {
  try {
    const { telegramId, username, firstName, lastName, languageCode } = req.body;
    
    if (!telegramId || !firstName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: '缺少必要字段'
      });
    }

    const user = await DatabaseService.createUser({
      telegramId,
      username,
      firstName,
      lastName,
      languageCode,
      role: 'user',
      status: 'active',
      permissions: [],
      lastLogin: new Date()
    });

    res.json({
      success: true,
      data: user,
      message: '用戶創建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '服務器內部錯誤'
    });
  }
});

// 商品相關 API
router.get('/products', async (req, res) => {
  try {
    const { category, featured, limit = 20, page = 1 } = req.query;
    
    const filters: any = {};
    if (category) filters.category = category;
    if (featured !== undefined) filters.featured = featured === 'true';
    
    const pagination = {
      limit: parseInt(limit as string),
      startAfter: page > 1 ? (parseInt(page as string) - 1) * parseInt(limit as string) : 0
    };

    const products = await DatabaseService.getProducts(filters, pagination);
    
    res.json({
      success: true,
      data: products,
      message: '商品列表獲取成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '服務器內部錯誤'
    });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await DatabaseService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: '商品不存在'
      });
    }

    res.json({
      success: true,
      data: product,
      message: '商品詳情獲取成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '服務器內部錯誤'
    });
  }
});

// 需要認證的端點
router.use(authenticateUser);

// 用戶資料 API
router.get('/user/profile', (req, res) => {
  const user = (req as any).user;
  res.json({
    success: true,
    data: user,
    message: '用戶資料獲取成功'
  });
});

router.put('/user/profile', async (req, res) => {
  try {
    const user = (req as any).user;
    const updates = req.body;
    
    // 移除不可更新的字段
    delete updates.id;
    delete updates.telegramId;
    delete updates.role;
    delete updates.createdAt;
    
    await DatabaseService.updateUser(user.id, updates);
    
    res.json({
      success: true,
      message: '用戶資料更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '服務器內部錯誤'
    });
  }
});

// 訂單相關 API
router.post('/orders', async (req, res) => {
  try {
    const user = (req as any).user;
    const { products, shippingAddress, notes } = req.body;
    
    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No products specified',
        message: '未指定商品'
      });
    }

    // 計算訂單總額
    const subtotal = products.reduce((sum: number, product: any) => sum + product.subtotal, 0);
    const tax = 0; // 根據實際需求計算
    const shipping = 0; // 根據實際需求計算
    const total = subtotal + tax + shipping;

    // 生成訂單號
    const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const order = await DatabaseService.createOrder({
      orderNumber,
      userId: user.id,
      telegramId: user.telegramId,
      products,
      subtotal,
      tax,
      shipping,
      total,
      currency: 'USDT',
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'usdt_trc20',
      shippingAddress,
      notes
    });

    res.json({
      success: true,
      data: order,
      message: '訂單創建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '服務器內部錯誤'
    });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const user = (req as any).user;
    const orders = await DatabaseService.getOrdersByUserId(user.id);
    
    res.json({
      success: true,
      data: orders,
      message: '訂單列表獲取成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '服務器內部錯誤'
    });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    const orders = await DatabaseService.getOrdersByUserId(user.id);
    const order = orders.find(o => o.id === id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        message: '訂單不存在'
      });
    }

    res.json({
      success: true,
      data: order,
      message: '訂單詳情獲取成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '服務器內部錯誤'
    });
  }
});

// 分類 API
router.get('/categories', async (req, res) => {
  try {
    const categories = await DatabaseService.getCategories();
    
    res.json({
      success: true,
      data: categories,
      message: '分類列表獲取成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '服務器內部錯誤'
    });
  }
});

// 管理員專用 API
router.use('/admin', requireRole('admin'));

router.post('/admin/products', async (req, res) => {
  try {
    const productData = req.body;
    const product = await DatabaseService.createProduct(productData);
    
    res.json({
      success: true,
      data: product,
      message: '商品創建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '服務器內部錯誤'
    });
  }
});

router.put('/admin/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // 這裡需要實現更新商品的邏輯
    res.json({
      success: true,
      message: '商品更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '服務器內部錯誤'
    });
  }
});

export default router;
