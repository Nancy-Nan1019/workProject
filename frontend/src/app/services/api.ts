import axios from 'axios';

/**
 * API基础路径配置
 * 说明：统一管理后端API地址，便于环境切换（如开发/生产环境）
 */
const API_BASE_URL = 'http://localhost:3000';

/**
 * 获取公司列表数据
 * 功能：调用后端接口获取所有公司的基础信息，处理层级类型转换
 * @returns 格式化后的公司列表（层级转为数字类型）
 * @throws 接口请求失败时抛出错误（含错误信息）
 */
export const fetchCompanyList = async (): Promise<Company[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/company-structure/list`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to load company list');
    }

    return response.data.data.map((company: any) => ({
      ...company,
      level: Number(company.level) // 转换数字等级为字母
    }));
  } catch (error) {
    throw new Error('Failed to fetch company list');
  }
};

/**
 * 获取单个公司详情
 * 功能：根据公司编码调用后端接口，获取该公司的详细信息（如营收、员工数）
 * @param companyCode - 公司唯一编码（用于定位具体公司）
 * @returns 公司详情数据
 * @throws 接口请求失败或公司不存在时抛出错误
 */
export const fetchCompanyDetails = async (companyCode: string): Promise<CompanyDetail> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/company-structure/${companyCode}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Company not found');
    }
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to fetch details for company ${companyCode}`);
  }
};

/**
 * 层级映射函数（数字转字母）
 * 功能：将数字层级（如5、8）转为字母等级（A/B/C），用于展示或分类
 * 规则：level≥8→A，5≤level<8→B，level<5→C
 * @param level - 数字类型的公司层级
 * @returns 字母等级（A/B/C）
 * 注：当前未在导出函数中使用，保留以备后续扩展
 */
const mapLevel = (level: number): 'A' | 'B' | 'C' => {
  if (level >= 8) return 'A';
  if (level >= 5) return 'B';
  return 'C';
};