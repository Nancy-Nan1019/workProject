/**
 * 测试控制器 - 提供系统组件测试接口
 * 
 * 功能说明：
 * - 测试Redis连接和缓存功能
 * - 验证系统组件可用性
 * - 提供诊断和监控接口
 * 
 * 注意：生产环境应考虑禁用或保护这些测试接口
 */

import { Controller, Get, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisClientType } from 'redis';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiInternalServerErrorResponse 
} from '@nestjs/swagger';

@ApiTags('System Test') // API文档分组
@Controller('test')
export class TestController {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache
  ) {}

  /**
   * Redis连接测试接口
   */
  @Get('redis-connection')
  @ApiOperation({ 
    summary: '测试Redis连接', 
    description: '测试Redis基础缓存操作和原始客户端连接' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Redis连接测试成功',
    schema: {
      example: {
        cacheSuccess: true,
        redisSuccess: true,
        message: '测试完成'
      }
    }
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Redis连接失败',
    schema: {
      example: {
        success: false,
        error: 'Connection refused',
        message: 'Redis 连接失败'
      }
    }
  })
  async testRedisConnection() {
    try {
      // 测试基础缓存操作
      await this.cacheManager.set('manual_test', 'hello_redis', {ttl:60 * 1000},); // TTL 单位毫秒
      const val = await this.cacheManager.get('manual_test');

      // 获取Redis原始客户端进行底层测试
      const redisClient = await this.getRedisClient();
      
      if (!redisClient) {
        throw new Error('Redis client not available');
      }

      await redisClient.set('raw_redis_test', 'raw_value');
      const rawVal = await redisClient.get('raw_redis_test');

      return {
        cacheSuccess: val === 'hello_redis',
        redisSuccess: rawVal === 'raw_value',
        message: '测试完成'
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
        message: 'Redis 连接失败'
      };
    }
  }

  /**
   * 获取底层Redis客户端（兼容不同版本）
   */
  private async getRedisClient(): Promise<RedisClientType | undefined> {
    const store = (this.cacheManager as any).store;
    
    if (!store) return undefined;
    
   // 兼容不同版本的Redis存储实现
    if (store.getClient) {
      return store.getClient();
    }
    
    if (store.client) {
      return store.client;
    }
    
    return undefined;
  }
}