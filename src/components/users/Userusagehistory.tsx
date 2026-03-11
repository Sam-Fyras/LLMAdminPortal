import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Chip,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Alert,
  Divider,
  Avatar,
  SelectChangeEvent,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TokenIcon from '@mui/icons-material/Token';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SpeedIcon from '@mui/icons-material/Speed';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import DataObjectIcon from '@mui/icons-material/DataObject';
import TableChartIcon from '@mui/icons-material/TableChart';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { UserRow } from '../../mocks/data/users';

// ============== Type Definitions ==============

interface DailyUsage {
  date: string;
  tokens: number;
  cost: number;
  requests: number;
  inputTokens: number;
  outputTokens: number;
}

interface ModelUsage {
  model: string;
  provider: string;
  tokens: number;
  cost: number;
  requests: number;
  avgResponseTime: number;
  color: string;
}

interface UsageStats {
  totalTokens: number;
  totalCost: number;
  totalRequests: number;
  avgTokensPerRequest: number;
  avgResponseTime: number;
  tokenTrend: number;
  costTrend: number;
  requestTrend: number;
  inputTokens: number;
  outputTokens: number;
}

interface QuotaStatus {
  tokenLimit: number;
  tokenUsed: number;
  costLimit: number;
  costUsed: number;
  resetDate: string;
}

interface UserUsageHistoryProps {
  user: UserRow;
  onExport?: (data: any, format: 'csv' | 'json') => void;
}

type TimePeriod = '7d' | '30d' | '90d' | '6m' | '1y' | 'custom';
type GroupBy = 'day' | 'week' | 'month';

// ============== Mock Data Generator ==============

const generateMockUsageData = (period: TimePeriod, groupBy: GroupBy) => {
  const daysMap: Record<TimePeriod, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '6m': 180,
    '1y': 365,
    'custom': 30,
  };

  const days = daysMap[period];
  const dailyUsage: DailyUsage[] = [];

  let dataPoints = days;
  if (groupBy === 'week') dataPoints = Math.ceil(days / 7);
  if (groupBy === 'month') dataPoints = Math.ceil(days / 30);

  for (let i = dataPoints - 1; i >= 0; i--) {
    const date = new Date();
    if (groupBy === 'day') {
      date.setDate(date.getDate() - i);
    } else if (groupBy === 'week') {
      date.setDate(date.getDate() - i * 7);
    } else {
      date.setMonth(date.getMonth() - i);
    }

    const inputTokens = Math.floor(Math.random() * 10000) + 1000;
    const outputTokens = Math.floor(Math.random() * 5000) + 500;

    dailyUsage.push({
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: groupBy === 'month' ? undefined : 'numeric',
        year: groupBy === 'month' || groupBy === 'week' ? '2-digit' : undefined,
      }),
      tokens: inputTokens + outputTokens,
      cost: inputTokens * 0.00001 + outputTokens * 0.00003,
      requests: Math.floor(Math.random() * 100) + 20,
      inputTokens,
      outputTokens,
    });
  }

  const modelUsage: ModelUsage[] = [
    {
      model: 'GPT-4-Turbo',
      provider: 'OpenAI',
      tokens: 245000,
      cost: 36.75,
      requests: 650,
      avgResponseTime: 2800,
      color: '#10a37f',
    },
    {
      model: 'GPT-3.5-Turbo',
      provider: 'OpenAI',
      tokens: 485000,
      cost: 9.70,
      requests: 2200,
      avgResponseTime: 650,
      color: '#74aa9c',
    },
    {
      model: 'Claude-3-Opus',
      provider: 'Anthropic',
      tokens: 125000,
      cost: 18.75,
      requests: 380,
      avgResponseTime: 3500,
      color: '#d97706',
    },
    {
      model: 'Claude-3-Sonnet',
      provider: 'Anthropic',
      tokens: 220000,
      cost: 6.60,
      requests: 920,
      avgResponseTime: 1200,
      color: '#f59e0b',
    },
    {
      model: 'Claude-3-Haiku',
      provider: 'Anthropic',
      tokens: 350000,
      cost: 1.75,
      requests: 1500,
      avgResponseTime: 400,
      color: '#fbbf24',
    },
  ];

  const totalTokens = dailyUsage.reduce((sum, d) => sum + d.tokens, 0);
  const totalCost = dailyUsage.reduce((sum, d) => sum + d.cost, 0);
  const totalRequests = dailyUsage.reduce((sum, d) => sum + d.requests, 0);
  const totalInputTokens = dailyUsage.reduce((sum, d) => sum + d.inputTokens, 0);
  const totalOutputTokens = dailyUsage.reduce((sum, d) => sum + d.outputTokens, 0);

  const stats: UsageStats = {
    totalTokens,
    totalCost,
    totalRequests,
    avgTokensPerRequest: Math.round(totalTokens / totalRequests),
    avgResponseTime: 1650,
    tokenTrend: Math.random() * 40 - 20,
    costTrend: Math.random() * 40 - 20,
    requestTrend: Math.random() * 30 - 10,
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
  };

  const quota: QuotaStatus = {
    tokenLimit: 1000000,
    tokenUsed: totalTokens,
    costLimit: 100,
    costUsed: totalCost,
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
  };

  return { dailyUsage, modelUsage, stats, quota };
};

