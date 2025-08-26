/**
 * 应用服务 - 提供基础业务逻辑
 * 
 * 功能说明：
 * - 处理应用级别的业务逻辑
 * - 提供简单的欢迎消息生成
 * - 可作为其他服务的基类或参考
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * 生成欢迎消息
   * @returns 欢迎消息字符串
   */
  getHello(): string {
    return 'Hello World! Hello Nancy!';
  }
}