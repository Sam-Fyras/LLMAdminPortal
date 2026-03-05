import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton,
} from '@mui/material';
import { TrendingUp, Warning } from '@mui/icons-material';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { BudgetProjection } from '../../types/budget';

// ============================================================================
// Chart tooltip
// ============================================================================

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 1.5,
        minWidth: 160,
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
        {label}
      </Typography>
      {payload.map((entry: TooltipEntry) => (
        <Box key={entry.name} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="body2" sx={{ color: entry.color }}>
            {entry.name}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            ${Number(entry.value).toFixed(2)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ============================================================================
// Props
// ============================================================================

interface CostProjectionProps {
  projection: BudgetProjection | null;
  budgetCap?: number;   // USD — drawn as horizontal reference line
  loading?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const CostProjection: React.FC<CostProjectionProps> = ({
  projection,
  budgetCap,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width={200} height={28} />
          <Skeleton variant="rounded" height={280} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (!projection || projection.dataPoints.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={1}>
            Cost Projection
          </Typography>
          <Typography color="text.secondary">
            No projection data available yet.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const overBudget = projection.willExceedBudget;

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Cost Projection
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Actual spend to date vs. projected end-of-period cost
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingUp fontSize="small" color={overBudget ? 'warning' : 'success'} />
            <Typography variant="body2" fontWeight={600} color={overBudget ? 'warning.main' : 'success.main'}>
              ${projection.projectedTotalCost.toFixed(2)} projected
            </Typography>
          </Box>
        </Box>

        {/* Over-budget warning */}
        {overBudget && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.5,
              mb: 2,
              borderRadius: 2,
              bgcolor: 'warning.light',
            }}
          >
            <Warning color="warning" fontSize="small" />
            <Typography variant="body2" color="warning.dark">
              Projected spend exceeds budget cap
              {projection.estimatedOverspend !== undefined
                ? ` by $${projection.estimatedOverspend.toFixed(2)}`
                : ''}
              . Consider reducing usage or increasing the budget.
            </Typography>
          </Box>
        )}

        {/* Chart */}
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={projection.dataPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(val: string) => val.slice(5)} // Show MM-DD
              />
              <YAxis
                tickFormatter={(v: number) => `$${v}`}
                tick={{ fontSize: 11 }}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Budget cap reference line */}
              {budgetCap !== undefined && (
                <ReferenceLine
                  y={budgetCap}
                  stroke="#f44336"
                  strokeDasharray="6 3"
                  label={{
                    value: `Cap $${budgetCap}`,
                    position: 'insideTopRight',
                    fontSize: 11,
                    fill: '#f44336',
                  }}
                />
              )}

              {/* Actual spend — solid area */}
              <Area
                type="monotone"
                dataKey="actualCost"
                name="Actual"
                stroke="#1976d2"
                fill="#1976d2"
                fillOpacity={0.1}
                strokeWidth={2}
                connectNulls={false}
                dot={false}
                activeDot={{ r: 5 }}
              />

              {/* Projected spend — dashed line */}
              <Line
                type="monotone"
                dataKey="projectedCost"
                name="Projected"
                stroke="#ff9800"
                strokeWidth={2}
                strokeDasharray="6 3"
                connectNulls={false}
                dot={false}
                activeDot={{ r: 5 }}
              />

              {/* Confidence interval — upper bound */}
              <Line
                type="monotone"
                dataKey="confidenceUpper"
                name="Upper bound"
                stroke="#ff9800"
                strokeWidth={1}
                strokeOpacity={0.35}
                strokeDasharray="3 4"
                connectNulls={false}
                dot={false}
                legendType="none"
              />

              {/* Confidence interval — lower bound */}
              <Line
                type="monotone"
                dataKey="confidenceLower"
                name="Lower bound"
                stroke="#ff9800"
                strokeWidth={1}
                strokeOpacity={0.35}
                strokeDasharray="3 4"
                connectNulls={false}
                dot={false}
                legendType="none"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>

        {/* Legend note */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Solid line = actual spend · Dashed line = projected spend · Faint lines = confidence interval
          {budgetCap !== undefined ? ' · Red dashed = budget cap' : ''}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CostProjection;
