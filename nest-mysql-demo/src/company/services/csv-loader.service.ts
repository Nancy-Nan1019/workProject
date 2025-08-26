/**
 * CSV加载服务 - 从CSV文件加载公司数据并构建树形结构
 * 
 * 功能说明：
 * - 从CSV文件加载公司基本信息和关系数据
 * - 构建公司层级树形结构
 * - 提供数据初始化服务
 * 
 * 文件要求：
 * - companies.csv: 公司基本信息
 * - relationships.csv: 公司层级关系
 */

import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csv from 'csv-parser';

/**
 * 公司基本信息接口
 */
interface Company {
  company_code: string;
  company_name: string;
  level: number;
  country: string;
  city: string;
  founded_year: number;
  annual_revenue: number;
  employees: number;
}

/**
 * 公司节点接口（包含子节点）
 */
interface CompanyNode extends Company {
  children?: CompanyNode[];
}

@Injectable()
export class CsvLoaderService {
  /**
   * 从CSV文件加载公司基本信息
   */
  async loadCompanies(filePath: string): Promise<Record<string, Company>> {
    return new Promise((resolve, reject) => {
      const companies: Record<string, Company> = {};

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          companies[data.company_code] = {
            company_code: data.company_code,
            company_name: data.company_name,
            level: parseInt(data.level),
            country: data.country,
            city: data.city,
            founded_year: parseInt(data.founded_year),
            annual_revenue: parseFloat(data.annual_revenue),
            employees: parseInt(data.employees),
          };
        })
        .on('end', () => resolve(companies))
        .on('error', reject);
    });
  }

  /**
   * 从CSV文件加载公司关系数据
   */
  async loadRelationships(filePath: string): Promise<{code: string, parent?: string}[]> {
    return new Promise((resolve, reject) => {
      const relations: {code: string, parent?: string}[] = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          relations.push({
            code: data.company_code,
            parent: data.parent_company || undefined
          });
        })
        .on('end', () => resolve(relations))
        .on('error', reject);
    });
  } 

  /**
   * 构建公司树形结构
   */
  async buildCompanyTree(): Promise<CompanyNode> {
    const [companies, relations] = await Promise.all([
      this.loadCompanies('data/companies.csv'),
      this.loadRelationships('data/relationships.csv')
    ]);

    const nodeMap: Record<string, CompanyNode> = {};
    const rootNodes: CompanyNode[] = [];

    // 创建所有节点
    Object.entries(companies).forEach(([code, company]) => {
      nodeMap[code] = { ...company, children: [] };
    });

    // 建立父子关系
    relations.forEach(relation => {
      if (relation.parent && nodeMap[relation.parent]) {
        if (!nodeMap[relation.parent].children) {
          nodeMap[relation.parent].children = [];
        }
        nodeMap[relation.parent].children?.push(nodeMap[relation.code]);
      } else if (nodeMap[relation.code]) {
        rootNodes.push(nodeMap[relation.code]);
      }
    });

    // 验证根节点数量
    if (rootNodes.length !== 1) {
      throw new Error('Expected exactly one root company');
    }

    return rootNodes[0];
  }
}