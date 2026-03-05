import React, { useState } from 'react';
import {
  Drawer, Box, Typography, Chip, Divider, Button,
  TextField, Stack, IconButton, Tooltip, Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  ErrorOutline as CriticalIcon,
  WarningAmber as WarningIcon,
  InfoOutlined as InfoIcon,
  CheckCircleOutline as AcknowledgeIcon,
  TaskAlt as ResolveIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Category as TypeIcon,
} from '@mui/icons-material';
import { Alert, AlertSeverity, AlertStatus, AlertType } from '../../types/alert';

// ============================================================================
// Constants
// ============================================================================

const SEVERITY_CONFIG: Record<AlertSeverity, {
  label: string;
  color: 'error' | 'warning' | 'info';
  icon: React.ReactElement;
}> = {
  critical: { label: 'Critical', color: 'error',   icon: <CriticalIcon color="error" /> },
  warning:  { label: 'Warning',  color: 'warning', icon: <WarningIcon  color="warning" /> },
  info:     { label: 'Info',     color: 'info',    icon: <InfoIcon     color="info" /> },
};

const STATUS_CONFIG: Record<AlertStatus, { label: string; color: 'error' | 'warning' | 'success' | 'default' }> = {
  new:          { label: 'New',          color: 'error' },
  acknowledged: { label: 'Acknowledged', color: 'warning' },
  resolved:     { label: 'Resolved',     color: 'success' },
};

const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  budget_threshold:    'Budget Threshold',
  budget_overspend:    'Budget Overspend',
  moderation_block:    'Moderation Block',
  provider_failure:    'Provider Failure',
  auth_failure:        'Auth Failure',
  config_change:       'Config Change',
  suspicious_activity: 'Suspicious Activity',
};

const formatDateTime = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
};

// ============================================================================
// Sub-components
// ============================================================================

const MetaRow: React.FC<{ icon: React.ReactElement; label: string; value: React.ReactNode }> = ({
  icon, label, value,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 0.75 }}>
    <Box sx={{ color: 'text.secondary', mt: 0.25, flexShrink: 0 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  </Box>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1, mb: 0.5, display: 'block' }}>
    {children}
  </Typography>
);

// ============================================================================
// Props
// ============================================================================

interface AlertDetailsProps {
  alert: Alert | null;
  onClose:       () => void;
  onAcknowledge: (alertId: string) => void;
  onResolve:     (alertId: string, notes: string) => void;
}

// ============================================================================
// Component
// ============================================================================

