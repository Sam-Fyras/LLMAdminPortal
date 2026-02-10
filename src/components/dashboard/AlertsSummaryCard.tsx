import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface AlertBreakdown {
  critical: number;
  warning: number;
  info: number;
}

interface AlertsSummaryCardProps {
  total: number;
  breakdown: AlertBreakdown;
}

/**
 * AlertsSummaryCard Component
 * Displays count of unread alerts with breakdown by severity
 * Used in dashboard overview section
 */
export const AlertsSummaryCard: React.FC<AlertsSummaryCardProps> = ({
  total,
  breakdown,
}) => {
  return (
    <Card sx={{ flex: '1 1 250px', minWidth: '250px' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <NotificationsIcon color="primary" fontSize="small" />
          <Typography color="text.secondary" variant="body2">
            Alerts Summary
          </Typography>
        </Box>

        <Typography variant="h4" sx={{ mb: 2 }}>
          {total}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {breakdown.critical > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />
              <Typography variant="caption" color="text.secondary">
                Critical: {breakdown.critical}
              </Typography>
            </Box>
          )}
          {breakdown.warning > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon sx={{ fontSize: 16, color: 'warning.main' }} />
              <Typography variant="caption" color="text.secondary">
                Warning: {breakdown.warning}
              </Typography>
            </Box>
          )}
          {breakdown.info > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon sx={{ fontSize: 16, color: 'info.main' }} />
              <Typography variant="caption" color="text.secondary">
                Info: {breakdown.info}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AlertsSummaryCard;
