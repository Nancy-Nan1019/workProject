import { User } from '../components/tables/UserTable/types';

/**
 * API地址配置
 * 说明：统一管理用户相关接口地址，API_BASE为基础路径，API_URL为用户列表接口路径
 */
const API_BASE = 'http://localhost:3000';
const API_URL = 'http://localhost:3000/users';

/**
 * 获取用户列表
 * 功能：调用后端接口获取所有用户信息，需登录态（token），返回格式化后的用户列表
 * @returns 符合User类型的用户列表
 * @throws 无token或接口失败时抛出错误
 */
export const fetchUsers = async (): Promise<User[]> => {
  // 从本地存储获取登录token（用户需先登录）
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  // 调用用户列表接口（带登录态）
  const response = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  // 格式化返回数据：确保字段匹配User类型，补充默认值（如status默认active）
  const result = await response.json();
  return result.map((user: any) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    status: user.status || 'active', // 默认值
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  }));
};

/**
 * 更新用户信息
 * 功能：根据用户ID调用后端PUT接口，更新用户部分信息（如用户名、状态）
 * @param id - 待更新用户的ID
 * @param userData - 需更新的用户数据（部分字段，如{username: 'newName'}）
 * @returns 更新后的完整用户信息
 * @throws 无token、接口失败或业务错误时抛出错误
 */
export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  // 调用用户更新接口（PUT方法）
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update user');
  }

  return await response.json();
};


/**
 * 删除用户
 * 功能：根据用户ID调用后端DELETE接口，删除指定用户
 * @param id - 待删除用户的ID
 * @returns 无返回值（成功时Promise resolved）
 * @throws 无token、接口失败时抛出错误
 */
export const deleteUser = async (id: number): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  // 调用用户删除接口（DELETE方法）
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete user');
  }
};

/**
 * 获取当前登录用户的个人资料
 * 功能：调用“我的资料”接口，获取当前登录用户的详细信息（如姓名、头像等）
 * @param token - 登录token（主动传入，避免重复从localStorage获取）
 * @returns 用户个人资料数据
 * @throws 接口失败时抛出错误
 */
export const getUserProfile = async (token: string) => {
  const response = await fetch(`${API_BASE}/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch user profile');
  }

  return await response.json();
};


/**
 * 更新当前登录用户的个人资料
 * 功能：调用“更新我的资料”接口，修改当前用户的部分信息（如姓名）
 * @param token - 登录token
 * @param data - 待更新的资料数据（如{name: '新姓名'}）
 * @returns 更新后的个人资料
 * @throws 接口失败时抛出错误
 */
export const updateUserProfile = async (token: string, data: { name: string }) => {
  const response = await fetch(`${API_BASE}/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update profile');
  }

  return await response.json();
};

/**
 * 修改当前登录用户的密码
 * 功能：调用“修改密码”接口，验证旧密码后更新为新密码
 * @param token - 登录token
 * @param currentPassword - 当前密码（用于验证）
 * @param newPassword - 新密码（需符合后端密码规则）
 * @returns 后端返回的成功信息（如{success: true, message: 'Password updated'}）
 * @throws 旧密码错误、新密码不符合规则或接口失败时抛出错误
 */
export const changePassword = async (
  token: string,
  currentPassword: string,
  newPassword: string
) => {
  const response = await fetch(`${API_BASE}/users/me/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to change password');
  }

  return await response.json();
};