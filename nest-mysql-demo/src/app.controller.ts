/**
 * 应用根控制器 - 提供基础健康检查接口
 * 
 * 功能说明：
 * - 提供应用根路径的访问接口
 * - 用于服务健康检查和基础验证
 * - 集成应用服务处理业务逻辑
 */

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * 根路径访问接口
   * @returns 欢迎消息字符串
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}