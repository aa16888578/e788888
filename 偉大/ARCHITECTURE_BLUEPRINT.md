# 🏗️ 多平台電商系統架構藍圖

## 📋 **專案概述**
這是一個創新的多平台電商管理系統，整合了 Telegram 機器人、MiniWeb 輕量網頁和完整的網站管理後台。系統採用現代化技術棧，提供全方位的電商解決方案。

---

## 🎨 **多平台架構 (Multi-Platform Architecture)**

### **1. 平台組成 (Platform Components)**

#### **1.1 Telegram 機器人私人聊天窗口** 🤖
- **功能定位**：個人購物助手、客服支持、快速下單
- **技術架構**：Telegram Bot API + Firebase 後端
- **核心特性**：
  - 智能商品推薦
  - 一對一客服對話
  - 購物車管理
  - 訂單追蹤
  - 支付集成

#### **1.2 MiniWeb 輕量網頁** 🌐
- **功能定位**：快速瀏覽、簡單操作、分享鏈接
- **技術架構**：PWA + 響應式設計 + Firebase
- **核心特性**：
  - 輕量級界面
  - 快速加載
  - 離線功能
  - 移動端優化
  - 社交分享

#### **1.3 網站管理後台** 🖥️
- **功能定位**：完整的電商管理系統
- **技術架構**：Next.js 15 + TypeScript + Tailwind CSS
- **核心特性**：
  - 商品管理
  - 訂單處理
  - 用戶管理
  - 數據分析
  - 系統監控

#### **1.4 代理系統** 🏢
- **功能定位**：多層級代理分銷管理
- **技術架構**：Firebase + 代理管理模組
- **核心特性**：
  - 多層級代理架構
  - 佣金計算系統
  - 代理業績追蹤
  - 分銷網絡管理
  - 代理激勵機制

#### **1.5 支付系統** 💰
- **功能定位**：USDT-TRC20 加密貨幣支付處理
- **技術架構**：Tron 區塊鏈 + 智能合約 + 支付網關
- **核心特性**：
  - USDT-TRC20 支付處理
  - 智能合約自動化
  - 實時匯率轉換
  - 多幣種支持
  - 安全支付驗證

### **2. 技術棧 (Tech Stack)**
```
Frontend Framework: Next.js 15.5.0
Language: TypeScript 5
Styling: Tailwind CSS 4
State Management: React Hooks + Context API
Backend: Firebase (Firestore, Functions, Storage, Auth)
Bot Platform: Telegram Bot API
PWA: Service Workers + Web App Manifest
Database: Firestore + Realtime Database
Hosting: Firebase Hosting + Vercel
Blockchain: Tron Network (TRC20)
Payment: USDT-TRC20 + Smart Contracts
```

---

## 🤖 **Telegram Bot 架構 (Telegram Bot Architecture)**

### **1. Bot 功能架構**
```typescript
interface TelegramBotFeatures {
  // 商品相關
  productSearch: 'search by name, category, price range';
  productRecommendation: 'AI-powered recommendations';
  productDetails: 'detailed product information';
  
  // 購物功能
  shoppingCart: 'add, remove, view cart items';
  orderManagement: 'place, track, cancel orders';
  paymentIntegration: 'secure payment processing';
  
  // 客服功能
  customerService: '24/7 automated support';
  orderTracking: 'real-time order status';
  returnRefund: 'return and refund requests';
  
  // 用戶管理
  userProfile: 'personal information management';
  orderHistory: 'complete order records';
  preferences: 'shopping preferences and settings';
}
```

### **2. Bot 對話流程設計**
```mermaid
graph TD
    A[用戶開始對話] --> B[歡迎訊息]
    B --> C[主選單]
    C --> D[商品瀏覽]
    C --> E[購物車]
    C --> F[訂單管理]
    C --> G[客服支援]
    
    D --> H[商品搜尋]
    D --> I[分類瀏覽]
    D --> J[商品詳情]
    
    E --> K[加入購物車]
    E --> L[查看購物車]
    E --> M[結帳流程]
    
    F --> N[訂單狀態]
    F --> O[訂單歷史]
    F --> P[退貨申請]
```

### **3. Bot 技術實現**
```typescript
// Bot 核心配置
const botConfig = {
  token: process.env.TELEGRAM_BOT_TOKEN,
  webhook: process.env.WEBHOOK_URL,
  commands: [
    { command: '/start', description: '開始使用購物助手' },
    { command: '/products', description: '瀏覽商品' },
    { command: '/cart', description: '查看購物車' },
    { command: '/orders', description: '訂單管理' },
    { command: '/help', description: '客服支援' }
  ]
};

// 對話狀態管理
interface ChatState {
  userId: number;
  currentState: 'main_menu' | 'product_browsing' | 'cart' | 'checkout';
  context: any;
  lastActivity: Date;
}
```

---

## 🌐 **MiniWeb 架構 (MiniWeb Architecture)**

### **1. PWA 功能設計**
```typescript
// Service Worker 配置
const swConfig = {
  name: 'ShopBot MiniWeb',
  version: '1.0.0',
  cacheStrategy: 'stale-while-revalidate',
  offlineFallback: '/offline.html',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.shopbot\.com/,
      handler: 'networkFirst',
      options: { cacheName: 'api-cache' }
    },
    {
      urlPattern: /\.(png|jpg|jpeg|svg|gif)$/,
      handler: 'cacheFirst',
      options: { cacheName: 'image-cache' }
    }
  ]
};

// Web App Manifest
const manifest = {
  name: 'ShopBot',
  short_name: 'ShopBot',
  description: '輕量級電商購物體驗',
  start_url: '/',
  display: 'standalone',
  theme_color: '#4285f4',
  background_color: '#ffffff',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
  ]
};
```

