/**
 * 公司节点数据结构接口
 * 描述公司层级中的单个节点信息，包含基础属性和子节点引用
 */

export interface CompanyNode {
  company_code: string; // 公司唯一编码（主键）
  company_name: string;
  level: number;
  country: string;
  city: string;
  founded_year: number;
  annual_revenue: number;
  employees: number;
  children?: CompanyNode[];
  // 气泡大小计算用字段（可选，由processData函数动态生成）
  value?: number;
}

/**
 * 气泡图组件Props接口
 * 定义组件的外部传入参数
 */
export interface BubbleChartProps {
  data: CompanyNode;
  width?: number;
  height?: number;
}