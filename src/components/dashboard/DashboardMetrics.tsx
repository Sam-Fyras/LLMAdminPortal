import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { MetricCard } from './MetricCard';
import { TokenUsageSummary } from '../../types';

interface DashboardMetricsProps {
  tokenUsage: TokenUsageSummary | null;
  budgetLimit?: number;
  previousPeriod?: {
    totalTokens: number;
    activeUsers: number;
    estimatedCost: number;
    avgTokensPerRequest: number;
  };
}

/**
 * DashboardMetrics Component
 * Container component that displays all 4 dashboard metric cards:
 * - Total Tokens Used (with budget progress)
 * - Active Users (with trend)
 * - Estimated Cost (with trend)
 * - Average Tokens per Request (with trend)
 */
export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  tokenUsage,
  budgetLimit = 10000000,
  previousPeriod,
}) => {
  const metrics = useMemo(() => {
    const total = tokenUsage?.totalTokens ?? 0;
    const budgetPercent = budgetLimit > 0 ? Math.round((total / budgetLimit) * 100) : 0;

    const formatTrend = (current: number, previous: number | undefined): { trend: 'up' | 'down' | 'neutral'; value: string } => {
      if (previous === undefined || previous === 0) return { trend: 'neutral', value: 'N/A' };
      const change = ((current - previous) / previous) * 100;
      return {
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
        value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
      };
    };

    const tokenTrend = formatTrend(total, previousPeriod?.totalTokens);
    const userTrend = formatTrend(tokenUsage?.activeUsers ?? 0, previousPeriod?.activeUsers);
    const costTrend = formatTrend(tokenUsage?.estimatedCost ?? 0, previousPeriod?.estimatedCost);
    const avgTrend = formatTrend(tokenUsage?.avgTokensPerRequest ?? 0, previousPeriod?.avgTokensPerRequest);

    const formatTokens = (n: number) => {
      if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
      return n.toLocaleString();
    };

    const budgetLimitFormatted = formatTokens(budgetLimit);
    const totalFormatted = formatTokens(total);

    return { total, budgetPercent, tokenTrend, userTrend, costTrend, avgTrend, totalFormatted, budgetLimitFormatted };
  }, [tokenUsage, budgetLimit, previousPeriod]);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
      <MetricCard
        title="Monthly Token Usage"
        value={tokenUsage?.totalTokens?.toLocaleString() || '0'}
        trend={metrics.tokenTrend.trend}
        trendValue={metrics.tokenTrend.value}
        progress={metrics.budgetPercent}
        subtitle={`${metrics.totalFormatted} / ${metrics.budgetLimitFormatted} (${metrics.budgetPercent}%)`}
      />

      <MetricCard
        title="Active Users"
        value={tokenUsage?.activeUsers || '0'}
        trend={metrics.userTrend.trend}
        trendValue={metrics.userTrend.value}
      />

      <MetricCard
        title="Estimated Cost"
        value={`$${tokenUsage?.estimatedCost?.toFixed(2) || '0.00'}`}
        trend={metrics.costTrend.trend}
        trendValue={metrics.costTrend.value}
      />

      <MetricCard
        title="Avg Tokens per Request"
        value={tokenUsage?.avgTokensPerRequest?.toLocaleString() || '0'}
        trend={metrics.avgTrend.trend}
        trendValue={metrics.avgTrend.value}
      />
    </Box>
  );
};

export default DashboardMetrics;
