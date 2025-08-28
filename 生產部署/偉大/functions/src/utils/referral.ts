/**
 * 推薦碼生成工具
 */

/**
 * 生成唯一的推薦碼
 * 格式：AGENT + 6位隨機字符
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'AGENT';
  
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * 驗證推薦碼格式
 */
export function validateReferralCode(code: string): boolean {
  const pattern = /^AGENT[A-Z0-9]{6}$/;
  return pattern.test(code);
}

/**
 * 生成短推薦碼（用於分享）
 * 格式：AG + 4位隨機字符
 */
export function generateShortReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'AG';
  
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}
