import React, { useState } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

type AlertSeverity = 'error' | 'warning' | 'info' | 'success';

interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  source?: string;
  details?: string;
  userId?: string;
}

interface AlertsSummaryProps {
  data: Alert[];
  limit?: number;
  onAlertClick?: (alert: Alert) => void;
}

/**
 * AlertsSummary Component
 * Displays a list of recent alerts and notifications
 * Shows severity, message, and timestamp for each alert
 * Supports click-to-view-detail and links to full alerts page
 */
export const AlertsSummary: React.FC<AlertsSummaryProps> = ({
  data,
  limit = 5,
  onAlertClick,
}) => {
  const navigate = useNavigate();
  const recentAlerts = data.slice(0, limit);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

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

  const getSeverityLabel = (severity: AlertSeverity) => {
    switch (severity) {
      case 'error': return 'Critical';
      case 'warning': return 'Warning';
      case 'info': return 'Info';
      case 'success': return 'Success';
      default: return severity;
    }
  };

  const getSeverityColor = (severity: AlertSeverity): 'error' | 'warning' | 'info' | 'success' => {
    switch (severity) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'success': return 'success';
      case 'info':
      default: return 'info';
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

  const handleAlertClick = (alert: Alert) => {
    if (onAlertClick) {
      onAlertClick(alert);
    } else {
      setSelectedAlert(alert);
    }
  };

  return (
    <>
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
            <>
              <List sx={{ py: 0 }}>
                {recentAlerts.map((alert, index) => (
                  <ListItem
                    key={alert.id}
                    onClick={() => handleAlertClick(alert)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderRadius: 1,
                      mb: index < recentAlerts.length - 1 ? 1 : 0,
                      bgcolor: 'background.default',
                      cursor: 'pointer',
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
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/alerts')}
                >
                  View All Alerts
                </Button>
              </Box>
            </>
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

      {/* Alert Detail Dialog */}
      <Dialog open={!!selectedAlert} onClose={() => setSelectedAlert(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Alert Details
          <IconButton size="small" onClick={() => setSelectedAlert(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getAlertIcon(selectedAlert.severity)}
                <Chip
                  label={getSeverityLabel(selectedAlert.severity)}
                  size="small"
                  color={getSeverityColor(selectedAlert.severity)}
                />
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Message</Typography>
                <Typography variant="body1">{selectedAlert.message}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Timestamp</Typography>
                <Typography variant="body2">
                  {new Date(selectedAlert.timestamp).toLocaleString()} ({formatTimestamp(selectedAlert.timestamp)})
                </Typography>
              </Box>

              {selectedAlert.source && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Source</Typography>
                  <Typography variant="body2">{selectedAlert.source}</Typography>
                </Box>
              )}

              {selectedAlert.details && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Details</Typography>
                  <Typography variant="body2">{selectedAlert.details}</Typography>
                </Box>
              )}

              {selectedAlert.userId && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">User</Typography>
                  <Typography variant="body2">{selectedAlert.userId}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAlert(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AlertsSummary;
