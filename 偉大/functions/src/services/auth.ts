import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from './database';
import { User, TelegramAuth, AuthToken } from '../types';
import * as crypto from 'crypto';

// 認證服務類
export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly SESSION_DURATION = 30 * 60 * 1000; // 30 分鐘

  // 生成會話令牌
  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // 生成 JWT 令牌
  static generateJWTToken(authData: AuthToken): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload = {
      ...authData,
      exp: Math.floor(Date.now() / 1000) + (this.SESSION_DURATION / 1000),
      iat: Math.floor(Date.now() / 1000)
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', this.JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  // 驗證 JWT 令牌
  static verifyJWTToken(token: string): AuthToken | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [header, payload, signature] = parts;
      
      // 驗證簽名
      const expectedSignature = crypto
        .createHmac('sha256', this.JWT_SECRET)
        .update(`${header}.${payload}`)
        .digest('base64url');

      if (signature !== expectedSignature) return null;

      // 解析載荷
      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
      
      // 檢查過期時間
      if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return decodedPayload as AuthToken;
    } catch (error) {
      return null;
    }
  }

  // 創建或獲取用戶
  static async createOrGetUser(telegramAuth: TelegramAuth): Promise<User> {
    try {
      // 檢查用戶是否已存在
      let user = await DatabaseService.getUserByTelegramId(telegramAuth.telegramId);
      
      if (!user) {
        // 創建新用戶
        user = await DatabaseService.createUser({
          telegramId: telegramAuth.telegramId,
          username: telegramAuth.username,
          firstName: telegramAuth.firstName,
          lastName: telegramAuth.lastName,
          languageCode: telegramAuth.languageCode,
          role: 'user',
          status: 'active',
          permissions: [],
          lastLogin: new Date()
        });
      } else {
        // 更新最後登入時間
        await DatabaseService.updateUser(user.id, {
          lastLogin: new Date(),
          username: telegramAuth.username,
          firstName: telegramAuth.firstName,
          lastName: telegramAuth.lastName,
          languageCode: telegramAuth.languageCode
        });
      }

      return user;
    } catch (error) {
      throw new Error(`Failed to create or get user: ${error}`);
    }
  }

  // 創建會話
  static async createSession(telegramId: number): Promise<{ sessionToken: string; expiresAt: Date }> {
    try {
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + this.SESSION_DURATION);

      await DatabaseService.createSession({
        telegramId,
        sessionToken,
        expiresAt,
        lastActivity: new Date()
      });

      return { sessionToken, expiresAt };
    } catch (error) {
      throw new Error(`Failed to create session: ${error}`);
    }
  }

  // 驗證會話
  static async validateSession(sessionToken: string): Promise<User | null> {
    try {
      const session = await DatabaseService.getSessionByToken(sessionToken);
      if (!session) return null;

      // 更新最後活動時間
      await DatabaseService.updateUser(session.id, {
        lastActivity: new Date()
      });

      // 獲取用戶信息
      return await DatabaseService.getUserByTelegramId(session.telegramId);
    } catch (error) {
      return null;
    }
  }

  // 登出
  static async logout(sessionToken: string): Promise<void> {
    try {
      const session = await DatabaseService.getSessionByToken(sessionToken);
      if (session) {
        await DatabaseService.deleteSession(session.id);
      }
    } catch (error) {
      // 忽略錯誤，確保登出總是成功
    }
  }

  // 檢查權限
  static hasPermission(user: User, permission: string): boolean {
    return user.permissions.includes(permission) || user.role === 'admin';
  }

  // 檢查角色
  static hasRole(user: User, role: string): boolean {
    return user.role === role || user.role === 'admin';
  }
}

// 認證中間件
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const sessionToken = req.headers['x-session-token'] as string;

    if (!authHeader && !sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: '請提供認證信息'
      });
    }

    let user: User | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // JWT 認證
      const token = authHeader.substring(7);
      const authData = AuthService.verifyJWTToken(token);
      
      if (authData) {
        user = await DatabaseService.getUserByTelegramId(authData.telegramId);
      }
    } else if (sessionToken) {
      // 會話認證
      user = await AuthService.validateSession(sessionToken);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication',
        message: '認證無效'
      });
    }

    // 將用戶信息添加到請求對象
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: '認證過程發生錯誤'
    });
  }
};

// 權限檢查中間件
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as User;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: '請先登入'
      });
    }

    if (!AuthService.hasPermission(user, permission)) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied',
        message: '權限不足'
      });
    }

    next();
  };
};

// 角色檢查中間件
export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as User;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: '請先登入'
      });
    }

    if (!AuthService.hasRole(user, role)) {
      return res.status(403).json({
        success: false,
        error: 'Role required',
        message: '需要特定角色權限'
      });
    }

    next();
  };
};
