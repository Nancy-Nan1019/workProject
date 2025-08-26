'use client';

/**
 * 登录页面
 * 提供用户登录功能，包含表单验证和错误处理
 * @module LoginPage
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  CssBaseline,
  Avatar,
  Grid // 确保 Grid 已经导入
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Material-UI 主题配置
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

/**
 * 登录页面组件
 * @returns {JSX.Element} 登录页面
 */
export default function LoginPage() {
  const router = useRouter();

  /**
 * 表单数据接口定义
 */
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  /**
 * 表单错误接口定义
 */
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  /**
   * 处理输入框变化
   * @param {React.ChangeEvent<HTMLInputElement>} e - 输入事件
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除对应字段的错误信息
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  /**
   * 表单验证
   * @returns {boolean} 验证是否通过
   */
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      email: '',
      password: ''
    };

    // 邮箱验证
    if (!formData.email) {
      newErrors.email = '请输入邮箱';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
      valid = false;
    }

    // 密码验证
    if (!formData.password) {
      newErrors.password = '请输入密码';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少6位';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  /**
   * 处理表单提交
   * @param {React.FormEvent} e - 表单提交事件
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // 清理输入数据
    const credentials = {
      email: formData.email.trim(),
      password: formData.password.trim()
    };

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to login');
      }

      // 存储认证信息
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));

      // 跳转到首页
      router.push('/');
    } catch (error) {
      console.error('登录错误:', error);
      setLoginError(error instanceof Error ? error.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 3,
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: 'background.paper',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
            登录您的账户
          </Typography>

          {/* 登录错误提示 */}
          {loginError && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {loginError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="邮箱地址"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              variant="outlined"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="密码"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              variant="outlined"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: 1
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : '登 录'}
            </Button>
            <Grid container justifyContent="space-between">
              <Grid item>
                <Link href="/forgot-password" variant="body2">
                  忘记密码?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/register" variant="body2">
                  注册新账号
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}