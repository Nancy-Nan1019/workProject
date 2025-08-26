/**
 * 认证服务 - 核心认证业务逻辑实现
 * 
 * 主要功能：
 * - 用户验证：验证邮箱和密码的正确性
 * - 用户注册：创建新用户并加密密码
 * - JWT令牌生成：颁发访问令牌
 * - 密码安全：使用bcrypt进行密码哈希和验证
 * 
 * 安全特性：
 * - 密码强度验证（注册时）
 * - 防止时序攻击的密码比较
 * - 密码哈希格式验证
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../user/user.entity';

// BCrypt哈希格式验证辅助函数
const isValidBcryptHash = (hash: string): boolean => {
  return !!hash && /^\$2[abxy]\$\d{2}\$/.test(hash);
};

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * 验证用户凭证
   * @param email 用户邮箱
   * @param password 用户密码
   * @returns 去除密码的用户信息或null
   */
  async validateUser(email: string, password: string): Promise<Partial<User> | null> {
    const user = await this.userService.findOneByEmail(email.trim());
    if (!user) {
      return null;
    }

    // 验证密码哈希格式
    if (!isValidBcryptHash(user.password)) {
      return null;
    }

    // 安全密码比较
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    
    return isMatch ? { ...user, password: undefined } : null;
  }

  /**
   * 用户登录
   * @param loginDto 登录数据
   * @returns 访问令牌和用户信息
   * @throws UnauthorizedException 当认证失败时
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }
    
    const payload = { 
      email: user.email, 
      sub: user.id,
      username: user.username 
    };
    
    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    };
  }

  /**
   * 用户注册
   * @param registerDto 注册数据
   * @returns 新创建的用户信息（不包含密码）
   */
  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // 转换注册数据格式
    const createUserDto = {
      username: registerDto.name,
      password: hashedPassword,
      email: registerDto.email
    };

    const user = await this.userService.create(createUserDto);
    return user;
  }
}