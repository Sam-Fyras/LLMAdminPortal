import React, { useState, useMemo } from 'react';
import {
  Box, Chip, Divider, Drawer, IconButton, Stack,
  Tooltip, Typography, Avatar, LinearProgress,
  Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
  Tabs, Tab, Button, Menu, MenuItem, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent,
} from '@mui/material';
import {
  Close, Edit,
  Person, Shield, Schedule,
  Block as BlockIcon,
  WarningAmber as WarningAmberIcon,
  BarChart as BarChartIcon,
  Download as DownloadIcon,
  DataObject as DataObjectIcon,
  TableChart as TableChartIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import UserUsageHistory from './Userusagehistory';
import { UserRow } from '../../mocks/data/users';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TokenUsageByModel { model: string; tokens: number; cost: number; color: string; }
interface MonthlyUsage { month: string; tokens: number; cost: number; }
interface TokenUsageData {
  currentMonth: { tokens: number; limit: number; cost: number; costLimit: number };
  historicalUsage: MonthlyUsage[];
  costBreakdownByModel: TokenUsageByModel[];
}

interface ModerationEvent {
  id: string; timestamp: string;
  type: 'blocked' | 'redacted' | 'warned';
  reason: string; prompt_preview: string;
  rule_id: string; rule_name: string;
}
interface ModerationHistoryData {
  events: ModerationEvent[];
  summary: { blocked: number; redacted: number; warned: number };
}

interface UserDetailsProps {
  open: boolean;
  onClose: () => void;
  User: UserRow | null;
  tokenUsageData?: TokenUsageData;
  moderationHistoryData?: ModerationHistoryData;
  onEdit?: () => void;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const generateMockTokenUsageData = (): TokenUsageData => ({
  currentMonth: { tokens: 145000, limit: 200000, cost: 14.5, costLimit: 25.0 },
  historicalUsage: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'].map((month) => ({
    month,
    tokens: Math.floor(Math.random() * 150000) + 50000,
    cost: Math.random() * 20 + 5,
  })),
  costBreakdownByModel: [
    { model: 'GPT-4', tokens: 45000, cost: 6.75, color: '#4caf50' },
    { model: 'GPT-3.5', tokens: 65000, cost: 3.25, color: '#2196f3' },
    { model: 'Claude-3', tokens: 25000, cost: 3.0, color: '#9c27b0' },
    { model: 'Claude-2', tokens: 10000, cost: 1.5, color: '#ff9800' },
  ],
});

const generateMockModerationHistory = (): ModerationHistoryData => ({
  events: [
    { id: 'mod-001', timestamp: '2024-02-15T14:32:00Z', type: 'blocked', reason: 'PII detected - Social Security Number', prompt_preview: 'My SSN is ***-**-****...', rule_id: 'rule-pii-001', rule_name: 'PII Detection - SSN' },
    { id: 'mod-002', timestamp: '2024-02-14T09:15:00Z', type: 'redacted', reason: 'Email address redacted', prompt_preview: 'Contact me at [REDACTED]...', rule_id: 'rule-pii-002', rule_name: 'PII Detection - Email' },
    { id: 'mod-003', timestamp: '2024-02-13T16:45:00Z', type: 'warned', reason: 'Potential sensitive content', prompt_preview: 'Can you help me with confidential...', rule_id: 'rule-content-001', rule_name: 'Sensitive Content Warning' },
    { id: 'mod-004', timestamp: '2024-02-10T11:20:00Z', type: 'blocked', reason: 'Hard block keyword detected', prompt_preview: 'Generate code for [BLOCKED]...', rule_id: 'rule-block-001', rule_name: 'Hard Block Keywords' },
    { id: 'mod-005', timestamp: '2024-02-08T08:55:00Z', type: 'redacted', reason: 'Credit card number redacted', prompt_preview: 'My card number is [REDACTED]...', rule_id: 'rule-pii-003', rule_name: 'PII Detection - Financial' },
  ],
  summary: { blocked: 2, redacted: 2, warned: 1 },
});

// ── Shared layout primitives (same as TenantDetail) ───────────────────────────

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
        <Typography variant="caption" fontWeight={700} textTransform="uppercase" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Stack spacing={1.5}>{children}</Stack>
    </Box>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" mb={0.25}>{label}</Typography>
      <Typography variant="body2" fontWeight={500} sx={{ wordBreak: 'break-all' }}>{value}</Typography>
    </Box>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

