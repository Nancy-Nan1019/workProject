import { Company, CompanyDetail, DashboardMetrics, TierDistribution } from "../components/tables/CompanyTable/types";

/**
 * 仪表盘数据计算工具函数
 * 功能：基于公司列表和详情数据，计算仪表盘所需的三大核心数据：
 * 1. 关键指标（总公司数、总营收等）
 * 2. 公司层级分布（各层级数量及占比）
 * 3. 公司增长折线图数据（模拟年份增长趋势）
 * @param companies - 公司列表数据（主表）
 * @param companyDetails - 公司详情数据（按公司编码索引，关联主表）
 * @returns 格式化后的仪表盘数据对象
 */
export const calculateDashboardData = (
  companies: Company[],
  companyDetails: Record<string, CompanyDetail[]>
): {
  metrics: DashboardMetrics; // 关键业务指标
  tierDistribution: TierDistribution[]; // 公司层级分布
  lineChartData: { year: string; companies: number }[]; // 增长折线图数据
} => {
  // 1. 计算指标卡片数据
  const totalRevenue = companies.reduce((sum, company) => {
    const detail = companyDetails[company.company_code]?.[0];
    return sum + (detail?.annual_revenue || 0);
  }, 0);

  const totalEmployees = companies.reduce((sum, company) => {
    const detail = companyDetails[company.company_code]?.[0];
    return sum + (detail?.employees || 0);
  }, 0);

  const countryCount = new Set(companies.map(c => c.country)).size;

  // 2. 计算等级分布
  const tierCounts = companies.reduce((acc, company) => {
    acc[company.level] = (acc[company.level] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const tierDistribution = Object.entries(tierCounts).map(([level, count]) => ({
    level: Number(level),
    count,
    percentage: `${((count / companies.length) * 100).toFixed(1)}%`
  }));

  // 3. 生成折线图数据
  const lineChartData = [
    { year: '2018', companies: Math.round(companies.length * 0.2) },
    { year: '2019', companies: Math.round(companies.length * 0.4) },
    { year: '2020', companies: Math.round(companies.length * 0.6) },
    { year: '2021', companies: Math.round(companies.length * 0.8) },
    { year: '2022', companies: companies.length },
    { year: '2023', companies: companies.length }
  ];

  return {
    metrics: {
      companyCount: companies.length,
      totalRevenue,
      countryCount,
      totalEmployees
    },
    tierDistribution,
    lineChartData
  };
};