### **2. 響應式設計架構**
```css
/* 斷點設計 */
:root {
  --mobile: 320px;
  --tablet: 768px;
  --desktop: 1024px;
  --large: 1440px;
}

/* 響應式網格系統 */
.product-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

/* 移動端優先設計 */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 0 2rem;
  }
}
```

### **3. 性能優化策略**
```typescript
// 圖片懶加載
const lazyLoadImages = () => {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src!;
        imageObserver.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
};

// 代碼分割
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
```

---

## 🖥️ **網站管理後台架構 (Admin Dashboard Architecture)**

### **1. 管理功能模組**
```typescript
interface AdminModules {
  // 商品管理
  productManagement: {
    create: '新增商品';
    edit: '編輯商品';
    delete: '刪除商品';
    bulk: '批量操作';
    categories: '分類管理';
    inventory: '庫存管理';
  };
  
  // 訂單管理
  orderManagement: {
    view: '查看訂單';
    process: '處理訂單';
    ship: '發貨管理';
    refund: '退款處理';
    analytics: '訂單分析';
  };
  
  // 用戶管理
  userManagement: {
    list: '用戶列表';
    details: '用戶詳情';
    permissions: '權限管理';
    activity: '活動記錄';
    support: '客服記錄';
  };
  
  // 數據分析
  analytics: {
    sales: '銷售數據';
    traffic: '流量分析';
    conversion: '轉換率';
    revenue: '收入分析';
    trends: '趨勢預測';
  };
}
```

### **2. 儀表板設計**
```typescript
// 實時數據監控
interface DashboardMetrics {
  realTime: {
    activeUsers: number;
    currentOrders: number;
    revenue: number;
    conversionRate: number;
  };
  
  daily: {
    sales: number;
    orders: number;
    newUsers: number;
    pageViews: number;
  };
  
  weekly: {
    growth: number;
    topProducts: Product[];
    userRetention: number;
    averageOrderValue: number;
  };
}

// 圖表配置
const chartConfig = {
  sales: {
    type: 'line',
    data: salesData,
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: '銷售趨勢' }
      }
    }
  },
  
  products: {
    type: 'doughnut',
    data: productData,
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  }
};
```

---

## 🔧 **後台架構 (Backend Architecture)**

### **1. Firebase 服務架構**
```typescript
// Firestore 數據結構
interface FirestoreCollections {
  products: {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    description: string;
    images: string[];
    status: 'active' | 'inactive' | 'deleted';
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };
  
  orders: {
    id: string;
    userId: string;
    products: OrderProduct[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    shippingAddress: Address;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };
  
  users: {
    id: string;
    telegramId: number;                    // Telegram 用戶 ID (主要標識符)
    username?: string;                     // Telegram 用戶名 (可選)
    firstName: string;                     // 用戶名字
    lastName?: string;                     // 用戶姓氏 (可選)
    languageCode?: string;                 // 用戶語言偏好
    role: 'admin' | 'user' | 'moderator'; // 用戶角色
    status: 'active' | 'inactive' | 'suspended'; // 用戶狀態
    permissions: string[];                 // 權限陣列
    lastLogin: Timestamp;                  // 最後登入時間
    createdAt: Timestamp;                  // 創建時間
    updatedAt: Timestamp;                  // 更新時間
  };
}

// Cloud Functions 架構
interface CloudFunctions {
  // Telegram Bot 相關
  telegramWebhook: '處理 Telegram 更新';
  sendMessage: '發送 Telegram 訊息';
  processCommand: '處理 Bot 命令';
  
  // 電商功能
  createOrder: '創建訂單';
  updateInventory: '更新庫存';
  processPayment: '處理支付';
  sendNotification: '發送通知';
  
  // 管理功能
  generateReport: '生成報表';
  backupData: '數據備份';
  syncInventory: '庫存同步';
}
```

### **2. API 架構設計**
```typescript
// RESTful API 端點
const apiEndpoints = {
  // 商品 API
  products: {
    GET: '/api/products',           // 獲取商品列表
    POST: '/api/products',          // 創建商品
    PUT: '/api/products/:id',       // 更新商品
    DELETE: '/api/products/:id',    // 刪除商品
    PATCH: '/api/products/:id',     // 部分更新
  },
  
  // 訂單 API
  orders: {
    GET: '/api/orders',             // 獲取訂單列表
    POST: '/api/orders',            // 創建訂單
    PUT: '/api/orders/:id',         // 更新訂單
    PATCH: '/api/orders/:id/status', // 更新訂單狀態
  },
  
  // 用戶 API
  users: {
    GET: '/api/users',              // 獲取用戶列表
    POST: '/api/users',             // 創建用戶
    PUT: '/api/users/:id',          // 更新用戶
    DELETE: '/api/users/:id',       // 刪除用戶
  },
  
  // Telegram Bot API
  telegram: {
    POST: '/api/telegram/webhook',  // Webhook 處理
    POST: '/api/telegram/send',     // 發送訊息
    GET: '/api/telegram/status',    // Bot 狀態
  }
};

// 響應格式標準
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  requestId: string;
}
```

---

## 🚀 **部署架構 (Deployment Architecture)**

### **1. 多平台部署策略**
```bash
# 1. Firebase 後端部署
firebase deploy --only functions,firestore,storage,hosting

# 2. Telegram Bot 部署
# 設置 webhook 到 Firebase Functions
curl -F "url=https://your-project.cloudfunctions.net/telegramWebhook" \
     https://api.telegram.org/bot<BOT_TOKEN>/setWebhook

# 3. MiniWeb 部署
# 部署到 Firebase Hosting
firebase deploy --only hosting

# 4. 管理後台部署
# 部署到 Vercel
vercel --prod
```