const TabPanel: React.FC<{ children?: React.ReactNode; index: number; value: number }> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const UsageBar: React.FC<{ label: string; current: number; limit: number; unit?: string }> = ({ label, current, limit, unit = '' }) => {
  const pct = Math.min((current / limit) * 100, 100);
  const color = pct >= 90 ? 'error' : pct >= 75 ? 'warning' : 'primary';
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight={500}>{current.toLocaleString()}{unit} / {limit.toLocaleString()}{unit}</Typography>
      </Box>
      <LinearProgress variant="determinate" value={pct} color={color} sx={{ height: 7, borderRadius: 4 }} />
      <Typography variant="caption" color={pct >= 90 ? 'error.main' : 'text.secondary'} sx={{ mt: 0.5, display: 'block' }}>
        {pct.toFixed(1)}% used
      </Typography>
    </Box>
  );
};

const ModChip: React.FC<{ type: ModerationEvent['type'] }> = ({ type }) => {
  const cfg = {
    blocked: { color: 'error' as const, icon: <BlockIcon sx={{ fontSize: 13 }} /> },
    redacted: { color: 'warning' as const, icon: <Edit sx={{ fontSize: 13 }} /> },
    warned: { color: 'info' as const, icon: <WarningAmberIcon sx={{ fontSize: 13 }} /> },
  };
  return <Chip label={type} size="small" color={cfg[type].color} icon={cfg[type].icon} sx={{ textTransform: 'capitalize' }} />;
};

// ── Main Component ────────────────────────────────────────────────────────────

