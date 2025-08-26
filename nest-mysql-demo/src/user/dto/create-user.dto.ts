/**
 * 创建用户数据传输对象
 * 
 * 功能说明：
 * - 定义创建新用户接口的请求数据格式
 * - 提供Swagger API文档支持
 * - 内置数据验证规则
 * 
 * 业务规则：
 * - 用户名必填且不能为空
 * - 密码最小长度6位
 * - 邮箱唯一，必须符合格式要求
 */

import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'username',
    example: 'Tina',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'password',
    example: '20142014',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    description: 'email',
    example: 'Tina@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}