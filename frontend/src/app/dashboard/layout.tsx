'use client';
import { AppBar, Toolbar, IconButton, InputBase, Badge } from '@mui/material';
import { Search, Notifications, ArrowBack, CalendarToday } from '@mui/icons-material';


/**
 * 仪表盘布局组件
 * 功能：为仪表盘所有子页面（首页、公司管理、用户管理）提供统一基础布局
 * 结构：顶部导航栏（返回、标题、搜索、日期、通知）+ 可滚动主内容区
 * @param children - 子页面内容（如仪表盘首页、公司列表页等）
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen"> {/* 纵向布局，占满屏幕高度 */}
      {/* 1. 顶部导航栏（固定在顶部，非滚动） */}
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar className="flex justify-between">
          {/* 左侧：返回按钮 + 页面标题 */}
          <div className="flex items-center">
            {/* 返回按钮：点击返回上一页（基于浏览器历史记录） */}
            <IconButton onClick={() => window.history.back()}>
              <ArrowBack />
            </IconButton>
            <h1 className="ml-4 text-xl font-semibold">Overview</h1>
          </div>

          {/* 右侧：搜索框 + 日期 + 通知 */}
          <div className="flex items-center gap-4">
            {/* 搜索框 */}
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
              <Search className="text-gray-500 mr-2" />
              <InputBase placeholder="Search..." />
            </div>

            {/* 日期和时间 */}
            <div className="flex items-center">
              <CalendarToday className="mr-2 text-gray-600" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>

            {/* 通知按钮 */}
            <IconButton>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      {/* 2. 主内容区（占满剩余高度，支持滚动） */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        {/* 子页面内容：动态渲染当前路由对应的仪表盘子页面 */}
        {children}
      </div>
    </div>
  );
}