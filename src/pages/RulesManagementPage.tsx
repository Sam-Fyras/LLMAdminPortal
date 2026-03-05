import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import {
  getRules,
  createRule,
  updateRule,
  deleteRule,
  toggleRuleStatus,
} from '../api/rules';
import { TenantRule } from '../types/rule';
import { useAuth } from '../context/AuthContext';
import { RuleList, RuleForm, RuleTestPanel } from '../components/rules';

const RulesManagementPage: React.FC = () => {
  const { account } = useAuth();
  const tenantId = account?.tenantId ?? '';

  // State
  const [rules, setRules] = useState<TenantRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TenantRule | null>(null);

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Test panel
  const [testPanelOpen, setTestPanelOpen] = useState(false);
  const [testRuleId, setTestRuleId] = useState<string | null>(null);

  // Load rules
  const loadRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRules(tenantId);
      setRules(response.data);
    } catch (err) {
      setError('Failed to load rules. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { if (tenantId) loadRules(); }, [tenantId, loadRules]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleCreateRule = () => {
    setEditingRule(null);
    setFormOpen(true);
  };

  const handleEditRule = (rule: TenantRule) => {
    setEditingRule(rule);
    setFormOpen(true);
  };

  const handleDuplicateRule = (rule: TenantRule) => {
    const duplicated: TenantRule = {
      ...rule,
      id: '',
      name: `${rule.name} (Copy)`,
      enabled: false,
      priority: rule.priority + 1,
    };
    setEditingRule(duplicated);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteRule(tenantId, deleteTargetId);
      setRules(rules.filter(rule => rule.id !== deleteTargetId));
    } catch (err) {
      setError('Failed to delete rule. Please try again later.');
      console.error(err);
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
    }
  };

  const handleToggleStatus = async (id: string, enabled: boolean) => {
    try {
      await toggleRuleStatus(tenantId, id, enabled);
      setRules(rules.map(rule => rule.id === id ? { ...rule, enabled } : rule));
    } catch (err) {
      setError('Failed to update rule status. Please try again later.');
      console.error(err);
    }
  };

  const handleTestRule = (ruleId: string) => {
    setTestRuleId(ruleId);
    setTestPanelOpen(true);
  };

  const handleSaveRule = async (ruleData: Partial<TenantRule>, ruleEditingRef: TenantRule | null) => {
    try {
      if (ruleEditingRef && ruleEditingRef.id) {
        const response = await updateRule(tenantId, ruleEditingRef.id, ruleData);
        setRules(rules.map(rule => rule.id === ruleEditingRef.id ? response.data : rule));
      } else {
        const response = await createRule(tenantId, ruleData as any);
        setRules([...rules, response.data]);
      }
      setFormOpen(false);
    } catch (err) {
      setError('Failed to save rule. Please try again later.');
      console.error(err);
    }
  };

  const handleReorderRules = (draggedId: string, droppedOnId: string) => {
    const fromIndex = rules.findIndex(r => r.id === draggedId);
    const toIndex = rules.findIndex(r => r.id === droppedOnId);
    if (fromIndex === -1 || toIndex === -1) return;
    const reordered = [...rules];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setRules(reordered.map((rule, idx) => ({ ...rule, priority: idx + 1 })));
  };

  const getDeleteTargetName = () =>
    rules.find(r => r.id === deleteTargetId)?.name || 'this rule';

  // ============================================================================
  // Render
  // ============================================================================

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Rule Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateRule}>
          Create New Rule
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Rules List with Filters */}
      <RuleList
        rules={rules}
        onEdit={handleEditRule}
        onDelete={handleDeleteClick}
        onDuplicate={handleDuplicateRule}
        onToggleStatus={handleToggleStatus}
        onTest={handleTestRule}
        onReorder={handleReorderRules}
      />

      {/* Create/Edit Rule Dialog */}
      <RuleForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveRule}
        editingRule={editingRule}
      />

      {/* Rule Test Panel */}
      <RuleTestPanel
        open={testPanelOpen}
        onClose={() => setTestPanelOpen(false)}
        rules={rules}
        preselectedRuleId={testRuleId}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Rule</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{getDeleteTargetName()}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RulesManagementPage;
