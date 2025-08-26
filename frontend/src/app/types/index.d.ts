/**
 * TSX模块类型声明
 * 功能：为.tsx文件提供类型定义，确保TypeScript正确识别TSX组件
 * 说明：声明所有.tsx文件导出一个返回React元素的组件
 */

declare module '*.tsx' {
  import { ReactElement } from 'react';
  const component: () => ReactElement;
  export default component;
}