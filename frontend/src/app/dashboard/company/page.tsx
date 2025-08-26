'use client';
// 业务组件：公司列表表格（核心功能：展示/编辑/查看公司详情）
import CompanyTable from '../../components/tables/CompanyTable';
import { Box, Typography } from '@mui/material';

/**
 * 公司管理页面
 * 功能：仪表盘-公司管理模块的入口页面，仅负责展示公司列表表格
 * 层级：作为DashboardLayout的子页面，继承顶部导航栏和基础布局
 */
export default function CompanyPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Company Management
      </Typography>
      {/* 公司列表表格：核心业务组件，承载公司数据展示与交互 */}
      <CompanyTable />
    </Box>

  );
}