'use client';
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Box,
  Typography,
  TableSortLabel,
  CircularProgress
} from '@mui/material';
import {
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon
} from '@mui/icons-material';
import { Company, CompanyDetail } from './types';
import { fetchCompanyList, fetchCompanyDetails } from '../../../services/api';

/**
 * 公司表格组件
 * 功能：展示公司列表（支持折叠行查看详情）、加载状态管理、错误提示
 * 交互：点击展开/折叠按钮加载并显示公司详情，层级数值用颜色区分
 */

export default function CompanyTable() {
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});
  const [companies, setCompanies] = useState<Company[]>([]);
  const [details, setDetails] = useState<Record<string, CompanyDetail[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
  * 初始化加载公司列表
  * 时机：组件首次渲染时执行
  */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCompanyList();
        setCompanies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * 展开/折叠行处理
   * @param companyCode - 公司编码（用于定位具体行）
   * 逻辑：未加载详情则先请求API，再切换展开状态
   */
  const toggleRow = async (companyCode: string) => {
    if (!details[companyCode] && !openRows[companyCode]) {
      try {
        const data = await fetchCompanyDetails(companyCode);
        setDetails(prev => ({
          ...prev,
          [companyCode]: [data] // 存储详情（数组格式适配表格渲染）
        }));
      } catch (err) {
        console.error('Failed to load details:', err);
        setError(`Failed to load details for ${companyCode}`);
      }
    }
    setOpenRows(prev => ({ ...prev, [companyCode]: !prev[companyCode] }));
  };

  // 加载中：显示居中加载动画
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  // 错误状态：显示错误提示
  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={3} sx={{ mt: 3 }}>
      <Table aria-label="collapsible company table">
        {/* 表格表头 */}
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>
              <TableSortLabel>Code</TableSortLabel>
            </TableCell>
            <TableCell>Company Name</TableCell>
            <TableCell>Level</TableCell>
            <TableCell>Country</TableCell>
            <TableCell>Efficiency</TableCell>
          </TableRow>
        </TableHead>

        {/* 表格主体 */}
        <TableBody>
          {companies.map((company) => (
            <React.Fragment key={company.company_code}>
              {/* 公司主行（可点击展开详情） */}
              <TableRow hover>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => toggleRow(company.company_code)}
                  >
                    {openRows[company.company_code] ? <CollapseIcon /> : <ExpandIcon />}
                  </IconButton>
                </TableCell>
                <TableCell>{company.company_code}</TableCell>
                <TableCell>{company.company_name}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      bgcolor: company.level === 4 ? 'success.light' :   // 4级=绿色
                        company.level === 3 ? 'warning.light' :    // 3级=黄色
                          company.level === 2 ? 'info.light' :       // 2级=蓝色
                            'error.light',                            // 1级=红色
                      px: 1,
                      borderRadius: 1,
                      display: 'inline-block'
                    }}
                  >
                    {company.level}
                  </Box>
                </TableCell>
                <TableCell>{company.country}</TableCell>
                <TableCell>
                  <Typography
                    color={company.efficiency > 2 ? 'success.main' : 'error.main'}
                    fontWeight="bold"
                  >
                    {company.efficiency.toFixed(1)}
                  </Typography>
                </TableCell>
              </TableRow>

              {/* 公司详情折叠行（展开时显示） */}
              <TableRow>
                <TableCell style={{ padding: 0 }} colSpan={6}>
                  <Collapse in={openRows[company.company_code]} timeout="auto" unmountOnExit>
                    <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                      <Typography variant="h6" gutterBottom>
                        Branch Details
                      </Typography>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>City</TableCell>
                            <TableCell>Founded</TableCell>
                            <TableCell>Revenue</TableCell>
                            <TableCell>Employees</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {details[company.company_code]?.map((detail) => (
                            <TableRow key={`${detail.company_code}-${detail.city}`}>
                              <TableCell>{detail.city}</TableCell>
                              <TableCell>{detail.founded_year}</TableCell>
                              <TableCell>
                                ${(detail.annual_revenue / 1000000).toFixed(1)}M
                              </TableCell>
                              <TableCell>{detail.employees}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}