### **2. 環境配置**
```typescript
// 環境變數配置
const environmentConfig = {
  development: {
    firebase: {
      projectId: 'shopbot-dev',
      apiKey: process.env.FIREBASE_API_KEY_DEV,
      authDomain: 'shopbot-dev.firebaseapp.com'
    },
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN_DEV,
      webhookUrl: 'https://dev-api.shopbot.com/telegram/webhook'
    }
  },
  
  production: {
    firebase: {
      projectId: 'shopbot-prod',
      apiKey: process.env.FIREBASE_API_KEY_PROD,
      authDomain: 'shopbot-prod.firebaseapp.com'
    },
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN_PROD,
      webhookUrl: 'https://api.shopbot.com/telegram/webhook'
    }
  }
};
```

---

## 📊 **數據流架構 (Data Flow Architecture)**

### **1. 多平台數據同步**
```mermaid
graph TD
    A[Telegram Bot] --> B[Firebase Functions]
    C[MiniWeb] --> B
    D[管理後台] --> B
    B --> E[Firestore Database]
    B --> F[Cloud Storage]
    B --> G[Authentication]
    
    H[用戶操作] --> I[數據更新]
    I --> J[實時同步]
    J --> K[多平台更新]
    
    L[訂單創建] --> M[庫存更新]
    M --> N[通知發送]
    N --> O[Telegram 通知]
    N --> P[Email 通知]
    N --> Q[管理後台更新]
```

### **2. 實時數據流**
```typescript
// Firestore 實時監聽
const realtimeDataSync = {
  // 訂單狀態監聽
  orderStatus: onSnapshot(
    doc(db, 'orders', orderId),
    (doc) => {
      const orderData = doc.data();
      updateOrderStatus(orderData);
      notifyUser(orderData);
      updateAdminDashboard(orderData);
    }
  ),
  
  // 庫存變化監聽
  inventoryChanges: onSnapshot(
    collection(db, 'products'),
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          updateInventoryDisplay(change.doc.data());
          checkLowStock(change.doc.data());
        }
      });
    }
  )
};
```

---

## 🔒 **安全架構 (Security Architecture)**

### **1. 基於 Telegram 的用戶認證架構**
```typescript
// Telegram 用戶認證流程
interface TelegramAuthFlow {
  // 1. 用戶通過 Telegram Bot 開始對話
  startConversation: {
    trigger: '/start command or first message';
    action: 'create or retrieve user profile';
    data: 'extract telegram user info';
  };
  
  // 2. 用戶身份驗證
  userAuthentication: {
    method: 'telegram user ID verification';
    validation: 'check telegram user exists and is active';
    session: 'create secure session token';
  };
  
  // 3. 權限管理
  authorization: {
    role: 'admin | user | moderator';
    permissions: 'feature-based access control';
    scope: 'user-specific data access';
  };
}

// 用戶驗證中間件
const telegramAuthMiddleware = {
  // 驗證 Telegram 用戶身份
  verifyUser: (telegramId: number) => {
    return firebase.firestore()
      .collection('users')
      .where('telegramId', '==', telegramId)
      .where('status', '==', 'active')
      .get();
  },
  
  // 檢查用戶權限
  checkPermission: (userId: string, permission: string) => {
    return firebase.firestore()
      .collection('users')
      .doc(userId)
      .get()
      .then(doc => {
        const user = doc.data();
        return user?.permissions?.includes(permission) || false;
      });
  }
};
```

### **2. 多平台安全策略**
```typescript
// 認證與授權 - 基於 Telegram 用戶資訊
const securityConfig = {
  // Telegram 用戶認證
  telegram: {
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET,
    allowedUsers: process.env.ALLOWED_TELEGRAM_USERS?.split(','),
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    // 使用 Telegram 用戶資訊進行身份驗證
    userVerification: {
      telegramId: 'primary identifier',
      username: 'optional display name',
      firstName: 'user first name',
      lastName: 'user last name',
      languageCode: 'user language preference'
    }
  },
  
  // API 安全
  api: {
    rateLimit: { maxRequests: 1000, windowMs: 900000 },
    cors: { origin: process.env.ALLOWED_ORIGINS?.split(',') },
    helmet: true,
    // 基於 Telegram 用戶的認證
    authentication: 'telegram-based',
    authorization: 'role-based-permissions'
  }
};

// 數據加密
const encryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  saltLength: 64
};
```

---

## 📈 **監控與維護架構 (Monitoring & Maintenance)**

### **1. 多平台監控**
```typescript
// 性能監控
const monitoringConfig = {
  // Firebase 性能監控
  firebase: {
    performance: true,
    analytics: true,
    crashlytics: true
  },
  
  // Telegram Bot 監控
  telegram: {
    messageDelivery: true,
    responseTime: true,
    errorTracking: true,
    userEngagement: true
  },
  
  // 網站性能監控
  web: {
    pageLoadTime: true,
    apiResponseTime: true,
    userExperience: true,
    conversionTracking: true
  }
};

// 日誌記錄
const loggingConfig = {
  levels: ['error', 'warn', 'info', 'debug'],
  destinations: ['console', 'firebase', 'external'],
  retention: '30 days',
  format: 'json'
};
```

---

## 💰 **支付系統架構 (Payment System Architecture)**

