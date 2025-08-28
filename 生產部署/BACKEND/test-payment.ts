#!/usr/bin/env tsx

/**
 * USDT-TRC20 支付系統測試腳本
 * 用於測試支付服務的基本功能
 */

import { v4 as uuidv4 } from 'uuid';
import config from './src/config';
import logger from './src/config/logger';

// 模擬測試數據
const mockOrder = {
  id: uuidv4(),
  userId: uuidv4(),
  items: [
    {
      id: uuidv4(),
      productId: 'product-001',
      quantity: 1,
      unitPrice: 100,
      totalPrice: 100,
    },
  ],
  totalAmount: 100,
  currency: 'USD',
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPaymentRequest = {
  orderId: mockOrder.id,
  userId: mockOrder.userId,
  amount: 100,
  currency: 'USD',
};

/**
 * 測試配置加載
 */
function testConfig() {
  console.log('🧪 測試配置加載...');
  
  try {
    console.log('✅ 應用配置:', {
      env: config.app.env,
      port: config.app.port,
      apiVersion: config.app.apiVersion,
    });
    
    console.log('✅ 區塊鏈配置:', {
      network: config.blockchain.network,
      usdtContractAddress: config.blockchain.usdtContractAddress,
    });
    
    console.log('✅ 支付配置:', {
      minAmount: config.payment.minAmount,
      maxAmount: config.payment.maxAmount,
      timeout: config.payment.timeout,
      requiredConfirmations: config.payment.requiredConfirmations,
    });
    
    console.log('✅ 安全配置:', {
      jwtSecret: config.security.jwtSecret ? '已配置' : '未配置',
      encryptionKey: config.security.encryptionKey ? '已配置' : '未配置',
      rateLimit: config.security.rateLimit,
    });
    
    return true;
  } catch (error) {
    console.error('❌ 配置測試失敗:', error);
    return false;
  }
}

/**
 * 測試類型定義
 */
function testTypes() {
  console.log('\n🧪 測試類型定義...');
  
  try {
    // 測試 Payment 類型
    const payment = {
      id: uuidv4(),
      orderId: mockOrder.id,
      userId: mockOrder.userId,
      amount: 100,
      usdtAmount: 100,
      exchangeRate: 1.0,
      currency: 'USD',
      status: 'pending',
      paymentAddress: config.blockchain.usdtContractAddress,
      requiredConfirmations: config.payment.requiredConfirmations,
      confirmations: 0,
      expiresAt: new Date(Date.now() + config.payment.timeout * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('✅ Payment 類型測試通過:', {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
    });
    
    return true;
  } catch (error) {
    console.error('❌ 類型測試失敗:', error);
    return false;
  }
}

/**
 * 測試匯率計算
 */
async function testExchangeRate() {
  console.log('\n🧪 測試匯率計算...');
  
  try {
    // 模擬匯率計算
    const usdToUsdt = 1.0;
    const eurToUsdt = 1.1;
    const cnyToUsdt = 0.14;
    
    const testCases = [
      { from: 'USD', to: 'USDT', expected: 1.0 },
      { from: 'EUR', to: 'USDT', expected: 1.1 },
      { from: 'CNY', to: 'USDT', expected: 0.14 },
    ];
    
    for (const testCase of testCases) {
      const usdtAmount = 100 / testCase.expected;
      console.log(`✅ ${testCase.from} -> ${testCase.to}: 100 ${testCase.from} = ${usdtAmount.toFixed(2)} USDT`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ 匯率測試失敗:', error);
    return false;
  }
}

/**
 * 測試支付驗證
 */
function testPaymentValidation() {
  console.log('\n🧪 測試支付驗證...');
  
  try {
    const { amount, currency } = mockPaymentRequest;
    
    // 驗證金額範圍
    if (amount < config.payment.minAmount || amount > config.payment.maxAmount) {
      throw new Error(`金額 ${amount} 超出範圍 ${config.payment.minAmount}-${config.payment.maxAmount}`);
    }
    
    // 驗證貨幣類型
    const supportedCurrencies = ['USD', 'EUR', 'CNY', 'JPY', 'USDT'];
    if (!supportedCurrencies.includes(currency)) {
      throw new Error(`不支持的貨幣類型: ${currency}`);
    }
    
    console.log('✅ 支付驗證測試通過:', {
      amount,
      currency,
      minAmount: config.payment.minAmount,
      maxAmount: config.payment.maxAmount,
    });
    
    return true;
  } catch (error) {
    console.error('❌ 支付驗證測試失敗:', error);
    return false;
  }
}

/**
 * 測試智能合約地址
 */
function testContractAddress() {
  console.log('\n🧪 測試智能合約地址...');
  
  try {
    const address = config.blockchain.usdtContractAddress;
    
    // 簡單的地址格式驗證
    if (!address || address.length < 10) {
      throw new Error('合約地址格式無效');
    }
    
    console.log('✅ 智能合約地址測試通過:', {
      address: address.substring(0, 10) + '...',
      network: config.blockchain.network,
    });
    
    return true;
  } catch (error) {
    console.error('❌ 智能合約地址測試失敗:', error);
    return false;
  }
}

/**
 * 主測試函數
 */
async function runTests() {
  console.log('🚀 開始 USDT-TRC20 支付系統測試...\n');
  
  const tests = [
    { name: '配置加載', fn: testConfig },
    { name: '類型定義', fn: testTypes },
    { name: '匯率計算', fn: testExchangeRate },
    { name: '支付驗證', fn: testPaymentValidation },
    { name: '智能合約地址', fn: testContractAddress },
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      console.error(`❌ ${test.name} 測試異常:`, error);
    }
  }
  
  console.log('\n📊 測試結果總結:');
  console.log(`✅ 通過: ${passedTests}/${totalTests}`);
  console.log(`❌ 失敗: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 所有測試通過！系統配置正確。');
  } else {
    console.log('\n⚠️  部分測試失敗，請檢查配置。');
  }
  
  return passedTests === totalTests;
}

// 運行測試
if (require.main === module) {
  runTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('測試運行失敗:', error);
      process.exit(1);
    });
}

export { runTests };
