import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import ThemeProvider from './providers/ThemeProvider';
import UserAvatarMenu from './components/layout/UserAvatarMenu';

/**
 * 字体配置：全局引入Geist字体
 * 说明：
 * - geistSans：无衬线字体，用于正文、标题等主要内容
 * - geistMono：等宽字体，用于代码、数字等需要对齐的内容
 * 配置variable属性，可通过CSS变量在全局使用
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * 应用元数据配置
 * 作用：设置全局页面标题、描述（会显示在浏览器标签页和SEO搜索结果中）
 */
export const metadata: Metadata = {
  title: "公司管理系统",
  description: "企业级管理平台",
};

/**
 * 根布局组件（Next.js 13+ App Router）
 * 功能：提供应用全局布局框架，整合核心依赖和全局组件
 * 层级：所有页面都会嵌套在该布局内，确保样式、主题、全局组件的统一性
 * @param children - 子页面内容（如首页、仪表盘页等）
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* MUI缓存适配：解决Next.js App Router下MUI组件缓存问题 */}
        <AppRouterCacheProvider>
          {/* 主题提供者：注入全局MUI主题（颜色、样式、组件配置等） */}
          <ThemeProvider>
            {/* 子页面内容：动态渲染当前路由对应的页面 */}
            {children}
            {/* 全局用户头像菜单：浮动在页面右下角，所有页面可见 */}
            <UserAvatarMenu />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}