/**
 * 公司架构控制器 - 处理公司层级结构相关的API
 * 
 * 功能概述：
 * - 提供公司树形结构数据的查询和展示
 * - 支持公司列表的扁平化输出
 * - 提供多维度的公司统计功能
 * - 支持按公司代码查询子树结构
 * 
 * 数据来源：
 * - 通过CSV加载服务从CSV文件构建公司树结构
 * - 初始化时自动构建公司树
 */


import { Controller, Get, Param, NotFoundException, Query  } from '@nestjs/common';
import { CsvLoaderService } from '../services/csv-loader.service';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';
import { 
  CompanyStructureResponse
} from '../dtos/company-structure-response.dto';

@ApiTags('Company Structure')
@Controller('api/company-structure')
export class CompanyStructureController {
  constructor(private readonly csvLoader: CsvLoaderService) {}

  private companyTree: any;

  /**
   * 模块初始化时构建公司树
   */
  async onModuleInit() {
    this.companyTree = await this.csvLoader.buildCompanyTree();
  }

  /**
   * 获取完整公司架构树
   */
  @Get()
  @ApiOperation({ 
    summary: '获取完整公司架构树', 
    description: '返回完整的公司层级结构树' 
  })
  @ApiOkResponse({ 
    description: '架构树获取成功',
    type: CompanyStructureResponse,
    schema: {
      example: {
        success: true,
        data: {
          company_code: "C01",
          company_name: "总公司",
          children: [
            {
              company_code: "C02",
              company_name: "分公司A",
              children: []
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: '服务未初始化',
    schema: {
      example: {
        success: false,
        message: 'Company tree not initialized'
      }
    }
  })
  async getFullStructure() {
    if (!this.companyTree) {
      throw new Error('Company tree not initialized');
    }
    return {
      success: true,
      data: this.companyTree
    };
  }

  /**
   * 获取扁平化公司列表
   */
  @Get('/list')
  @ApiOperation({ 
    summary: '获取扁平化公司列表', 
    description: '返回所有公司的扁平化列表，包含效率指标' 
  })
  @ApiOkResponse({
    description: '公司列表获取成功',
    type: CompanyStructureResponse,
    schema: {
      example: {
        success: true,
        data: [
          {
            company_code: "C01",
            company_name: "Apple Inc.",
            level: 3,
            country: "United States",
            city: "Cupertino",
            efficiency: 2.4
          }
        ]
      }
    }
  })
  async getCompanyList() {
    try {
      if (!this.companyTree) {
        throw new Error('Company data not initialized');
      }

      // 扁平化公司树结构
      const flattenCompanies = (node: any): any[] => {
        const baseInfo = {
          company_code: node.company_code,
          company_name: node.company_name,
          level: node.level,
          country: node.country,
          city: node.city,
          efficiency: this.calculateEfficiency(node)
        };

        const children = node.children || [];
        return [
          baseInfo,
          ...children.flatMap(flattenCompanies)
        ];
      };

      const companies = flattenCompanies(this.companyTree);

      return {
        success: true,
        data: companies
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to load company list'
      };
    }
  }

  /**
   * 计算公司效率指标
   */
  private calculateEfficiency(company: any): number {
    // 更健壮的计算逻辑
    if (!company.employees || company.employees === 0) return 0;
    return company.annual_revenue / company.employees / 1000;
  }

  /**
   * 获取公司统计信息
   */
  @Get('/stats')
  @ApiOperation({ 
    summary: '获取公司统计信息', 
    description: '根据指定维度和条件统计公司分布' 
  })
  @ApiQuery({
    name: 'dimension',
    description: '分组维度',
    enum: ['level', 'country', 'city'],
    example: 'country'
  })
  @ApiQuery({
    name: 'level',
    description: '按等级筛选(逗号分隔)',
    required: false,
    example: '2,3'
  })
  @ApiQuery({
    name: 'country',
    description: '按国家筛选(逗号分隔)',
    required: false,
    example: 'United States,China'
  })
  @ApiQuery({
    name: 'city',
    description: '按城市筛选(逗号分隔)',
    required: false,
    example: 'Cupertino,Shenzhen'
  })
  @ApiQuery({
    name: 'minEmployees',
    description: '最小员工数',
    required: false,
    type: Number,
    example: 1000
  })
  @ApiQuery({
    name: 'maxEmployees',
    description: '最大员工数',
    required: false,
    type: Number,
    example: 100000
  })
  @ApiQuery({
    name: 'minRevenue',
    description: '最小年度营收(美元)',
    required: false,
    type: Number,
    example: 1000000000
  })
  @ApiQuery({
    name: 'maxRevenue',
    description: '最大年度营收(美元)',
    required: false,
    type: Number,
    example: 500000000000
  })
  @ApiQuery({
    name: 'minYear',
    description: '最早成立年份',
    required: false,
    type: Number,
    example: 2000
  })
  @ApiQuery({
    name: 'maxYear',
    description: '最晚成立年份',
    required: false,
    type: Number,
    example: 2020
  })
  @ApiOkResponse({ 
    description: '统计结果',
    type: CompanyStructureResponse,
    schema: {
      example: {
        success: true,
        data: {
          labels: ['United States', 'China'],
          values: [15, 8]
        }
      }
    }
  })
  @ApiBadRequestResponse({
    description: '参数验证失败',
    schema: {
      example: {
        success: false,
        message: 'Dimension is required'
      }
    }
  })
async getCompanyStats(
  @Query('dimension') dimension: string,
  @Query('level') level?: string,
  @Query('country') country?: string,
  @Query('city') city?: string,
  @Query('minEmployees') minEmployees?: string,
  @Query('maxEmployees') maxEmployees?: string,
  @Query('minRevenue') minRevenue?: string,
  @Query('maxRevenue') maxRevenue?: string,
  @Query('minYear') minYear?: string,
  @Query('maxYear') maxYear?: string
) {
  try {
    if (!this.companyTree) {
      throw new Error('Company data not initialized');
    }

    // 扁平化公司数据
    const flattenCompanies = (node: any): any[] => {
      const children = node.children || [];
      return [node, ...children.flatMap(flattenCompanies)];
    };

    let companies = flattenCompanies(this.companyTree);

    // 应用过滤器
    if (level) {
      const levels = level.split(',').map(Number);
      companies = companies.filter(c => levels.includes(c.level));
    }
    
    if (country) {
      const countries = country.split(',');
      companies = companies.filter(c => countries.includes(c.country));
    }
    
    if (city) {
      const cities = city.split(',');
      companies = companies.filter(c => cities.includes(c.city));
    }
    
    if (minEmployees) {
      companies = companies.filter(c => c.employees >= parseInt(minEmployees));
    }
    
    if (maxEmployees) {
      companies = companies.filter(c => c.employees <= parseInt(maxEmployees));
    }
    
    if (minRevenue) {
      companies = companies.filter(c => c.annual_revenue >= parseFloat(minRevenue));
    }
    
    if (maxRevenue) {
      companies = companies.filter(c => c.annual_revenue <= parseFloat(maxRevenue));
    }
    
    if (minYear) {
      companies = companies.filter(c => c.founded_year >= parseInt(minYear));
    }
    
    if (maxYear) {
      companies = companies.filter(c => c.founded_year <= parseInt(maxYear));
    }

    // 按维度分组统计
    const grouped = companies.reduce((acc, company) => {
      const key = company[dimension];
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key]++;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        labels: Object.keys(grouped),
        values: Object.values(grouped)
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to load company stats'
    };
  }
}
  
  /**
   * 获取指定公司子树
   */
  @Get(':code')
  @ApiOperation({ 
    summary: '获取指定公司子树', 
    description: '根据公司代码获取该公司及其下属公司的结构' 
  })
  @ApiParam({
    name: 'code',
    description: '公司代码',
    example: 'C01'
  })
  @ApiOkResponse({ 
    description: '公司子树获取成功',
    type: CompanyStructureResponse,
    schema: {
      example: {
        success: true,
        data: {
          company_code: "C01",
          city: "Cupertino",
          founded_year: 1976,
          annual_revenue: 394328000000,
          employees: 164000
        }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: '公司不存在',
    schema: {
      example: {
        success: false,
        message: 'Company with code C99 not found'
      }
    }
  })
  async getSubtree(@Param('code') code: string) {
    /**
     * 递归查找公司节点
     */
    function findCompany(node: any): any {
      if (node.company_code === code) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findCompany(child);
          if (found) return found;
        }
      }
      return null;
    }

    const company = this.companyTree ? findCompany(this.companyTree) : null;
    if (!company) {
      throw new NotFoundException(`Company with code ${code} not found`);
    }
    return {
      success: true,
      data: {
        company_code: company.company_code,
        city: company.city,
        founded_year: company.founded_year,
        annual_revenue: company.annual_revenue,
        employees: company.employees
      }
    };
  }

  
}