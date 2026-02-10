import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';

type AlertSeverity = 'error' | 'warning' | 'info' | 'success';

interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  source?: string;
}

interface AlertsSummaryProps {
  data: Alert[];
  limit?: number;
}

/**
 * AlertsSummary Component
 * Displays a list of recent alerts and notifications
 * Shows severity, message, and timestamp for each alert
 */
export const AlertsSummary: React.FC<AlertsSummaryProps> = ({
  data,
  limit = 5,
}) => {
  const recentAlerts = data.slice(0, limit);

  const getAlertIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'success':
        return <SuccessIcon color="success" />;
      case 'info':
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getAlertColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'info':
      default:
        return 'info';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card sx={{ flex: '1 1 400px', minWidth: '400px' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Recent Alerts
          </Typography>
          {recentAlerts.length > 0 && (
            <Chip
              label={`${recentAlerts.length} active`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        {recentAlerts && recentAlerts.length > 0 ? (
          <List sx={{ py: 0 }}>
            {recentAlerts.map((alert, index) => (
              <ListItem
                key={alert.id}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: 1,
                  mb: index < recentAlerts.length - 1 ? 1 : 0,
                  bgcolor: 'background.default',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getAlertIcon(alert.severity)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {alert.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(alert.timestamp)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    alert.source && (
                      <Typography variant="caption" color="text.secondary">
                        Source: {alert.source}
                      </Typography>
                    )
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: 200,
              color: 'text.secondary',
            }}
          >
            <SuccessIcon sx={{ fontSize: 48, mb: 2, color: 'success.main' }} />
            <Typography color="text.secondary">
              No alerts - All systems operating normally
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsSummary;
