import { Button, ButtonProps } from '@mui/material';

/**
 * 应用程序按钮组件
 * 功能：封装基础按钮组件，统一设置默认样式（蓝色实心按钮）
 * 用途：全局统一按钮外观，便于样式维护
 */
export default function AppButton(props: ButtonProps) {
  // 默认使用实心样式和主色调，支持覆盖传入的props
  return <Button variant="contained" color="primary" {...props} />;
}
