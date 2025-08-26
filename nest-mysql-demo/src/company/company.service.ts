/**
 * 公司服务 - 公司数据业务逻辑处理
 * 
 * 功能概述：
 * - 提供公司数据的CRUD操作
 * - 实现多条件筛选和分组统计
 * - 集成缓存机制提升性能
 * - 构建复杂的查询条件
 * 
 * 缓存策略：
 * - 使用cache-manager进行数据缓存
 * - 所有查询结果缓存1分钟
 * - 支持缓存清理操作
 * 
 * 性能特性：
 * - 数据库查询优化
 * - 缓存命中优先
 * - 条件查询构建
 */


import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, Like } from 'typeorm';
import { Company } from './company.entity';
import { CompanyQueryDto } from './dtos/company-query.dto';
import { CompanyFilterDto } from './dtos/company-filter.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CompanyService {
  constructor(
  @InjectRepository(Company)
  private companyRepository: Repository<Company>,
  @Inject(CACHE_MANAGER)
  private cacheManager: Cache, 
) {}

  /**
   * 获取所有公司列表
   * @returns 公司列表（包含缓存逻辑）
   */
  async findAll(): Promise<Company[]> {
    const cacheKey = 'companies_all';
    try {
      // 尝试从缓存获取数据
      const cachedData = await this.cacheManager.get<Company[]>(cacheKey);
      if (cachedData) return cachedData;

      // 缓存未命中，从数据库查询
      const companies = await this.companyRepository.find();

      // 设置缓存，有效期1分钟
      await this.cacheManager.set(cacheKey, companies, { ttl:60 * 1000 });
      return companies;
    } catch (err) {
      // 缓存异常时降级到直接数据库查询
      return this.companyRepository.find();
    }
  }

  /**
   * 根据公司代码查找单个公司
   * @param id 公司代码
   * @returns 公司信息或null
   */
  async findCompany(id: string): Promise<Company | null> {
    const cacheKey = `company_${id}`;
    
    try {
      // 尝试从缓存获取
      const cachedData = await this.cacheManager.get<Company>(cacheKey);
      if (cachedData) return cachedData;

      // 数据库查询
      const dbData = await this.companyRepository.findOne({ 
        where: { company_code: id } 
      });
      
      // 如果找到数据则设置缓存
      if (dbData) {
        await this.cacheManager.set(cacheKey, dbData, { ttl: 60 * 1000 });
      }
      return dbData;
    } catch (err) {
      // 缓存异常降级
      return this.companyRepository.findOne({ where: { company_code: id } });
    }
  }

  /**
   * 根据筛选条件查询公司列表
   * @param filter 筛选条件
   * @returns 符合条件的公司列表
   */
  async findCompaniesWithFilter(filter: CompanyFilterDto): Promise<Company[]> {
    const cacheKey = `companies_filter_${JSON.stringify(filter)}`;

    // 尝试从缓存获取
    const cachedData = await this.cacheManager.get<Company[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
   
    // 构建查询条件
    const where = this.buildWhereClause(filter);
    const companies = await this.companyRepository.find({ where });

    // 设置缓存
    await this.cacheManager.set(cacheKey, companies, { ttl: 60 * 1000 }); // 1分钟TTL
    return companies;
  }

  /**
   * 分组查询公司统计信息
   * @param query 查询参数（包含维度和筛选条件）
   * @returns 分组统计结果
   */
  async queryCompanies(query: CompanyQueryDto) {
    const cacheKey = `companies_query_${JSON.stringify(query)}`;

    // 尝试从缓存获取
    const cachedData = await this.cacheManager.get<any>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const { dimension, filter } = query;

    // 构建查询条件并获取数据
    const where = this.buildWhereClause(filter);
    const companies = await this.companyRepository.find({ where });

    // 构建返回结果
    const result = {
      dimension,
      data: this.groupByDimension(companies, dimension),
      filter: filter || undefined,
    };

    // 设置缓存
    await this.cacheManager.set(cacheKey, result, { ttl: 60 * 1000 }); // 1分钟TTL
    return result;
  }

  /**
   * 清除所有缓存
   */
  async clearCache(): Promise<void> {
    await Promise.all([
      await this.cacheManager.del?.('companies_all'),
      this.clearCompaniesCache()
    ]);
  }

  /**
   * 清除指定公司的缓存
   * @param companyId 公司代码
   */
  async clearCompanyCache(companyId: string): Promise<void> {
    await this.cacheManager.del?.(`company_${companyId}`);
  }

  /**
   * 清除公司相关缓存（私有方法）
   */
  private async clearCompaniesCache(): Promise<void> {
    // 清除已知的缓存键模式
    // 注意：标准cache-manager不支持通配符删除，需要维护键列表
    await Promise.all([
      this.cacheManager.del?.('companies_all'),
      this.cacheManager.del?.('companies_filter_*'), 
      this.cacheManager.del?.('companies_query_*')
    ]);
  }

  /**
   * 按维度分组公司数据
   * @param companies 公司列表
   * @param dimension 分组维度
   * @returns 分组后的数据
   */
  private groupByDimension(companies: Company[], dimension: 'level' | 'country' | 'city') {
    const groupedData: Record<string, Company[]> = {};

    companies.forEach((company) => {
      let key: string;

      if (dimension === 'level') {
        // 等级维度特殊处理，添加前缀便于识别
        key = `level${company.level}`;
      } else {
        // 其他维度直接使用字段值
        key = company[dimension];
      }

      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(company);
    });

    return groupedData;
  }

  /**
   * 构建TypeORM查询条件
   * @param filter 筛选条件
   * @returns TypeORM的where条件对象
   */
  private buildWhereClause(filter?: CompanyFilterDto) {
    if (!filter) return {};

    const where: any = {};

    // 公司名称模糊搜索
    if (filter.name) {
      where.company_name = Like(`%${filter.name}%`);
    }

    // 等级范围筛选
    if (filter.level?.length) {
      where.level = In(filter.level);
    }

    // 国家筛选（转换为大写确保一致性）
    if (filter.country?.length) {
      where.country = In(filter.country.map(c => c.toUpperCase()));
    }

    // 城市筛选
    if (filter.city?.length) {
      where.city = In(filter.city);
    }

    // 成立年份范围筛选
    if (filter.founded_year) {
      const { start, end } = filter.founded_year;
      if (start && end) {
        where.founded_year = Between(start, end);
      } else if (start) {
        where.founded_year = Between(start, 9999);
      } else if (end) {
        where.founded_year = Between(0, end);
      }
    }

    // 年度营收范围筛选
    if (filter.annual_revenue) {
      const { min, max } = filter.annual_revenue;
      if (min && max) {
        where.annual_revenue = Between(min, max);
      } else if (min) {
        where.annual_revenue = Between(min, 999999999);
      } else if (max) {
        where.annual_revenue = Between(0, max);
      }
    }

    // 员工数量范围筛选
    if (filter.employees) {
      const { min, max } = filter.employees;
      if (min && max) {
        where.employees = Between(min, max);
      } else if (min) {
        where.employees = Between(min, 999999);
      } else if (max) {
        where.employees = Between(0, max);
      }
    }

    return where;
  }

}