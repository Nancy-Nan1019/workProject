/**
 * 更新用户数据传输对象
 * 
 * 功能说明：
 * - 定义更新用户信息接口的请求数据格式
 * - 所有字段都是可选的，支持部分更新
 * - 提供Swagger API文档支持
 * 
 * 验证规则：
 * - 密码最小长度6位
 * - 邮箱必须符合格式要求
 * - 状态必须是active或inactive
 */

import { IsOptional, IsEnum, IsEmail, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'username (optional update)',
    example: 'updated_username',
  })
  @IsOptional()
  readonly username?: string;
  
  @ApiPropertyOptional({
    description: 'password (optional update, min length 6)',
    example: 'newP@ssw0rd',
    minLength: 6,
  })
  @IsOptional()
  @MinLength(6, { message: '密码长度至少6位' })
  readonly password?: string;
  
  @ApiPropertyOptional({
    description: 'email',
    example: 'updated@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式无效' })
  readonly email?: string;
  
  @ApiPropertyOptional({
    description: 'user status (optional update, active or inactive)',
    enum: ['active', 'inactive'],
    example: 'active',
  })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  readonly status?: 'active' | 'inactive';
}