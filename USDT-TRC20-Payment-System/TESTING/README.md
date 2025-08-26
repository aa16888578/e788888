# 🧪 USDT-TRC20 支付系統測試指南

## 📋 **測試概述**

本文檔描述了 USDT-TRC20 支付系統的完整測試策略，包括單元測試、集成測試、端到端測試和安全測試。

---

## 🎯 **測試目標**

### **功能測試**
- 驗證支付創建、確認、退款等核心功能
- 測試智能合約的各種狀態轉換
- 驗證匯率管理和錢包管理功能

### **性能測試**
- 測試系統在高併發下的響應能力
- 驗證區塊鏈交易的處理速度
- 測試系統的擴展性和穩定性

### **安全測試**
- 驗證加密算法的安全性
- 測試防重放攻擊和雙重支付保護
- 驗證權限控制和訪問管理

---

## 🧪 **測試類型**

### **1. 單元測試 (Unit Tests)**

#### **測試範圍**
- 支付處理引擎
- 智能合約函數
- 匯率管理服務
- 錢包管理服務
- 安全驗證邏輯

#### **測試框架**
```bash
# 運行單元測試
npm run test

# 監視模式
npm run test:watch

# 生成覆蓋率報告
npm run test:coverage
```

#### **測試示例**
```typescript
describe('PaymentEngine', () => {
  it('should create payment successfully', async () => {
    const payment = await PaymentEngine.createPayment({
      orderId: '123',
      amount: 100,
      currency: 'USDT'
    });
    
    expect(payment.status).toBe('pending');
    expect(payment.amount).toBe(100);
  });
});
```

### **2. 集成測試 (Integration Tests)**

#### **測試範圍**
- API 端點功能
- 數據庫操作
- 外部服務集成
- 區塊鏈交互

#### **測試環境**
- 測試數據庫
- 模擬區塊鏈網絡
- 模擬外部 API

#### **測試示例**
```typescript
describe('Payment API Integration', () => {
  it('should process payment end-to-end', async () => {
    // 創建訂單
    const order = await createTestOrder();
    
    // 創建支付
    const payment = await createPayment(order.id, 100);
    
    // 模擬區塊鏈確認
    await simulateBlockchainConfirmation(payment.id);
    
    // 驗證支付狀態
    const updatedPayment = await getPayment(payment.id);
    expect(updatedPayment.status).toBe('confirmed');
  });
});
```

### **3. 端到端測試 (E2E Tests)**

#### **測試範圍**
- 完整支付流程
- 用戶界面交互
- 跨平台功能
- 錯誤處理流程

#### **測試工具**
- Playwright (Web 應用)
- Detox (移動應用)
- 自定義 Bot 測試

#### **測試場景**
```typescript
describe('Complete Payment Flow', () => {
  it('should complete payment from order to confirmation', async () => {
    // 1. 用戶瀏覽商品
    await page.goto('/products');
    await page.click('[data-testid="product-item"]');
    
    // 2. 添加到購物車
    await page.click('[data-testid="add-to-cart"]');
    
    // 3. 結帳
    await page.click('[data-testid="checkout"]');
    
    // 4. 選擇支付方式
    await page.click('[data-testid="usdt-trc20"]');
    
    // 5. 完成支付
    await page.fill('[data-testid="wallet-address"]', testWalletAddress);
    await page.click('[data-testid="confirm-payment"]');
    
    // 6. 驗證成功
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

### **4. 性能測試 (Performance Tests)**

#### **測試指標**
- 響應時間 (RT)
- 吞吐量 (TPS)
- 併發用戶數
- 資源使用率

#### **測試工具**
- Artillery.js
- k6
- Apache JMeter

#### **測試配置**
```javascript
// artillery.config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 100
      name: "Sustained load"
    - duration: 60
      arrivalRate: 200
      name: "Peak load"