### **1. USDT-TRC20 支付核心架構**
```typescript
// 支付系統數據結構
interface PaymentSystem {
  // 支付方式
  paymentMethods: {
    usdtTrc20: 'USDT-TRC20 支付 (主要)';
    usdtErc20: 'USDT-ERC20 支付 (備用)';
    trx: 'TRX 原生代幣支付';
  };
  
  // 支付狀態
  paymentStatus: {
    pending: '等待支付';
    processing: '處理中';
    confirmed: '已確認';
    failed: '支付失敗';
    expired: '已過期';
    refunded: '已退款';
  };
  
  // 支付類型
  paymentTypes: {
    order: '訂單支付';
    deposit: '充值';
    withdrawal: '提現';
    refund: '退款';
    commission: '佣金支付';
  };
}

// 支付訂單數據結構
interface PaymentOrder {
  id: string;
  orderId: string;                       // 關聯訂單 ID
  userId: string;                        // 用戶 ID
  agentId?: string;                      // 代理 ID (如果有)
  amount: number;                        // 支付金額 (USDT)
  amountFiat: number;                    // 等值法幣金額
  exchangeRate: number;                  // 匯率
  currency: 'USD' | 'CNY' | 'TWD';      // 法幣類型
  paymentMethod: 'usdt_trc20' | 'usdt_erc20' | 'trx';
  walletAddress: string;                 // 收款錢包地址
  userWalletAddress?: string;            // 用戶錢包地址
  transactionHash?: string;              // 區塊鏈交易哈希
  blockNumber?: number;                  // 區塊號
  confirmations: number;                 // 確認數
  requiredConfirmations: number;         // 所需確認數 (TRC20: 20)
  paymentStatus: 'pending' | 'processing' | 'confirmed' | 'failed' | 'expired' | 'refunded';
  expiresAt: Timestamp;                  // 支付過期時間
  paidAt?: Timestamp;                    // 支付完成時間
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 錢包管理數據結構
interface WalletManagement {
  // 系統錢包
  systemWallets: {
    hotWallet: {
      address: string;                   // 熱錢包地址
      balance: number;                   // 餘額
      purpose: '日常收款和支付';
      security: '多簽名保護';
    };
    coldWallet: {
      address: string;                   // 冷錢包地址
      balance: number;                   // 餘額
      purpose: '長期存儲';
      security: '離線存儲';
    };
    commissionWallet: {
      address: string;                   // 佣金錢包地址
      balance: number;                   // 餘額
      purpose: '代理佣金支付';
      security: '自動化支付';
    };
  };
  
  // 用戶錢包
  userWallets: {
    id: string;
    userId: string;
    walletAddress: string;               // 用戶錢包地址
    walletType: 'tron' | 'ethereum';
    isVerified: boolean;                 // 是否驗證
    balance: number;                     // 餘額
    lastSync: Timestamp;                 // 最後同步時間
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };
}
```

### **2. 智能合約架構**
```typescript
// 智能合約接口
interface SmartContractInterface {
  // 支付合約
  paymentContract: {
    name: 'ShopBotPayment';
    network: 'Tron Mainnet';
    address: string;
    functions: [
      'createPayment(uint256 orderId, uint256 amount)',
      'confirmPayment(bytes32 paymentId)',
      'refundPayment(bytes32 paymentId)',
      'getPaymentStatus(bytes32 paymentId)',
      'withdrawFunds(address to, uint256 amount)'
    ];
  };
  
  // 代理佣金合約
  commissionContract: {
    name: 'AgentCommission';
    network: 'Tron Mainnet';
    address: string;
    functions: [
      'distributeCommission(address agent, uint256 amount)',
      'claimCommission(address agent)',
      'getCommissionBalance(address agent)',
      'withdrawCommission(address agent, uint256 amount)'
    ];
  };
  
  // 匯率預言機合約
  oracleContract: {
    name: 'PriceOracle';
    network: 'Tron Mainnet';
    address: string;
    functions: [
      'getUSDTPrice(string currency)',
      'updatePrice(string currency, uint256 price)',
      'getLastUpdateTime(string currency)'
    ];
  };
}

// 智能合約事件
interface ContractEvents {
  // 支付事件
  paymentEvents: {
    PaymentCreated: 'event PaymentCreated(bytes32 indexed paymentId, uint256 orderId, uint256 amount)';
    PaymentConfirmed: 'event PaymentConfirmed(bytes32 indexed paymentId, address indexed user, uint256 amount)';
    PaymentRefunded: 'event PaymentRefunded(bytes32 indexed paymentId, uint256 amount)';
    PaymentExpired: 'event PaymentExpired(bytes32 indexed paymentId)';
  };
  
  // 佣金事件
  commissionEvents: {
    CommissionDistributed: 'event CommissionDistributed(address indexed agent, uint256 amount)';
    CommissionClaimed: 'event CommissionClaimed(address indexed agent, uint256 amount)';
    CommissionWithdrawn: 'event CommissionWithdrawn(address indexed agent, uint256 amount)';
  };
}
```

