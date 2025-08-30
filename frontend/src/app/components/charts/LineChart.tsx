'use client';
// 公司增长趋势线图组件
// 功能：展示指定时间段内公司数量的增长趋势

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Card, CardContent, Typography, useTheme } from '@mui/material';

// 注册ChartJS必要组件（线图渲染依赖）
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  title: string;
  data: { year: string; companies: number }[];
  compact?: boolean; // 添加 compact 属性
}

export default function LineChart({ title, data, compact = false }: LineChartProps) {
  const theme = useTheme();
  
  const chartData = {
    labels: data.map(item => item.year),
    datasets: [
      {
        label: 'Company Growth',
        data: data.map(item => item.companies), // Y轴数据：公司数量
        borderColor: theme.palette.primary.main,
        backgroundColor: compact 
          ? 'rgba(66, 133, 244, 0.05)' 
          : 'rgba(66, 133, 244, 0.1)',
        tension: 0.3,
        fill: true,
        borderWidth: compact ? 1.5 : 2
      }
    ]
  };

  return (
    <Card sx={{ 
      height: '100%',
      p: compact ? 0.5 : 1 // 紧凑模式下减少内边距
    }}>
      <CardContent sx={{ 
        p: compact ? 1 : 2, // 紧凑模式下减少内边距
        '&:last-child': { pb: compact ? 1 : 2 } // 修复最后一个子元素的内边距
      }}>
        <Typography 
          variant={compact ? "subtitle2" : "h6"} 
          gutterBottom
          sx={{ fontSize: compact ? '0.875rem' : '1.25rem' }}
        >
          {title}
        </Typography>
        <div style={{ 
          height: compact ? 200 : 300, // 紧凑模式下减少高度
          marginTop: compact ? '0.5rem' : '1rem'
        }}>
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: !compact, // 紧凑模式下隐藏图例
                  position: 'top' as const,
                },
                title: {
                  display: false,
                },
              },
              scales: {
                x: {
                  ticks: {
                    font: {
                      size: compact ? 10 : 12 // 紧凑模式下减小字体
                    }
                  }
                },
                y: {
                  ticks: {
                    font: {
                      size: compact ? 10 : 12 // 紧凑模式下减小字体
                    }
                  }
                }
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}