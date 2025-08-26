'use client';
import { useState } from 'react';
import {
  useTheme,
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useRouter, usePathname } from 'next/navigation';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import UserAvatarMenu from '../components/layout/UserAvatarMenu';

/**
 * 导航项数据结构
 * @property {string} text - 导航项显示文本
 * @property {React.ReactNode} icon - 导航项图标
 * @property {string} [path] - 导航项对应的路由路径（可选）
 * @property {NavItem[]} [subItems] - 子导航项（可选，用于下拉菜单）
 */
type NavItem = {
  text: string;
  icon: React.ReactNode;
  subItems?: NavItem[];
};

/**
 * 系统主页组件
 * 功能：提供系统整体布局框架，包含顶部导航栏、侧边栏和主内容区
 * 特点：支持响应式布局、导航菜单折叠/展开、路由跳转和返回功能
 */
export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();// 获取当前路由路径
  const shouldShowBackButton = !['/', '/dashboard'].includes(pathname);


  /**
   * 处理导航项点击事件
   * @param {string} [path] - 目标路由路径（可选）
   * 功能：如果有路径则跳转，无路径则用于展开/折叠子菜单
   */
  const handleNavClick = (path?: string) => {
    if (path) router.push(path);
  };

  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'User Management': false,
    'Company Management': false
  });

  /**
   * 切换子菜单展开状态
   * @param {string} text - 导航项文本（作为状态键）
   */
  const toggleItem = (text: string) => {
    setOpenItems(prev => ({ ...prev, [text]: !prev[text] }));
  };

  /**
   * 导航菜单配置
   * 包含系统所有导航项，支持多级菜单结构
   */
  const navItems: NavItem[] = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    {
      text: 'User Management',
      icon: <PeopleIcon />,
      path: '/dashboard/user',
      subItems: [
        { text: 'Users', icon: <PeopleIcon /> },
        { text: 'Roles', icon: <SettingsIcon /> }
      ]
    },
    {
      text: 'Company Management',
      icon: <BusinessIcon />,
      path: '/dashboard/company',
      subItems: [
        { text: 'Overview', icon: <BusinessIcon />, path: '/dashboard/company' },
        { text: 'Analytics', icon: <AnalyticsIcon />, path: '/dashboard/company/analytics' }
      ]
    },
    {
      text: 'Account Management',
      icon: <AccountCircleIcon />,
      path: '/account'
    },
    { text: 'Settings', icon: <SettingsIcon /> }
  ];

  /**
   * 组件样式配置
   * 集中管理布局相关样式，确保视觉一致性
   */
  const styles = {
    appBar: {
      zIndex: theme.zIndex.drawer + 1, // 确保导航栏在侧边栏上方
      backgroundColor: theme.palette.primary.main,
      '& .MuiToolbar-root': {
        paddingLeft: '8px',
        paddingRight: '8px'
      }
    },
    drawer: {
      width: 240,
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: 240,
        boxSizing: 'border-box',
      },
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(1),
      ...theme.mixins.toolbar,
      justifyContent: 'flex-end',
    },
    nestedItem: {
      paddingLeft: theme.spacing(4), // 子菜单缩进，区分层级
    },
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* 顶部导航栏 */}
      <AppBar position="fixed" sx={styles.appBar}>
        <Toolbar>

          {/* 返回按钮：非首页和仪表盘时显示 */}
          {shouldShowBackButton && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => router.push(pathname.startsWith('/dashboard') ? '/dashboard' : '/')}
              sx={{ mr: 1 }}
            >
              <ArrowBackIosIcon />
            </IconButton>
          )}

          {/* 侧边栏开关按钮 */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            <MenuIcon />
          </IconButton>

          {/* 系统标题 */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Business Management System
          </Typography>
        </Toolbar>
      </AppBar>

      {/* 侧边导航栏 */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{
          keepMounted: true, // 移动端优化：保持挂载提升打开性能
        }}
        sx={styles.drawer}
      >
        <Toolbar />{/* 与顶部导航栏高度对齐，避免内容被遮挡 */}
        <Divider />
        <List>
          {/* 渲染导航菜单 */}
          {navItems.map((item) => (
            <div key={item.text}>
              <ListItem
                button
                onClick={() => item.path ? handleNavClick(item.path) : toggleItem(item.text)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {/* 显示展开/折叠图标（仅含子菜单的项） */}
                {item.subItems && (openItems[item.text] ? <ExpandLess /> : <ExpandMore />)}
              </ListItem>

              {/* 渲染子菜单（折叠面板） */}
              {item.subItems && (
                <Collapse in={openItems[item.text]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItem
                        key={subItem.text}
                        button
                        sx={styles.nestedItem}
                        onClick={() => console.log(subItem.text)}
                      >
                        <ListItemIcon>{subItem.icon}</ListItemIcon>
                        <ListItemText primary={subItem.text} />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </div>
          ))}
        </List>
      </Drawer>

      {/* 主内容区 */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, marginTop: '64px' }}>
        {/* 添加浮动用户头像 */}
        <UserAvatarMenu />
        <Typography variant="h4" gutterBottom>
          Welcome Back
        </Typography>
        {/* 此处可添加卡片、图表等主要内容 */}
      </Box>
    </Box>
  );
}