### **3. 支付流程設計**
```typescript
// 支付流程狀態機
interface PaymentFlow {
  // 1. 創建支付
  createPayment: {
    trigger: '用戶選擇商品並結帳';
    action: '生成支付訂單和 QR 碼';
    data: '訂單金額、匯率、過期時間';
    nextState: 'waiting_payment';
  };
  
  // 2. 等待支付
  waitingPayment: {
    trigger: '支付訂單創建完成';
    action: '監控區塊鏈交易';
    data: '錢包地址、金額、確認數';
    nextState: 'payment_confirmed' | 'payment_expired';
  };
  
  // 3. 支付確認
  paymentConfirmed: {
    trigger: '達到所需確認數';
    action: '更新訂單狀態、發送通知';
    data: '交易哈希、確認時間、區塊號';
    nextState: 'order_processing';
  };
  
  // 4. 支付過期
  paymentExpired: {
    trigger: '超過支付過期時間';
    action: '取消訂單、釋放庫存';
    data: '過期時間、取消原因';
    nextState: 'order_cancelled';
  };
}

// 支付驗證邏輯
interface PaymentValidation {
  // 交易驗證
  transactionValidation: {
    // 檢查交易哈希
    verifyTransactionHash: (txHash: string) => boolean;
    
    // 檢查確認數
    verifyConfirmations: (confirmations: number, required: number) => boolean;
    
    // 檢查金額
    verifyAmount: (expected: number, actual: number, tolerance: number) => boolean;
    
    // 檢查收款地址
    verifyRecipientAddress: (expected: string, actual: string) => boolean;
    
    // 檢查發送地址
    verifySenderAddress: (sender: string, whitelist: string[]) => boolean;
  };
  
  // 安全檢查
  securityChecks: {
    // 防重放攻擊
    preventReplayAttack: (txHash: string, orderId: string) => boolean;
    
    // 防雙重支付
    preventDoubleSpending: (orderId: string) => boolean;
    
    // 防金額操縱
    preventAmountManipulation: (order: PaymentOrder) => boolean;
    
    // 防地址偽造
    preventAddressSpoofing: (address: string) => boolean;
  };
}
```

### **4. 匯率管理系統**
```typescript
// 匯率管理
interface ExchangeRateManagement {
  // 匯率來源
  rateSources: {
    primary: 'Chainlink Price Feeds';     // 主要來源
    secondary: 'CoinGecko API';           // 備用來源
    tertiary: 'Binance API';              // 第三來源
  };
  
  // 匯率更新頻率
  updateFrequency: {
    usdt: '每 1 分鐘更新';
    major: '每 5 分鐘更新';
    minor: '每 15 分鐘更新';
  };
  
  // 匯率計算
  rateCalculation: {
    // 即時匯率
    getCurrentRate: (from: string, to: string) => number;
    
    // 歷史匯率
    getHistoricalRate: (from: string, to: string, date: Date) => number;
    
    // 匯率變化
    getRateChange: (from: string, to: string, period: string) => number;
    
    // 匯率預警
    setRateAlert: (from: string, to: string, threshold: number) => void;
  };
  
  // 匯率緩存
  rateCaching: {
    cacheStrategy: 'Redis + Memory';
    ttl: '1 分鐘';
    fallback: '使用最後已知匯率';
  };
}
```

### **5. 支付 API 設計**
```typescript
// 支付系統 API 端點
const paymentApiEndpoints = {
  // 支付管理 API
  payments: {
    GET: '/api/payments',                    // 獲取支付列表
    POST: '/api/payments/create',            // 創建支付
    GET: '/api/payments/:id',                // 獲取支付詳情
    PUT: '/api/payments/:id/status',         // 更新支付狀態
    POST: '/api/payments/:id/refund',        // 退款
    GET: '/api/payments/:id/qr',             // 獲取支付 QR 碼
  },
  
  // 錢包管理 API
  wallets: {
    GET: '/api/wallets',                     // 獲取錢包列表
    POST: '/api/wallets/create',             // 創建錢包
    GET: '/api/wallets/:id',                 // 獲取錢包詳情
    PUT: '/api/wallets/:id',                 // 更新錢包
    GET: '/api/wallets/:id/balance',         // 獲取錢包餘額
    POST: '/api/wallets/:id/sync',           // 同步錢包
  },
  
  // 匯率管理 API
  exchangeRates: {
    GET: '/api/exchange-rates/current',      // 獲取當前匯率
    GET: '/api/exchange-rates/history',      // 獲取歷史匯率
    GET: '/api/exchange-rates/currencies',   // 獲取支持幣種
    POST: '/api/exchange-rates/convert',     // 匯率轉換
  },
  
  // 區塊鏈交易 API
  blockchain: {
    GET: '/api/blockchain/transaction/:hash', // 獲取交易詳情
    GET: '/api/blockchain/address/:address',  // 獲取地址詳情
    GET: '/api/blockchain/confirmations/:hash', // 獲取確認數
    POST: '/api/blockchain/webhook',          // 區塊鏈事件 webhook
  }
};

// 支付系統響應格式
interface PaymentApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  requestId: string;
  paymentId?: string;                        // 支付 ID
  transactionHash?: string;                  // 交易哈希
  confirmations?: number;                    // 確認數
  exchangeRate?: number;                     // 匯率
}
```

### **6. 支付系統集成**
```typescript
// 與現有系統的集成
interface PaymentSystemIntegration {
  // Telegram Bot 集成
  telegramBot: {
    paymentCommands: [
      '/pay_order',           // 支付訂單
      '/payment_status',      // 查看支付狀態
      '/wallet_balance',      // 查看錢包餘額
      '/payment_history',     // 查看支付歷史
      '/refund_request'       // 申請退款
    ];
    paymentNotifications: [
      'payment_created',      // 支付創建通知
      'payment_confirmed',    // 支付確認通知
      'payment_failed',       // 支付失敗通知
      'payment_expired',      // 支付過期通知
      'refund_processed'      // 退款處理通知
    ];
  };
  
  // MiniWeb 集成
  miniWeb: {
    paymentInterface: '支付頁面';
    walletConnection: '錢包連接';
    paymentHistory: '支付記錄';
    refundRequest: '退款申請';
  };
  
  // 管理後台集成
  adminDashboard: {
    paymentOverview: '支付概覽儀表板';
    transactionMonitoring: '交易監控';
    refundManagement: '退款管理';
    walletManagement: '錢包管理';
  };
  
  // 代理系統集成
  agentSystem: {
    commissionPayment: '佣金支付';
    agentWallet: '代理錢包';
    paymentTracking: '支付追蹤';
  };
}
```

