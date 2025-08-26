/**
 * 公司列表数据结构
 * 用于表格主行展示的核心公司信息
 */

export interface Company {
  company_code: string;
  company_name: string;
  level: number;
  country: string;
  efficiency: number; // 公司效率值（用于数值展示和颜色判断）

}

/**
 * 公司详情数据结构
 * 用于表格折叠行展示的公司详细信息
 */
export interface CompanyDetail {
  company_code: string;
  city: string;
  founded_year: number;
  annual_revenue: number;
  employees: number;
}

/**
 * 仪表盘指标数据结构
 * 用于展示系统核心统计指标（如总公司数、总营收等）
 */
export interface DashboardMetrics {
  companyCount: number;
  totalRevenue: number;
  countryCount: number;
  totalEmployees: number;
}

/**
 * 层级分布数据结构
 * 用于饼图等组件展示各层级公司的数量分布
 */
export interface TierDistribution {
  level: number;
  count: number;
  percentage: string;
}
