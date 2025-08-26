'use client';

/**
 * 忘记密码页面
 * 提供通过邮箱重置密码的功能
 * @module ForgotPasswordPage
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
 * 忘记密码页面组件
 * @returns {JSX.Element} 忘记密码页面
 */
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * 处理表单提交
   * @param {React.FormEvent} e - 表单提交事件
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 表单验证
    if (!email) {
      setError('请输入邮箱地址');
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('邮箱格式不正确');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to send reset link');
      }

      setSuccess('重置链接已发送到您的邮箱，请查收');
    } catch (error) {
      console.error('Error sending reset link:', error);
      setError(error instanceof Error ? error.message : 'Failed to send reset link');
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
            重置密码
          </Typography>

          {/* 错误提示 */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* 成功提示 */}
          {success && (
            <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
              {success}
            </Alert>
          )}

          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            请输入您的邮箱地址，我们将发送重置密码的链接
          </Typography>

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {loading ? <CircularProgress size={24} color="inherit" /> : '发送重置链接'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  返回登录
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}