/**
 * Express 请求类型扩展声明
 * 
 * 功能说明：
 * - 扩展 Express 的 Request 接口，添加用户信息类型
 * - 确保在中间件和控制器中能够正确访问用户信息
 * - 提供完整的用户对象类型定义
 * 
 * 使用场景：
 * - JWT 认证中间件将用户信息附加到请求对象
 * - 控制器中通过 @Req() 装饰器访问用户信息
 * - 类型安全的用户数据访问
 */

import { User } from '../user/user.entity';

declare global {
  namespace Express {
    interface Request {
      /**
       * 认证用户信息
       * - 在认证成功后由守卫或中间件设置
       * - 包含用户的完整信息和身份验证状态
       */
      user?: {
        id: number;
        email: string;
        username: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
        status: 'active' | 'inactive';
        // 其他业务需要的用户字段
      }& Express.User; // 合并 Express 默认用户类型
    }
  }
}