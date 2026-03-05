import React, { useState, useMemo } from 'react';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
  Typography,
  Button,
  Avatar,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Menu,
  ListItemIcon,
  ListItemText,
  MenuItem
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BarChartIcon from '@mui/icons-material/BarChart';
import CloseIcon from '@mui/icons-material/Close';
import DataObjectIcon from '@mui/icons-material/DataObject';
import TableChartIcon from '@mui/icons-material/TableChart';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import UserUsageHistory from './Userusagehistory';

// ============== Type Definitions ==============

interface UserRow {
  _id: string;
  user_id: string;
  tenant_id: string;
  display_name: string;
  email: string;
  role_id: string;
  custom_permissions: string[];
  status: 'active' | 'inactive';
  created_date: string;
  updated_date: string;
  last_login: string | null;
  is_deleted: boolean;
  metadata: Record<string, any>;
  schema_version: number;
}

interface TokenUsageByModel {
  model: string;
  tokens: number;
  cost: number;
  color: string;
}

interface MonthlyUsage {
  month: string;
  tokens: number;
  cost: number;
}

interface TokenUsageData {
  currentMonth: {
    tokens: number;
    limit: number;
    cost: number;
    costLimit: number;
  };
  historicalUsage: MonthlyUsage[];
  costBreakdownByModel: TokenUsageByModel[];
}

interface ModerationEvent {
  id: string;
  timestamp: string;
  type: 'blocked' | 'redacted' | 'warned';
  reason: string;
  prompt_preview: string;
  rule_id: string;
  rule_name: string;
}

interface ModerationHistoryData {
  events: ModerationEvent[];
  summary: {
    blocked: number;
    redacted: number;
    warned: number;
  };
}

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  User: UserRow | null;
  tokenUsageData?: TokenUsageData;
  moderationHistoryData?: ModerationHistoryData;
  onViewUsage?: (user: UserRow) => void;
  onEdit?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// ============== Mock Data (for development) ==============

