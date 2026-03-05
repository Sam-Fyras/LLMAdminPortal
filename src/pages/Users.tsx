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
  Menu,
  ListItemIcon,
  ListItemText,
  Paper,
  Skeleton,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import TableChartIcon from '@mui/icons-material/TableChart';
import DataObjectIcon from '@mui/icons-material/DataObject';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForm';
import { userTableData, UserRow } from '../mocks/data/users';

function UsersPage() {
  const [openForm, setOpenForm] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [searchUser, setSearchUser] = useState<UserRow[]>([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchUser(userTableData);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleEdit = (user: UserRow) => {
    setEditUser(user);
    setOpenForm(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setEditUser(null);
  };

  const filterUser = (e: string) => {
    const filtered = userTableData.filter(
      (user) =>
        user.display_name?.toLowerCase().includes(e?.toLowerCase() ?? '') ||
        user.email?.toLowerCase().includes(e?.toLowerCase() ?? '')
    );
    setSearchUser(filtered);
  };

  const filterbyrole = (role: string) => {
    const filtered =
      role.toLowerCase() === 'all'
        ? userTableData
        : userTableData.filter(
            (user) => user.role?.toLowerCase() === role.toLowerCase()
          );
    setSearchUser(filtered);
  };

  const exportToCSV = () => {
    if (searchUser.length === 0) {
      console.warn('No users to export');
      return;
    }

    const headers = Object.keys(searchUser[0]);

    const csvContent = [
      headers.join(','),
      ...searchUser.map((user) =>
        headers
          .map((header) => {
            const value = user[header as keyof typeof user];
            if (
              typeof value === 'string' &&
              (value.includes(',') || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `users_export_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (searchUser.length === 0) {
      console.warn('No users to export');
      return;
    }

    const jsonContent = JSON.stringify(searchUser, null, 2);

    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `users_export_${new Date().toISOString().split('T')[0]}.json`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={220} height={44} />
            <Skeleton variant="text" width={300} height={24} />
          </Box>
          <Skeleton variant="rounded" width={110} height={36} />
        </Box>
        <Skeleton variant="rounded" height={64} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={400} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Users Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage user access, roles, and token limits.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setOpenForm(true)}
        >
          Add User
        </Button>
      </Box>
      <Paper
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'nowrap',
        }}
      >
        <TextField
          placeholder="Search..."
          size="small"
          sx={{ minWidth: 250, flexGrow: 1 }}
          onChange={(e) => filterUser(e.target.value)}
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
          <InputLabel id="role-filter-label">Filter by Role</InputLabel>
          <Select
            labelId="role-filter-label"
            id="role-filter"
            label="Filter by Role"
            value={roleFilter}
            onChange={(e) => {
              const role = e.target.value;
              setRoleFilter(role);
              filterbyrole(role);
            }}
          >
            <MenuItem value="ALL">All Roles</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="DEVELOPER">Developer</MenuItem>
            <MenuItem value="VIEWER">Viewer</MenuItem>
            <MenuItem value="USER">User</MenuItem>
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
          slotProps={{
            paper: { elevation: 3, sx: { minWidth: 190, borderRadius: 2, mt: 0.5 } },
          }}
        >
          <MenuItem
            onClick={() => {
              exportToCSV();
              setExportAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <TableChartIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Export as CSV"
              secondary="Spreadsheet format"
              slotProps={{ secondary: { style: { fontSize: 11 } } }}
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              exportToJSON();
              setExportAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <DataObjectIcon fontSize="small" color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="Export as JSON"
              secondary="Structured data format"
              slotProps={{ secondary: { style: { fontSize: 11 } } }}
            />
          </MenuItem>
        </Menu>
      </Paper>
      <UserList searchUser={searchUser} role={roleFilter} onEdit={handleEdit} />
      <UserForm
        open={openForm}
        onClose={handleFormClose}
        editUser={editUser}
        existingEmails={userTableData.map((u) => u.email)}
      />
    </Box>
  );
}

export default UsersPage;
