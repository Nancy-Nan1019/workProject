/**
 * 修改密码数据传输对象
 * 
 * 功能说明：
 * - 定义用户修改密码接口的请求数据格式
 * - 包含当前密码验证和新密码设置
 * - 提供Swagger API文档支持
 * 
 * 安全要求：
 * - 当前密码用于身份验证
 * - 新密码最小长度6位
 */

import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: '当前密码（用于验证用户身份）',
    example: 'oldPassword123',
    minLength: 6,
  })
  @IsString({ message: '当前密码必须为字符串' })
  @MinLength(6, { message: '当前密码长度至少为6位' })
  currentPassword: string;

  @ApiProperty({
    description: '新密码（将更新为该密码）',
    example: 'newPassword456',
    minLength: 6,
  })
  @IsString({ message: '新密码必须为字符串' })
  @MinLength(6, { message: '新密码长度至少为6位' })
  newPassword: string;
}