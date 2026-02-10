import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
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

interface TokenUsageChartProps {
  data: DailyUsage[] | undefined;
}

/**
 * TokenUsageChart Component
 * Displays a line chart showing daily token usage trends
 * with separate lines for prompt tokens and completion tokens
 */
export const TokenUsageChart: React.FC<TokenUsageChartProps> = ({ data }) => {
  return (
    <Card sx={{ flex: '3 1 600px', minWidth: '300px' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Daily Token Usage
        </Typography>

        <Box sx={{ height: 300 }}>
          {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="promptTokens"
                  name="Prompt Tokens"
                  stroke="#8884d8"
                />
                <Line
                  type="monotone"
                  dataKey="completionTokens"
                  name="Completion Tokens"
                  stroke="#82ca9d"
                />
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
                No usage data available for the selected time range
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TokenUsageChart;
