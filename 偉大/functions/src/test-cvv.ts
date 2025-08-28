/**
 * CVV API 測試文件
 * 用於驗證 CVV 服務和路由是否正常工作
 */

import { cvvService } from './services/cvv';
import { CVVStatus, CVVType, CVVLevel } from './types/cvv';

// 測試數據
const testCardData = {
  cardNumber: '4111111111111111',
  cvv: '123',
  expiryMonth: '12',
  expiryYear: '2026',
  cardType: CVVType.VISA,
  cardLevel: CVVLevel.CLASSIC,
  country: 'US',
  bank: 'Test Bank',
  price: 15.99
};

async function testCVVService() {
  console.log('🧪 開始測試 CVV 服務...\n');

  try {
    // 測試 1: 搜索卡片
    console.log('📋 測試 1: 搜索卡片');
    const searchResult = await cvvService.searchCards({
      status: [CVVStatus.AVAILABLE],
      limit: 5
    });
    console.log('✅ 搜索結果:', searchResult.success ? '成功' : '失敗');
    if (searchResult.success) {
      console.log(`   找到 ${searchResult.data?.length || 0} 張卡片`);
    }
    console.log('');

    // 測試 2: 獲取庫存統計
    console.log('📊 測試 2: 獲取庫存統計');
    const statsResult = await cvvService.getInventoryStats();
    console.log('✅ 統計結果:', statsResult.success ? '成功' : '失敗');
    if (statsResult.success && statsResult.data) {
      console.log(`   總卡片數: ${statsResult.data.total}`);
      console.log(`   可用卡片: ${statsResult.data.available}`);
      console.log(`   已售卡片: ${statsResult.data.sold}`);
    }
    console.log('');

    // 測試 3: 檢查配置
    console.log('⚙️ 測試 3: 檢查配置');
    console.log('✅ CVV 狀態枚舉:', Object.values(CVVStatus));
    console.log('✅ CVV 類型枚舉:', Object.values(CVVType));
    console.log('✅ CVV 等級枚舉:', Object.values(CVVLevel));
    console.log('');

    console.log('🎉 CVV 服務測試完成！');
    console.log('📝 注意: 這是離線測試，沒有實際的數據庫連接');

  } catch (error) {
    console.error('❌ 測試失敗:', error);
  }
}

// 如果直接運行此文件，執行測試
if (require.main === module) {
  testCVVService();
}

export { testCVVService };
