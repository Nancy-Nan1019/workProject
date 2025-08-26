/**
 * 公司查询数据传输对象
 * 
 * 功能说明：
 * - 定义分组统计查询的参数格式
 * - 包含分组维度和筛选条件
 * - 提供Swagger API文档支持
 * 
 * 分组维度：
 * - level: 按公司等级分组
 * - country: 按国家分组
 * - city: 按城市分组
 */


import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CompanyFilterDto } from './company-filter.dto';

/**
 * 分组维度枚举
 */
export enum DimensionEnum {
  LEVEL = 'level',
  COUNTRY = 'country',
  CITY = 'city',
}

export class CompanyQueryDto {
  @ApiProperty({
    enum: DimensionEnum, // 使用枚举类型
    example: DimensionEnum.COUNTRY,
    description: '分组统计维度'
  })
  @IsEnum(DimensionEnum) // 显式绑定枚举
  dimension: DimensionEnum;


  @ApiPropertyOptional({
    type: CompanyFilterDto,
    description: '筛选条件（可选）'
  })
  @ValidateNested()
  @Type(() => CompanyFilterDto)
  @IsOptional()
  filter?: CompanyFilterDto;
}