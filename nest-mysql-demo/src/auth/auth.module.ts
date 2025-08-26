/**
 * 认证模块 - 用户身份验证和授权管理
 * 
 * 模块组成：
 * - AuthService: 认证核心业务逻辑
 * - AuthController: 认证API接口
 * - JwtStrategy: JWT令牌验证策略
 * - 依赖UserModule获取用户数据
 * 
 * 配置说明：
 * - JWT密钥通过constants配置，生产环境应从环境变量获取
 * - Token有效期默认60分钟，可根据需求调整
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UserModule, // 用户模块，提供用户数据操作
    PassportModule, // Passport认证模块
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService], // 导出AuthService供其他模块使用
})
export class AuthModule {}