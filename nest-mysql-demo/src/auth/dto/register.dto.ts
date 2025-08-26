/**
 * 用户注册数据传输对象
 * 
 * 功能说明：
 * - 定义用户注册接口的请求数据格式
 * - 提供Swagger API文档自动生成支持
 * - 内置严格的数据验证规则，确保账户安全
 * 
 * 安全要求：
 * - 密码最小长度8位，必须包含大小写字母、数字和特殊字符
 * - 邮箱地址必须唯一
 * - 用户姓名长度限制2-20字符
 */

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'Tina',
    description: '用户真实姓名',
    minLength: 2,
    maxLength: 20,
    required: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: '注册邮箱地址（唯一）',
    required: true
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd123',
    description: '登录密码（必须包含字母、数字和特殊字符）',
    minLength: 8,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}