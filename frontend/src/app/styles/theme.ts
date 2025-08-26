import { createTheme } from '@mui/material/styles';

/**
 * MUI自定义主题配置
 * 功能：统一应用的视觉风格，包括颜色、响应式断点和组件样式
 * 特点：去函数化配置，使用固定值确保SSR兼容性
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  breakpoints: {
    values: { // 响应式断点固定值（替代默认函数式配置）
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    // 自定义Avatar组件样式
    MuiAvatar: {
      styleOverrides: {
        root: {
          cursor: 'pointer',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.1)' // 悬停放大效果
          }
        }
      }
    }
  },
  transitions: {
    // 禁用函数式过渡配置，使用固定值
    create: () => 'none',
  },
  zIndex: { // 固定z-index值，确保组件层级正确
    drawer: 1200,
    appBar: 1100,
  },
});

export default theme;