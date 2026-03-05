import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Chip,
  IconButton, Tooltip, InputAdornment, FormControl,
  InputLabel, Select, MenuItem, SelectChangeEvent,
  Button, Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  FileDownload as ExportIcon,
  Person as PersonIcon,
  Edit as UpdateIcon,
  Add as CreateIcon,
  Delete as DeleteIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import { AuditLog, AuditEventType, AuditResourceType } from '../../types/alert';

// ============================================================================
// Constants
// ============================================================================

const EVENT_TYPE_LABELS: Record<AuditEventType, string> = {
  user_created:     'User Created',
  user_updated:     'User Updated',
  user_deleted:     'User Deleted',
  rule_created:     'Rule Created',
  rule_updated:     'Rule Updated',
  rule_deleted:     'Rule Deleted',
  provider_created: 'Provider Created',
  provider_updated: 'Provider Updated',
  provider_deleted: 'Provider Deleted',
  budget_updated:   'Budget Updated',
  login:            'Login',
  logout:           'Logout',
  api_key_rotated:  'API Key Rotated',
};

const EVENT_TYPE_ICON: Record<AuditEventType, React.ReactElement> = {
  user_created:     <CreateIcon  fontSize="small" color="success" />,
  user_updated:     <UpdateIcon  fontSize="small" color="info" />,
  user_deleted:     <DeleteIcon  fontSize="small" color="error" />,
  rule_created:     <CreateIcon  fontSize="small" color="success" />,
  rule_updated:     <UpdateIcon  fontSize="small" color="info" />,
  rule_deleted:     <DeleteIcon  fontSize="small" color="error" />,
  provider_created: <CreateIcon  fontSize="small" color="success" />,
  provider_updated: <UpdateIcon  fontSize="small" color="info" />,
  provider_deleted: <DeleteIcon  fontSize="small" color="error" />,
  budget_updated:   <UpdateIcon  fontSize="small" color="warning" />,
  login:            <LoginIcon   fontSize="small" color="success" />,
  logout:           <LogoutIcon  fontSize="small" color="action" />,
  api_key_rotated:  <KeyIcon     fontSize="small" color="warning" />,
};

const RESOURCE_TYPE_COLORS: Record<AuditResourceType, 'primary' | 'secondary' | 'success' | 'warning'> = {
  user:     'primary',
  rule:     'secondary',
  provider: 'success',
  budget:   'warning',
};

const EVENT_GROUPS = [
  { label: 'User Events',     values: ['user_created', 'user_updated', 'user_deleted'] },
  { label: 'Rule Events',     values: ['rule_created', 'rule_updated', 'rule_deleted'] },
  { label: 'Provider Events', values: ['provider_created', 'provider_updated', 'provider_deleted'] },
  { label: 'Budget Events',   values: ['budget_updated'] },
  { label: 'Auth Events',     values: ['login', 'logout', 'api_key_rotated'] },
];

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

// ============================================================================
// Export helpers
// ============================================================================

