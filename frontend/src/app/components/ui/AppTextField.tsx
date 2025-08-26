import { TextField, TextFieldProps } from '@mui/material';

/**
 * 应用程序文本输入框组件
 * 功能：封装基础输入框组件，统一设置默认样式（带边框、全宽、标准间距）
 * 用途：全局统一表单输入框外观，简化表单开发
 */
export default function AppTextField(props: TextFieldProps) {
  // 默认使用带边框样式、全宽显示和标准间距，支持覆盖传入的props
  return <TextField variant="outlined" fullWidth margin="normal" {...props} />;
}
