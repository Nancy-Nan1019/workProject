'use client';
import React, { useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Box,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FiberManualRecord as FiberManualRecordIcon
} from '@mui/icons-material';
import { User } from './types';
import { fetchUsers, updateUser, deleteUser } from '../../../services/userService';


/**
 * 用户管理表格组件
 * 功能：展示用户列表、支持排序、编辑用户信息、删除用户
 * 交互：表格排序、编辑对话框、操作菜单（编辑/删除）
 */
export default function UserTable() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof User>('username');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [tempUser, setTempUser] = React.useState<Partial<User>>({});
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);

  /**
   * 初始化加载用户列表
   * 时机：组件首次渲染时执行
   */
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  /**
   * 处理编辑点击
   * @param user - 待编辑的用户数据
   * 功能：初始化编辑表单数据，打开编辑对话框
   */
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setTempUser({
      username: user.username,
      email: user.email,
      status: user.status
    });
  };

  /**
   * 保存编辑内容
   * 功能：调用API更新用户数据，刷新列表，关闭对话框
   */
  const handleSave = async () => {
    if (!editingUser) return;

    try {
      setLoading(true);
      const updatedUser = await updateUser(editingUser.id, tempUser);
      setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
      setEditingUser(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理删除操作
   * 功能：调用API删除用户，从列表中移除对应项
   */
  const handleDelete = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      await deleteUser(currentUserId);
      // 从列表中过滤掉已删除的用户
      setUsers(users.filter(u => u.id !== currentUserId));
      setCurrentUserId(null);
      setAnchorEl(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理输入框变化
   * @param field - 字段名
   * @param value - 新值
   * 功能：更新临时编辑数据
   */
  const handleInputChange = (field: keyof User, value: string) => {
    setTempUser(prev => ({ ...prev, [field]: value }));
  };

  /**
   * 处理排序请求
   * @param property - 排序字段
   * 功能：切换排序方向（升序/降序）
   */
  const handleRequestSort = (property: keyof User) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  /**
   * 打开操作菜单
   * @param event - 鼠标事件
   * @param userId - 当前用户ID
   */
  const handleActionMenu = (event: React.MouseEvent<HTMLElement>, userId: number) => {
    setAnchorEl(event.currentTarget);
    setCurrentUserId(userId);
  };

  /**
   * 关闭操作菜单
   */
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setCurrentUserId(null);
  };

  /**
   * 对用户列表进行排序
   * 基于当前排序字段和方向
   */
  const sortedUsers = [...users].sort((a, b) => {
    if (a[orderBy] < b[orderBy]) return order === 'asc' ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return order === 'asc' ? 1 : -1;
    return 0;
  });

  /**
   * 获取状态标签颜色
   * @param status - 用户状态
   * @returns 活跃状态返回绿色，禁用状态返回红色
   */
  const getStatusColor = (status: User['status']) => {
    return status === 'active' ? 'success' : 'error';
  };

  /**
   * 格式化日期显示
   * @param dateString - ISO格式日期字符串
   * @returns 本地化日期字符串（如"2023/10/05"）
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // ========== 加载与错误状态渲染 ==========
  if (loading && users.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  // ========== 主组件渲染 ==========
  return (
    <Box sx={{ width: '100%' }}>
      {/* 用户表格 */}
      <TableContainer component={Paper} elevation={3}>
        <Table aria-label="user management table">
          <TableHead>
            <TableRow>
              <TableCell>
                {/* 用户名排序按钮 */}
                <TableSortLabel
                  active={orderBy === 'username'}
                  direction={orderBy === 'username' ? order : 'asc'}
                  onClick={() => handleRequestSort('username')}
                >
                  Username
                </TableSortLabel>
              </TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedUsers.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {/* 状态标签：带颜色标识 */}
                  <Chip
                    icon={<FiberManualRecordIcon fontSize="small" />}
                    label={user.status}
                    color={getStatusColor(user.status)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEditClick(user)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={(e) => handleActionMenu(e, user.id)}
                    aria-label="more actions"
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 操作菜单（编辑/删除） */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          const user = users.find(u => u.id === currentUserId);
          user && handleEditClick(user);
          handleCloseMenu();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* 编辑对话框 */}
      <Dialog open={!!editingUser} onClose={() => setEditingUser(null)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            value={tempUser?.username || ''}
            onChange={(e) => handleInputChange('username', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            value={tempUser?.email || ''}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }} // 邮箱不可修改
            helperText="Email cannot be changed"
          />

          <TextField
            label="Status"
            select
            value={tempUser?.status || 'active'}
            onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive')}
            fullWidth
            margin="normal"
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingUser(null)}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}