export const AlertDetails: React.FC<AlertDetailsProps> = ({
  alert,
  onClose,
  onAcknowledge,
  onResolve,
}) => {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(false);

  const handleResolveSubmit = () => {
    if (!alert) return;
    onResolve(alert.id, resolutionNotes);
    setResolutionNotes('');
    setShowResolveForm(false);
  };

  const handleClose = () => {
    setResolutionNotes('');
    setShowResolveForm(false);
    onClose();
  };

  if (!alert) return null;

  const sev    = SEVERITY_CONFIG[alert.severity];
  const status = STATUS_CONFIG[alert.status];
  const canAck = alert.status === 'new';
  const canRes = alert.status !== 'resolved';

  return (
    <Drawer
      anchor="right"
      open={!!alert}
      onClose={handleClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}
    >
      {/* Header */}
      <Box sx={{
        px: 3, py: 2,
        display: 'flex', alignItems: 'center', gap: 1.5,
        borderBottom: 1, borderColor: 'divider',
        bgcolor: alert.severity === 'critical' ? 'error.50' : 'background.paper',
      }}>
        {sev.icon}
        <Typography variant="h6" sx={{ flex: 1 }}>Alert Details</Typography>
        <Tooltip title="Close">
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ px: 3, py: 2, overflowY: 'auto', flex: 1 }}>

        {/* Status + Severity row */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip label={sev.label}    color={sev.color}    size="small" icon={sev.icon} />
          <Chip label={status.label} color={status.color} size="small"
                variant={alert.status === 'new' ? 'filled' : 'outlined'} />
          <Chip label={ALERT_TYPE_LABELS[alert.type]} size="small" variant="outlined" />
        </Box>

        {/* Full message */}
        <SectionTitle>Message</SectionTitle>
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50', borderRadius: 1 }} elevation={0} variant="outlined">
          <Typography variant="body2">{alert.message}</Typography>
        </Paper>

        {/* Metadata */}
        <SectionTitle>Details</SectionTitle>
        <Box sx={{ mb: 2 }}>
          <MetaRow
            icon={<ScheduleIcon fontSize="small" />}
            label="Triggered at"
            value={formatDateTime(alert.createdAt)}
          />
          {alert.userName && (
            <MetaRow
              icon={<PersonIcon fontSize="small" />}
              label="User"
              value={alert.userName}
            />
          )}
          <MetaRow
            icon={<TypeIcon fontSize="small" />}
            label="Alert ID"
            value={<Typography variant="body2" fontFamily="monospace">{alert.id}</Typography>}
          />
        </Box>

        {/* Related context (alert.details) */}
        {alert.details && Object.keys(alert.details).length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <SectionTitle>Related Context</SectionTitle>
            <Box component="pre" sx={{
              bgcolor: 'grey.100', p: 1.5, borderRadius: 1,
              fontSize: 12, overflowX: 'auto', mb: 2,
              fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {JSON.stringify(alert.details, null, 2)}
            </Box>
          </>
        )}

        {/* Resolution info (if resolved) */}
        {alert.status === 'resolved' && (
          <>
            <Divider sx={{ my: 2 }} />
            <SectionTitle>Resolution</SectionTitle>
            <Box sx={{ mb: 2 }}>
              <MetaRow
                icon={<ResolveIcon fontSize="small" />}
                label="Resolved by"
                value={alert.resolvedBy || '—'}
              />
              <MetaRow
                icon={<ScheduleIcon fontSize="small" />}
                label="Resolved at"
                value={formatDateTime(alert.resolvedAt)}
              />
              {alert.resolutionNotes && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">Notes</Typography>
                  <Typography variant="body2" sx={{ mt: 0.25 }}>{alert.resolutionNotes}</Typography>
                </Box>
              )}
            </Box>
          </>
        )}

        {/* Acknowledged info */}
        {(alert.status === 'acknowledged' || alert.status === 'resolved') && alert.acknowledgedBy && (
          <>
            <Divider sx={{ my: 2 }} />
            <SectionTitle>Acknowledgement</SectionTitle>
            <Box sx={{ mb: 2 }}>
              <MetaRow
                icon={<AcknowledgeIcon fontSize="small" />}
                label="Acknowledged by"
                value={alert.acknowledgedBy}
              />
              <MetaRow
                icon={<ScheduleIcon fontSize="small" />}
                label="Acknowledged at"
                value={formatDateTime(alert.acknowledgedAt)}
              />
            </Box>
          </>
        )}

        {/* Resolve form */}
        {showResolveForm && canRes && (
          <>
            <Divider sx={{ my: 2 }} />
            <SectionTitle>Resolution Notes</SectionTitle>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Describe how this alert was resolved..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              size="small"
              sx={{ mb: 1.5 }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleResolveSubmit}
                startIcon={<ResolveIcon />}
              >
                Confirm Resolve
              </Button>
              <Button
                size="small"
                onClick={() => { setShowResolveForm(false); setResolutionNotes(''); }}
              >
                Cancel
              </Button>
            </Stack>
          </>
        )}
      </Box>

      {/* Footer Actions */}
      {(canAck || canRes) && !showResolveForm && (
        <Box sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
          {canAck && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<AcknowledgeIcon />}
              onClick={() => onAcknowledge(alert.id)}
              size="small"
            >
              Acknowledge
            </Button>
          )}
          {canRes && (
            <Button
              variant="contained"
              color="success"
              startIcon={<ResolveIcon />}
              onClick={() => setShowResolveForm(true)}
              size="small"
            >
              Resolve
            </Button>
          )}
        </Box>
      )}
    </Drawer>
  );
};

export default AlertDetails;
