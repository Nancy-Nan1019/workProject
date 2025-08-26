'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import {
  Logout,
  AccountCircle
} from '@mui/icons-material';

/**
 * 用户头像菜单组件
 * 功能：展示当前用户信息，提供账户管理和退出登录功能
 */
export default function UserAvatarMenu() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  /**
   * 获取当前用户信息
   * 从localStorage读取，兼容SSR环境
   * @returns 用户信息对象（包含用户名）
   */
  const getUser = () => {
    if (typeof window === 'undefined') return { username: 'U' };
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return {
        username: user?.username || user?.email?.split('@')[0] || 'U',
        ...user
      };
    } catch {
      return { username: 'U' }; // 解析失败时返回默认值
    }
  };

  const user = getUser();

  // 打开菜单
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // 关闭菜单
  const handleClose = () => {
    setAnchorEl(null);
  };

  // 处理退出登录：清除本地存储并跳转登录页
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
      }}
    >
      {/* 用户头像按钮：点击打开菜单 */}
      <IconButton onClick={handleMenu} sx={{ p: 0 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: '#90caf9',
            color: '#1565c0',
            fontSize: '1.25rem',
            boxShadow: 3,
            '&:hover': {
              transform: 'scale(1.1)',
              transition: 'transform 0.2s'
            }
          }}
        >
          {/* 显示用户名首字母（大写） */}
          {user.username.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      {/* 用户操作菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        PaperProps={{
          sx: {
            bgcolor: '#e3f2fd',
            borderRadius: 2,
            boxShadow: 3,
            mt: -1,
            mr: 1
          }
        }}
      >
        {/* 账户管理选项 */}
        <MenuItem onClick={() => router.push('/account')}>
          <ListItemIcon><AccountCircle /></ListItemIcon>
          <Typography>Account Management</Typography>
        </MenuItem>
        <Divider />

        {/* 退出登录选项（红色标识） */}
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><Logout color="error" /></ListItemIcon>
          <Typography color="error">Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}