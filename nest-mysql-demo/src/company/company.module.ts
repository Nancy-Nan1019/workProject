/**
 * 公司模块 - 公司管理功能模块
 * 
 * 模块组成：
 * - CompanyEntity: 公司数据模型
 * - CompanyService: 公司业务逻辑服务
 * - CompanyController: 公司基础管理API
 * - CompanyStructureController: 公司架构管理API
 * - CsvLoaderService: CSV数据加载服务
 * 
 * 数据库配置：
 * - 使用TypeORM进行数据库操作
 * - 注册Company实体
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { CompanyStructureController } from './controllers/company-structure.controller';
import { CsvLoaderService } from './services/csv-loader.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company]), // 注册公司实体
  ],
  providers: [CompanyService, CsvLoaderService,],
  controllers: [CompanyController, CompanyStructureController,],
  exports: [CompanyService],
})
export class CompanyModule {}