import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchTokenUsage, fetchModelUsage } from '../api/tokens';
import { getTopUsers } from '../api/usage';
import { TokenUsageSummary, ModelUsage } from '../types';
import {
  DashboardMetrics,
  TokenUsageChart,
  ModelUsageChart,
  TimeRangeSelector,
  TopUsersTable,
  AlertsSummary,
  ModerationEventsCard,
  AlertsSummaryCard,
} from '../components/dashboard';

interface TopUser {
  user_id: string;
  name: string;
  tokens: number;
  cost: number;
  lastActivity: string;
  rank: number;
}

// Temporary mock data for moderation events (will be replaced by API call later)
const MOCK_MODERATION_EVENTS = {
  total: 47,
  breakdown: [
    { ruleType: 'Content Moderation', count: 35 },
    { ruleType: 'Rate Limit', count: 8 },
    { ruleType: 'Token Limit', count: 4 },
  ],
};

// Temporary mock data for alerts summary (will be replaced by API call later)
const MOCK_ALERTS_SUMMARY = {
  total: 9,
  breakdown: { critical: 2, warning: 4, info: 3 },
};

// Temporary mock data for recent alerts list (will be replaced by API call later)
const MOCK_RECENT_ALERTS = [
  {
    id: 'alert-1',
    severity: 'error' as const,
    message: 'Monthly token budget exceeded 90% threshold',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    source: 'Budget Monitor',
    details: 'Organization has consumed 90.2% of the monthly token budget (9.02M / 10M tokens). Consider increasing the budget or restricting usage.',
  },
  {
    id: 'alert-2',
    severity: 'error' as const,
    message: 'OpenAI API experiencing elevated error rates',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    source: 'Provider Health',
    details: 'OpenAI API error rate has increased to 5.2% over the last hour. Failover to backup provider may be triggered.',
  },
  {
    id: 'alert-3',
    severity: 'warning' as const,
    message: 'User sarah.johnson@acme.com approaching daily token limit',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    source: 'Usage Tracker',
    details: 'User has consumed 85% of their daily token allocation (425K / 500K tokens).',
    userId: 'user-1',
  },
  {
    id: 'alert-4',
    severity: 'warning' as const,
    message: 'Unusual spike in token usage detected for Engineering team',
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
    source: 'Anomaly Detection',
    details: 'Token usage for the Engineering department is 340% above the daily average. This may indicate automated or bulk processing.',
  },
  {
    id: 'alert-5',
    severity: 'info' as const,
    message: 'New moderation rule "PII Detection v2" activated',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    source: 'Rule Engine',
    details: 'Rule "PII Detection v2" has been enabled by admin@acme.com. It will apply to all incoming prompts.',
  },
  {
    id: 'alert-6',
    severity: 'warning' as const,
    message: 'Projected monthly spend will exceed budget by $120',
    timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
    source: 'Cost Projector',
    details: 'Based on current usage trends, the projected end-of-month cost is $1,620 against a budget of $1,500.',
  },
  {
    id: 'alert-7',
    severity: 'info' as const,
    message: 'Anthropic Claude 3.5 model added to available models',
    timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
    source: 'Provider Config',
    details: 'A new model "claude-3.5-sonnet" has been made available for this tenant.',
  },
];

// Temporary mock data for previous period comparison (will be replaced by API call later)
const MOCK_PREVIOUS_PERIOD = {
  totalTokens: 4000000,
  activeUsers: 22,
  estimatedCost: 200.00,
  avgTokensPerRequest: 1300,
};

// Temporary mock data for user breakdown chart (will be replaced by API call later)
const MOCK_USER_BREAKDOWN = [
  { date: '2025-01-09', 'Sarah Johnson': 180000, 'Michael Chen': 140000, 'Emily Rodriguez': 120000, 'James Wilson': 95000, 'Priya Patel': 65000 },
  { date: '2025-01-10', 'Sarah Johnson': 195000, 'Michael Chen': 155000, 'Emily Rodriguez': 130000, 'James Wilson': 100000, 'Priya Patel': 70000 },
  { date: '2025-01-11', 'Sarah Johnson': 160000, 'Michael Chen': 130000, 'Emily Rodriguez': 100000, 'James Wilson': 80000, 'Priya Patel': 60000 },
  { date: '2025-01-12', 'Sarah Johnson': 220000, 'Michael Chen': 175000, 'Emily Rodriguez': 155000, 'James Wilson': 115000, 'Priya Patel': 85000 },
  { date: '2025-01-13', 'Sarah Johnson': 170000, 'Michael Chen': 145000, 'Emily Rodriguez': 110000, 'James Wilson': 90000, 'Priya Patel': 65000 },
  { date: '2025-01-14', 'Sarah Johnson': 200000, 'Michael Chen': 160000, 'Emily Rodriguez': 135000, 'James Wilson': 110000, 'Priya Patel': 75000 },
  { date: '2025-01-15', 'Sarah Johnson': 210000, 'Michael Chen': 165000, 'Emily Rodriguez': 145000, 'James Wilson': 115000, 'Priya Patel': 75000 },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsageSummary | null>(null);
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [tokenResponse, modelResponse, topUsersResponse] = await Promise.all([
          fetchTokenUsage(timeRange),
          fetchModelUsage(timeRange),
          getTopUsers('tenant-123', 10, timeRange),
        ]);

        setTokenUsage(tokenResponse.data);
        setModelUsage(modelResponse.data);
        setTopUsers(topUsersResponse.data);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [timeRange]);

  const handleUserClick = (userId: string) => {
    // Navigate to user detail view (will be implemented with Users page)
    navigate(`/users?userId=${userId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 4,
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1">
          Token Usage Dashboard
        </Typography>

        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <DashboardMetrics
        tokenUsage={tokenUsage}
        budgetLimit={10000000}
        previousPeriod={MOCK_PREVIOUS_PERIOD}
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <ModerationEventsCard
          total={MOCK_MODERATION_EVENTS.total}
          breakdown={MOCK_MODERATION_EVENTS.breakdown}
        />
        <AlertsSummaryCard
          total={MOCK_ALERTS_SUMMARY.total}
          breakdown={MOCK_ALERTS_SUMMARY.breakdown}
        />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <TokenUsageChart
          data={tokenUsage?.dailyUsage}
          userBreakdownData={MOCK_USER_BREAKDOWN}
        />
        <ModelUsageChart data={modelUsage} />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <TopUsersTable data={topUsers} limit={10} onUserClick={handleUserClick} />
        <AlertsSummary data={MOCK_RECENT_ALERTS} limit={5} />
      </Box>
    </Box>
  );
};

export default DashboardPage;
