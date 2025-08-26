/**
 * 用户登录数据传输对象
 * 
 * 功能说明：
 * - 定义用户登录接口的请求数据格式
 * - 提供Swagger API文档自动生成支持
 * - 内置数据验证规则，确保输入合法性
 * 
 * 验证规则：
 * - 邮箱格式必须符合标准
 * - 密码不能为空且为字符串类型
 */

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '注册邮箱地址',
    required: true
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd123',
    description: '登录密码(6-20位字符)',
    minLength: 6,
    maxLength: 20,
    required: true
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}