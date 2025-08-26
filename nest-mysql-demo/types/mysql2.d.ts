/**
 * MySQL2 认证模块类型声明
 * 
 * 功能说明：
 * - 为 mysql2 库的 caching_sha2_password 认证插件提供类型定义
 * - 解决 TypeScript 无法识别该模块的问题
 * - 确保数据库连接配置的类型安全
 * 
 * 背景信息：
 * - MySQL 8.0+ 默认使用 caching_sha2_password 认证方式
 * - Node.js 的 mysql2 库需要特殊配置来处理这种认证
 * - 此声明使 TypeScript 能够识别相关的认证方法
 */

declare module 'mysql2/lib/auth/caching_sha2_password' {
  /**
   * caching_sha2_password 认证方法
   * @param options 认证选项，包含密码等信息
   * @returns 认证处理器
   */
  export function auth(options: { password: string }): any;
}