import TronWeb from 'tronweb';
import config from '../config';
import logger from '../config/logger';

let tronWebInstance: TronWeb | null = null;

/**
 * 獲取 TronWeb 實例
 */
export const getTronWeb = (): TronWeb => {
  if (!tronWebInstance) {
    const network = config.blockchain.network;
    
    if (network === 'mainnet') {
      tronWebInstance = new TronWeb({
        fullHost: 'https://api.trongrid.io',
        headers: { 'TRON-PRO-API-KEY': config.blockchain.apiKey },
        privateKey: config.blockchain.privateKey,
      });
    } else {
      // 測試網
      tronWebInstance = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io',
        headers: { 'TRON-PRO-API-KEY': config.blockchain.apiKey },
        privateKey: config.blockchain.privateKey,
      });
    }
    
    logger.info(`TronWeb 初始化成功，網絡: ${network}`);
  }
  
  return tronWebInstance;
};

/**
 * 檢查 USDT 餘額
 */
export const checkUSDTBalance = async (address: string): Promise<number> => {
  try {
    const tronWeb = getTronWeb();
    const contract = await tronWeb.contract().at(config.blockchain.usdtContractAddress);
    
    const balance = await contract.balanceOf(address).call();
    const decimals = await contract.decimals().call();
    
    return balance / Math.pow(10, decimals);
  } catch (error) {
    logger.error('檢查 USDT 餘額失敗:', error);
    throw error;
  }
};

/**
 * 驗證地址格式
 */
export const isValidAddress = (address: string): boolean => {
  try {
    const tronWeb = getTronWeb();
    return tronWeb.isAddress(address);
  } catch (error) {
    return false;
  }
};

/**
 * 獲取交易詳情
 */
export const getTransactionDetails = async (txHash: string) => {
  try {
    const tronWeb = getTronWeb();
    return await tronWeb.trx.getTransaction(txHash);
  } catch (error) {
    logger.error('獲取交易詳情失敗:', error);
    throw error;
  }
};

/**
 * 獲取當前區塊高度
 */
export const getCurrentBlockHeight = async (): Promise<number> => {
  try {
    const tronWeb = getTronWeb();
    const block = await tronWeb.trx.getCurrentBlock();
    return block.block_header.raw_data.number;
  } catch (error) {
    logger.error('獲取當前區塊高度失敗:', error);
    throw error;
  }
};

/**
 * 監控地址交易
 */
export const monitorAddressTransactions = async (address: string, callback: (tx: any) => void) => {
  try {
    const tronWeb = getTronWeb();
    
    // 這裡應該實現實際的交易監控邏輯
    // 可以使用 WebSocket 或輪詢方式
    logger.info(`開始監控地址交易: ${address}`);
    
    // 模擬監控邏輯
    setInterval(async () => {
      try {
        const transactions = await tronWeb.trx.getTransactionsRelatedToAddress(address);
        if (transactions && transactions.length > 0) {
          transactions.forEach(callback);
        }
      } catch (error) {
        logger.error('監控交易失敗:', error);
      }
    }, 10000); // 每10秒檢查一次
    
  } catch (error) {
    logger.error('啟動地址監控失敗:', error);
    throw error;
  }
};

export default {
  getTronWeb,
  checkUSDTBalance,
  isValidAddress,
  getTransactionDetails,
  getCurrentBlockHeight,
  monitorAddressTransactions,
};
