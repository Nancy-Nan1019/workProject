import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Autocomplete,
  TextField,
  Slider,
  Typography,
  Chip,
  Divider,
  Grid,
  Paper,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { Dimension, FilterOptions, BarChartRequest } from './types';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * 动态柱状图组件
 * 功能：支持多维度分组、多条件筛选，实时请求后端数据渲染图表
 */
const DynamicBarChart: React.FC<DynamicBarChartProps> = () => {
  // 图表请求参数：维度+筛选条件（初始值配置默认范围）
  const [request, setRequest] = useState<BarChartRequest>({
    dimension: 'level',
    filter: {
      level: [],
      country: [],
      city: [],
      founded_year: { start: 1900, end: new Date().getFullYear() },
      annual_revenue: { min: 0, max: 1000000 },
      employees: { min: 0, max: 1000 }
    }
  });

  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // 响应式设计
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  /**
     * 初始化：加载国家/城市下拉框选项
     * 时机：组件首次渲染时执行
     */
  useEffect(() => {
    const fetchAvailableOptions = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/company-structure/list');
        if (!res.ok) throw new Error('Failed to fetch company list');
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'API error');

        const companies = json.data;
        const countries = [...new Set(companies.map((c: any) => c.country).filter(Boolean))].sort();
        const cities = [...new Set(companies.map((c: any) => c.city).filter(Boolean))].sort();

        setAvailableCountries(countries);
        setAvailableCities(cities);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };
    fetchAvailableOptions();
  }, []);

  /**
     * 城市列表联动：根据选中国家过滤城市
     * 时机：国家筛选条件变化时执行
     */
  useEffect(() => {
    if (request.filter.country.length === 0) {
      // 未选国家 → 拿到全部城市
      fetch('http://localhost:3000/api/company-structure/list')
        .then(r => r.json())
        .then(j => {
          const cities = [...new Set(j.data.map((c: any) => c.city).filter(Boolean))].sort();
          setAvailableCities(cities);
        });
    } else {
      // 已选国家 → 仅显示选中国家下的城市
      fetch(`http://localhost:3000/api/company-structure/list`)
        .then(r => r.json())
        .then(j => {
          const cities = [
            ...new Set(
              j.data
                .filter((c: any) => request.filter.country.includes(c.country))
                .map((c: any) => c.city)
                .filter(Boolean)
            )
          ].sort();
          setAvailableCities(cities);
        });
    }
  }, [request.filter.country]);

  /**
     * 图表数据加载：根据请求参数获取后端统计数据
     * 时机：request（维度/筛选条件）变化时执行
     */
  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append('dimension', request.dimension);

        if (request.filter.level.length) params.append('level', request.filter.level.join(','));
        if (request.filter.country.length) params.append('country', request.filter.country.join(','));
        if (request.filter.city.length) params.append('city', request.filter.city.join(','));
        if (request.filter.employees.min > 0) params.append('minEmployees', request.filter.employees.min.toString());
        if (request.filter.employees.max < 1000) params.append('maxEmployees', request.filter.employees.max.toString());
        if (request.filter.annual_revenue.min > 0) params.append('minRevenue', request.filter.annual_revenue.min.toString());
        if (request.filter.annual_revenue.max < 1000000) params.append('maxRevenue', request.filter.annual_revenue.max.toString());
        if (request.filter.founded_year.start > 1900) params.append('minYear', request.filter.founded_year.start.toString());
        if (request.filter.founded_year.end < new Date().getFullYear()) params.append('maxYear', request.filter.founded_year.end.toString());

        const res = await fetch(`http://localhost:3000/api/company-structure/stats?${params}`);
        if (!res.ok) throw new Error('Failed to fetch chart data');
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'API error');

        // 格式化图表数据（适配ChartJS）
        setChartData({
          labels: json.data.labels,
          datasets: [{
            label: `Companies by ${request.dimension}`,
            data: json.data.values,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        });
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [request]);


  /**
   * 图表配置生成：动态计算柱状图样式（适配标签数量）
   * @returns ChartJS配置项
   */
  const getChartOptions = () => {
    const labelCount = chartData.labels.length;
    const baseWidth = 50;
    const minWidth = 15;
    const maxWidth = 60;

    // 动态计算柱子宽度：标签越多，柱子越窄（避免溢出）
    const barThickness = Math.max(minWidth, Math.min(maxWidth, baseWidth - labelCount * 0.3));

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: `Company Distribution by ${request.dimension}`,
          font: {
            size: 16
          }
        },
      },
      scales: {
        x: {
          ticks: {
            autoSkip: labelCount > 30,
            maxRotation: labelCount > 15 ? 90 : 45,
            minRotation: labelCount > 15 ? 90 : 45,
            font: {
              size: labelCount > 30 ? 10 : 12,
            },
          },
          barThickness: labelCount > 50 ? 'flex' : barThickness,
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
      },
      animation: {
        duration: 800,
      },
    };
  };

  /**
   * 维度切换：修改图表分组维度（层级/国家/城市）
   * @param event - 单选框事件
   */
  const handleDimensionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRequest(prev => ({
      ...prev,
      dimension: event.target.value as Dimension
    }));
  };

  /**
   * 筛选条件修改：更新指定筛选器的数值
   * @param filterKey - 筛选器key（对应FilterOptions）
   * @param value - 新的筛选值
   */
  const handleFilterChange = (filterKey: keyof FilterOptions, value: any) => {
    setRequest(prev => ({
      ...prev,
      filter: {
        ...prev.filter,
        [filterKey]: value
      }
    }));
  };

  // 筛选面板内容
  const filterPanel = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 3,
      p: isSmallScreen ? 2 : 0,
      width: isSmallScreen ? '80vw' : 250,
      maxWidth: 400
    }}>
      {isSmallScreen && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      )}
      
      <FormControl component="fieldset">
        <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>Dimension</FormLabel>
        <RadioGroup
          value={request.dimension}
          onChange={handleDimensionChange}
        >
          <FormControlLabel value="level" control={<Radio size={isSmallScreen ? "small" : "medium"} />} label="Company Level" />
          <FormControlLabel value="country" control={<Radio size={isSmallScreen ? "small" : "medium"} />} label="Country" />
          <FormControlLabel value="city" control={<Radio size={isSmallScreen ? "small" : "medium"} />} label="City" />
        </RadioGroup>
      </FormControl>

      <Divider />

      {/* 公司层级筛选（多选下拉） */}
      <FormControl fullWidth>
        <FormLabel sx={{ fontWeight: 'bold' }}>Company Level</FormLabel>
        <Autocomplete
          multiple
          options={[1, 2, 3, 4, 5]}
          getOptionLabel={(option) => `Level ${option}`}
          value={request.filter.level || []}
          onChange={(event, newValue) => {
            handleFilterChange('level', newValue);
          }}
          renderInput={(params) => (
            <TextField 
              {...params} 
              placeholder="Select level" 
              size="small" 
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                key={option}
                label={`Level ${option}`}
                {...getTagProps({ index })}
                size="small"
              />
            ))
          }
        />
      </FormControl>

      {/* 国家筛选（多选下拉） */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <FormLabel>Country</FormLabel>
        <Autocomplete
          multiple
          options={availableCountries}
          value={request.filter.country || []}
          onChange={(e, newValue) => handleFilterChange('country', newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select country"
              variant="outlined"
              size="small"
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                label={option}
                size="small"
                sx={{ m: 0.5 }}
              />
            ))
          }
          sx={{
            '& .MuiOutlinedInput-root': {
              p: 1,
              flexWrap: 'wrap'
            }
          }}
        />
      </FormControl>

      {/* 城市筛选（多选下拉，联动国家） */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <FormLabel>City</FormLabel>
        <Autocomplete
          multiple
          options={availableCities}
          value={request.filter.city || []}
          onChange={(e, newValue) => handleFilterChange('city', newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={availableCities.length ? "Select city" : "No cities available"}
              variant="outlined"
              size="small"
              disabled={availableCities.length === 0}
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                label={option}
                size="small"
                sx={{ m: 0.5 }}
              />
            ))
          }
          disabled={availableCities.length === 0}
          sx={{
            '& .MuiOutlinedInput-root': {
              p: 1,
              flexWrap: 'wrap'
            }
          }}
        />
      </FormControl>

      {/* 成立年份范围（输入框） */}
      <FormControl fullWidth>
        <FormLabel sx={{ fontWeight: 'bold' }}>Founded Year Range</FormLabel>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            type="number"
            label="From"
            value={request.filter.founded_year?.start || 1900}
            onChange={(e) => handleFilterChange('founded_year', {
              ...request.filter.founded_year,
              start: Number(e.target.value)
            })}
            inputProps={{
              min: 1900,
              max: request.filter.founded_year?.end || new Date().getFullYear()
            }}
            size="small"
            fullWidth
          />
          <TextField
            type="number"
            label="To"
            value={request.filter.founded_year?.end || new Date().getFullYear()}
            onChange={(e) => handleFilterChange('founded_year', {
              ...request.filter.founded_year,
              end: Number(e.target.value)
            })}
            inputProps={{
              min: request.filter.founded_year?.start || 1900,
              max: new Date().getFullYear()
            }}
            size="small"
            fullWidth
          />
        </Box>
      </FormControl>

      {/* 年营收范围（滑块） */}
      <FormControl fullWidth>
        <FormLabel sx={{ fontWeight: 'bold' }}>Annual Revenue Range ($)</FormLabel>
        <Box sx={{ px: 2 }}>
          <Slider
            value={[
              request.filter.annual_revenue?.min || 0,
              request.filter.annual_revenue?.max || 1000000
            ]}
            onChange={(event, newValue) => {
              const [min, max] = newValue as number[];
              handleFilterChange('annual_revenue', { min, max });
            }}
            valueLabelDisplay="auto"
            min={0}
            max={1000000}
            step={10000}
            valueLabelFormat={(value) => `$${value.toLocaleString()}`}
            size="small"
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption">
            ${(request.filter.annual_revenue?.min || 0).toLocaleString()}
          </Typography>
          <Typography variant="caption">
            ${(request.filter.annual_revenue?.max || 1000000).toLocaleString()}
          </Typography>
        </Box>
      </FormControl>

      {/* 员工数量范围（滑块） */}
      <FormControl fullWidth>
        <FormLabel sx={{ fontWeight: 'bold' }}>Employee Count Range</FormLabel>
        <Box sx={{ px: 2 }}>
          <Slider
            value={[
              request.filter.employees?.min || 0,
              request.filter.employees?.max || 1000
            ]}
            onChange={(event, newValue) => {
              const [min, max] = newValue as number[];
              handleFilterChange('employees', { min, max });
            }}
            valueLabelDisplay="auto"
            min={0}
            max={1000}
            step={10}
            size="small"
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption">
            {request.filter.employees?.min || 0}
          </Typography>
          <Typography variant="caption">
            {request.filter.employees?.max || 1000}
          </Typography>
        </Box>
      </FormControl>
    </Box>
  );

  return (
    <Paper elevation={3} sx={{ p: isSmallScreen ? 1 : 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!isLoading && !error && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* 小屏幕上的筛选按钮 */}
          {isSmallScreen && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <IconButton 
                onClick={() => setFilterDrawerOpen(true)}
                size="small"
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <FilterListIcon />
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  Filters
                </Typography>
              </IconButton>
            </Box>
          )}
          
          <Grid container spacing={0} sx={{ height: '100%', width: '100%' }}>
            {/* 大屏幕上的侧边筛选面板 */}
            {!isSmallScreen && (
              <Grid item sx={{
                width: 250, 
                height: '100%',
                overflowY: 'auto',
                pr: 2,
                borderRight: '1px solid #eee'
              }}>
                {filterPanel}
              </Grid>
            )}

            {/* 右侧图表面板 */}
            <Grid item sx={{ 
              flex: 1, 
              height: '100%', 
              minWidth: 0, 
              pl: isSmallScreen ? 0 : 2 
            }}>
              <Box sx={{
                height: '100%',
                width: '100%',
                overflowX: chartData.labels.length > 15 ? 'auto' : 'hidden',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                p: isSmallScreen ? 1 : 2,
              }}>
                <div style={{
                  width: '100%',
                  minWidth: `${Math.max(800, chartData.labels.length * 30)}px`,
                  height: '100%',
                  minHeight: '400px'
                }}>
                  <Bar options={getChartOptions()} data={chartData} />
                </div>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* 小屏幕上的筛选抽屉 */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: '80vw',
            maxWidth: 400,
            p: 2
          }
        }}
      >
        {filterPanel}
      </Drawer>
    </Paper>
  );
};

export default DynamicBarChart;