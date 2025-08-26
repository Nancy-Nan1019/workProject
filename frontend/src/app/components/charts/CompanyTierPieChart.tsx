// 公司等级分布饼图组件
// 功能：可视化展示各等级公司的数量及占比分布
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { TierDistribution } from '../tables/CompanyTable/types';

// 注册ChartJS必要组件（饼图渲染依赖）
ChartJS.register(ArcElement, Tooltip, Legend);

interface CompanyTierPieChartProps {
  data: TierDistribution[];
}

const CompanyTierPieChart: React.FC<CompanyTierPieChartProps> = ({ data }) => {

  const chartData = {
    labels: data.map(item => `Level ${item.level}`),
    datasets: [
      {
        data: data.map(item => item.count), // 饼图数值：各等级公司数量
        backgroundColor: [
          '#4CAF50', // Level 1
          '#2196F3', // Level 2
          '#FFC107', // Level 3
          '#F44336'  // Level 4
        ],
        borderWidth: 1
      }
    ]
  };

  // 图表配置项
  const options = {
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Level ${data[context.dataIndex].level}: ${context.raw} 家 (${data[context.dataIndex].percentage})`;
          }
        }
      }
    },
    // 饼图区块点击事件
    onClick: (event: any, elements: any) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const tier = data[index].tier;
        console.log(`Clicked on ${tier} level companies`);
      }
    }
  };

  return (
    <div className="h-full w-full">
      <h3 className="text-lg font-medium mb-4">公司等级分布</h3>
      <div className="h-80">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default CompanyTierPieChart;