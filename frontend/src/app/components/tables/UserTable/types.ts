// 用户数据结构定义
export interface User {
  id: number; // 用户唯一标识
  username: string;
  email: string; // 邮箱（不可修改）
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string; // 可选字段，根据后端实际情况调整
}
