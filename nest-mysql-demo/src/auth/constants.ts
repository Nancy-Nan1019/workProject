/**
 * JWT配置常量
 * 
 * 注意：生产环境必须通过环境变量设置secret
 * 建议使用强随机字符串，长度至少32字符
 */

export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'your-secret-key', // 生产环境应该使用环境变量
  expiresIn: process.env.JWT_EXPIRES_IN || '60m', // 令牌有效期
};