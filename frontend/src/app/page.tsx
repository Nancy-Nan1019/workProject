// 引入首页布局组件（包含顶部导航栏、侧边栏、主内容区）
import HomePage from './main/HomePage';

/**
 * 应用首页组件
 * 功能：作为根路由（/）的入口页面，直接渲染完整的首页布局
 * 说明：首页布局（HomePage）已包含导航、侧边栏和基础内容区，此处无需额外逻辑
 */
export default function Page() {
  // 直接返回首页布局组件，无额外业务逻辑（首页核心逻辑在HomePage中）
  return <HomePage />;
}