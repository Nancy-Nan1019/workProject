'use client';

// 指标卡片组件
// 功能：展示关键业务指标（如总数、增长率等）及变化趋势

import { Card, CardContent, Typography, Stack } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  compact?: boolean; // 添加 compact 属性
}

export default function MetricCard({
  title,
  value,
  change,
  icon,
  compact = false // 默认值为 false
}: MetricCardProps) {
  // 判断变化趋势是否为正向（用于显示不同颜色）
  const isPositive = change.startsWith('+');

  return (
    <Card 
      elevation={compact ? 1 : 3} // 紧凑模式下减少阴影
      sx={{ 
        height: '100%',
        p: compact ? 0.5 : 0 // 紧凑模式下减少内边距
      }}
    >
      <CardContent sx={{ 
        p: compact ? 1 : 2, // 紧凑模式下减少内边距
        '&:last-child': { pb: compact ? 1 : 2 } // 修复最后一个子元素的内边距
      }}>
        {/* 标题、数值与图标的布局 */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <div>
            <Typography 
              variant={compact ? "caption" : "body2"} 
              color="text.secondary"
              sx={{ fontSize: compact ? '0.7rem' : '0.875rem' }}
            >
              {title}
            </Typography>
            <Typography 
              variant={compact ? "h6" : "h5"}
              sx={{ fontSize: compact ? '1rem' : '1.5rem' }}
            >
              {value}
            </Typography>
          </div>
          <div style={{ 
            fontSize: compact ? '1.25rem' : '1.5rem' // 紧凑模式下减小图标
          }}>
            {icon}
          </div>
        </Stack>

        {/* 变化趋势显示（带箭头图标） */}
        <Typography
          variant={compact ? "caption" : "body2"}
          color={isPositive ? 'success.main' : 'error.main'}
          sx={{ 
            mt: compact ? 0.5 : 1, 
            display: 'flex', 
            alignItems: 'center',
            fontSize: compact ? '0.7rem' : '0.875rem'
          }}
        >
          {isPositive ? 
            <TrendingUp fontSize={compact ? "small" : "medium"} /> : 
            <TrendingDown fontSize={compact ? "small" : "medium"} />
          }
          {change}
        </Typography>
      </CardContent>
    </Card>
  );
}