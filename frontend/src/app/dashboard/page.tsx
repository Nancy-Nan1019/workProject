'use client';
import { useState, useEffect } from 'react';
import { Box, Tab, Tabs, Paper, CircularProgress, Alert } from '@mui/material';
import { useCompanies } from '../hooks/useCompanies';
import { calculateDashboardData } from '../utils/dashboardCalculations';
import CompanyTierPieChart from '../components/charts/CompanyTierPieChart';
import MetricCard from '../components/charts/MetricCard';
import LineChart from '../components/charts/LineChart';
import DynamicBarChart from '../components/charts/DynamicBarChart';
import CompanyHierarchyBubbleChart from '../components/charts/CompanyHierarchyBubbleChart';
import { BarChartCompany } from '../components/charts/DynamicBarChart/types';
import { Typography } from '@mui/material';


/**
 * 仪表盘首页
 * 功能：仪表盘核心页面，展示公司数据的多维度可视化（指标、折线图、饼图、柱状图、气泡图）
 * 交互：标签页切换（柱状图/气泡图）、数据加载状态管理、错误处理
 */
const DashboardPage = () => {
  const { companies, companyDetails, loading, error, fetchDetails } = useCompanies();
  const [activeTab, setActiveTab] = useState(0);
  const [structureLoading, setStructureLoading] = useState(false);
  const [structureError, setStructureError] = useState<string | null>(null);
  const [companyStructure, setCompanyStructure] = useState<any>(null);


  /**
   * 加载公司层级结构数据
   * 时机：切换到气泡图标签页（activeTab=1）且未加载过数据时
   */
  useEffect(() => {
    const fetchCompanyStructure = async () => {
      setStructureLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/company-structure');
        if (!response.ok) throw new Error('Failed to fetch structure');

        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'API request failed');

        setCompanyStructure(result.data); // 存储结构数据（取response.data中的业务数据）
      } catch (err) {
        setStructureError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setStructureLoading(false);
      }
    };

    // 切换到气泡图且未加载数据时，触发请求
    if (activeTab === 1 && !companyStructure) {
      fetchCompanyStructure();
    }
  }, [activeTab, companyStructure]);

  if (loading) return <CircularProgress sx={{ display: 'block', m: '2rem auto' }} />;
  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error.message}</Alert>;
  if (!companies.length) return <Alert severity="info" sx={{ m: 2 }}>No company data available</Alert>;

  const dashboardData = calculateDashboardData(companies, companyDetails);

  return (
    <Box sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 64px)',// 高度：占满屏幕-顶部导航栏高度（避免滚动溢出）

    }}>
      {/* 1. 指标卡片区域（4列布局，响应式适配） */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <MetricCard
          title="公司数量"
          value={dashboardData.metrics.companyCount.toString()}
          change="+0%"
          icon="🏢"
        />
        <MetricCard
          title="总收入"
          value={`$${(dashboardData.metrics.totalRevenue / 1000000).toFixed(1)}M`}
          change="+0%"
          icon="💰"
        />
        <MetricCard
          title="覆盖国家"
          value={dashboardData.metrics.countryCount.toString()}
          change="+0"
          icon="🌍"
        />
        <MetricCard
          title="员工数量"
          value={dashboardData.metrics.totalEmployees.toString()}
          change="+0%"
          icon="👥"
        />
      </Box>

      {/* 2. 折线图+饼图区域（2列布局，响应式适配） */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 3 }}>
        {/* 公司增长趋势折线图 */}
        <LineChart
          title="公司增长趋势"
          data={dashboardData.lineChartData}
        />
        {/* 公司层级分布饼图 */}
        <CompanyTierPieChart data={dashboardData.tierDistribution} />
      </Box>

      {/* 3. 公司分析区域（标签页切换：柱状图/气泡图） */}
      <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        {/* 标签页标题栏 */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h6">Company Distribution Analysis</Typography>
          {/* 切换标签页（柱状图/气泡图） */}
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            indicatorColor="secondary"
            textColor="secondary"
          >
            <Tab label="Bar Chart" />
            <Tab label="Bubble Chart" />
          </Tabs>
        </Box>

        {/* 图表内容区（占满剩余高度） */}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          {/* 标签页1：动态柱状图 */}
          {activeTab === 0 ? (
            <DynamicBarChart companies={convertToBarChartFormat(companies)} />
          ) : (
            // 标签页2：气泡图（含加载/错误状态）
            <>
              {structureLoading && <CircularProgress sx={{ display: 'block', margin: '2rem auto' }} />}
              {structureError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Failed to load company structure: {structureError}
                </Alert>
              )}
              {companyStructure && (
                <CompanyHierarchyBubbleChart
                  data={companyStructure}
                  style={{ height: '100%' }}
                />
              )}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );

  /**
   * 转换公司数据格式
   * 功能：将原始公司列表数据转为动态柱状图所需的BarChartCompany格式
   * @param companies - 原始公司列表数据
   * @returns 适配柱状图的公司数据数组
   */
  function convertToBarChartFormat(companies: any[]): BarChartCompany[] {
    return companies.map((company) => ({
      name: company.name,
      revenue: company.revenue,
      employees: company.employees,
      tier: company.tier,
      id: company.id,
    }));
  }
}
export default DashboardPage;