### **7. 安全與合規**
```typescript
// 支付安全配置
interface PaymentSecurity {
  // 加密配置
  encryption: {
    algorithm: 'AES-256-GCM';
    keyLength: 32;
    ivLength: 16;
    saltLength: 64;
  };
  
  // 身份驗證
  authentication: {
    method: 'Telegram-based + Wallet Signature';
    mfa: 'Optional 2FA for large amounts';
    sessionTimeout: '30 minutes';
  };
  
  // 風險控制
  riskControl: {
    // 單筆限額
    singleLimit: {
      min: 1;                    // 最小 1 USDT
      max: 10000;                // 最大 10,000 USDT
    };
    
    // 日累計限額
    dailyLimit: {
      min: 1;                    // 最小 1 USDT
      max: 50000;                // 最大 50,000 USDT
    };
    
    // 可疑交易檢測
    suspiciousDetection: [
      '異常大額交易',
      '頻繁小額交易',
      '可疑地址模式',
      '異常時間模式'
    ];
  };
  
  // 合規要求
  compliance: {
    kyc: 'Optional for small amounts';
    aml: 'Automated monitoring';
    reporting: 'Monthly compliance reports';
    audit: 'Annual security audit';
  };
}
```

---

## 🏢 **代理系統架構 (Agent System Architecture)**

### **1. 代理系統核心架構**
```typescript
// 代理系統數據結構
interface AgentSystem {
  // 代理層級結構
  agentLevels: {
    level1: '一級代理 (直接代理)';
    level2: '二級代理 (間接代理)';
    level3: '三級代理 (間接間接代理)';
    maxLevels: 3; // 最大代理層級
  };
  
  // 代理類型
  agentTypes: {
    individual: '個人代理';
    company: '企業代理';
    store: '實體店代理';
    online: '網店代理';
  };
  
  // 代理狀態
  agentStatus: {
    pending: '待審核';
    active: '活躍';
    suspended: '暫停';
    terminated: '終止';
  };
}

// 代理用戶數據結構
interface AgentUser {
  id: string;
  telegramId: number;                    // Telegram 用戶 ID
  agentCode: string;                     // 代理編碼 (唯一)
  agentLevel: 1 | 2 | 3;                // 代理層級
  parentAgentId?: string;                // 上級代理 ID
  childAgents: string[];                 // 下級代理 ID 列表
  commissionRate: number;                // 佣金比例 (%)
  totalSales: number;                    // 總銷售額
  totalCommission: number;               // 總佣金
  monthlyTarget: number;                 // 月度目標
  monthlyAchievement: number;            // 月度達成
  status: 'pending' | 'active' | 'suspended' | 'terminated';
  joinDate: Timestamp;                   // 加入日期
  lastActivity: Timestamp;               // 最後活動
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 代理訂單數據結構
interface AgentOrder {
  id: string;
  orderId: string;                       // 原始訂單 ID
  agentId: string;                       // 代理 ID
  customerId: string;                    // 客戶 ID
  products: OrderProduct[];              // 商品列表
  subtotal: number;                      // 訂單小計
  commission: number;                    // 代理佣金
  commissionRate: number;                // 佣金比例
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  commissionStatus: 'pending' | 'paid' | 'cancelled'; // 佣金狀態
  commissionPaidAt?: Timestamp;          // 佣金支付時間
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### **2. 佣金計算系統**
```typescript
// 佣金計算引擎
class CommissionCalculator {
  // 基礎佣金計算
  calculateCommission(order: AgentOrder, agent: AgentUser): number {
    const baseCommission = order.subtotal * (agent.commissionRate / 100);
    
    // 層級獎勵
    const levelBonus = this.calculateLevelBonus(agent.agentLevel);
    
    // 業績獎勵
    const performanceBonus = this.calculatePerformanceBonus(agent);
    
    // 特殊活動獎勵
    const campaignBonus = this.calculateCampaignBonus(order);
    
    return baseCommission + levelBonus + performanceBonus + campaignBonus;
  }
  
  // 層級獎勵計算
  private calculateLevelBonus(level: number): number {
    const levelMultipliers = { 1: 1.0, 2: 0.8, 3: 0.6 };
    return levelMultipliers[level] || 0;
  }
  
  // 業績獎勵計算
  private calculatePerformanceBonus(agent: AgentUser): number {
    const achievementRate = agent.monthlyAchievement / agent.monthlyTarget;
    
    if (achievementRate >= 1.5) return 0.1;      // 超額完成 150%
    if (achievementRate >= 1.2) return 0.05;     // 超額完成 120%
    if (achievementRate >= 1.0) return 0.02;     // 完成目標
    return 0;
  }
  
  // 活動獎勵計算
  private calculateCampaignBonus(order: AgentOrder): number {
    // 根據促銷活動計算額外獎勵
    return 0; // 預設值
  }
}

// 佣金分配策略
interface CommissionStrategy {
  // 直接銷售佣金
  directSale: {
    level1: 0.15,  // 15%
    level2: 0.08,  // 8%
    level3: 0.05   // 5%
  };
  
  // 團隊銷售佣金
  teamSale: {
    level1: 0.05,  // 5%
    level2: 0.03,  // 3%
    level3: 0.02   // 2%
  };
  
  // 新代理推薦獎勵
  referralBonus: {
    level1: 50,    // 50 元
    level2: 30,    // 30 元
    level3: 20     // 20 元
  };
}
```

### **3. 代理管理功能**
```typescript
// 代理管理模組
interface AgentManagement {
  // 代理註冊與審核
  registration: {
    apply: '提交代理申請';
    review: '管理員審核';
    approve: '批准代理資格';
    reject: '拒絕代理申請';
    activate: '激活代理帳戶';
  };
  
