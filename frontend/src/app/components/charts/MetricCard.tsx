'use client';

// 指标卡片组件
// 功能：展示关键业务指标（如总数、增长率等）及变化趋势

import { Card, CardContent, Typography, Stack } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

export default function MetricCard({
  title,
  value,
  change,
  icon
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}) {
  // 判断变化趋势是否为正向（用于显示不同颜色）
  const isPositive = change.startsWith('+');

  return (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent>
        {/* 标题、数值与图标的布局 */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <div>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h5">{value}</Typography>
          </div>
          <div className="text-2xl">{icon}</div>
        </Stack>

        {/* 变化趋势显示（带箭头图标） */}
        <Typography
          variant="body2"
          color={isPositive ? 'success.main' : 'error.main'}
          sx={{ mt: 1, display: 'flex', alignItems: 'center' }}
        >
          {isPositive ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
          {change}
        </Typography>
      </CardContent>
    </Card>
  );
}