/**
 * 公司结构响应数据传输对象
 * 
 * 功能说明：
 * - 定义公司结构相关API的响应格式
 * - 包含统一的成功标识和数据字段
 * - 提供Swagger API文档支持
 * 
 * 响应类型：
 * - 公司节点信息
 * - 统计结果数据
 * - 通用响应结构
 */

import { ApiProperty } from '@nestjs/swagger';

/**
 * 通用响应结构
 */
export class CompanyStructureResponse {
  @ApiProperty({ example: true, description: '请求是否成功' })
  success: boolean;

  @ApiProperty({ description: '返回的数据' })
  data: any;
}

/**
 * 公司节点信息
 */
export class CompanyNodeDto {
  @ApiProperty({ example: 'C01', description: '公司代码（唯一标识）' })
  company_code: string;

  @ApiProperty({ example: 'Apple Inc.', description: '公司名称' })
  company_name: string;

  @ApiProperty({ example: 3, description: '公司等级(1-5)' })
  level: number;

  @ApiProperty({ example: 'United States', description: '国家' })
  country: string;

  @ApiProperty({ example: 'Cupertino', description: '城市' })
  city: string;

  @ApiProperty({ example: 1976, description: '成立年份' })
  founded_year: number;

  @ApiProperty({ example: 394328000000, description: '年度营收' })
  annual_revenue: number;

  @ApiProperty({ example: 164000, description: '员工数量' })
  employees: number;

  @ApiProperty({ example: 2.4, description: '人均效率(千美元/人)' })
  efficiency?: number;
}

/**
 * 统计结果数据
 */
export class CompanyStatsResponse {
  @ApiProperty({
    example: ['United States', 'China'],
    description: '分组标签'
  })
  labels: string[];

  @ApiProperty({
    example: [15, 8],
    description: '分组数量统计'
  })
  values: number[];
}