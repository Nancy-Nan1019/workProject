/**
 * 应用入口文件 - NestJS应用的启动文件
 * 
 * 启动配置：
 * - 创建NestJS应用实例
 * - 配置全局管道和中间件
 * - 设置跨域和Swagger文档
 * - 启动HTTP服务器监听
 * 
 * 特性：
 * - 数据验证和转换
 * - API文档自动生成
 * - 生产环境就绪配置
 */


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type {} from '../types/express';


async function bootstrap() {
  // 创建应用实例
  const app = await NestFactory.create(AppModule);
  
  // 全局验证管道配置
app.useGlobalPipes(new ValidationPipe({
    whitelist: true,              // 自动剔除 DTO 中未声明的字段
    forbidNonWhitelisted: true,   // 有非法字段时抛出异常（400）
    transform: true,              // 自动转换请求参数类型
  }));

  // 跨域配置
  app.enableCors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'], // 允许的前端地址
    methods: '*',// 允许所有HTTP方法
    allowedHeaders: ['Content-Type', 'Authorization'],// 允许的请求头
    credentials: true // 允许携带认证信息
  });

  // Swagger API文档配置
  const config = new DocumentBuilder()
    .setTitle('企业管理系统API文档')
    .setDescription('提供用户管理、公司管理和认证相关的API接口')
    .setVersion('1.0')
    .addBearerAuth() // JWT认证支持
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // 文档访问路径
  
  // 启动应用监听
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}

// 启动应用
bootstrap();