'use client';

import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import theme from '../styles/theme';

/**
 * 主题提供者组件
 * 功能：
 * 1. 集成MUI主题系统，提供全局样式配置
 * 2. 结合Next.js 13+ App Router的缓存机制，优化MUI组件性能
 * 使用：作为应用根组件，包裹所有子内容
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      {/* 应用自定义MUI主题 */}
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </AppRouterCacheProvider>
  );
}