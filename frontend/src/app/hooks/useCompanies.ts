'use client';
import { useState, useEffect } from 'react';
import { fetchCompanyList, fetchCompanyDetails } from '../services/api';
import { Company, CompanyDetail } from '../components/tables/CompanyTable/types';

/**
 * 公司数据结构接口
 * 包含公司列表和按公司编码索引的详情数据
 */
interface CompanyData {
  companies: Company[];
  companyDetails: Record<string, CompanyDetail[]>;  // key: 公司编码, value: 详情数组
}

/**
 * 公司数据自定义Hook
 * 功能：统一管理公司列表和详情数据的加载、缓存和更新
 * 提供数据访问、加载状态、错误信息及手动刷新方法
 */
export const useCompanies = () => {
  const [data, setData] = useState<CompanyData>({
    companies: [],
    companyDetails: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 初始数据加载
   * 1. 获取公司列表
   * 2. 并行加载所有公司详情（可根据性能需求改为按需加载）
   * 时机：Hook初始化时执行
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. 获取公司列表
        const companies = await fetchCompanyList();

        // 2. 并行获取所有公司详情 
        const detailsRequests = companies.map(company =>
          fetchCompanyDetails(company.company_code)
        );
        const detailsResults = await Promise.allSettled(detailsRequests);

        // 3. 处理详情数据
        const companyDetails = detailsResults.reduce((acc, result, index) => {
          if (result.status === 'fulfilled') {
            const companyCode = companies[index].company_code;
            acc[companyCode] = [result.value]; // 包装成数组保持结构一致
          }
          return acc;
        }, {} as Record<string, CompanyDetail[]>);

        setData({ companies, companyDetails });

      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load data'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * 按需获取单个公司详情
   * @param companyCode - 公司编码
   * 功能：单独加载指定公司的详情并更新缓存
   */
  const fetchDetails = async (companyCode: string) => {
    try {
      const detail = await fetchCompanyDetails(companyCode);
      setData(prev => ({
        ...prev,
        companyDetails: {
          ...prev.companyDetails,
          [companyCode]: [detail] // 保持数组结构
        }
      }));
    } catch (err) {
      console.error(`Failed to fetch details for ${companyCode}:`, err);
      throw err;
    }
  };

  return {
    companies: data.companies,
    companyDetails: data.companyDetails,
    loading,
    error,
    fetchDetails,
    refetch: () => {
      setLoading(true);
      fetchData().finally(() => setLoading(false));
    }
  };
}; 