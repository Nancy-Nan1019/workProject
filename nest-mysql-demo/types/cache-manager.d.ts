/**
 * cache-manager 类型扩展声明
 * 
 * 功能说明：
 * - 为 cache-manager 库添加 TypeScript 类型定义
 * - 解决默认类型定义不完整或缺失的问题
 * - 确保代码中的缓存操作具有正确的类型检查
 * 
 * 为什么需要：
 * - 原始类型可能缺少某些方法的类型定义
 * - 提供更严格的类型安全保证
 * - 避免在使用缓存时出现类型错误
 */
import 'cache-manager';

declare module 'cache-manager' {
  interface Cache {
    /**
     * 获取缓存值
     * @param key 缓存键
     * @returns 缓存值或undefined（如果不存在）
     */
    get<T>(key: string): Promise<T | undefined>;

    /**
     * 设置缓存值
     * @param key 缓存键
     * @param value 缓存值
     * @param options 缓存选项（包含TTL有效期）
     */
    set(key: string, value: any, options?: { ttl: number }): Promise<void>;
    
    /**
     * 删除缓存键
     * @param key 要删除的缓存键
     */
    del(key: string): Promise<void>;
  }
}