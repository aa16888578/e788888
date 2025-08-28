import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import logger from '../config/logger';

// 擴展 Request 類型
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * JWT 認證中間件
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: '訪問令牌缺失',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.security.jwtSecret) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    logger.warn('JWT 驗證失敗:', { token: token.substring(0, 10) + '...' });
    res.status(403).json({
      success: false,
      error: '訪問令牌無效',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    });
  }
};

/**
 * 角色權限檢查中間件
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: '未授權訪問',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('權限不足:', { user: req.user.email, requiredRoles: roles, userRole: req.user.role });
      res.status(403).json({
        success: false,
        error: '權限不足',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      });
      return;
    }

    next();
  };
};

/**
 * 管理員權限檢查
 */
export const requireAdmin = requireRole(['admin']);

/**
 * 代理權限檢查
 */
export const requireAgent = requireRole(['admin', 'agent']);

/**
 * 生成 JWT 令牌
 */
export const generateToken = (payload: { id: string; email: string; role: string }): string => {
  return jwt.sign(payload, config.security.jwtSecret, { expiresIn: '24h' });
};

/**
 * 驗證 JWT 令牌
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.security.jwtSecret);
  } catch (error) {
    return null;
  }
};