const generateMockTokenUsageData = (): TokenUsageData => {
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
  return {
    currentMonth: {
      tokens: 145000,
      limit: 200000,
      cost: 14.5,
      costLimit: 25.0,
    },
    historicalUsage: months.map((month) => ({
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
  };
};

const generateMockModerationHistory = (): ModerationHistoryData => ({
  events: [
    {
      id: 'mod-001',
      timestamp: '2024-02-15T14:32:00Z',
      type: 'blocked',
      reason: 'PII detected - Social Security Number',
      prompt_preview: 'My SSN is ***-**-****...',
      rule_id: 'rule-pii-001',
      rule_name: 'PII Detection - SSN',
    },
    {
      id: 'mod-002',
      timestamp: '2024-02-14T09:15:00Z',
      type: 'redacted',
      reason: 'Email address redacted',
      prompt_preview: 'Contact me at [REDACTED]...',
      rule_id: 'rule-pii-002',
      rule_name: 'PII Detection - Email',
    },
    {
      id: 'mod-003',
      timestamp: '2024-02-13T16:45:00Z',
      type: 'warned',
      reason: 'Potential sensitive content',
      prompt_preview: 'Can you help me with confidential...',
      rule_id: 'rule-content-001',
      rule_name: 'Sensitive Content Warning',
    },
    {
      id: 'mod-004',
      timestamp: '2024-02-10T11:20:00Z',
      type: 'blocked',
      reason: 'Hard block keyword detected',
      prompt_preview: 'Generate code for [BLOCKED]...',
      rule_id: 'rule-block-001',
      rule_name: 'Hard Block Keywords',
    },
    {
      id: 'mod-005',
      timestamp: '2024-02-08T08:55:00Z',
      type: 'redacted',
      reason: 'Credit card number redacted',
      prompt_preview: 'My card number is [REDACTED]...',
      rule_id: 'rule-pii-003',
      rule_name: 'PII Detection - Financial',
    },
  ],
  summary: {
    blocked: 2,
    redacted: 2,
    warned: 1,
  },
});

// ============== Helper Components ==============

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`user-tabpanel-${index}`}
    aria-labelledby={`user-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
  </div>
);

const UsageProgressBar: React.FC<{
  current: number;
  limit: number;
  label: string;
  unit?: string;
}> = ({ current, limit, label, unit = '' }) => {
  const percentage = Math.min((current / limit) * 100, 100);
  const getColor = () => {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'primary';
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {current.toLocaleString()}
          {unit} / {limit.toLocaleString()}
          {unit}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={getColor()}
        sx={{ height: 8, borderRadius: 4 }}
      />
      <Typography
        variant="caption"
        color={percentage >= 90 ? 'error.main' : 'text.secondary'}
        sx={{ mt: 0.5, display: 'block' }}
      >
        {percentage.toFixed(1)}% used
      </Typography>
    </Box>
  );
};

const ModerationTypeChip: React.FC<{ type: ModerationEvent['type'] }> = ({ type }) => {
  const config = {
    blocked: { color: 'error' as const, icon: <BlockIcon sx={{ fontSize: 14 }} /> },
    redacted: { color: 'warning' as const, icon: <EditIcon sx={{ fontSize: 14 }} /> },
    warned: { color: 'info' as const, icon: <WarningAmberIcon sx={{ fontSize: 14 }} /> },
  };

  return (
    <Chip
      label={type}
      size="small"
      color={config[type].color}
      icon={config[type].icon}
      sx={{ textTransform: 'capitalize' }}
    />
  );
};

// ============== Main Component ==============

const UserDetails: React.FC<UserFormProps> = ({
  open,
  onClose,
  User,
  tokenUsageData: propTokenUsageData,
  moderationHistoryData: propModerationHistoryData,
  onViewUsage,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [exportUserAnchorEl, setExportUserAnchorEl] = useState<null | HTMLElement>(null);
  const [exportModerationAnchorEl, setExportModerationAnchorEl] = useState<null | HTMLElement>(null);
  const [usageDialogOpen, setUsageDialogOpen] = useState(false);

  // Use mock data if no data is provided (for development)
  const tokenUsageData = useMemo(
    () => propTokenUsageData || generateMockTokenUsageData(),
    [propTokenUsageData]
  );

  const moderationHistoryData = useMemo(
    () => propModerationHistoryData || generateMockModerationHistory(),
    [propModerationHistoryData]
  );

  if (!User) return null;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportUserToCSV = () => {
    const headers = Object.keys(User);
    const csvContent = [
      headers.join(','),
      headers
        .map((header) => {
          const value = User[header as keyof UserRow];
          if (Array.isArray(value)) {
            return `"${value.join('; ')}"`;
          }
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        })
        .join(','),
    ].join('\n');

    downloadFile(
      csvContent,
      `user_${User.user_id}_${new Date().toISOString().split('T')[0]}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  const exportUserToJSON = () => {
    const jsonContent = JSON.stringify(User, null, 2);
    downloadFile(
      jsonContent,
      `user_${User.user_id}_${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
  };

  const exportModerationToCSV = () => {
    const headers = ['ID', 'Timestamp', 'Type', 'Reason', 'Rule Name', 'Prompt Preview'];
    const rows = moderationHistoryData.events.map((event) => [
      event.id,
      new Date(event.timestamp).toLocaleString(),
      event.type,
      `"${event.reason.replace(/"/g, '""')}"`,
      event.rule_name,
      `"${event.prompt_preview.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    downloadFile(
      csvContent,
      `moderation_history_${User.user_id}_${new Date().toISOString().split('T')[0]}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  const exportModerationToJSON = () => {
    const jsonContent = JSON.stringify(
      {
        user_id: User.user_id,
        exported_at: new Date().toISOString(),
        summary: moderationHistoryData.summary,
        events: moderationHistoryData.events,
      },
      null,
      2
    );

    downloadFile(
      jsonContent,
      `moderation_history_${User.user_id}_${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
  };

  // ============== Render User Info Section ==============
  const renderUserInfo = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Avatar
          sx={{
            width: 56,
            height: 56,
            bgcolor: 'primary.main',
            fontSize: '1.2rem',
          }}
        >
          {User.display_name
            ?.split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {User.display_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {User.email}
          </Typography>
        </Box>
        {/* View Usage Button */}
        <Tooltip title="View Usage Analytics">
          <IconButton
            size="small"
            color="primary"
            onClick={() => setUsageDialogOpen(true)}
            sx={{
              bgcolor: 'primary.light',
              '&:hover': { bgcolor: 'primary.main', color: 'white' },
            }}
          >
            <BarChartIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          User ID
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {User.user_id}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Tenant ID
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {User.tenant_id}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Status
        </Typography>
        <Chip
          label={User.status}
          color={User.status === 'active' ? 'success' : 'default'}
          sx={{ textTransform: 'capitalize' }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Permissions
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {User.custom_permissions?.map((perm: string) => (
            <Chip
              key={perm}
              label={perm}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ textTransform: 'capitalize' }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Created Date
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {User.created_date ? new Date(User.created_date).toLocaleDateString() : 'N/A'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Last Login
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {User.last_login ? new Date(User.last_login).toLocaleDateString() : 'Never'}
        </Typography>
      </Box>
    </Box>
  );

  // ============== Render Token Usage Section ==============
  const renderTokenUsage = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Current Month Usage */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Current Month Usage
          </Typography>
          <UsageProgressBar
            current={tokenUsageData.currentMonth.tokens}
            limit={tokenUsageData.currentMonth.limit}
            label="Tokens"
          />
          <UsageProgressBar
            current={tokenUsageData.currentMonth.cost}
            limit={tokenUsageData.currentMonth.costLimit}
            label="Cost"
            unit=" USD"
          />
        </CardContent>
      </Card>

      {/* Historical Usage Chart */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Historical Usage (Last 6 Months)
          </Typography>
          <Box sx={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tokenUsageData.historicalUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" stroke="#1976d2" />
                <YAxis yAxisId="right" orientation="right" stroke="#2e7d32" />
                <RechartsTooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="tokens"
                  fill="#1976d2"
                  name="Tokens"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="cost"
                  fill="#2e7d32"
                  name="Cost ($)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Cost Breakdown by Model */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Cost Breakdown by Model
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ width: 180, height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tokenUsageData.costBreakdownByModel}
                    dataKey="cost"
                    nameKey="model"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={40}
                  >
                    {tokenUsageData.costBreakdownByModel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ flex: 1 }}>
              {tokenUsageData.costBreakdownByModel.map((item) => (
                <Box
                  key={item.model}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 0.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: item.color,
                      }}
                    />
                    <Typography variant="body2">{item.model}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight={500}>
                      ${item.cost.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.tokens.toLocaleString()} tokens
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  // ============== Render Moderation History Section ==============
  const renderModerationHistory = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Card variant="outlined" sx={{ flex: 1, bgcolor: 'error.lighter' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="h5" color="error.main" fontWeight={600}>
              {moderationHistoryData.summary.blocked}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Blocked
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ flex: 1, bgcolor: 'warning.lighter' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="h5" color="warning.main" fontWeight={600}>
              {moderationHistoryData.summary.redacted}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Redacted
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ flex: 1, bgcolor: 'info.lighter' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="h5" color="info.main" fontWeight={600}>
              {moderationHistoryData.summary.warned}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Warned
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Export Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadIcon />}
          endIcon={<ArrowDropDownIcon />}
          onClick={(e) => setExportModerationAnchorEl(e.currentTarget)}
        >
          Export History
        </Button>
        <Menu
          anchorEl={exportModerationAnchorEl}
          open={Boolean(exportModerationAnchorEl)}
          onClose={() => setExportModerationAnchorEl(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          slotProps={{ paper: { elevation: 3, sx: { minWidth: 190, borderRadius: 2, mt: -0.5 } } }}
        >
          <MenuItem onClick={() => { exportModerationToCSV(); setExportModerationAnchorEl(null); }}>
            <ListItemIcon><TableChartIcon fontSize="small" color="primary" /></ListItemIcon>
            <ListItemText
              primary="Export as CSV"
              secondary="Spreadsheet format"
              slotProps={{ secondary: { style: { fontSize: 11 } } }}
            />
          </MenuItem>
          <MenuItem onClick={() => { exportModerationToJSON(); setExportModerationAnchorEl(null); }}>
            <ListItemIcon><DataObjectIcon fontSize="small" color="secondary" /></ListItemIcon>
            <ListItemText
              primary="Export as JSON"
              secondary="Structured data format"
              slotProps={{ secondary: { style: { fontSize: 11 } } }}
            />
          </MenuItem>
        </Menu>
      </Box>

      {/* Events Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Rule</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {moderationHistoryData.events.map((event) => (
              <TableRow key={event.id} hover>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(event.timestamp).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <ModerationTypeChip type={event.type} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                    {event.reason}
                  </Typography>
                  <Tooltip title={event.prompt_preview}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'help',
                      }}
                    >
                      {event.prompt_preview}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{event.rule_name}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="user details tabs">
              <Tab label="Overview" id="user-tab-0" aria-controls="user-tabpanel-0" />
              <Tab label="Token Usage" id="user-tab-1" aria-controls="user-tabpanel-1" />
              <Tab label="Moderation History" id="user-tab-2" aria-controls="user-tabpanel-2" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            {renderUserInfo()}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            {renderTokenUsage()}
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            {renderModerationHistory()}
          </TabPanel>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          {onEdit && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => { onEdit(); onClose(); }}
            >
              Edit User
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            endIcon={<ArrowDropDownIcon />}
            onClick={(e) => setExportUserAnchorEl(e.currentTarget)}
          >
            Export User
          </Button>
          <Menu
            anchorEl={exportUserAnchorEl}
            open={Boolean(exportUserAnchorEl)}
            onClose={() => setExportUserAnchorEl(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            slotProps={{ paper: { elevation: 3, sx: { minWidth: 190, borderRadius: 2, mt: -0.5 } } }}
          >
            <MenuItem onClick={() => { exportUserToCSV(); setExportUserAnchorEl(null); }}>
              <ListItemIcon><TableChartIcon fontSize="small" color="primary" /></ListItemIcon>
              <ListItemText
                primary="Export as CSV"
                secondary="Spreadsheet format"
                slotProps={{ secondary: { style: { fontSize: 11 } } }}
              />
            </MenuItem>
            <MenuItem onClick={() => { exportUserToJSON(); setExportUserAnchorEl(null); }}>
              <ListItemIcon><DataObjectIcon fontSize="small" color="secondary" /></ListItemIcon>
              <ListItemText
                primary="Export as JSON"
                secondary="Structured data format"
                slotProps={{ secondary: { style: { fontSize: 11 } } }}
              />
            </MenuItem>
          </Menu>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* User Usage History Dialog */}
      <Dialog
        open={usageDialogOpen}
        onClose={() => setUsageDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">User Usage Analytics</Typography>
          <IconButton onClick={() => setUsageDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <UserUsageHistory user={User} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserDetails;