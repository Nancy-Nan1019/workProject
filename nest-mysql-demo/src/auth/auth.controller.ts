/**
 * 认证控制器 - 处理用户认证相关API
 * 
 * 模块功能：
 * - 用户注册：创建新用户账户，邮箱唯一性校验
 * - 用户登录：验证用户凭证，颁发访问令牌
 * - 集成Swagger文档，提供完整的API说明和响应示例
 * 
 * 安全考虑：
 * - 注册接口防止重复邮箱注册
 * - 登录接口限制尝试次数（需配合中间件实现）
 * - 所有敏感操作都有详细的错误响应定义
 */

import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse 
} from '@nestjs/swagger';

@ApiTags('认证管理')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * 用户注册接口
   */
  @Post('register')
  @ApiOperation({ 
    summary: '用户注册', 
    description: '创建新用户账号，邮箱必须唯一，密码需符合安全规范' 
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: '注册成功',
    schema: {
      example: {
        id: 1,
        name: 'Tian',
        email: 'user@example.com',
        createdAt: '2023-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: '参数验证失败：邮箱格式错误、密码不符合要求等',
    schema: {
      example: {
        statusCode: 400,
        message: ['email 必须是有效的邮箱地址'],
        error: 'Bad Request'
      }
    }
  })
  @ApiConflictResponse({ 
    description: '邮箱已存在，无法重复注册',
    schema: {
      example: {
        statusCode: 409,
        message: '邮箱已被注册',
        error: 'Conflict'
      }
    }
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * 用户登录接口
   */
  @Post('login')
  @ApiOperation({ 
    summary: '用户登录', 
    description: '通过邮箱和密码验证用户身份，成功返回访问令牌' 
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: '登录成功，返回访问令牌和用户基本信息',
    schema: {
      example: {
        success: true,
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 1,
            email: 'user@example.com',
            username: 'Tina'
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: '认证失败：邮箱或密码错误',
    schema: {
      example: {
        statusCode: 401,
        message: '无效的邮箱或密码',
        error: 'Unauthorized'
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: '参数验证失败：密码为空等',
    schema: {
      example: {
        statusCode: 400,
        message: ['password 不能为空'],
        error: 'Bad Request'
      }
    }
  })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      data: {
        token: result.token,
        user: result.user
      }
    };
  }
}