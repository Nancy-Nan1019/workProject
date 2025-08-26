import { Card, CardProps } from '@mui/material';

/**
 * 应用程序卡片组件
 * 功能：封装基础卡片组件，统一设置默认阴影层级
 * 用途：全局统一卡片外观，保持界面一致性
 */
export default function AppCard(props: CardProps) {
  // 默认使用3级阴影，支持覆盖传入的props
  return <Card elevation={3} {...props} />;
}
