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
import { Card, CardContent, Typography } from '@mui/material';

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
}

export default function LineChart({ title, data }: LineChartProps) {
  const chartData = {
    labels: data.map(item => item.year),
    datasets: [
      {
        label: 'Company Growth',
        data: data.map(item => item.companies), // Y轴数据：公司数量
        borderColor: '#4285F4',
        backgroundColor: 'rgba(66, 133, 244, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <div style={{ height: 300 }}>
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}