// ============== Helper Components ==============

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  icon: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, trend, icon, color = 'primary.main' }) => (
  <Card variant="outlined" sx={{ flex: 1, minWidth: 180 }}>
    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        <Box sx={{ color, opacity: 0.8 }}>{icon}</Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h5" fontWeight={600}>
          {value}
        </Typography>
        {trend !== undefined && (
          <Chip
            size="small"
            icon={trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
            label={`${trend >= 0 ? '+' : ''}${trend.toFixed(1)}%`}
            color={trend >= 0 ? 'success' : 'error'}
            sx={{ height: 22, fontSize: '0.7rem' }}
          />
        )}
      </Box>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const QuotaProgressBar: React.FC<{
  label: string;
  used: number;
  limit: number;
  unit?: string;
  formatValue?: (val: number) => string;
}> = ({ label, used, limit, unit = '', formatValue }) => {
  const percentage = Math.min((used / limit) * 100, 100);
  const getColor = () => {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'primary';
  };

  const format = formatValue || ((val: number) => val.toLocaleString());

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {format(used)}{unit} / {format(limit)}{unit}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={getColor()}
        sx={{ height: 10, borderRadius: 5 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography variant="caption" color={percentage >= 90 ? 'error.main' : 'text.secondary'}>
          {percentage.toFixed(1)}% used
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {format(limit - used)}{unit} remaining
        </Typography>
      </Box>
    </Box>
  );
};

// ============== Main Component ==============

const UserUsageHistory: React.FC<UserUsageHistoryProps> = ({ user, onExport }) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  const { dailyUsage, modelUsage, stats, quota } = useMemo(() => {
    return generateMockUsageData(timePeriod, groupBy);
  }, [timePeriod, groupBy]);

  const filteredModelUsage = useMemo(() => {
    if (selectedProvider === 'all') return modelUsage;
    return modelUsage.filter((m) => m.provider === selectedProvider);
  }, [modelUsage, selectedProvider]);

  const providers = useMemo(() => {
    return Array.from(new Set(modelUsage.map((m) => m.provider)));
  }, [modelUsage]);

  const handleTimePeriodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPeriod: TimePeriod | null
  ) => {
    if (newPeriod) {
      setTimePeriod(newPeriod);
      if (newPeriod === '7d') setGroupBy('day');
      else if (newPeriod === '90d' || newPeriod === '6m') setGroupBy('week');
      else if (newPeriod === '1y') setGroupBy('month');
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleExportUsage = (format: 'csv' | 'json') => {
    const exportData = {
      user: { id: user.user_id, name: user.display_name, email: user.email },
      period: timePeriod,
      exportedAt: new Date().toISOString(),
      summary: stats,
      dailyUsage,
      modelBreakdown: modelUsage,
    };

    if (format === 'csv') {
      const csvHeaders = ['Date', 'Tokens', 'Input Tokens', 'Output Tokens', 'Cost ($)', 'Requests'];
      const csvRows = dailyUsage.map((d) => [d.date, d.tokens, d.inputTokens, d.outputTokens, d.cost.toFixed(4), d.requests]);
      const csvContent = [csvHeaders.join(','), ...csvRows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      downloadFile(blob, `usage_${user.user_id}_${timePeriod}_${new Date().toISOString().split('T')[0]}.csv`);
    } else {
      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      downloadFile(blob, `usage_${user.user_id}_${timePeriod}_${new Date().toISOString().split('T')[0]}.json`);
    }

    onExport?.(exportData, format);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderUsageChart = () => {
    return (
      <BarChart data={dailyUsage}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis yAxisId="left" orientation="left" stroke="#1976d2" tick={{ fontSize: 11 }} />
        <YAxis yAxisId="right" orientation="right" stroke="#2e7d32" tick={{ fontSize: 11 }} />
        <RechartsTooltip
          contentStyle={{ fontSize: 12 }}
          formatter={(value: number, name: string) => [
            name === 'Cost ($)' ? `$${value.toFixed(4)}` : value.toLocaleString(),
            name,
          ]}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="inputTokens" stackId="tokens" fill="#1976d2" name="Input Tokens" />
        <Bar yAxisId="left" dataKey="outputTokens" stackId="tokens" fill="#42a5f5" name="Output Tokens" />
        <Bar yAxisId="right" dataKey="cost" fill="#2e7d32" name="Cost ($)" />
      </BarChart>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
            {user.display_name?.split(' ').map((n) => n[0]).join('').toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>Usage History</Typography>
            <Typography variant="body2" color="text.secondary">
              {user.display_name} • {user.email}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <ToggleButtonGroup size="small" value={timePeriod} exclusive onChange={handleTimePeriodChange}>
            <ToggleButton value="7d">7D</ToggleButton>
            <ToggleButton value="30d">30D</ToggleButton>
            <ToggleButton value="90d">90D</ToggleButton>
            <ToggleButton value="6m">6M</ToggleButton>
            <ToggleButton value="1y">1Y</ToggleButton>
          </ToggleButtonGroup>

          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <StatCard
          title="Total Tokens"
          value={stats.totalTokens.toLocaleString()}
          trend={stats.tokenTrend}
          subtitle={`${stats.inputTokens.toLocaleString()} in / ${stats.outputTokens.toLocaleString()} out`}
          icon={<TokenIcon />}
          color="#1976d2"
        />
        <StatCard
          title="Total Cost"
          value={`$${stats.totalCost.toFixed(2)}`}
          trend={stats.costTrend}
          subtitle="Estimated"
          icon={<AttachMoneyIcon />}
          color="#2e7d32"
        />
        <StatCard
          title="Total Requests"
          value={stats.totalRequests.toLocaleString()}
          trend={stats.requestTrend}
          subtitle={`Avg ${stats.avgTokensPerRequest} tokens/req`}
          icon={<QueryStatsIcon />}
          color="#9c27b0"
        />
        <StatCard
          title="Avg Response Time"
          value={`${stats.avgResponseTime}ms`}
          subtitle="Across all models"
          icon={<SpeedIcon />}
          color="#ed6c02"
        />
      </Box>

      {/* Usage Chart */}
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Usage Over Time</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Group By</InputLabel>
                <Select value={groupBy} label="Group By" onChange={(e: SelectChangeEvent) => setGroupBy(e.target.value as GroupBy)}>
                  <MenuItem value="day">Day</MenuItem>
                  <MenuItem value="week">Week</MenuItem>
                  <MenuItem value="month">Month</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ height: 320 }}>
            {loading ? (
              <Skeleton variant="rectangular" height="100%" animation="wave" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">{renderUsageChart()}</ResponsiveContainer>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Model Breakdown & Quota */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
        {/* Model Usage */}
        <Card variant="outlined" sx={{ flex: 2, minWidth: 300 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>Usage by Model</Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Provider</InputLabel>
                <Select value={selectedProvider} label="Provider" onChange={(e: SelectChangeEvent) => setSelectedProvider(e.target.value)}>
                  <MenuItem value="all">All Providers</MenuItem>
                  {providers.map((p) => (<MenuItem key={p} value={p}>{p}</MenuItem>))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
              <Box sx={{ width: 200, height: 200, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={filteredModelUsage} dataKey="cost" nameKey="model" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                      {filteredModelUsage.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              <TableContainer sx={{ flex: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Model</TableCell>
                      <TableCell align="right">Tokens</TableCell>
                      <TableCell align="right">Cost</TableCell>
                      <TableCell align="right">Requests</TableCell>
                      <TableCell align="right">Avg Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredModelUsage.map((model) => (
                      <TableRow key={model.model} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: model.color }} />
                            <Box>
                              <Typography variant="body2">{model.model}</Typography>
                              <Typography variant="caption" color="text.secondary">{model.provider}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right"><Typography variant="body2">{model.tokens.toLocaleString()}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2" fontWeight={500}>${model.cost.toFixed(2)}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2">{model.requests.toLocaleString()}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2">{model.avgResponseTime}ms</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Quota Status */}
        <Card variant="outlined" sx={{ flex: 1, minWidth: 280 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>Monthly Quota</Typography>
              <Chip size="small" icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />} label={`Resets ${new Date(quota.resetDate).toLocaleDateString()}`} variant="outlined" />
            </Box>

            <QuotaProgressBar label="Token Limit" used={quota.tokenUsed} limit={quota.tokenLimit} />
            <QuotaProgressBar label="Cost Limit" used={quota.costUsed} limit={quota.costLimit} unit="" formatValue={(val) => `$${val.toFixed(2)}`} />

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Daily Average</Typography>
                <Typography variant="body2" fontWeight={500}>{Math.round(stats.totalTokens / 30).toLocaleString()} tokens</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Projected Monthly</Typography>
                <Typography variant="body2" fontWeight={500} color={quota.tokenUsed * 1.2 > quota.tokenLimit ? 'error.main' : 'text.primary'}>
                  {Math.round(quota.tokenUsed * 1.2).toLocaleString()} tokens
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Export Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          endIcon={<ArrowDropDownIcon />}
          onClick={(e) => setExportAnchorEl(e.currentTarget)}
        >
          Export
        </Button>
        <Menu
          anchorEl={exportAnchorEl}
          open={Boolean(exportAnchorEl)}
          onClose={() => setExportAnchorEl(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          slotProps={{
            paper: { elevation: 3, sx: { minWidth: 190, borderRadius: 2, mt: -0.5 } },
          }}
        >
          <MenuItem
            onClick={() => {
              handleExportUsage('csv');
              setExportAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <TableChartIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Export as CSV"
              secondary="Spreadsheet format"
              slotProps={{ secondary: { style: { fontSize: 11 } } }}
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleExportUsage('json');
              setExportAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <DataObjectIcon fontSize="small" color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="Export as JSON"
              secondary="Structured data format"
              slotProps={{ secondary: { style: { fontSize: 11 } } }}
            />
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default UserUsageHistory;