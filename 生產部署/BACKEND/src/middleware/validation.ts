import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

/**
 * 創建支付請求驗證
 */
export const validateCreatePayment = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    orderId: Joi.string().required().messages({
      'string.empty': '訂單ID不能為空',
      'any.required': '訂單ID是必需的',
    }),
    amount: Joi.number().positive().required().messages({
      'number.base': '金額必須是數字',
      'number.positive': '金額必須大於0',
      'any.required': '金額是必需的',
    }),
    currency: Joi.string().valid('USD', 'EUR', 'CNY', 'JPY', 'USDT').required().messages({
      'string.empty': '貨幣不能為空',
      'any.only': '不支持的貨幣類型',
      'any.required': '貨幣是必需的',
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      error: error.details[0].message,
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
    return;
  }

  next();
};

/**
 * 支付ID驗證
 */
export const validatePaymentId = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    paymentId: Joi.string().uuid().required().messages({
      'string.empty': '支付ID不能為空',
      'string.guid': '支付ID格式無效',
      'any.required': '支付ID是必需的',
    }),
  });

  const { error } = schema.validate(req.params);
  if (error) {
    res.status(400).json({
      success: false,
      error: error.details[0].message,
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
    return;
  }

  next();
};

/**
 * 分頁參數驗證
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': '頁碼必須是數字',
      'number.integer': '頁碼必須是整數',
      'number.min': '頁碼必須大於0',
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      'number.base': '限制必須是數字',
      'number.integer': '限制必須是整數',
      'number.min': '限制必須大於0',
      'number.max': '限制不能超過100',
    }),
    sortBy: Joi.string().valid('createdAt', 'amount', 'status').optional().messages({
      'any.only': '排序字段無效',
    }),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
      'any.only': '排序順序無效',
    }),
  });

  const { error } = schema.validate(req.query);
  if (error) {
    res.status(400).json({
      success: false,
      error: error.details[0].message,
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
    return;
  }

  next();
};

/**
 * 通用錯誤處理中間件
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('錯誤處理中間件:', err);

  res.status(500).json({
    success: false,
    error: '內部服務器錯誤',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || uuidv4(),
  });
};

/**
 * 請求日誌中間件
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
};
