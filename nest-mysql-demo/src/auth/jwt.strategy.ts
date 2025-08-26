/**
 * JWT认证策略 - 验证HTTP请求中的Bearer Token
 * 
 * 功能说明：
 * - 从Authorization头提取JWT令牌
 * - 验证令牌签名和有效期
 * - 解析令牌payload并附加到请求对象
 * 
 * 配置选项：
 * - jwtFromRequest: 令牌提取方式
 * - ignoreExpiration: 是否忽略过期（生产环境应为false）
 * - secretOrKey: 验证签名使用的密钥
 */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // 不忽略过期令牌
      secretOrKey: jwtConstants.secret,
    });
  }

  /**
   * JWT验证回调
   * @param payload 解析后的令牌payload
   * @returns 附加到请求对象的用户信息
   */
  async validate(payload: any) {
    return { 
      id: payload.sub, 
      email: payload.email,
      username: payload.username 
    };
  }
}