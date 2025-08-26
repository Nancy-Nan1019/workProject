'use client';
import { useRouter } from 'next/navigation';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

/**
 * 侧边栏导航组件
 * 功能：提供系统各主要模块的导航入口
 */
export default function Sidebar() {
  const router = useRouter();

  // 导航菜单配置：文本、图标、跳转路径
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'User Management', icon: <PeopleIcon />, path: '/dashboard/user' },
    { text: 'Company Management', icon: <BusinessIcon />, path: '/dashboard/company' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings' }
  ];

  return (
    <List sx={{ width: 250 }}>
      {/* 渲染导航菜单列表 */}
      {navItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton onClick={() => router.push(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}