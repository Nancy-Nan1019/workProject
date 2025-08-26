/**
 * 公司数据结构接口
 * 存储用于柱状图展示的公司基础信息
 */

export interface BarChartCompany {
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
 * 图表分组维度类型
 * 限定柱状图可按「层级/国家/城市」分组
 */
export type Dimension = 'level' | 'country' | 'city';

/**
 * 筛选条件配置接口
 * 定义各维度的筛选规则
 */
export interface FilterOptions {
  level: number[];
  country: string[];
  city: string[];
  founded_year: {
    start: number;
    end: number;
  };
  annual_revenue: {
    min: number;
    max: number;
  };
  employees: {
    min: number;
    max: number;
  };
}

/**
 * 图表请求参数接口
 * 整合「分组维度」和「筛选条件」，用于接口请求
 */
export interface BarChartRequest {
  dimension: Dimension;
  filter: FilterOptions;
}

/**
 * API响应通用格式
 * 统一后端返回数据结构，支持泛型适配不同业务数据
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * 柱状图统计数据响应接口
 * 后端返回的图表渲染所需数据（标签+数值）
 */
export interface BarChartStatsResponse {
  labels: string[];
  values: number[];
}