const UserDetails: React.FC<UserDetailsProps> = ({
  open, onClose, User,
  tokenUsageData: propTokenData,
  moderationHistoryData: propModData,
  onEdit,
}) => {
  const [tab, setTab] = useState(0);
  const [exportUserAnchorEl, setExportUserAnchorEl] = useState<null | HTMLElement>(null);
  const [exportModAnchorEl, setExportModAnchorEl] = useState<null | HTMLElement>(null);
  const [usageDialogOpen, setUsageDialogOpen] = useState(false);

  const tokenUsageData = useMemo(() => propTokenData || generateMockTokenUsageData(), [propTokenData]);
  const moderationData = useMemo(() => propModData || generateMockModerationHistory(), [propModData]);

  if (!User) return null;

  const initials = User.display_name?.split(' ').map((n) => n[0]).join('').toUpperCase() ?? 'U';

  const dl = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const exportUserCSV = () => {
    const headers = Object.keys(User);
    const row = headers.map((h) => {
      const v = User[h as keyof UserRow];
      if (Array.isArray(v)) return `"${(v as string[]).join('; ')}"`;
      if (typeof v === 'object' && v) return `"${JSON.stringify(v).replace(/"/g, '""')}"`;
      return typeof v === 'string' && v.includes(',') ? `"${v}"` : (v ?? '');
    });
    dl([headers.join(','), row.join(',')].join('\n'),
      `user_${User.user_id}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
  };

  const exportUserJSON = () =>
    dl(JSON.stringify(User, null, 2), `user_${User.user_id}_${new Date().toISOString().split('T')[0]}.json`, 'application/json');

  const exportModCSV = () => {
    const headers = ['ID', 'Timestamp', 'Type', 'Reason', 'Rule Name', 'Prompt Preview'];
    const rows = moderationData.events.map((e) => [
      e.id, new Date(e.timestamp).toLocaleString(), e.type,
      `"${e.reason.replace(/"/g, '""')}"`, e.rule_name, `"${e.prompt_preview.replace(/"/g, '""')}"`,
    ]);
    dl([headers.join(','), ...rows.map((r) => r.join(','))].join('\n'),
      `moderation_${User.user_id}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
  };

  const exportModJSON = () =>
    dl(JSON.stringify({ user_id: User.user_id, exported_at: new Date().toISOString(), ...moderationData }, null, 2),
      `moderation_${User.user_id}_${new Date().toISOString().split('T')[0]}.json`, 'application/json');

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose}
        slotProps={{ paper: { sx: { width: 560, p: 0, display: 'flex', flexDirection: 'column' } } }}>

        {/* Header */}
        <Box sx={{ p: 2.5, pb: 2, display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontWeight: 700, fontSize: 15 }}>
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={700} noWrap>{User.display_name}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>{User.email}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
            <Tooltip title="View usage analytics">
              <IconButton size="small" onClick={() => setUsageDialogOpen(true)}>
                <BarChartIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {onEdit && (
              <Tooltip title="Edit user">
                <IconButton size="small" onClick={() => { onClose(); onEdit(); }}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <IconButton size="small" onClick={onClose}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Badge bar */}
        <Box sx={{ px: 2.5, py: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap',
          borderBottom: '1px solid', borderColor: 'divider' }}>
          <Chip
            label={User.status.charAt(0).toUpperCase() + User.status.slice(1)}
            size="small"
            color={User.status === 'active' ? 'success' : 'default'}
            sx={{ fontWeight: 600, fontSize: 11 }}
          />
          <Chip
            label={User.role}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: 11, textTransform: 'capitalize' }}
          />
          {User.is_deleted && (
            <Chip label="Deleted" size="small" color="error" sx={{ fontWeight: 600, fontSize: 11 }} />
          )}
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 40 }}>
            <Tab label="Overview" sx={{ minHeight: 40, fontSize: 13 }} />
            <Tab label="Token Usage" sx={{ minHeight: 40, fontSize: 13 }} />
            <Tab label="Moderation" sx={{ minHeight: 40, fontSize: 13 }} />
          </Tabs>
        </Box>

        {/* Tab body */}
        <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>

          {/* ── Overview ── */}
          <TabPanel value={tab} index={0}>
            <Stack spacing={3}>

              <Section icon={<Person fontSize="small" />} title="User Info">
                <Field label="Display Name" value={User.display_name} />
                <Field label="Email" value={User.email} />
                <Field label="User ID" value={<Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{User.user_id}</Typography>} />
                <Field label="Tenant ID" value={<Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{User.tenant_id}</Typography>} />
              </Section>

              <Divider />

              <Section icon={<Shield fontSize="small" />} title="Role & Permissions">
                <Field label="Role" value={
                  <Chip label={User.role} size="small" color="primary" variant="outlined"
                    sx={{ fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }} />
                } />
                <Field label="Custom Permissions" value={
                  User.custom_permissions?.length ? (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.25 }}>
                      {User.custom_permissions.map((p) => (
                        <Chip key={p} label={p} size="small" color="primary" variant="outlined"
                          sx={{ fontSize: 11, textTransform: 'capitalize' }} />
                      ))}
                    </Box>
                  ) : <Typography variant="body2" color="text.secondary">None</Typography>
                } />
              </Section>

              <Divider />

              <Section icon={<Schedule fontSize="small" />} title="Timestamps">
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">Created</Typography>
                    <Typography variant="caption">
                      {User.created_date?.$date ? new Date(User.created_date.$date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">Last Login</Typography>
                    <Typography variant="caption">
                      {User.last_login ? new Date(User.last_login).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Never'}
                    </Typography>
                  </Box>
                </Stack>
              </Section>

              {/* Export */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button size="small" variant="outlined" startIcon={<DownloadIcon />} endIcon={<ArrowDropDownIcon />}
                  onClick={(e) => setExportUserAnchorEl(e.currentTarget)}>
                  Export User
                </Button>
                <Menu anchorEl={exportUserAnchorEl} open={Boolean(exportUserAnchorEl)}
                  onClose={() => setExportUserAnchorEl(null)}
                  slotProps={{ paper: { elevation: 3, sx: { minWidth: 190, borderRadius: 2, mt: 0.5 } } }}>
                  <MenuItem onClick={() => { exportUserCSV(); setExportUserAnchorEl(null); }}>
                    <ListItemIcon><TableChartIcon fontSize="small" color="primary" /></ListItemIcon>
                    <ListItemText primary="Export as CSV" secondary="Spreadsheet format" slotProps={{ secondary: { style: { fontSize: 11 } } }} />
                  </MenuItem>
                  <MenuItem onClick={() => { exportUserJSON(); setExportUserAnchorEl(null); }}>
                    <ListItemIcon><DataObjectIcon fontSize="small" color="secondary" /></ListItemIcon>
                    <ListItemText primary="Export as JSON" secondary="Structured data format" slotProps={{ secondary: { style: { fontSize: 11 } } }} />
                  </MenuItem>
                </Menu>
              </Box>

            </Stack>
          </TabPanel>

          {/* ── Token Usage ── */}
          <TabPanel value={tab} index={1}>
            <Stack spacing={3}>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>Current Month</Typography>
                  <UsageBar label="Tokens" current={tokenUsageData.currentMonth.tokens} limit={tokenUsageData.currentMonth.limit} />
                  <UsageBar label="Cost" current={tokenUsageData.currentMonth.cost} limit={tokenUsageData.currentMonth.costLimit} unit=" USD" />
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>Historical Usage (6 Months)</Typography>
                  <Box sx={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={tokenUsageData.historicalUsage}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" orientation="left" stroke="#1976d2" />
                        <YAxis yAxisId="right" orientation="right" stroke="#2e7d32" />
                        <RechartsTooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="tokens" fill="#1976d2" name="Tokens" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="cost" fill="#2e7d32" name="Cost ($)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>Cost by Model</Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ width: 160, height: 160, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={tokenUsageData.costBreakdownByModel} dataKey="cost" nameKey="model"
                            cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                            {tokenUsageData.costBreakdownByModel.map((e, i) => (
                              <Cell key={i} fill={e.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      {tokenUsageData.costBreakdownByModel.map((item) => (
                        <Box key={item.model} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                            <Typography variant="body2">{item.model}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" fontWeight={600}>${item.cost.toFixed(2)}</Typography>
                            <Typography variant="caption" color="text.secondary">{item.tokens.toLocaleString()} tokens</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>

            </Stack>
          </TabPanel>

          {/* ── Moderation ── */}
          <TabPanel value={tab} index={2}>
            <Stack spacing={2}>

              {/* Summary */}
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {[
                  { label: 'Blocked', value: moderationData.summary.blocked, color: 'error.main' },
                  { label: 'Redacted', value: moderationData.summary.redacted, color: 'warning.main' },
                  { label: 'Warned', value: moderationData.summary.warned, color: 'info.main' },
                ].map(({ label, value, color }) => (
                  <Card key={label} variant="outlined" sx={{ flex: 1 }}>
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="h5" color={color} fontWeight={700}>{value}</Typography>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              {/* Export */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button size="small" variant="outlined" startIcon={<DownloadIcon />} endIcon={<ArrowDropDownIcon />}
                  onClick={(e) => setExportModAnchorEl(e.currentTarget)}>
                  Export History
                </Button>
                <Menu anchorEl={exportModAnchorEl} open={Boolean(exportModAnchorEl)}
                  onClose={() => setExportModAnchorEl(null)}
                  slotProps={{ paper: { elevation: 3, sx: { minWidth: 190, borderRadius: 2, mt: 0.5 } } }}>
                  <MenuItem onClick={() => { exportModCSV(); setExportModAnchorEl(null); }}>
                    <ListItemIcon><TableChartIcon fontSize="small" color="primary" /></ListItemIcon>
                    <ListItemText primary="Export as CSV" slotProps={{ secondary: { style: { fontSize: 11 } } }} />
                  </MenuItem>
                  <MenuItem onClick={() => { exportModJSON(); setExportModAnchorEl(null); }}>
                    <ListItemIcon><DataObjectIcon fontSize="small" color="secondary" /></ListItemIcon>
                    <ListItemText primary="Export as JSON" slotProps={{ secondary: { style: { fontSize: 11 } } }} />
                  </MenuItem>
                </Menu>
              </Box>

              {/* Events table */}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Rule</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {moderationData.events.map((event) => (
                      <TableRow key={event.id} hover>
                        <TableCell>
                          <Typography variant="body2">{new Date(event.timestamp).toLocaleDateString()}</Typography>
                          <Typography variant="caption" color="text.secondary">{new Date(event.timestamp).toLocaleTimeString()}</Typography>
                        </TableCell>
                        <TableCell><ModChip type={event.type} /></TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 160 }} noWrap>{event.reason}</Typography>
                          <Tooltip title={event.prompt_preview}>
                            <Typography variant="caption" color="text.secondary"
                              sx={{ display: 'block', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'help' }}>
                              {event.prompt_preview}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell><Typography variant="body2">{event.rule_name}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

            </Stack>
          </TabPanel>

        </Box>
      </Drawer>

      {/* Usage Analytics full dialog */}
      <Dialog open={usageDialogOpen} onClose={() => setUsageDialogOpen(false)} maxWidth="lg" fullWidth
        slotProps={{ paper: { sx: { minHeight: '80vh' } } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">User Usage Analytics</Typography>
          <IconButton onClick={() => setUsageDialogOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <UserUsageHistory user={User} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserDetails;
