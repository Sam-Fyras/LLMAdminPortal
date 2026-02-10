import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ModelUsage } from '../../types';

interface ModelUsageChartProps {
  data: ModelUsage[];
}

// Color palette for pie chart slices
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

/**
 * ModelUsageChart Component
 * Displays a pie chart showing the distribution of usage across different models
 * Each slice represents a model with percentage labels
 */
export const ModelUsageChart: React.FC<ModelUsageChartProps> = ({ data }) => {
  return (
    <Card sx={{ flex: '1 1 300px', minWidth: '300px' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Model Usage Distribution
        </Typography>

        <Box sx={{ height: 300 }}>
          {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="model"
                  label={({ name, percent }) =>
                    `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                  }
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
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
                No model usage data available
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ModelUsageChart;
