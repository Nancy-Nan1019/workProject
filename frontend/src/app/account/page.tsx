'use client';

/**
 * 账户管理页面
 * 提供用户个人信息查看、编辑和密码修改功能
 * @module AccountManagement
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  InputBase,
  Grid,
  Stack,
  Chip,
  MenuItem,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import SaveIcon from '@mui/icons-material/Save';
import LockResetIcon from '@mui/icons-material/LockReset';
import { ArrowBack, Notifications, Search, CalendarToday } from '@mui/icons-material';
import { getUserProfile, updateUserProfile, changePassword } from '../services/userService';
import dayjs from 'dayjs';

/**
 * 用户数据接口定义
 */
interface UserData {
  id: number;
  username: string;
  email: string;
  status?: string;
  createdAt?: string;
  lastLogin?: string | null;
}


/**
 * 账户管理主组件
 * @returns {JSX.Element} 账户管理页面
 */
export default function AccountManagement() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);

  /**
 * 表单数据接口定义
 */
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    status: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });


  /**
   * 组件挂载时获取用户数据
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile(token);
        setUserData(data);
        setFormData(prev => ({
          ...prev,
          username: data.username,
          email: data.email,
          status: data.status || 'active'
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  /**
   * 处理表单输入变化
   * @param {React.ChangeEvent<HTMLInputElement>} e - 输入事件
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * 保存用户信息
   */
  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      await updateUserProfile(token, {
        username: formData.username,
        status: formData.status
      });

      const updatedData = await getUserProfile(token);
      setUserData(updatedData);
      setEditMode(false);
      setSuccess('Profile updated successfully!');

      // 更新本地存储的用户信息
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...user, name: formData.username, status: formData.status }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 修改密码
   */
  const handlePasswordChange = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      await changePassword(token, formData.currentPassword, formData.newPassword);

      setPasswordMode(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setSuccess('Password changed successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 根据用户名生成头像属性
   * @param {string} name - 用户名
   * @returns {Object} 头像属性对象
   */
  const stringAvatar = (name: string) => {
    return {
      sx: {
        bgcolor: stringToColor(name),
        width: 100,
        height: 100,
        fontSize: 48,
        margin: '0 auto'
      },
      children: `${name.split(' ')[0][0]}${name.split(' ')[1]?.[0] || ''}`,
    };
  };

  /**
   * 将字符串转换为颜色值
   * @param {string} string - 输入字符串
   * @returns {string} 十六进制颜色值
   */
  const stringToColor = (string: string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ('00' + value.toString(16)).slice(-2);
    }
    return color;
  };

  // 加载状态显示
  if (loading && !userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 无用户数据时显示
  if (!userData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">No user data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* 顶部导航栏 */}
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar className="flex justify-between">
          <div className="flex items-center">
            <IconButton onClick={() => window.history.back()}>
              <ArrowBack />
            </IconButton>
            <h1 className="ml-4 text-xl font-semibold">Account Management</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
              <Search className="text-gray-500 mr-2" />
              <InputBase placeholder="Search..." />
            </div>

            <div className="flex items-center">
              <CalendarToday className="mr-2 text-gray-600" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>

            <IconButton>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      {/* 主内容区域 */}
      <Box sx={{ flex: 1, p: 3, maxWidth: 800, margin: '0 auto', width: '100%' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* 用户信息卡片 */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4} md={3}>
              <Avatar {...stringAvatar(userData.username || 'User')} />
            </Grid>

            <Grid item xs={12} sm={8} md={9}>
              <Typography variant="h6">{userData.username}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {userData.email}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Chip label={`Status: ${userData.status}`} color={userData.status === 'active' ? 'success' : 'default'} />
                <Chip label={`User ID: ${userData.id}`} variant="outlined" />
              </Stack>

              <Typography variant="body2" color="text.secondary">
                Created at: {dayjs(userData.createdAt).format('YYYY-MM-DD HH:mm')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last login: {userData.lastLogin ? dayjs(userData.lastLogin).format('YYYY-MM-DD HH:mm') : 'Never'}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>Profile Information</Typography>

          {editMode ? (
            <>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                margin="normal"
                disabled
                helperText="Email cannot be changed"
              />

              <TextField
                fullWidth
                label="Status"
                name="status"
                select
                value={formData.status || 'active'}
                onChange={handleInputChange}
                margin="normal"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>


              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" onClick={() => setEditMode(false)} sx={{ mr: 2 }} color="info">
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setEditMode(true)}
                sx={{ mt: 2 }}
              >
                Edit Profile
              </Button>
            </>
          )}
        </Paper>

        {/* 密码修改部分 */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Password Settings</Typography>

          {passwordMode ? (
            <>
              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                margin="normal"
                required
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" onClick={() => setPasswordMode(false)} sx={{ mr: 2 }} color="info">
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePasswordChange}
                  startIcon={<LockResetIcon />}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Change Password'}
                </Button>
              </Box>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setPasswordMode(true)}
              startIcon={<LockResetIcon />}
            >
              Change Password
            </Button>
          )}
        </Paper>
      </Box>
    </Box>
  );
}