```

### **5. 安全測試 (Security Tests)**

#### **測試範圍**
- 身份驗證和授權
- 輸入驗證
- SQL 注入防護
- XSS 防護
- CSRF 防護

#### **測試工具**
- OWASP ZAP
- Burp Suite
- 自定義安全測試腳本

#### **測試示例**
```typescript
describe('Security Tests', () => {
  it('should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    
    const response = await request(app)
      .post('/api/payments')
      .send({ orderId: maliciousInput });
    
    expect(response.status).toBe(400);
  });
  
  it('should validate JWT tokens', async () => {
    const invalidToken = 'invalid.jwt.token';
    
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${invalidToken}`);
    
    expect(response.status).toBe(401);
  });
});
```

---

## 🚀 **測試環境設置**

### **本地測試環境**
```bash
# 安裝依賴
npm install

# 設置環境變數
cp env.example .env.test

# 啟動測試數據庫
docker-compose -f docker-compose.test.yml up -d

# 運行測試
npm run test:all
```

### **測試網環境**
```bash
# 部署到 Tron Shasta 測試網
npm run deploy:testnet

# 運行測試網測試
npm run test:testnet
```

### **CI/CD 環境**
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:all
      - run: npm run test:coverage
```

---

## 📊 **測試覆蓋率**

### **目標覆蓋率**
- **代碼覆蓋率**: > 90%
- **分支覆蓋率**: > 85%
- **函數覆蓋率**: > 95%

### **覆蓋率報告**
```bash
# 生成覆蓋率報告
npm run test:coverage

# 查看 HTML 報告
open coverage/lcov-report/index.html
```

---

## 🔍 **測試數據管理**

### **測試數據策略**
- 使用工廠模式創建測試數據
- 每個測試使用獨立的數據集
- 測試後自動清理數據

### **測試數據示例**
```typescript
// factories/payment.factory.ts
export class PaymentFactory {
  static createPayment(overrides: Partial<Payment> = {}): Payment {
    return {
      id: generateId(),
      orderId: generateOrderId(),
      amount: 100,
      currency: 'USDT',
      status: 'pending',
      createdAt: new Date(),
      ...overrides
    };
  }
}
```

---

## 🚨 **錯誤處理測試**

### **錯誤場景**
- 網絡故障
- 區塊鏈交易失敗
- 數據庫連接錯誤
- 外部 API 超時

### **錯誤測試示例**
```typescript
describe('Error Handling', () => {
  it('should handle blockchain network errors gracefully', async () => {
    // 模擬網絡錯誤
    jest.spyOn(blockchainService, 'sendTransaction')
      .mockRejectedValue(new Error('Network error'));
    
    const response = await request(app)
      .post('/api/payments')
      .send(validPaymentData);
    
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Blockchain service unavailable');
  });
});
```

---

## 📈 **性能基準測試**

### **基準指標**
- **API 響應時間**: < 100ms (95th percentile)
- **支付處理時間**: < 5 秒
- **區塊鏈確認時間**: < 30 秒
- **系統可用性**: > 99.9%

### **基準測試腳本**
```bash
# 運行基準測試
npm run test:benchmark

# 比較結果
npm run test:benchmark:compare
```

---

## 🧹 **測試清理**

### **清理策略**
- 測試數據自動清理
- 臨時文件清理
- 測試環境重置

### **清理腳本**
```bash
# 清理測試環境
npm run test:cleanup

# 重置測試數據庫
npm run test:reset-db
```

---

## 📝 **測試報告**

### **報告類型**
- HTML 覆蓋率報告
- JUnit XML 報告
- 性能測試報告
- 安全測試報告

### **報告生成**
```bash
# 生成所有報告
npm run test:reports

# 查看報告
open reports/index.html
```

---

## 🔄 **持續測試**

### **自動化測試**
- 每次提交自動運行測試
- 定期運行性能測試
- 自動生成測試報告

### **測試監控**
- 測試結果趨勢分析
- 失敗測試自動重試
- 測試性能監控

---

## 📚 **測試資源**

### **文檔**
- [測試最佳實踐](https://example.com/testing-best-practices)
- [性能測試指南](https://example.com/performance-testing)
- [安全測試手冊](https://example.com/security-testing)

### **工具**
- [Jest 文檔](https://jestjs.io/)
- [Playwright 文檔](https://playwright.dev/)
- [OWASP 測試指南](https://owasp.org/www-project-web-security-testing-guide/)

---

**文檔版本**: 1.0.0  
**最後更新**: 2025-08-26  
**維護者**: ShopBot 開發團隊
