'use client';

/**
 * 注册页面
 * 提供新用户注册功能，包含表单验证和错误处理
 * @module RegisterPage
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
  Grid
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
 * 注册页面组件
 * @returns {JSX.Element} 注册页面
 */
export default function RegisterPage() {
  const router = useRouter();

  /**
 * 注册表单数据接口定义
 */
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  /**
 * 注册表单错误接口定义
 */
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

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
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    };

    // 用户名验证
    if (!formData.name) {
      newErrors.name = '请输入用户名';
      valid = false;
    }

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

    // 确认密码验证
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '密码不一致';
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
    setRegisterError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const result = await response.json();

      // 处理注册成功
      if (response.status === 200 || response.status === 201) {
        router.push('/login');
      } else {
        throw new Error(result.message || `注册失败 (${response.status})`);
      }

    } catch (error) {
      console.error('Error registering:', error);
      setRegisterError(error instanceof Error ? error.message : 'Failed to register');
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
          <Typography component="h1" variant="h5">
            注册新账户
          </Typography>

          {/* 注册错误提示 */}
          {registerError && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {registerError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="用户名"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              variant="outlined"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="邮箱地址"
              name="email"
              autoComplete="email"
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
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              variant="outlined"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="确认密码"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
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
              {loading ? <CircularProgress size={24} color="inherit" /> : '注 册'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  已有账号? 去登录
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}