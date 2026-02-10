import React from 'react';
import { Box } from '@mui/material';
import { MetricCard } from './MetricCard';
import { TokenUsageSummary } from '../../types';

interface DashboardMetricsProps {
  tokenUsage: TokenUsageSummary | null;
}

/**
 * DashboardMetrics Component
 * Container component that displays all 4 dashboard metric cards:
 * - Total Tokens Used
 * - Active Users
 * - Estimated Cost
 * - Average Tokens per Request
 */
export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  tokenUsage,
}) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
      <MetricCard
        title="Total Tokens Used"
        value={tokenUsage?.totalTokens?.toLocaleString() || '0'}
      />

      <MetricCard
        title="Active Users"
        value={tokenUsage?.activeUsers || '0'}
      />

      <MetricCard
        title="Estimated Cost"
        value={`$${tokenUsage?.estimatedCost?.toFixed(2) || '0.00'}`}
      />

      <MetricCard
        title="Avg Tokens per Request"
        value={tokenUsage?.avgTokensPerRequest?.toLocaleString() || '0'}
      />
    </Box>
  );
};

export default DashboardMetrics;
