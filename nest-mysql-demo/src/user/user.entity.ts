/**
 * 用户实体类 - 定义用户数据模型
 * 
 * 数据库表：users
 * 字段说明：
 * - id: 主键，自增
 * - username: 用户名，唯一索引
 * - password: 加密密码，响应中隐藏
 * - email: 邮箱地址，唯一索引
 * - status: 用户状态（active/inactive）
 * - createdAt: 创建时间
 * - updatedAt: 更新时间
 * - lastLogin: 最后登录时间
 * 
 * 安全特性：
 * - 密码字段标记为writeOnly，不在API响应中返回
 * - 邮箱格式自动验证
 */

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

@Entity()
export class User {
  @ApiProperty({
    example: 1,
    description: '用户唯一ID (自增主键）',
    readOnly: true
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'john_doe',
    description: '用户名（唯一标识，不可重复）',
    maxLength: 50
  })
  @Column({ unique: true })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'P@ssw0rd',
    description: '加密后的密码 (API响应中自动隐藏)',
    writeOnly: true,
    minLength: 6
  })
  @Column()
  password: string;

  @ApiPropertyOptional({
    example: 'john@example.com',
    description: '用户邮箱地址（唯一标识，可选）',
    nullable: true
  })
  @Column({ unique: true, nullable: true })
  @IsEmail({}, { message: '邮箱格式无效' })
  email: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: '用户创建时间（自动生成）',
    readOnly: true
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-02T00:00:00.000Z',
    description: '最后更新时间（自动更新）',
    readOnly: true
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ApiProperty({
    example: 'active',
    description: '用户状态 (active-活跃, inactive-非活跃）',
    enum: ['active', 'inactive'],
    default: 'active'
  })
  @Column({ 
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active'
  })
  status: 'active' | 'inactive';

  @ApiPropertyOptional({
    example: '2023-01-03T00:00:00.000Z',
    description: '最后登录时间（记录用户最近登录时间）',
    nullable: true,
    readOnly: true
  })
  @Column({ nullable: true })
  lastLogin?: Date;
}