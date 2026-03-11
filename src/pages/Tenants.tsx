import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Search, Add, MoreVert, Edit, Delete } from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import TableChartIcon from '@mui/icons-material/TableChart';
import DataObjectIcon from '@mui/icons-material/DataObject';
import { tenantListData, TenantRow, TenantStatus } from '../mocks/data/tenantList';
import TenantForm from '../components/tenants/TenantForm';
import TenantDetail from '../components/tenants/TenantDetail';

const STATUS_COLORS: Record<TenantStatus, 'success' | 'default' | 'error'> = {
  active: 'success',
  inactive: 'default',
  suspended: 'error',
};

const TIER_COLORS: Record<string, 'warning' | 'primary' | 'default'> = {
  Enterprise: 'warning',
  Pro: 'primary',
  Free: 'default',
};

function TenantsPage() {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [openForm, setOpenForm] = useState(false);
  const [editTenant, setEditTenant] = useState<TenantRow | null>(null);
  const [detailTenant, setDetailTenant] = useState<TenantRow | null>(null);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
  const [actionTenant, setActionTenant] = useState<TenantRow | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTenants(tenantListData);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (query: string) => {
    const q = query.toLowerCase();
    setTenants(
      tenantListData.filter(
        (t) =>
          t.tenant_name.toLowerCase().includes(q) ||
          t.tenant_admin.email.toLowerCase().includes(q) ||
          t.tenant_id.toLowerCase().includes(q)
      )
    );
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setTenants(
      status === 'ALL'
        ? tenantListData
        : tenantListData.filter((t) => t.status === status)
    );
  };

  const handleActionOpen = (e: React.MouseEvent<HTMLElement>, tenant: TenantRow) => {
    e.stopPropagation();
    setActionAnchorEl(e.currentTarget);
    setActionTenant(tenant);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setActionTenant(null);
  };

  const handleEdit = (tenant?: TenantRow) => {
    setEditTenant(tenant ?? actionTenant);
    setOpenForm(true);
    handleActionClose();
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setEditTenant(null);
  };

  const exportToCSV = () => {
    if (tenants.length === 0) return;
    const rows = tenants.map((t) => ({
      tenant_id: t.tenant_id,
      tenant_name: t.tenant_name,
      admin_name: t.tenant_admin.name,
      admin_email: t.tenant_admin.email,
      tier: t.tier_id,
      status: t.status,
      llm_use: t.llm_use,
      token_count: t.token_count,
      firewall_version: t.firewall_version_id,
      created_date: t.created_date,
    }));
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map((r) =>
        headers.map((h) => {
          const val = String(r[h as keyof typeof r]);
          return val.includes(',') ? `"${val}"` : val;
        }).join(',')
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `tenants_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    if (tenants.length === 0) return;
    const blob = new Blob([JSON.stringify(tenants, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `tenants_export_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={260} height={44} />
            <Skeleton variant="text" width={320} height={24} />
          </Box>
          <Skeleton variant="rounded" width={130} height={36} />
        </Box>
        <Skeleton variant="rounded" height={64} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={400} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Tenant Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all tenants, their subscriptions, and access.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenForm(true)}>
          Add Tenant
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'nowrap' }}>
        <TextField
          placeholder="Search tenants..."
          size="small"
          sx={{ minWidth: 250, flexGrow: 1 }}
          onChange={(e) => handleSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          endIcon={<ArrowDropDownIcon />}
          onClick={(e) => setExportAnchorEl(e.currentTarget)}
        >
          Export
        </Button>
        <Menu
          anchorEl={exportAnchorEl}
          open={Boolean(exportAnchorEl)}
          onClose={() => setExportAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { elevation: 3, sx: { minWidth: 190, borderRadius: 2, mt: 0.5 } } }}
        >
          <MenuItem onClick={() => { exportToCSV(); setExportAnchorEl(null); }}>
            <ListItemIcon><TableChartIcon fontSize="small" color="primary" /></ListItemIcon>
            <ListItemText primary="Export as CSV" secondary="Spreadsheet format" slotProps={{ secondary: { style: { fontSize: 11 } } }} />
          </MenuItem>
          <MenuItem onClick={() => { exportToJSON(); setExportAnchorEl(null); }}>
            <ListItemIcon><DataObjectIcon fontSize="small" color="secondary" /></ListItemIcon>
            <ListItemText primary="Export as JSON" secondary="Structured data format" slotProps={{ secondary: { style: { fontSize: 11 } } }} />
          </MenuItem>
        </Menu>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Tenant Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tenant ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Admin</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tier</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>LLM Model</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No tenants found.
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => (
                <TableRow
                  key={tenant.id}
                  hover
                  onClick={() => setDetailTenant(tenant)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{tenant.tenant_name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: 12, fontFamily: 'monospace' }}>
                    {tenant.tenant_id}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{tenant.tenant_admin.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{tenant.tenant_admin.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tenant.tier_id}
                      size="small"
                      color={TIER_COLORS[tenant.tier_id] ?? 'default'}
                      sx={{ fontWeight: 600, fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                      size="small"
                      color={STATUS_COLORS[tenant.status]}
                      sx={{ fontWeight: 600, fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{tenant.llm_use}</TableCell>
                  <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {new Date(tenant.created_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Actions">
                      <IconButton size="small" onClick={(e) => handleActionOpen(e, tenant)}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Row action menu */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { elevation: 3, sx: { minWidth: 160, borderRadius: 2, mt: 0.5 } } }}
      >
        <MenuItem onClick={() => handleEdit()}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>
        <MenuItem onClick={handleActionClose} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>

      {/* Detail Drawer */}
      <TenantDetail
        tenant={detailTenant}
        open={Boolean(detailTenant)}
        onClose={() => setDetailTenant(null)}
        onEdit={(t) => handleEdit(t)}
      />

      {/* Add / Edit Form */}
      <TenantForm
        open={openForm}
        onClose={handleFormClose}
        editTenant={editTenant ? {
          tenant_name: editTenant.tenant_name,
          admin_name: editTenant.tenant_admin.name,
          admin_email: editTenant.tenant_admin.email,
          azure_tenant_id: editTenant.azure_ad_tenant_id,
          azure_client_id: editTenant.azure_ad_client_id,
          tier_name: editTenant.tier_id,
          firewall_version: editTenant.firewall_version_id,
          llm_model: editTenant.llm_use,
          token_count: editTenant.token_count,
          mongo_url: editTenant.mongo_url,
          status: editTenant.status,
          is_active: editTenant.is_active,
        } : null}
      />
    </Box>
  );
}

export default TenantsPage;
