/**
 * 公司管理控制器 - 处理公司基础数据相关的API
 * 
 * 功能概述：
 * - 提供公司基本信息的CRUD操作
 * - 支持多条件筛选查询
 * - 提供分组统计功能
 * - 支持缓存管理
 * 
 * 安全特性：
 * - 所有接口都需要JWT认证
 * - 集成Swagger API文档
 */

import { Controller, Get, Post, Body, Param, UsePipes, NotFoundException } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from './company.entity';
import { CompanyFilterDto } from './dtos/company-filter.dto';
import { ValidationPipe } from '@nestjs/common';
import { CompanyQueryDto } from './dtos/company-query.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';


@ApiTags('Company Management')
@ApiBearerAuth()
@Controller('company')
@UseGuards(AuthGuard('jwt'))
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * 获取所有公司列表
   */
  @Get()
  @ApiOperation({ 
    summary: '获取所有公司', 
    description: '返回系统中所有公司的完整列表' 
  })
  @ApiOkResponse({ 
    description: '公司列表获取成功',
    type: [Company] 
  })
  findAll(): Promise<Company[]> {
    return this.companyService.findAll();
  }

  /**
   * 获取单个公司详情
   */
  @Get(':id')
  @ApiOperation({ 
    summary: '获取公司详情', 
    description: '根据公司ID获取详细信息' 
  })
  @ApiParam({ name: 'id', description: '公司ID/代码', example: 'C01' })
  @ApiOkResponse({ 
    description: '公司详情获取成功',
    type: Company 
  })
  @ApiNotFoundResponse({ description: '公司不存在' })
  async findCompany(@Param('id') id: string): Promise<Company> {
    const company = await this.companyService.findCompany(id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  /**
   * 条件筛选公司
   */
  @Post('filter')
  @ApiOperation({ 
    summary: '条件筛选公司', 
    description: '根据多维度条件筛选公司列表（带缓存）' 
  })
  @ApiBody({ type: CompanyFilterDto })
  @ApiOkResponse({ 
    description: '筛选结果',
    type: [Company],
    schema: {
      example: [
        {
          company_code: 'C01',
          company_name: 'Apple Inc.',
          level: 3,
          country: 'United States',
          city: 'Cupertino',
          founded_year: 1976,
          annual_revenue: 394328000000,
          employees: 164000
        }
      ]
    }
  })
  @UsePipes(ValidationPipe)
  async findCompaniesWithFilter(@Body() filter: CompanyFilterDto): Promise<Company[]> {
    return this.companyService.findCompaniesWithFilter(filter);
  }

  /**
   * 分组查询统计
   */
  @Post('query')
  @ApiOperation({ 
    summary: '分组查询统计', 
    description: '按指定维度分组统计公司数据（带缓存）' 
  })
  @ApiBody({ type: CompanyQueryDto })
  @ApiOkResponse({
    description: '分组统计结果',
    schema: {
      example: {
        country: {
          'United States': 15,
          'China': 8
        }
      }
    }
  })
  async queryCompanies(@Body() query: CompanyQueryDto) {
    return this.companyService.queryCompanies(query);
  }

  /**
   * 清除所有公司缓存
   */
  @Post('cache/clear')
  @ApiOperation({ 
    summary: '清除公司缓存', 
    description: '清除所有公司数据的缓存' 
  })
  @ApiOkResponse({ 
    description: '缓存清除成功',
    schema: {
      example: {
        message: 'Company cache cleared successfully'
      }
    }
  })
  async clearCache() {
    await this.companyService.clearCache();
    return { message: 'Company cache cleared successfully' };
  }

  /**
   * 清除指定公司缓存
   */
  @Post('cache/clear/:id')
  @ApiOperation({ 
    summary: '清除指定公司缓存', 
    description: '清除单个公司数据的缓存' 
  })
  @ApiParam({ name: 'id', description: '公司ID/代码', example: 'C01' })
  @ApiOkResponse({ 
    description: '缓存清除成功',
    schema: {
      example: {
        message: 'Cache for company C01 cleared successfully'
      }
    }
  })
  async clearCompanyCache(@Param('id') id: string) {
    await this.companyService.clearCompanyCache(id);
    return { message: `Cache for company ${id} cleared successfully` };
  }
}