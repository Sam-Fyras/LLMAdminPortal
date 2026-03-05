import React, { useMemo, useCallback, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip as MuiTooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { FileDownload as ExportIcon, Close as CloseIcon } from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DailyUsage } from '../../types';

type BreakdownView = 'provider' | 'user';

interface UserDailyUsage {
  date: string;
  [userName: string]: string | number;
}

interface TokenUsageChartProps {
  data: DailyUsage[] | undefined;
  userBreakdownData?: UserDailyUsage[];
}

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: '#10a37f',
  Anthropic: '#d97706',
  Google: '#4285f4',
  Cohere: '#6366f1',
};

const USER_COLORS: string[] = [
  '#1976d2', '#d32f2f', '#388e3c', '#f57c00', '#7b1fa2',
  '#0097a7', '#c2185b', '#455a64', '#5d4037', '#1565c0',
];

const EXCLUDED_KEYS = new Set(['date', 'totalTokens', 'cost']);

/**
 * TokenUsageChart Component
 * Displays a line chart showing daily token usage trends
 * with breakdown toggle between LLM provider and user views
 */
export const TokenUsageChart: React.FC<TokenUsageChartProps> = ({ data, userBreakdownData }) => {
  const [drillDownDate, setDrillDownDate] = useState<DailyUsage | null>(null);
  const [breakdownView, setBreakdownView] = useState<BreakdownView>('provider');

  const providers = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).filter((key) => !EXCLUDED_KEYS.has(key));
  }, [data]);

  const userKeys = useMemo(() => {
    if (!userBreakdownData || userBreakdownData.length === 0) return [];
    return Object.keys(userBreakdownData[0]).filter((key) => key !== 'date');
  }, [userBreakdownData]);

  const activeData = breakdownView === 'provider' ? data : userBreakdownData;
  const activeKeys = breakdownView === 'provider' ? providers : userKeys;
  const activeColors = breakdownView === 'provider' ? PROVIDER_COLORS : {};

  const handleExportCSV = useCallback(() => {
    if (!data || data.length === 0) return;

    const headers = ['Date', ...providers, 'Total Tokens', 'Cost'];
    const rows = data.map((row) => [
      row.date,
      ...providers.map((p) => row[p]),
      row.totalTokens,
      row.cost,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'token_usage_data.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, [data, providers]);

  const handleChartClick = useCallback(
    (chartData: any) => {
      if (breakdownView === 'provider' && chartData?.activePayload?.[0]?.payload) {
        setDrillDownDate(chartData.activePayload[0].payload);
      }
    },
    [breakdownView]
  );

  const handleBreakdownChange = (_: React.MouseEvent<HTMLElement>, newView: BreakdownView | null) => {
    if (newView !== null) {
      setBreakdownView(newView);
    }
  };

  const chartTitle = breakdownView === 'provider'
    ? 'Daily Token Usage by Provider'
    : 'Daily Token Usage by User';

  return (
    <>
      <Card sx={{ flex: '3 1 600px', minWidth: '300px' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">
              {chartTitle}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ToggleButtonGroup
                value={breakdownView}
                exclusive
                onChange={handleBreakdownChange}
                size="small"
              >
                <ToggleButton value="provider">Provider</ToggleButton>
                <ToggleButton value="user" disabled={!userBreakdownData || userBreakdownData.length === 0}>
                  User
                </ToggleButton>
              </ToggleButtonGroup>
              {data && data.length > 0 && (
                <MuiTooltip title="Export as CSV">
                  <IconButton size="small" onClick={handleExportCSV}>
                    <ExportIcon />
                  </IconButton>
                </MuiTooltip>
              )}
            </Box>
          </Box>

          <Box sx={{ height: 300 }}>
            {activeData && activeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeData} onClick={handleChartClick} style={{ cursor: breakdownView === 'provider' ? 'pointer' : 'default' }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {activeKeys.map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={key}
                      stroke={activeColors[key] || USER_COLORS[index % USER_COLORS.length]}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Typography color="text.secondary">
                  {breakdownView === 'user'
                    ? 'No user breakdown data available'
                    : 'No usage data available for the selected time range'}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      <Dialog open={!!drillDownDate} onClose={() => setDrillDownDate(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Usage Details — {drillDownDate?.date}
          <IconButton size="small" onClick={() => setDrillDownDate(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {drillDownDate && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Provider</TableCell>
                    <TableCell align="right">Tokens</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider}>
                      <TableCell>{provider}</TableCell>
                      <TableCell align="right">
                        {Number(drillDownDate[provider]).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ '& td': { fontWeight: 'bold' } }}>
                    <TableCell>Total</TableCell>
                    <TableCell align="right">
                      {Number(drillDownDate.totalTokens).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ '& td': { fontWeight: 'bold' } }}>
                    <TableCell>Estimated Cost</TableCell>
                    <TableCell align="right">${Number(drillDownDate.cost).toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDrillDownDate(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TokenUsageChart;
