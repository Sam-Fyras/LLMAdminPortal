import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Chip,
  IconButton, Tooltip, InputAdornment, FormControl,
  InputLabel, Select, MenuItem, SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  CheckCircleOutline as AcknowledgeIcon,
  TaskAlt as ResolveIcon,
  ErrorOutline as CriticalIcon,
  WarningAmber as WarningIcon,
  InfoOutlined as InfoIcon,
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
  critical: { label: 'Critical', color: 'error',   icon: <CriticalIcon fontSize="small" color="error" /> },
  warning:  { label: 'Warning',  color: 'warning', icon: <WarningIcon  fontSize="small" color="warning" /> },
  info:     { label: 'Info',     color: 'info',    icon: <InfoIcon     fontSize="small" color="info" /> },
};

const STATUS_CONFIG: Record<AlertStatus, { label: string; color: 'error' | 'warning' | 'success' | 'default' }> = {
  new:          { label: 'New',          color: 'error' },
  acknowledged: { label: 'Acknowledged', color: 'warning' },
  resolved:     { label: 'Resolved',     color: 'success' },
};

const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  budget_threshold:   'Budget Threshold',
  budget_overspend:   'Budget Overspend',
  moderation_block:   'Moderation Block',
  provider_failure:   'Provider Failure',
  auth_failure:       'Auth Failure',
  config_change:      'Config Change',
  suspicious_activity:'Suspicious Activity',
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// ============================================================================
// Props
// ============================================================================

interface AlertListProps {
  alerts: Alert[];
  onView:        (alert: Alert) => void;
  onAcknowledge: (alertId: string) => void;
  onResolve:     (alertId: string) => void;
}

// ============================================================================
// Component
// ============================================================================

export const AlertList: React.FC<AlertListProps> = ({
  alerts,
  onView,
  onAcknowledge,
  onResolve,
}) => {
  const [search,         setSearch]         = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType,     setFilterType]     = useState<string>('all');
  const [filterStatus,   setFilterStatus]   = useState<string>('all');
  const [dateFrom,       setDateFrom]       = useState('');
  const [dateTo,         setDateTo]         = useState('');

  const filtered = useMemo(() => {
    return alerts
      .filter((a) => {
        const matchSearch   = !search || a.message.toLowerCase().includes(search.toLowerCase()) ||
                              (a.userName || '').toLowerCase().includes(search.toLowerCase());
        const matchSeverity = filterSeverity === 'all' || a.severity === filterSeverity;
        const matchType     = filterType     === 'all' || a.type     === filterType;
        const matchStatus   = filterStatus   === 'all' || a.status   === filterStatus;
        const matchFrom     = !dateFrom || new Date(a.createdAt) >= new Date(dateFrom);
        const matchTo       = !dateTo   || new Date(a.createdAt) <= new Date(dateTo + 'T23:59:59');
        return matchSearch && matchSeverity && matchType && matchStatus && matchFrom && matchTo;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [alerts, search, filterSeverity, filterType, filterStatus, dateFrom, dateTo]);

  const newCount      = alerts.filter(a => a.status === 'new').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'new').length;

  return (
    <>
      {/* Summary bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Chip label={`${newCount} New`}           color="error"   variant={newCount > 0 ? 'filled' : 'outlined'} />
        <Chip label={`${criticalCount} Critical`} color="error"   variant="outlined" icon={<CriticalIcon />} />
        <Chip label={`${alerts.filter(a => a.severity === 'warning' && a.status === 'new').length} Warnings`}
              color="warning" variant="outlined" icon={<WarningIcon />} />
      </Box>

      {/* Filter Toolbar */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'nowrap' }}>
        <TextField
          size="small"
          placeholder="Search message or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: 120 }}
        />

        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Severity</InputLabel>
          <Select
            value={filterSeverity}
            onChange={(e: SelectChangeEvent) => setFilterSeverity(e.target.value)}
            label="Severity"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
            <MenuItem value="info">Info</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Alert Type</InputLabel>
          <Select
            value={filterType}
            onChange={(e: SelectChangeEvent) => setFilterType(e.target.value)}
            label="Alert Type"
          >
            <MenuItem value="all">All Types</MenuItem>
            {(Object.keys(ALERT_TYPE_LABELS) as AlertType[]).map((t) => (
              <MenuItem key={t} value={t}>{ALERT_TYPE_LABELS[t]}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e: SelectChangeEvent) => setFilterStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="acknowledged">Acknowledged</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small" type="date" label="From"
            value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 140 }}
          />
          <TextField
            size="small" type="date" label="To"
            value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 140 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {filtered.length} of {alerts.length} alerts
        </Typography>
      </Paper>

      {/* Alerts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 40 }}>Sev.</TableCell>
              <TableCell>Alert Type</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">
                    {alerts.length === 0
                      ? 'No alerts yet. System events will appear here.'
                      : 'No alerts match your current filters.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((alert) => {
                const sev    = SEVERITY_CONFIG[alert.severity];
                const status = STATUS_CONFIG[alert.status];
                const canAck = alert.status === 'new';
                const canRes = alert.status !== 'resolved';

                return (
                  <TableRow
                    key={alert.id}
                    sx={{
                      opacity: alert.status === 'resolved' ? 0.65 : 1,
                      bgcolor: alert.severity === 'critical' && alert.status === 'new'
                        ? 'error.50'
                        : undefined,
                    }}
                  >
                    {/* Severity icon */}
                    <TableCell sx={{ p: 1 }}>
                      <Tooltip title={sev.label}>
                        <span>{sev.icon}</span>
                      </Tooltip>
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <Chip
                        label={ALERT_TYPE_LABELS[alert.type]}
                        size="small"
                        variant="outlined"
                        color={sev.color}
                      />
                    </TableCell>

                    {/* Message */}
                    <TableCell>
                      <Typography variant="body2">
                        {alert.message.length > 80
                          ? `${alert.message.substring(0, 80)}…`
                          : alert.message}
                      </Typography>
                    </TableCell>

                    {/* User */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {alert.userName || '—'}
                      </Typography>
                    </TableCell>

                    {/* Timestamp */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {formatDateTime(alert.createdAt)}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        label={status.label}
                        size="small"
                        color={status.color}
                        variant={alert.status === 'new' ? 'filled' : 'outlined'}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="View details">
                          <IconButton size="small" onClick={() => onView(alert)}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={canAck ? 'Acknowledge' : 'Already acknowledged'}>
                          <span>
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => onAcknowledge(alert.id)}
                              disabled={!canAck}
                            >
                              <AcknowledgeIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={canRes ? 'Resolve' : 'Already resolved'}>
                          <span>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => onResolve(alert.id)}
                              disabled={!canRes}
                            >
                              <ResolveIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default AlertList;