const exportToCSV = (logs: AuditLog[]) => {
  const headers = ['Timestamp', 'Event Type', 'Performed By', 'Resource Type', 'Resource', 'Action', 'IP Address'];
  const rows = logs.map(l => [
    formatDateTime(l.timestamp),
    EVENT_TYPE_LABELS[l.eventType],
    l.userName,
    l.resourceType || '—',
    l.resourceName || l.resourceId || '—',
    l.action || '—',
    l.ipAddress,
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportToJSON = (logs: AuditLog[]) => {
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// ============================================================================
// Expanded diff row
// ============================================================================

const DiffRow: React.FC<{ log: AuditLog }> = ({ log }) => {
  if (!log.oldValue && !log.newValue) return null;
  return (
    <Box sx={{ display: 'flex', gap: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
      {log.oldValue && (
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="error.main" fontWeight={600}>Before</Typography>
          <Box component="pre" sx={{ fontSize: 11, m: 0, mt: 0.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(log.oldValue, null, 2)}
          </Box>
        </Box>
      )}
      {log.newValue && (
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="success.main" fontWeight={600}>After</Typography>
          <Box component="pre" sx={{ fontSize: 11, m: 0, mt: 0.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(log.newValue, null, 2)}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// ============================================================================
// Props
// ============================================================================

interface AuditLogTableProps {
  logs: AuditLog[];
}

// ============================================================================
// Component
// ============================================================================

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs }) => {
  const [search,      setSearch]      = useState('');
  const [filterEvent, setFilterEvent] = useState<string>('all');
  const [filterUser,  setFilterUser]  = useState<string>('all');
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [expandedId,  setExpandedId]  = useState<string | null>(null);
  const [exportMenu,  setExportMenu]  = useState(false);

  // Unique users for filter dropdown
  const uniqueUsers = useMemo(() => {
    const names = Array.from(new Set(logs.map(l => l.userName))).sort();
    return names;
  }, [logs]);

  const filtered = useMemo(() => {
    return logs
      .filter((l) => {
        const matchSearch = !search ||
          l.userName.toLowerCase().includes(search.toLowerCase()) ||
          (l.resourceName || '').toLowerCase().includes(search.toLowerCase()) ||
          EVENT_TYPE_LABELS[l.eventType].toLowerCase().includes(search.toLowerCase());
        const matchEvent = filterEvent === 'all' || l.eventType === filterEvent;
        const matchUser  = filterUser  === 'all' || l.userName  === filterUser;
        const matchFrom  = !dateFrom || new Date(l.timestamp) >= new Date(dateFrom);
        const matchTo    = !dateTo   || new Date(l.timestamp) <= new Date(dateTo + 'T23:59:59');
        return matchSearch && matchEvent && matchUser && matchFrom && matchTo;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, search, filterEvent, filterUser, dateFrom, dateTo]);

  const toggleExpand = (id: string) =>
    setExpandedId(prev => prev === id ? null : id);

  return (
    <>
      {/* Filter Toolbar */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search user, event, resource..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 240 }}
        />

        <FormControl size="small" sx={{ minWidth: 190 }}>
          <InputLabel>Event Type</InputLabel>
          <Select
            value={filterEvent}
            onChange={(e: SelectChangeEvent) => setFilterEvent(e.target.value)}
            label="Event Type"
          >
            <MenuItem value="all">All Events</MenuItem>
            {EVENT_GROUPS.map(group => [
              <MenuItem key={`header-${group.label}`} disabled sx={{ opacity: 0.6, fontSize: 12 }}>
                {group.label}
              </MenuItem>,
              ...group.values.map(v => (
                <MenuItem key={v} value={v} sx={{ pl: 3 }}>
                  {EVENT_TYPE_LABELS[v as AuditEventType]}
                </MenuItem>
              )),
            ])}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>User</InputLabel>
          <Select
            value={filterUser}
            onChange={(e: SelectChangeEvent) => setFilterUser(e.target.value)}
            label="User"
          >
            <MenuItem value="all">All Users</MenuItem>
            {uniqueUsers.map(u => (
              <MenuItem key={u} value={u}>{u}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small" type="date" label="From"
          value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 150 }}
        />
        <TextField
          size="small" type="date" label="To"
          value={dateTo} onChange={(e) => setDateTo(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 150 }}
        />

        <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {filtered.length} of {logs.length} entries
          </Typography>
          {/* Export buttons */}
          <Button
            size="small" variant="outlined" startIcon={<ExportIcon />}
            onClick={() => setExportMenu(v => !v)}
          >
            Export
          </Button>
          {exportMenu && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Button size="small" variant="contained" onClick={() => { exportToCSV(filtered); setExportMenu(false); }}>
                CSV
              </Button>
              <Button size="small" variant="contained" onClick={() => { exportToJSON(filtered); setExportMenu(false); }}>
                JSON
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Audit Log Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 32 }} />
              <TableCell>Timestamp</TableCell>
              <TableCell>Event</TableCell>
              <TableCell>Performed By</TableCell>
              <TableCell>Resource</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>IP Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">
                    {logs.length === 0
                      ? 'No audit log entries yet.'
                      : 'No entries match your filters.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((log) => {
                const hasDiff    = !!(log.oldValue || log.newValue);
                const isExpanded = expandedId === log.id;

                return (
                  <React.Fragment key={log.id}>
                    <TableRow
                      hover
                      sx={{ cursor: hasDiff ? 'pointer' : 'default' }}
                      onClick={() => hasDiff && toggleExpand(log.id)}
                    >
                      {/* Expand toggle */}
                      <TableCell sx={{ p: 0.5, width: 32 }}>
                        {hasDiff && (
                          <Tooltip title={isExpanded ? 'Hide changes' : 'Show changes'}>
                            <IconButton size="small">
                              {isExpanded ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>

                      {/* Timestamp */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {formatDateTime(log.timestamp)}
                        </Typography>
                      </TableCell>

                      {/* Event type */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          {EVENT_TYPE_ICON[log.eventType]}
                          <Typography variant="body2">
                            {EVENT_TYPE_LABELS[log.eventType]}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Performed by */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                          <Typography variant="body2">{log.userName}</Typography>
                        </Box>
                      </TableCell>

                      {/* Resource */}
                      <TableCell>
                        {log.resourceType ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Chip
                              label={log.resourceType}
                              size="small"
                              color={RESOURCE_TYPE_COLORS[log.resourceType]}
                              variant="outlined"
                              sx={{ height: 20, fontSize: 11 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {log.resourceName || log.resourceId || '—'}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.disabled">—</Typography>
                        )}
                      </TableCell>

                      {/* Action */}
                      <TableCell>
                        {log.action ? (
                          <Chip
                            label={log.action}
                            size="small"
                            color={
                              log.action === 'create' ? 'success' :
                              log.action === 'delete' ? 'error' : 'info'
                            }
                            sx={{ height: 20, fontSize: 11 }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.disabled">—</Typography>
                        )}
                      </TableCell>

                      {/* IP Address */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                          {log.ipAddress}
                        </Typography>
                      </TableCell>
                    </TableRow>

                    {/* Expanded diff row */}
                    {hasDiff && (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ py: 0, borderBottom: isExpanded ? undefined : 'none' }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ py: 1.5, px: 2 }}>
                              <DiffRow log={log} />
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default AuditLogTable;
