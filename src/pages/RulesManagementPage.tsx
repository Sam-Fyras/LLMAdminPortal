import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Switch, FormControlLabel, CircularProgress, Alert,
  Chip, SelectChangeEvent
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { fetchRules, createRule, updateRule, deleteRule, toggleRuleStatus } from '../api/rules';
import { Rule } from '../types';

const RulesManagementPage: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [ruleType, setRuleType] = useState<'token_limit' | 'model_restriction' | 'rate_limit'>('token_limit');
  const [formData, setFormData] = useState({
    name: '',
    action: 'block',
    priority: 1,
    enabled: true,
    // Token limit fields
    limit_type: 'daily',
    max_tokens: 10000,
    // Model restriction fields
    restriction_type: 'allowlist',
    models: ['gpt-3.5-turbo'],
    // Rate limit fields
    requests_per_minute: 10,
    requests_per_hour: 100,
    scope: 'user',
    // Common fields
    block_message: 'Request blocked by policy'
  });
  
  useEffect(() => {
    loadRules();
  }, []);
  
  const loadRules = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchRules();
      setRules(response.data);
    } catch (err) {
      setError('Failed to load rules. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateRule = () => {
    setEditingRule(null);
    setRuleType('token_limit');
    setFormData({
      name: '',
      action: 'block',
      priority: 1,
      enabled: true,
      limit_type: 'daily',
      max_tokens: 10000,
      restriction_type: 'allowlist',
      models: ['gpt-3.5-turbo'],
      requests_per_minute: 10,
      requests_per_hour: 100,
      scope: 'user',
      block_message: 'Request blocked by policy'
    });
    setOpenDialog(true);
  };
  
  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setRuleType(rule.type);
    
    // Set form data based on rule type
    const baseData = {
      name: rule.name,
      action: rule.action,
      priority: rule.priority,
      enabled: rule.enabled,
      block_message: rule.parameters.block_message || 'Request blocked by policy'
    };
    
    if (rule.type === 'token_limit') {
      const conditions = rule.conditions as any;
      setFormData({
        ...baseData,
        limit_type: conditions.limit_type,
        max_tokens: conditions.max_tokens,
        restriction_type: 'allowlist',
        models: ['gpt-3.5-turbo'],
        requests_per_minute: 10,
        requests_per_hour: 100,
        scope: 'user'
      });
    } else if (rule.type === 'model_restriction') {
      const conditions = rule.conditions as any;
      setFormData({
        ...baseData,
        restriction_type: conditions.restriction_type,
        models: conditions.models,
        limit_type: 'daily',
        max_tokens: 10000,
        requests_per_minute: 10,
        requests_per_hour: 100,
        scope: 'user'
      });
    } else if (rule.type === 'rate_limit') {
      const conditions = rule.conditions as any;
      setFormData({
        ...baseData,
        requests_per_minute: conditions.requests_per_minute || 10,
        requests_per_hour: conditions.requests_per_hour || 100,
        scope: conditions.scope,
        limit_type: 'daily',
        max_tokens: 10000,
        restriction_type: 'allowlist',
        models: ['gpt-3.5-turbo']
      });
    }
    
    setOpenDialog(true);
  };
  
  const handleDeleteRule = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        await deleteRule(id);
        setRules(rules.filter(rule => rule.id !== id));
      } catch (err) {
        setError('Failed to delete rule. Please try again later.');
        console.error(err);
      }
    }
  };
  
  const handleToggleRuleStatus = async (id: string, enabled: boolean) => {
    try {
      await toggleRuleStatus(id, enabled);
      setRules(rules.map(rule => 
        rule.id === id ? { ...rule, enabled } : rule
      ));
    } catch (err) {
      setError('Failed to update rule status. Please try again later.');
      console.error(err);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseInt(value, 10) });
  };
  
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };
  
  const handleRuleTypeChange = (e: SelectChangeEvent<string>) => {
    setRuleType(e.target.value as any);
  };
  
  const handleSaveRule = async () => {
    try {
      let ruleData: any = {
        name: formData.name,
        type: ruleType,
        action: formData.action,
        priority: formData.priority,
        enabled: formData.enabled,
        conditions: {},
        parameters: {
          block_message: formData.block_message
        }
      };
      
      // Set conditions based on rule type
      if (ruleType === 'token_limit') {
        ruleData.conditions = {
          limit_type: formData.limit_type,
          max_tokens: formData.max_tokens
        };
      } else if (ruleType === 'model_restriction') {
        ruleData.conditions = {
          restriction_type: formData.restriction_type,
          models: formData.models
        };
      } else if (ruleType === 'rate_limit') {
        ruleData.conditions = {
          requests_per_minute: formData.requests_per_minute,
          requests_per_hour: formData.requests_per_hour,
          scope: formData.scope
        };
      }
      
      if (editingRule) {
        const response = await updateRule(editingRule.id, ruleData);
        setRules(rules.map(rule => 
          rule.id === editingRule.id ? response.data : rule
        ));
      } else {
        const response = await createRule(ruleData);
        setRules([...rules, response.data]);
      }
      
      setOpenDialog(false);
    } catch (err) {
      setError('Failed to save rule. Please try again later.');
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Rule Management
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreateRule}
        >
          Create New Rule
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
              <TableCell>Type</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No rules found. Create your first rule to get started.
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>{rule.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={rule.type.replace('_', ' ')} 
                      color={
                        rule.type === 'token_limit' ? 'primary' :
                        rule.type === 'model_restriction' ? 'secondary' : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{rule.priority}</TableCell>
                  <TableCell>
                    <Switch
                      checked={rule.enabled}
                      onChange={(e) => handleToggleRuleStatus(rule.id, e.target.checked)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={rule.action} 
                      color={rule.action === 'block' ? 'error' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      onClick={() => handleEditRule(rule)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteRule(rule.id)}
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
      
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRule ? 'Edit Rule' : 'Create New Rule'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Rule Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Rule Type</InputLabel>
              <Select
                value={ruleType}
                onChange={handleRuleTypeChange}
                label="Rule Type"
              >
                <MenuItem value="token_limit">Token Limit</MenuItem>
                <MenuItem value="model_restriction">Model Restriction</MenuItem>
                <MenuItem value="rate_limit">Rate Limit</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 2 }}>
              {ruleType === 'token_limit' && (
                <>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Limit Type</InputLabel>
                    <Select
                      name="limit_type"
                      value={formData.limit_type}
                      onChange={handleSelectChange}
                      label="Limit Type"
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="hourly">Hourly</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    label="Max Tokens"
                    name="max_tokens"
                    type="number"
                    value={formData.max_tokens}
                    onChange={handleNumberChange}
                    margin="normal"
                    required
                  />
                </>
              )}
              
              {ruleType === 'model_restriction' && (
                <>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Restriction Type</InputLabel>
                    <Select
                      name="restriction_type"
                      value={formData.restriction_type}
                      onChange={handleSelectChange}
                      label="Restriction Type"
                    >
                      <MenuItem value="allowlist">Allowlist (only allow specified models)</MenuItem>
                      <MenuItem value="blocklist">Blocklist (block specified models)</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Models</InputLabel>
                    <Select
                      multiple
                      name="models"
                      value={formData.models}
                      onChange={(e) => setFormData({
                        ...formData,
                        models: e.target.value as unknown as string[]
                      })}
                      label="Models"
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
                </>
              )}
              
              {ruleType === 'rate_limit' && (
                <>
                  <TextField
                    fullWidth
                    label="Requests Per Minute"
                    name="requests_per_minute"
                    type="number"
                    value={formData.requests_per_minute}
                    onChange={handleNumberChange}
                    margin="normal"
                    required
                  />
                  
                  <TextField
                    fullWidth
                    label="Requests Per Hour"
                    name="requests_per_hour"
                    type="number"
                    value={formData.requests_per_hour}
                    onChange={handleNumberChange}
                    margin="normal"
                    required
                  />
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Scope</InputLabel>
                    <Select
                      name="scope"
                      value={formData.scope}
                      onChange={handleSelectChange}
                      label="Scope"
                    >
                      <MenuItem value="user">Per User</MenuItem>
                      <MenuItem value="tenant">Per Tenant</MenuItem>
                    </Select>
                  </FormControl>
                </>
              )}
            </Box>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Action</InputLabel>
              <Select
                name="action"
                value={formData.action}
                onChange={handleSelectChange}
                label="Action"
              >
                <MenuItem value="block">Block</MenuItem>
                <MenuItem value="alert">Alert Only</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Priority"
              name="priority"
              type="number"
              value={formData.priority}
              onChange={handleNumberChange}
              margin="normal"
              required
              helperText="Lower numbers = higher priority"
            />
            
            <TextField
              fullWidth
              label="Block Message"
              name="block_message"
              value={formData.block_message}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={2}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.enabled}
                  onChange={handleSwitchChange}
                  name="enabled"
                  color="primary"
                />
              }
              label="Enabled"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveRule} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RulesManagementPage;
