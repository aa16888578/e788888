import axios from 'axios';
import config from '../config';
import logger from '../config/logger';

// 匯率緩存
const rateCache = new Map<string, { rate: number; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5分鐘

/**
 * 獲取匯率
 */
export const getExchangeRate = async (fromCurrency: string, toCurrency: string): Promise<number> => {
  try {
    const cacheKey = `${fromCurrency}_${toCurrency}`;
    const now = Date.now();
    
    // 檢查緩存
    const cached = rateCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      logger.debug(`使用緩存匯率: ${cacheKey} = ${cached.rate}`);
      return cached.rate;
    }
    
    // 獲取新匯率
    const rate = await fetchExchangeRate(fromCurrency, toCurrency);
    
    // 更新緩存
    rateCache.set(cacheKey, { rate, timestamp: now });
    
    logger.info(`匯率更新: ${fromCurrency} -> ${toCurrency} = ${rate}`);
    return rate;
    
  } catch (error) {
    logger.error('獲取匯率失敗:', error);
    
    // 返回緩存值或默認值
    const cached = rateCache.get(`${fromCurrency}_${toCurrency}`);
    if (cached) {
      logger.warn(`使用過期緩存匯率: ${fromCurrency} -> ${toCurrency} = ${cached.rate}`);
      return cached.rate;
    }
    
    // 返回默認匯率
    return getDefaultRate(fromCurrency, toCurrency);
  }
};

/**
 * 從多個來源獲取匯率
 */
const fetchExchangeRate = async (fromCurrency: string, toCurrency: string): Promise<number> => {
  const sources = [
    () => fetchFromCoinGecko(fromCurrency, toCurrency),
    () => fetchFromBinance(fromCurrency, toCurrency),
    () => fetchFromChainlink(fromCurrency, toCurrency),
  ];
  
  for (const source of sources) {
    try {
      const rate = await source();
      if (rate > 0) {
        return rate;
      }
    } catch (error) {
      logger.warn(`匯率來源失敗:`, error);
      continue;
    }
  }
  
  throw new Error('所有匯率來源都失敗');
};

/**
 * 從 CoinGecko 獲取匯率
 */
const fetchFromCoinGecko = async (fromCurrency: string, toCurrency: string): Promise<number> => {
  if (!config.exchange.coingeckoApiKey) {
    throw new Error('CoinGecko API key 未配置');
  }
  
  const response = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${fromCurrency.toLowerCase()}&vs_currencies=${toCurrency.toLowerCase()}`,
    {
      headers: {
        'X-CG-API-KEY': config.exchange.coingeckoApiKey,
      },
      timeout: 5000,
    }
  );
  
  const rate = response.data[fromCurrency.toLowerCase()]?.[toCurrency.toLowerCase()];
  if (!rate || rate <= 0) {
    throw new Error('無效的匯率數據');
  }
  
  return rate;
};

/**
 * 從 Binance 獲取匯率
 */
const fetchFromBinance = async (fromCurrency: string, toCurrency: string): Promise<number> => {
  if (!config.exchange.binanceApiKey) {
    throw new Error('Binance API key 未配置');
  }
  
  const symbol = `${fromCurrency}${toCurrency}`;
  const response = await axios.get(
    `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`,
    {
      headers: {
        'X-MBX-APIKEY': config.exchange.binanceApiKey,
      },
      timeout: 5000,
    }
  );
  
  const rate = parseFloat(response.data.price);
  if (!rate || rate <= 0) {
    throw new Error('無效的匯率數據');
  }
  
  return rate;
};

/**
 * 從 Chainlink 獲取匯率
 */
const fetchFromChainlink = async (fromCurrency: string, toCurrency: string): Promise<number> => {
  if (!config.exchange.chainlinkApiKey) {
    throw new Error('Chainlink API key 未配置');
  }
  
  // 這裡應該調用 Chainlink 預言機合約
  // 暫時返回錯誤
  throw new Error('Chainlink 匯率獲取未實現');
};

/**
 * 獲取默認匯率
 */
const getDefaultRate = (fromCurrency: string, toCurrency: string): number => {
  const defaultRates: Record<string, Record<string, number>> = {
    USD: { USDT: 1.0 },
    EUR: { USDT: 1.1 },
    CNY: { USDT: 0.14 },
    JPY: { USDT: 0.0067 },
    USDT: { USD: 1.0, EUR: 0.91, CNY: 7.14, JPY: 149.25 },
  };
  
  const rate = defaultRates[fromCurrency]?.[toCurrency];
  if (rate) {
    logger.warn(`使用默認匯率: ${fromCurrency} -> ${toCurrency} = ${rate}`);
    return rate;
  }
  
  // 如果沒有默認匯率，返回 1.0
  logger.warn(`未找到匯率，使用默認值 1.0: ${fromCurrency} -> ${toCurrency}`);
  return 1.0;
};

/**
 * 批量獲取匯率
 */
export const getBatchExchangeRates = async (
  pairs: Array<{ from: string; to: string }>
): Promise<Record<string, number>> => {
  const rates: Record<string, number> = {};
  
  await Promise.all(
    pairs.map(async ({ from, to }) => {
      try {
        const rate = await getExchangeRate(from, to);
        rates[`${from}_${to}`] = rate;
      } catch (error) {
        logger.error(`獲取匯率失敗: ${from} -> ${to}`, error);
        rates[`${from}_${to}`] = getDefaultRate(from, to);
      }
    })
  );
  
  return rates;
};

/**
 * 清除匯率緩存
 */
export const clearRateCache = (): void => {
  rateCache.clear();
  logger.info('匯率緩存已清除');
};

/**
 * 獲取緩存統計
 */
export const getCacheStats = () => {
  const now = Date.now();
  const validEntries = Array.from(rateCache.entries()).filter(
    ([, { timestamp }]) => (now - timestamp) < CACHE_TTL
  );
  
  return {
    totalEntries: rateCache.size,
    validEntries: validEntries.length,
    expiredEntries: rateCache.size - validEntries.length,
  };
};

export default {
  getExchangeRate,
  getBatchExchangeRates,
  clearRateCache,
  getCacheStats,
};
