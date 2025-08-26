/**
 * 用户模块 - 用户管理功能模块
 * 
 * 模块组成：
 * - UserEntity: 用户数据模型
 * - UserService: 用户业务逻辑服务
 * - UserController: 用户API接口
 * 
 * 依赖配置：
 * - TypeOrmModule: 数据库ORM支持
 * - 导出UserService供其他模块使用（如认证模块）
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], // 导出服务供其他模块使用
})
export class UserModule {}