  // 代理等級管理
  levelManagement: {
    upgrade: '升級代理等級';
    downgrade: '降級代理等級';
    transfer: '轉移代理關係';
    merge: '合併代理帳戶';
  };
  
  // 佣金管理
  commissionManagement: {
    calculate: '計算佣金';
    distribute: '分配佣金';
    payout: '佣金支付';
    adjust: '佣金調整';
    refund: '佣金退款';
  };
  
  // 業績追蹤
  performanceTracking: {
    sales: '銷售業績';
    commission: '佣金收入';
    team: '團隊業績';
    ranking: '業績排名';
    reports: '業績報表';
  };
}

// 代理激勵機制
interface AgentIncentives {
  // 月度獎勵
  monthlyRewards: {
    topSales: '銷售冠軍獎勵';
    topCommission: '佣金冠軍獎勵';
    growthChampion: '成長冠軍獎勵';
    teamBuilder: '團隊建設獎勵';
  };
  
  // 季度獎勵
  quarterlyRewards: {
    performanceBonus: '季度績效獎金';
    travelReward: '旅遊獎勵';
    trainingReward: '培訓獎勵';
  };
  
  // 年度獎勵
  yearlyRewards: {
    annualBonus: '年度獎金';
    luxuryReward: '奢侈品獎勵';
    partnership: '合夥人資格';
  };
}
```

### **4. 代理系統 API 設計**
```typescript
// 代理系統 API 端點
const agentApiEndpoints = {
  // 代理管理 API
  agents: {
    GET: '/api/agents',                    // 獲取代理列表
    POST: '/api/agents',                   // 創建代理
    PUT: '/api/agents/:id',                // 更新代理
    DELETE: '/api/agents/:id',             // 刪除代理
    PATCH: '/api/agents/:id/status',       // 更新代理狀態
  },
  
  // 佣金管理 API
  commissions: {
    GET: '/api/commissions',               // 獲取佣金列表
    POST: '/api/commissions/calculate',    // 計算佣金
    PUT: '/api/commissions/:id/payout',    // 支付佣金
    GET: '/api/commissions/summary',       // 佣金摘要
  },
  
  // 業績追蹤 API
  performance: {
    GET: '/api/performance/sales',         // 銷售業績
    GET: '/api/performance/commission',    // 佣金業績
    GET: '/api/performance/team',          // 團隊業績
    GET: '/api/performance/ranking',       // 業績排名
  },
  
  // 代理激勵 API
  incentives: {
    GET: '/api/incentives/available',      // 可用獎勵
    POST: '/api/incentives/claim',         // 領取獎勵
    GET: '/api/incentives/history',        // 獎勵歷史
  }
};

// 代理系統響應格式
interface AgentApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  requestId: string;
  agentId?: string;                        // 代理 ID
  commission?: number;                      // 相關佣金
}
```

### **5. 代理系統集成**
```typescript
// 與現有系統的集成
interface SystemIntegration {
  // Telegram Bot 集成
  telegramBot: {
    agentCommands: [
      '/agent_status',      // 查看代理狀態
      '/agent_earnings',    // 查看收益
      '/agent_team',        // 查看團隊
      '/agent_orders',      // 查看訂單
      '/agent_commission'   // 查看佣金
    ];
    agentNotifications: [
      'new_order',          // 新訂單通知
      'commission_paid',    // 佣金支付通知
      'level_upgrade',      // 等級升級通知
      'target_achieved'     // 目標達成通知
    ];
  };
  
  // MiniWeb 集成
  miniWeb: {
    agentDashboard: '代理專用儀表板';
    orderTracking: '訂單追蹤系統';
    commissionHistory: '佣金歷史記錄';
    teamManagement: '團隊管理界面';
  };
  
  // 管理後台集成
  adminDashboard: {
    agentOverview: '代理概覽儀表板';
    commissionManagement: '佣金管理界面';
    performanceAnalytics: '業績分析工具';
    incentiveManagement: '激勵機制管理';
  };
}
```

---

## 🌍 **環境配置與部署指南 (Environment Configuration & Deployment Guide)**

### **📋 環境配置文件**
本項目包含完整的環境配置範例和說明文檔：

#### **1. 環境變數範例文件**
- **文件路徑**: `env.example`
- **用途**: 包含所有必要的環境變數配置
- **使用方法**: 複製為 `.env` 並填入實際值

#### **2. 環境配置說明文檔**
- **文件路徑**: `ENVIRONMENT_SETUP.md`
- **內容**: 詳細的配置說明、故障排除和最佳實踐

### **🚀 快速配置步驟**

#### **步驟 1: 複製環境配置**
```bash
cd /home/a0928997578_gmail_com/偉大
cp env.example .env
```

#### **步驟 2: 編輯配置文件**
根據實際情況編輯 `.env` 文件中的配置值。

#### **步驟 3: 重啟服務**
配置完成後重啟相關服務使配置生效。

### **🔑 核心配置項**

#### **Firebase 配置 (必需)**
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
```

#### **Telegram Bot 配置 (必需)**
```bash
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_WEBHOOK_SECRET=your-webhook-secret
TELEGRAM_WEBHOOK_URL=https://your-project-id.cloudfunctions.net/telegramWebhook
```

#### **支付系統配置 (必需)**
```bash
TRON_WALLET_ADDRESS=TYourTronWalletAddressHere
ETHEREUM_WALLET_ADDRESS=0xYourEthereumWalletAddressHere
SYSTEM_WALLET_ADDRESS=TYourSystemWalletAddressHere
```

