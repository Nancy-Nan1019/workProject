/**
 * 应用根模块 - NestJS应用的主模块
 * 
 * 模块功能：
 * - 配置和导入所有子模块
 * - 设置数据库连接和ORM配置
 * - 配置全局缓存和配置管理
 * - 注册控制器和服务
 * 
 * 核心配置：
 * - TypeORM数据库连接
 * - Redis缓存配置
 * - 环境变量配置
 * - 跨模块依赖管理
 */


import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { CompanyModule } from './company/company.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TestController } from './test.controller'; 
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { User } from './user/user.entity';

@Module({
  imports: [
    // 数据库配置
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'Nan2004SVM',
      database: 'nest_demo',
      entities: [__dirname + '/**/*.entity{.ts,.js}', User], // 确保这行存在
      synchronize: true,// 生产环境应设为false
      logging: true,// 开发环境开启日志
      connectorPackage: 'mysql2',
      extra: {
        authPlugins: {
          caching_sha2_password: () => require('mysql2/lib/auth/caching_sha2_password').auth({
            password: 'Nan2004SVM'
          })
        }
      }
    }),

    // 业务模块
    UserModule,
    AuthModule,
    CompanyModule,

    // 配置模块（全局）
    ConfigModule.forRoot({
      isGlobal: true, // 使 ConfigService 全局可用
    }),

    // 缓存模块（全局Redis配置）
   CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: '127.0.0.1',
            port: 6379
          },
          ttl: 60 * 1000, // 缓存有效期60秒
        }),
      }),
    }),
  ],

  // 控制器注册
  controllers: [TestController], 

  // 服务提供者注册
  providers: [],
})
export class AppModule {}