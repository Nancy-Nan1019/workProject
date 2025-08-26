/**
 * 公司实体类 - 定义公司数据模型
 * 
 * 数据库表：companies
 * 字段说明：
 * - company_code: 主键，公司代码
 * - company_name: 公司名称
 * - level: 公司等级（1-5级）
 * - country: 所在国家
 * - city: 所在城市
 * - founded_year: 成立年份
 * - annual_revenue: 年度营收（美元）
 * - employees: 员工数量
 * 
 * 数据类型：
 * - 大数字段使用bigint类型存储
 * - 包含数据转换器处理数字类型
 */

import { Entity, PrimaryColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Company {
  @ApiProperty({
    example: 'C01',
    description: '公司股票代码/唯一标识',
    maxLength: 10
  })
  @PrimaryColumn({ name: 'company_code' })
  company_code: string;

  @ApiProperty({
    example: 'Apple Inc.',
    description: '公司全称',
    maxLength: 100
  })
  @Column()
  company_name: string;

  @ApiProperty({
    example: 3,
    description: '公司等级(1-5)',
    minimum: 1,
    maximum: 5
  })
  @Column('int')
  level: number;

  @ApiProperty({
    example: 'United States',
    description: '总部所在国家',
    maxLength: 50
  })
  @Column()
  country: string;

  @ApiProperty({
    example: 'Cupertino',
    description: '总部所在城市',
    maxLength: 50
  })
  @Column()
  city: string;

  @ApiProperty({
    example: 1976,
    description: '成立年份',
    minimum: 1800
  })
  @Column()
  founded_year: number;

  @ApiProperty({
    example: 394328000000,
    description: '年度营收（美元）',
    type: String
  })
  @Column({
  type: 'bigint',
  transformer: {
    to: (value: number) => value, // 存入数据库时不变
    from: (value: string) => Number(value) // 从数据库读取时转为Number
  }
})
  annual_revenue: number;

  @ApiProperty({
    example: 164000,
    description: '员工总数',
    minimum: 0
  })
  @Column()
  employees: number;
}