#### **安全配置 (必需)**
```bash
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=https://your-domain.com
```

### **📚 配置文檔結構**

```
偉大/
├── env.example              # 環境變數範例
├── ENVIRONMENT_SETUP.md     # 環境配置說明
├── WORK_PROGRESS.md         # 工作進度報告
├── ARCHITECTURE_BLUEPRINT.md # 系統架構藍圖
└── functions/               # 後端代碼
    ├── src/
    │   ├── services/        # 服務層
    │   ├── types/           # 類型定義
    │   └── routes/          # API 路由
    └── package.json         # 依賴配置
```

### **🔧 開發環境設置**

#### **1. 安裝依賴**
```bash
cd functions
npm install
```

#### **2. 編譯 TypeScript**
```bash
npm run build
```

#### **3. 本地測試**
```bash
npm run dev
```

#### **4. 部署到 Firebase**
```bash
firebase deploy --only functions
```

### **📱 Telegram Bot 設置**

#### **1. 創建 Bot**
1. 在 Telegram 中搜索 `@BotFather`
2. 發送 `/newbot` 命令
3. 設置 Bot 名稱和用戶名
4. 獲取 Bot Token

#### **2. 設置 Webhook**
```bash
curl -F "url=https://your-project-id.cloudfunctions.net/telegramWebhook" \
     https://api.telegram.org/bot<BOT_TOKEN>/setWebhook
```

### **💰 支付系統配置**

#### **1. USDT-TRC20 配置**
- 獲取 Tron 錢包地址
- 配置 Tron API 密鑰
- 設置確認數 (建議 20)

#### **2. 匯率 API 配置**
- CoinGecko API (免費，推薦)
- Binance API (備用)

### **🔒 安全注意事項**

#### **1. 環境變數保護**
- 永遠不要將 `.env` 文件提交到版本控制
- 使用強密鑰和密碼
- 定期更換 API 密鑰

#### **2. 權限管理**
- 限制 API 密鑰的權限範圍
- 使用專用的服務帳戶
- 啟用安全日誌記錄

### **📊 監控和維護**

#### **1. 性能監控**
```bash
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_ERROR_TRACKING=true
ENABLE_ANALYTICS=true
```

#### **2. 日誌配置**
```bash
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
```

#### **3. 備份配置**
```bash
ENABLE_AUTO_BACKUP=true
BACKUP_FREQUENCY_HOURS=24
BACKUP_RETENTION_DAYS=30
```

### **🚨 故障排除**

#### **常見問題解決**

1. **Firebase 連接失敗**
   - 檢查項目 ID 和服務帳戶權限
   - 確認網絡連接

2. **Telegram Bot 無響應**
   - 檢查 Bot Token 和 Webhook 設置
   - 確認函數部署狀態

3. **支付系統錯誤**
   - 檢查錢包地址格式
   - 確認網絡配置和 API 密鑰

4. **環境變數未生效**
   - 重啟相關服務
   - 檢查變數名稱拼寫

### **📞 技術支持**

#### **文檔資源**
- [Firebase 文檔](https://firebase.google.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Tron 開發文檔](https://developers.tron.network/)
- [Ethereum 開發文檔](https://ethereum.org/developers/)

#### **項目文檔**
- `ENVIRONMENT_SETUP.md` - 詳細配置說明
- `WORK_PROGRESS.md` - 開發進度和狀態
- `ARCHITECTURE_BLUEPRINT.md` - 系統架構設計

---

## 🎯 **開發路線圖 (Development Roadmap)**

### **第一階段：基礎架構** 🏗️ ✅
- [x] Firebase 項目設置
- [x] 數據庫設計和結構 (基於 Telegram 用戶)
- [x] 基礎 API 架構
- [x] Telegram 用戶認證系統

### **第二階段：Telegram Bot** 🤖 ✅
- [x] Bot 基礎功能
- [x] 商品查詢功能
- [x] 購物車管理
- [x] 訂單處理
- [x] 支付集成測試
- [x] Bot 命令擴展

### **第三階段：MiniWeb** 🌐
- [ ] PWA 基礎設置
- [ ] 響應式設計
- [ ] 核心購物功能
- [ ] 離線支持

### **第四階段：管理後台** 🖥️
- [ ] Next.js 應用框架
- [ ] 管理儀表板
- [ ] 數據可視化
- [ ] 完整管理功能

### **第五階段：代理系統** 🏢
- [ ] 代理註冊與審核系統
- [ ] 佣金計算引擎
- [ ] 代理管理界面
- [ ] 業績追蹤系統

### **第六階段：支付系統** 💰
- [ ] USDT-TRC20 支付網關
- [ ] 智能合約部署
- [ ] 錢包管理系統
- [ ] 匯率管理系統
- [ ] 支付安全驗證

### **第七階段：整合測試** 🧪
- [ ] 多平台數據同步
- [ ] 端到端測試
- [ ] 性能優化
- [ ] 安全測試
- [ ] 支付流程測試

---

**架構狀態**: 第二階段完成，包含完整的 Telegram Bot 功能 🚀  
**最後更新**: 2025-08-26  
**版本**: 2.2.0 - 多平台版本 + 代理系統 + USDT-TRC20 支付 + 環境配置指南  

這份更新的架構藍圖提供了完整的多平台電商系統設計，包括 Telegram Bot、MiniWeb 和網站管理後台。系統採用現代化的技術棧，具有良好的可擴展性、安全性和維護性。每個平台都有明確的功能定位和技術實現方案，確保用戶在不同場景下都能獲得最佳的購物體驗。

**環境配置已完成，下一位開發者可以直接使用 `env.example` 和 `ENVIRONMENT_SETUP.md` 進行系統配置和部署。**
