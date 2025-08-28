import { Request, Response, NextFunction } from 'express';

// 擴展 Request 接口以包含 user 屬性
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        telegramId: number;
        role: string;
      };
    }
  }
}

// 簡化的認證中間件
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // TODO: 實現實際的認證邏輯
    // 暫時跳過認證，直接放行
    req.user = {
      id: 'temp-user-id',
      telegramId: 123456789,
      role: 'user'
    };
    next();
  } catch (error) {
    res.status(401).json({ error: '未授權' });
  }
};

// 角色檢查中間件
export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: '未授權' });
      return;
    }
    
    if (req.user.role !== role && req.user.role !== 'admin') {
      res.status(403).json({ error: '權限不足' });
      return;
    }
    
    next();
  };
};
