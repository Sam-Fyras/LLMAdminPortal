import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel,
  CircularProgress, Alert, Chip, SelectChangeEvent, Tabs, Tab
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { fetchRoles, createRole, updateRole, deleteRole } from '../api/users';
import { Role } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`role-tabpanel-${index}`}
      aria-labelledby={`role-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const UserRoleManagementPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dailyTokenLimit: 10000,
    monthlyTokenLimit: 100000,
    allowedModels: ['gpt-3.5-turbo']
  });
  
  useEffect(() => {
    loadRoles();
  }, []);
  
  const loadRoles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchRoles();
      setRoles(response.data);
    } catch (err) {
      setError('Failed to load roles. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateRole = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      dailyTokenLimit: 10000,
      monthlyTokenLimit: 100000,
      allowedModels: ['gpt-3.5-turbo']
    });
    setOpenDialog(true);
  };
  
  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      dailyTokenLimit: role.tokenLimits.daily,
      monthlyTokenLimit: role.tokenLimits.monthly,
      allowedModels: role.allowedModels
    });
    setOpenDialog(true);
  };
  
  const handleDeleteRole = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole(id);
        setRoles(roles.filter(role => role.id !== id));
      } catch (err) {
        setError('Failed to delete role. Please try again later.');
        console.error(err);
      }
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseInt(value, 10) });
  };
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleSaveRole = async () => {
    try {
      const roleData = {
        name: formData.name,
        description: formData.description,
        tokenLimits: {
          daily: formData.dailyTokenLimit,
          monthly: formData.monthlyTokenLimit
        },
        allowedModels: formData.allowedModels
      };
      
      if (editingRole) {
        const response = await updateRole(editingRole.id, roleData);
        setRoles(roles.map(role => 
          role.id === editingRole.id ? response.data : role
        ));
      } else {
        const response = await createRole(roleData);
        setRoles([...roles, response.data]);
      }
      
      setOpenDialog(false);
    } catch (err) {
      setError('Failed to save role. Please try again later.');
      console.error(err);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="user management tabs">
          <Tab label="Roles" id="role-tab-0" aria-controls="role-tabpanel-0" />
          <Tab label="Users" id="role-tab-1" aria-controls="role-tabpanel-1" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Role Management
          </Typography>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateRole}
          >
            Create New Role
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Daily Token Limit</TableCell>
                <TableCell>Monthly Token Limit</TableCell>
                <TableCell>Allowed Models</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No roles found. Create your first role to get started.
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>{role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>{role.tokenLimits.daily.toLocaleString()}</TableCell>
                    <TableCell>{role.tokenLimits.monthly.toLocaleString()}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {role.allowedModels.map((model) => (
                          <Chip key={model} label={model} size="small" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        onClick={() => handleEditRole(role)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Typography variant="h6" color="text.secondary">
            User management will be implemented in the next phase.
          </Typography>
        </Box>
      </TabPanel>
      
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRole ? 'Edit Role' : 'Create New Role'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Role Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={2}
            />
            
            <TextField
              fullWidth
              label="Daily Token Limit"
              name="dailyTokenLimit"
              type="number"
              value={formData.dailyTokenLimit}
              onChange={handleNumberChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Monthly Token Limit"
              name="monthlyTokenLimit"
              type="number"
              value={formData.monthlyTokenLimit}
              onChange={handleNumberChange}
              margin="normal"
              required
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Allowed Models</InputLabel>
              <Select
                multiple
                name="allowedModels"
                value={formData.allowedModels}
                onChange={(e) => setFormData({
                  ...formData,
                  allowedModels: e.target.value as unknown as string[]
                })}
                label="Allowed Models"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                <MenuItem value="gpt-4">GPT-4</MenuItem>
                <MenuItem value="gpt-4-turbo">GPT-4 Turbo</MenuItem>
                <MenuItem value="claude-3-opus">Claude 3 Opus</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveRole} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserRoleManagementPage;
