/**
 * 用户控制器 - 处理用户管理相关API
 * 
 * 模块功能：
 * - 用户信息管理：获取、创建、更新、删除用户
 * - 个人资料管理：获取和更新当前用户信息
 * - 密码管理：修改当前用户密码
 * - 集成JWT认证和Swagger文档
 * 
 * 权限控制：
 * - 所有接口都需要JWT认证
 * - 部分敏感操作需要额外权限验证
 */

import { 
  Controller, Get, Post, Body, Param, Put, Delete, 
   UnauthorizedException, UseGuards, Req 
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { 
  ApiTags, ApiOperation, ApiResponse, ApiParam, 
  ApiBearerAuth, ApiBody, ApiNotFoundResponse,
  ApiCreatedResponse, ApiOkResponse, ApiUnauthorizedResponse, ApiConflictResponse 
} from '@nestjs/swagger';
import { ParseIntPipe } from '@nestjs/common';

@ApiTags('User Management') 
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 获取当前登录用户信息
   */
  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiOkResponse({ type: User, description: '当前用户信息获取成功' })
  @ApiUnauthorizedResponse({ description: '用户未认证' })
  async getCurrentUser(@Req() req: Request & { user: { id: number } }) {
    if (!req.user) {
      throw new UnauthorizedException('用户未认证');
    }
    return this.userService.findOne(req.user.id);
  }

  /**
   * 更新当前登录用户信息
   */
  @Put('me')
  @ApiOperation({ summary: '更新当前用户信息' })
  @ApiBody({ type: UpdateUserDto, description: '要更新的用户信息' })
  @ApiOkResponse({ type: User, description: '用户信息更新成功' })
  @ApiUnauthorizedResponse({ description: '用户未认证' })
  async updateCurrentUser(
    @Req() req: Request & { user: { id: number } },
    @Body() updateUserDto: UpdateUserDto
  ) {
    if (!req.user) {
      throw new UnauthorizedException('用户未认证');
    }
    return this.userService.update(req.user.id, updateUserDto);
  }

  /**
   * 修改当前登录用户密码
   */
  @Put('me/password')
  @ApiOperation({ 
    summary: '修改当前登录用户的密码', 
    description: '需要提供当前密码和新密码进行身份验证' 
  })
  @ApiBody({ 
    type: ChangePasswordDto, 
    description: '包含当前密码和新密码'
  })
  @ApiOkResponse({ 
    description: '密码修改成功',
    schema: {
      example: {
        message: 'Password changed successfully'
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: '当前密码错误或未认证',
  })
  @ApiResponse({
    status: 400,
    description: '请求体格式错误或字段验证失败',
  })
  async changePassword(
    @Req() req: Request & { user: { id: number } },
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    if (!req.user) {
      throw new UnauthorizedException('用户未认证');
    }
    return this.userService.changePassword(
      req.user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword
    );
  }

  /**
   * 获取所有用户列表
   */
  @Get()
  @ApiOperation({ summary: '获取所有用户', description: '返回系统中所有用户列表' })
  @ApiOkResponse({ type: [User], description: '用户列表获取成功' })
  findAll() {
    return this.userService.findAll();
  }

  /**
   * 根据ID获取单个用户详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取单个用户', description: '根据ID获取用户详情' })
  @ApiParam({ name: 'id', type: Number, description: '用户ID' })
  @ApiOkResponse({ type: User, description: '用户详情获取成功' })
  @ApiNotFoundResponse({ description: '用户不存在' })
  findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  /**
   * 创建新用户
   */
  @Post()
  @ApiOperation({ summary: '创建用户', description: '创建新用户账户' })
  @ApiBody({ type: CreateUserDto, description: '用户创建数据' })
  @ApiCreatedResponse({ type: User, description: '用户创建成功' })
  @ApiConflictResponse({ description: '用户名或邮箱已存在' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * 更新指定用户信息
   */
  @Put(':id')
  @ApiOperation({ summary: '更新用户', description: '更新指定用户的信息' })
  @ApiParam({ name: 'id', type: Number, description: '用户ID' })
  @ApiBody({ type: UpdateUserDto, description: '要更新的用户信息' })
  @ApiOkResponse({ type: User, description: '用户信息更新成功' })
  @ApiNotFoundResponse({ description: '用户不存在' })
  @ApiConflictResponse({ description: '用户名或邮箱已存在' })
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(id, updateUserDto);
  }

  /**
   * 删除指定用户
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除用户', description: '删除指定用户账户' })
  @ApiParam({ name: 'id', type: Number, description: '用户ID' })
  @ApiOkResponse({ description: '用户删除成功' })
  @ApiNotFoundResponse({ description: '用户不存在' })
  @ApiUnauthorizedResponse({ description: '未授权访问' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.userService.remove(id);
  }
}