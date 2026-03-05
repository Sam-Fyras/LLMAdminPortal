import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Divider,
  Skeleton,
} from '@mui/material';
import {
  TrendingUp,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  Block,
} from '@mui/icons-material';
import { BudgetOverviewData, BudgetAlertStatus } from '../../types/budget';

// ============================================================================
// Helpers
// ============================================================================

const formatCost = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatTokens = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
};

const ALERT_CONFIG: Record<BudgetAlertStatus, { label: string; color: 'success' | 'warning' | 'error' | 'default'; icon: React.ReactNode; barColor: 'success' | 'warning' | 'error' | 'primary' }> = {
  on_track: { label: 'On Track', color: 'success', icon: <CheckCircle fontSize="small" />, barColor: 'success' },
  warning:  { label: 'Warning',  color: 'warning', icon: <Warning fontSize="small" />,      barColor: 'warning' },
  critical: { label: 'Critical', color: 'error',   icon: <ErrorIcon fontSize="small" />,    barColor: 'error' },
  blocked:  { label: 'Blocked',  color: 'default', icon: <Block fontSize="small" />,         barColor: 'error' },
};

// ============================================================================
// Sub-components
// ============================================================================

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subtitle }) => (
  <Card variant="outlined" sx={{ flex: '1 1 180px', minWidth: 160 }}>
    <CardContent sx={{ pb: '12px !important' }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={600} mt={0.5}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

// ============================================================================
// Props
// ============================================================================

interface BudgetOverviewProps {
  data: BudgetOverviewData | null;
  loading?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ data, loading = false }) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width={200} height={32} />
          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rounded" width={180} height={90} />
            ))}
          </Box>
          <Skeleton variant="rounded" height={12} sx={{ mt: 3 }} />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">No budget configured yet.</Typography>
        </CardContent>
      </Card>
    );
  }

  const { budget, percentageUsed, remainingCost, projectedEndOfMonthCost, alertStatus } = data;
  const alert = ALERT_CONFIG[alertStatus];
  const cappedPercent = Math.min(percentageUsed, 100);
  const scopeLabel = budget.scope === 'organization' ? 'Organization' : budget.scope === 'user' ? 'User' : 'Team';

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Budget Overview
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {scopeLabel} · {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} period
            </Typography>
          </Box>
          <Chip
            icon={alert.icon as React.ReactElement}
            label={alert.label}
            color={alert.color}
            size="small"
            variant="outlined"
          />
        </Box>

        {/* Stat Cards */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <StatCard
            label="Current Spend"
            value={formatCost(budget.currentUsage.cost)}
            subtitle={`of ${budget.costCap ? formatCost(budget.costCap) : 'No cap'}`}
          />
          <StatCard
            label="Tokens Used"
            value={formatTokens(budget.currentUsage.tokens)}
            subtitle={budget.tokenCap ? `of ${formatTokens(budget.tokenCap)}` : 'No cap'}
          />
          <StatCard
            label="Remaining Budget"
            value={remainingCost !== undefined ? formatCost(remainingCost) : '—'}
          />
          <StatCard
            label="Projected Month-End"
            value={formatCost(projectedEndOfMonthCost)}
            subtitle={
              projectedEndOfMonthCost > (budget.costCap ?? Infinity)
                ? `⚠ Exceeds cap by ${formatCost(projectedEndOfMonthCost - (budget.costCap ?? 0))}`
                : undefined
            }
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Progress Bar */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Budget Used
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {percentageUsed.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={cappedPercent}
            color={alert.barColor}
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Warning at {budget.alertThresholds.warning}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Critical at {budget.alertThresholds.critical}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Block at {budget.alertThresholds.block}%
            </Typography>
          </Box>
        </Box>

        {/* Projection Warning */}
        {projectedEndOfMonthCost > (budget.costCap ?? Infinity) && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'warning.light',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <TrendingUp color="warning" fontSize="small" />
            <Typography variant="body2" color="warning.dark">
              Projected spend ({formatCost(projectedEndOfMonthCost)}) exceeds the budget cap. Consider reducing usage or increasing the budget.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetOverview;
