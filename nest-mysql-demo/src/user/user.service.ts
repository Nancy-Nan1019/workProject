/**
 * 用户服务 - 用户管理核心业务逻辑
 * 
 * 主要功能：
 * - 用户CRUD操作：查找、创建、更新、删除
 * - 用户查询：按ID、邮箱查找用户
 * - 密码管理：密码修改和验证
 * - 数据验证：用户名和邮箱唯一性检查
 * 
 * 安全特性：
 * - 密码使用bcrypt加密存储
 * - 敏感信息（密码）不返回给客户端
 * - 严格的输入验证和错误处理
 */

import { Injectable, NotFoundException, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 获取所有用户列表（不包含密码字段）
   */
  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.userRepository.find({
      select: ['id', 'username', 'email', 'status', 'createdAt', 'lastLogin']
    });
  }

  /**
   * 根据ID获取用户详情（不包含密码字段）
   */
  async findOne(id: number): Promise<Omit<User, 'password'> & { id: number }> {
  const user = await this.userRepository.findOne({ 
    where: { id },
    select: ['id', 'username', 'email', 'status', 'createdAt', 'updatedAt', 'lastLogin']
  });
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  return user;
}


  /**
   * 根据邮箱查找用户（包含密码字段，用于登录验证）
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'username', 'email', 'password', 'status'] // 登录需要密码
    });
  }

  /**
   * 创建新用户
   */
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // 检查用户名唯一性
  const usernameExists = await this.userRepository.findOne({ where: { username: createUserDto.username } });
  if (usernameExists) {
    throw new ConflictException('用户名已存在');
  }

  // 检查邮箱唯一性
  const emailExists = await this.userRepository.findOne({ where: { email: createUserDto.email } });
  if (emailExists) {
    throw new ConflictException('邮箱已存在');
  }

  // 验证密码长度
  if (createUserDto.password.length < 6) {
    throw new BadRequestException('密码长度至少6位');
  }
    const user = await this.userRepository.save({
      username: createUserDto.username,
  email: createUserDto.email,
  password: createUserDto.password // 已经是 hashed
    });
    // 返回结果中排除密码字段
    const { password, ...result } = user;
    return result;
  }

  /**
   * 更新用户信息
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
  if (!updateUserDto || Object.keys(updateUserDto).length === 0) {
    throw new BadRequestException('请求体不能为空或无效字段');
  }

  // 查找用户
  const user = await this.userRepository.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }

  // 检查用户名唯一性（排除当前用户）
  if (updateUserDto.username) {
    const existingUser = await this.userRepository.findOne({ where: { username: updateUserDto.username } });
    if (existingUser && existingUser.id !== id) {
      throw new ConflictException('用户名已存在');
    }
    user.username = updateUserDto.username;
  }

  // 检查邮箱唯一性（排除当前用户）
  if (updateUserDto.email) {
    const existingUser = await this.userRepository.findOne({ where: { email: updateUserDto.email } });
    if (existingUser && existingUser.id !== id) {
      throw new ConflictException('邮箱已存在');
    }
    user.email = updateUserDto.email;
  }

  // 更新状态
  if (updateUserDto.status) {
    user.status = updateUserDto.status;
  }

  // 手动更新时间
  user.updatedAt = new Date();

  const updatedUser = await this.userRepository.save(user);

  const { password, ...result } = updatedUser;
  return result;
}

  
  /**
   * 删除用户
   */
  async remove(id: number): Promise<{ message: string }> {
    if (!Number.isInteger(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `用户 ${id} 删除成功` };
  }

  /**
   * 修改用户密码
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'password']
    });
    
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证当前密码
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('当前密码不正确');
    }

    // 加密新密码并更新
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });

  
  return { message: 'Password changed successfully' };
  }
}