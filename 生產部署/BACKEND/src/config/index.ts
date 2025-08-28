import dotenv from 'dotenv';
import { z } from 'zod';

// 載入環境變數
dotenv.config();

// 環境變數驗證 schema
const envSchema = z.object({
  // 應用配置
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  API_VERSION: z.string().default('v1'),

  // 區塊鏈配置
  TRON_NETWORK: z.enum(['mainnet', 'shasta']).default('shasta'),
  TRON_API_KEY: z.string().optional(),
  TRON_PRIVATE_KEY: z.string().optional(),
  USDT_CONTRACT_ADDRESS: z.string().default('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'),
  PAYMENT_CONTRACT_ADDRESS: z.string().optional(),

  // 支付配置
  MIN_PAYMENT_AMOUNT: z.string().transform(Number).default('1'),
  MAX_PAYMENT_AMOUNT: z.string().transform(Number).default('10000'),
  PAYMENT_TIMEOUT: z.string().transform(Number).default('1800'),
  REQUIRED_CONFIRMATIONS: z.string().transform(Number).default('20'),

  // 安全配置
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32),
  API_RATE_LIMIT: z.string().transform(Number).default('1000'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Firebase 配置
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_PRIVATE_KEY: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string(),

  // Redis 配置
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default('0'),

  // 匯率 API 配置
  EXCHANGE_RATE_API_KEY: z.string().optional(),
  CHAINLINK_API_KEY: z.string().optional(),
  COINGECKO_API_KEY: z.string().optional(),
  BINANCE_API_KEY: z.string().optional(),

  // 監控配置
  ENABLE_MONITORING: z.string().transform(val => val === 'true').default('true'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  METRICS_PORT: z.string().transform(Number).default('9090'),
  SENTRY_DSN: z.string().optional(),

  // 通知配置
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  EMAIL_SERVICE: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASSWORD: z.string().optional(),

  // 代理系統配置
  MAX_AGENT_LEVELS: z.string().transform(Number).default('3'),
  BASE_COMMISSION_RATE: z.string().transform(Number).default('1500'),
  REFERRAL_BONUS: z.string().transform(Number).default('50'),
});

// 驗證環境變數
const envParseResult = envSchema.safeParse(process.env);

if (!envParseResult.success) {
  console.error('❌ 環境變數驗證失敗:');
  console.error(envParseResult.error.format());
  process.exit(1);
}

const config = envParseResult.data;

// 導出配置
export default {
  app: {
    env: config.NODE_ENV,
    port: config.PORT,
    apiVersion: config.API_VERSION,
  },
  blockchain: {
    network: config.TRON_NETWORK,
    apiKey: config.TRON_API_KEY,
    privateKey: config.TRON_PRIVATE_KEY,
    usdtContractAddress: config.USDT_CONTRACT_ADDRESS,
    paymentContractAddress: config.PAYMENT_CONTRACT_ADDRESS,
  },
  payment: {
    minAmount: config.MIN_PAYMENT_AMOUNT,
    maxAmount: config.MAX_PAYMENT_AMOUNT,
    timeout: config.PAYMENT_TIMEOUT,
    requiredConfirmations: config.REQUIRED_CONFIRMATIONS,
  },
  security: {
    jwtSecret: config.JWT_SECRET,
    encryptionKey: config.ENCRYPTION_KEY,
    rateLimit: config.API_RATE_LIMIT,
    corsOrigin: config.CORS_ORIGIN.split(','),
  },
  firebase: {
    projectId: config.FIREBASE_PROJECT_ID,
    privateKey: config.FIREBASE_PRIVATE_KEY,
    clientEmail: config.FIREBASE_CLIENT_EMAIL,
  },
  redis: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    password: config.REDIS_PASSWORD,
    db: config.REDIS_DB,
  },
  exchange: {
    apiKey: config.EXCHANGE_RATE_API_KEY,
    chainlinkApiKey: config.CHAINLINK_API_KEY,
    coingeckoApiKey: config.COINGECKO_API_KEY,
    binanceApiKey: config.BINANCE_API_KEY,
  },
  monitoring: {
    enabled: config.ENABLE_MONITORING,
    logLevel: config.LOG_LEVEL,
    metricsPort: config.METRICS_PORT,
    sentryDsn: config.SENTRY_DSN,
  },
  notification: {
    telegramBotToken: config.TELEGRAM_BOT_TOKEN,
    emailService: config.EMAIL_SERVICE,
    emailUser: config.EMAIL_USER,
    emailPassword: config.EMAIL_PASSWORD,
  },
  agent: {
    maxLevels: config.MAX_AGENT_LEVELS,
    baseCommissionRate: config.BASE_COMMISSION_RATE,
    referralBonus: config.REFERRAL_BONUS,
  },
} as const;

// 導出類型
export type Config = typeof config;
