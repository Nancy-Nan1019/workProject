/**
 * 公司筛选条件数据传输对象
 * 
 * 功能说明：
 * - 定义公司查询接口的筛选条件格式
 * - 支持多维度条件组合筛选
 * - 提供Swagger API文档支持
 * 
 * 筛选维度：
 * - 基本信息：名称、等级、国家、城市
 * - 时间范围：成立年份
 * - 规模指标：员工数量、年度营收
 */


import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, IsNumber, IsString } from 'class-validator';

export class CompanyFilterDto {
  @ApiPropertyOptional({
    example: 'Apple',
    description: '公司名称模糊搜索'
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: [2, 3],
    description: '公司等级范围',
    type: [Number]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  level?: number[];

  @ApiPropertyOptional({
    example: ['United States', 'China'],
    description: '国家筛选（支持多选）',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  country?: string[];

  @ApiPropertyOptional({
    example: ['Cupertino', 'Shenzhen'],
    description: '城市筛选（支持多选）',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  city?: string[];

  @ApiPropertyOptional({
    example: { start: 2000, end: 2020 },
    description: '成立年份范围（起始年份-结束年份）'
  })
  @IsOptional()
  founded_year?: {
    start?: number;
    end?: number;
  };

  @ApiPropertyOptional({
    example: { min: 1000000000 },
    description: '年度营收范围（美元，最小值-最大值）'
  })
  @IsOptional()
  annual_revenue?: {
    min?: number;
    max?: number;
  };

  @ApiPropertyOptional({
    example: { min: 1000, max: 100000 },
    description: '员工数量范围（最小值-最大值）'
  })
  @IsOptional()
  employees?: {
    min?: number;
    max?: number;
  };
}