'use client';
// 业务组件：用户列表表格（核心功能：展示/编辑/删除用户）
import UserTable from '../../components/tables/UserTable';
import { Box, Typography } from '@mui/material';

/**
 * 用户管理页面
 * 功能：仪表盘-用户管理模块的入口页面，仅负责展示用户列表表格
 * 层级：作为DashboardLayout的子页面，继承顶部导航栏和基础布局
 */
export default function UserManagementPage() {
  return (
    <Box sx={{ p: 3, marginTop: '64px' }}> {/* 保持与主页一致的间距 */}
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      {/* 用户列表表格：核心业务组件，承载用户数据展示与交互 */}
      <UserTable />
    </Box>
  );
}
