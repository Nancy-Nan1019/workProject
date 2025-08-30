import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';
import { CompanyNode } from './types';
import { Box, Typography, List, ListItem, ListItemText, Paper, 
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

/**
 * 公司层级气泡图组件
 * 功能：通过气泡图可视化公司层级结构，支持缩放、hover提示、节点详情展示
 * @param props - 组件传入参数（数据源、宽高）
 */
const CompanyHierarchyBubbleChart: React.FC<BubbleChartProps> = ({
  data,
  width = 928,
  height = 928,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [currentNode, setCurrentNode] = useState<CompanyNode | null>(null);
  const [currentLevelData, setCurrentLevelData] = useState<CompanyNode[]>([]);
  const focusNodeRef = useRef<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [infoDrawerOpen, setInfoDrawerOpen] = useState(false);
  
  // 响应式设计
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  /**
   * 颜色比例尺 - 生成蓝色系渐变
   * 用途：根据节点层级（depth）分配不同深浅的蓝色，区分层级关系
   * 定义域：0-5（覆盖公司层级1-5），值域：浅蓝-深蓝
   */

  const color = d3.scaleLinear<string>()
    .domain([0, 5])
    .range(["#E6F0FF", "#2E80FF"])
    .interpolate(d3.interpolateHcl); // 使用HCL颜色空间插值，保证渐变平滑

  /**
   * 数据处理函数 - 为节点添加气泡大小计算字段
   * @param node - 原始公司节点数据
   * @returns 处理后的数据（新增value字段，用于D3计算气泡半径）
   * 逻辑：气泡大小由年营收决定，使用平方根缩放（避免大值气泡过大），乘以2调整整体尺寸
   */
  const processData = (node: CompanyNode): any => {
    return {
      ...node,
      value: node.annual_revenue ? Math.sqrt(node.annual_revenue) * 2 : 1,
      children: node.children?.map(processData)
    };
  };

  /**
   * 数据验证函数 - 检查核心字段是否存在
   * @param data - 根节点数据
   * @returns 验证结果（true: 有效，false: 无效）
   * 作用：避免因数据缺失导致图表渲染异常，无效时打印错误日志
   */
  const validateData = (data: CompanyNode): boolean => {
    if (!data.company_code || !data.company_name) {
      console.error('Invalid data structure: missing required fields');
      return false;
    }
    return true;
  };

  // 初始化图表
  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current || !data) return;
    if (!validateData(data)) return;

    const processedData = processData(data);
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    svg.selectAll("*").remove();

    /**
     * 气泡图布局函数 - 计算节点位置和大小
     * @param data - 处理后的数据
     * @returns D3打包布局的根节点（包含x/y坐标、r半径等布局信息）
     * 逻辑：
     * - pack(): 创建打包布局，设置图表尺寸和节点间距
     * - hierarchy(): 将平级数据转换为层级结构（tree）
     * - sum(): 计算每个节点的"权重"（这里用value字段）
     * - sort(): 按value降序排序，大节点优先布局
     */
    const pack = (data: any) => d3.pack()
      .size([width, height])
      .padding(5)
      (d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => (b.value || 0) - (a.value || 0)));

    const root = pack(processedData);
    focusNodeRef.current = root;

    // 设置视图框
    svg
      .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
      .attr("style", `max-width: 100%; height: auto; display: block; cursor: pointer;`)
      .append("rect")
      .attr("x", -width / 2)
      .attr("y", -height / 2)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#F5F9FF");

    // 创建节点组
    const node = svg.append("g")
      .selectAll("circle")
      .data(root.descendants())
      .join("circle")
      .attr("fill", d => d.children ? color(d.depth) : "white")
      .attr("stroke", d => d.depth === 0 ? "#2E80FF" : "#fff")
      .attr("stroke-width", d => d.depth === 0 ? 3 : 1.5)
      .attr("pointer-events", d => !d.children ? "none" : "all")
      .on("mouseover", function (event, d) {
        const nodeLevel = d.data.level;

        d3.select(this)
          .attr("stroke", "#2E80FF")
          .attr("stroke-width", d.depth === 0 ? 4 : 2.5);

        tooltip
          .html(`
              <div style="padding: 8px; max-width: 300px;">
                <h3 style="margin: 0 0 8px 0; color: #2E80FF">${d.data.company_name}</h3>
                <p style="margin: 4px 0;"><strong>Level:</strong> ${nodeLevel}</p>
                <p style="margin: 4px 0;"><strong>Revenue:</strong> $${d.data.annual_revenue?.toLocaleString() || 'N/A'}</p>
                <p style="margin: 4px 0;"><strong>Employees:</strong> ${d.data.employees?.toLocaleString() || 'N/A'}</p>
                ${d.data.city ? `<p style="margin: 4px 0;"><strong>Location:</strong> ${d.data.city}, ${d.data.country}</p>` : ''}
              </div>
            `)
          .style("opacity", 1)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
      })
      .on("mouseout", function (event, d) { // hover离开事件：恢复节点样式+隐藏提示框
        d3.select(this)
          .attr("stroke", d.depth === 0 ? "#2E80FF" : "#fff")
          .attr("stroke-width", d.depth === 0 ? 3 : 1.5);
        tooltip.style("opacity", 0);
      })
      .on("click", (event, d) => {
        if (focusNodeRef.current !== d && d.children) {
          zoom(event, d);
          event.stopPropagation();
          setCurrentNode(d.data);
          setCurrentLevelData(d.children.map(child => child.data));
        }
      });

    // 创建文本标签
    const label = svg.append("g")
      .style("font", "9px sans-serif")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(root.descendants())
      .join("text")
      .style("fill-opacity", d => d.parent === root ? 1 : 0)
      .style("display", d => d.parent === root ? "inline" : "none")
      .text(d => d.data.company_name)
      .style("font-weight", d => d.depth === 0 ? "bold" : "normal");

    // 初始缩放
    svg.on("click", (event) => {
      zoom(event, root);
      setCurrentNode(root.data);
      setCurrentLevelData(root.children?.map(child => child.data) || []);
    });

    // 初始化显示根节点信息
    setCurrentNode(root.data);
    setCurrentLevelData(root.children?.map(child => child.data) || []);

    zoomTo([root.x, root.y, root.r * 2]);

    // 缩放函数
    function zoomTo(v: [number, number, number]) {
      const k = width / v[2];

      node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      node.attr("r", d => d.r * k);

      label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    }

    // 缩放行为
    function zoom(event: any, d: any) {
      const focus0 = focusNodeRef.current;
      focusNodeRef.current = d;

      const transition = svg.transition()
        .duration(750)
        .tween("zoom", () => {
          const i = d3.interpolateZoom(
            [focus0.x, focus0.y, focus0.r * 2],
            [d.x, d.y, d.r * 2]
          );
          return (t: number) => zoomTo(i(t));
        });

      label
        .filter(function (d: any) {
          return d.parent === focusNodeRef.current || this.style.display === "inline";
        })
        .transition(transition)
        .style("fill-opacity", (d: any) => d.parent === focusNodeRef.current ? 1 : 0)
        .on("start", function (d: any) {
          if (d.parent === focusNodeRef.current) this.style.display = "inline";
        })
        .on("end", function (d: any) {
          if (d.parent !== focusNodeRef.current) this.style.display = "none";
        });
    }

  }, [width, height, data]);

  // 信息面板内容
  const infoPanel = (
    <Box sx={{ 
      p: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid #E6F0FF',
      overflow: 'hidden'
    }}>
      {isSmallScreen && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Company Details</Typography>
          <IconButton onClick={() => setInfoDrawerOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      )}
      
      {/* 当前节点信息 */}
      <Box sx={{
        borderBottom: '1px solid #eee',
        backgroundColor: '#F5F9FF',
        p: isSmallScreen ? 0 : 2,
        mb: 2
      }}>
        <Typography variant="h6" sx={{
          color: '#2E80FF',
          mb: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: isSmallScreen ? '1rem' : '1.25rem'
        }}>
          {currentNode?.company_name || "Company Details"}
        </Typography>
        {currentNode && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ color: '#666', mb: 0.5, fontSize: isSmallScreen ? '0.8rem' : '0.875rem' }}>
              <strong>Code:</strong> {currentNode.company_code}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 0.5, fontSize: isSmallScreen ? '0.8rem' : '0.875rem' }}>
              <strong>Level:</strong> {currentNode.level}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 0.5, fontSize: isSmallScreen ? '0.8rem' : '0.875rem' }}>
              <strong>Location:</strong> {currentNode.city}, {currentNode.country}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 0.5, fontSize: isSmallScreen ? '0.8rem' : '0.875rem' }}>
              <strong>Founded Year:</strong> {currentNode.founded_year}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 0.5, fontSize: isSmallScreen ? '0.8rem' : '0.875rem' }}>
              <strong>Revenue:</strong> ${currentNode.annual_revenue?.toLocaleString() || 'N/A'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 0.5, fontSize: isSmallScreen ? '0.8rem' : '0.875rem' }}>
              <strong>Employees:</strong> {currentNode.employees?.toLocaleString() || 'N/A'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* 子节点列表 */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#2E80FF',
          borderRadius: '3px'
        }
      }}>
        <Typography variant="subtitle2" sx={{
          p: 1,
          color: '#2E80FF',
          position: 'sticky',
          top: 0,
          backgroundColor: '#F5F9FF',
          zIndex: 1,
          borderBottom: '1px solid #eee',
          fontSize: isSmallScreen ? '0.8rem' : '0.875rem'
        }}>
          {currentNode?.level === 1 ? "Global Departments" :
            currentNode?.level === 2 ? "Regional Offices" :
              "Subsidiaries"} ({currentLevelData.length})
        </Typography>

        {currentLevelData.length > 0 ? (
          <List dense sx={{ py: 0 }}>
            {currentLevelData.map((company) => (
              <ListItem
                key={company.company_code}
                sx={{
                  px: 1,
                  py: 1,
                  borderBottom: '1px solid #f0f0f0',
                  '&:hover': {
                    backgroundColor: 'rgba(46, 128, 255, 0.05)',
                    cursor: 'pointer'
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{
                      color: '#2E80FF',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: isSmallScreen ? '0.8rem' : '0.875rem'
                    }}>
                      {company.company_name}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" component="div" sx={{ fontSize: isSmallScreen ? '0.7rem' : '0.75rem' }}>
                        <strong>Code:</strong> {company.company_code} | <strong>Level:</strong> {company.level}
                      </Typography>
                      <Typography variant="caption" component="div" sx={{ fontSize: isSmallScreen ? '0.7rem' : '0.75rem' }}>
                        <strong>Location:</strong> {company.city}, {company.country}
                      </Typography>
                      <Typography variant="caption" component="div" sx={{ fontSize: isSmallScreen ? '0.7rem' : '0.75rem' }}>
                        <strong>Founded:</strong> {company.founded_year} | <strong>Revenue:</strong> ${company.annual_revenue?.toLocaleString() || 'N/A'}
                      </Typography>
                      <Typography variant="caption" component="div" sx={{ fontSize: isSmallScreen ? '0.7rem' : '0.75rem' }}>
                        <strong>Employees:</strong> {company.employees?.toLocaleString() || 'N/A'}
                      </Typography>
                    </>
                  }
                  sx={{ my: 0 }}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{
            p: 2,
            textAlign: 'center',
            color: '#666'
          }}>
            <Typography variant="body2" sx={{ fontSize: isSmallScreen ? '0.8rem' : '0.875rem' }}>
              {currentNode?.level === 4 ? "No subsidiaries" : "Select a node to view details"}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{
      display: 'flex',
      height: '100%',
      gap: isSmallScreen ? 0 : 2,
      position: 'relative',
      backgroundColor: '#F5F9FF',
      padding: isSmallScreen ? 1 : 2,
      borderRadius: 2,
    }}>
      {/* Tooltip 容器 */}
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          backgroundColor: 'white',
          borderRadius: '4px',
          padding: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.2s',
          zIndex: 100,
          maxWidth: '300px',
          border: '1px solid #2E80FF'
        }}
      />

      {/* 气泡图容器 */}
      <Paper elevation={0} sx={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        p: 1,
        borderRadius: 2,
        backgroundColor: 'transparent',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 1 }}>
          <Typography variant="h6" sx={{ color: '#2E80FF', fontSize: isSmallScreen ? '1rem' : '1.25rem' }}>
            {currentNode ? currentNode.company_name : "Company Hierarchy"}
          </Typography>
          {isSmallScreen && (
            <IconButton 
              onClick={() => setInfoDrawerOpen(true)}
              size="small"
              sx={{ color: '#2E80FF' }}
            >
              <InfoIcon />
            </IconButton>
          )}
        </Box>
        <svg
          ref={svgRef}
          width={width}
          height={height}
        />
      </Paper>

      {/* 大屏幕上的信息面板 */}
      {!isSmallScreen && (
        <Paper elevation={3} sx={{
          width: 350,
          height: height,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid #E6F0FF',
          overflow: 'hidden'
        }}>
          {infoPanel}
        </Paper>
      )}

      {/* 小屏幕上的信息抽屉 */}
      <Drawer
        anchor="right"
        open={infoDrawerOpen}
        onClose={() => setInfoDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: '85vw',
            maxWidth: 400,
            p: 2
          }
        }}
      >
        {infoPanel}
      </Drawer>
    </Box>
  );
};

export default CompanyHierarchyBubbleChart;