import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
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
  tokens: number;
  rank: number;
}

const DashboardPage: React.FC = () => {
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

      <DashboardMetrics tokenUsage={tokenUsage} />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <ModerationEventsCard total={0} breakdown={[]} />
        <AlertsSummaryCard total={0} breakdown={{ critical: 0, warning: 0, info: 0 }} />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <TokenUsageChart data={tokenUsage?.dailyUsage} />
        <ModelUsageChart data={modelUsage} />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <TopUsersTable data={topUsers} limit={10} />
        <AlertsSummary data={[]} limit={5} />
      </Box>
    </Box>
  );
};

export default DashboardPage;
