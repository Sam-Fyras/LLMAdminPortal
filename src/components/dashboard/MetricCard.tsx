import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  subtitle?: string;
  progress?: number;
}

const trendConfig = {
  up: { color: 'success.main', icon: TrendingUpIcon },
  down: { color: 'error.main', icon: TrendingDownIcon },
  neutral: { color: 'text.secondary', icon: TrendingFlatIcon },
};

/**
 * MetricCard Component
 * Reusable card component for displaying dashboard metrics
 * Used for stats like Total Tokens, Active Users, Cost, etc.
 */
const getProgressColor = (value: number): 'primary' | 'warning' | 'error' => {
  if (value >= 90) return 'error';
  if (value >= 80) return 'warning';
  return 'primary';
};

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, trendValue, subtitle, progress }) => {
  const config = trend ? trendConfig[trend] : null;
  const TrendIcon = config?.icon;

  return (
    <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
      <CardContent>
        <Typography color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4">
          {value}
        </Typography>
        {progress !== undefined && (
          <Box sx={{ mt: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(progress, 100)}
              color={getProgressColor(progress)}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
        {config && trendValue && TrendIcon && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            <TrendIcon sx={{ fontSize: 18, color: config.color }} />
            <Typography variant="body2" sx={{ color: config.color, fontWeight: 500 }}>
              {trendValue}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
