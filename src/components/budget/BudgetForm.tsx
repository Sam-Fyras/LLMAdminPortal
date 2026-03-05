import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Switch,
  Divider,
  Typography,
  InputAdornment,
  SelectChangeEvent,
} from '@mui/material';
import { Budget, BudgetFormValues, BudgetPeriod, BudgetScope } from '../../types/budget';

// ============================================================================
// Defaults & Validation
// ============================================================================

const DEFAULT_FORM: BudgetFormValues = {
  scope: 'organization',
  targetId: '',
  period: 'monthly',
  tokenCap: undefined,
  costCap: undefined,
  alertThresholds: {
    warning: 80,
    critical: 90,
    block: 100,
  },
  blockRequestsOnLimit: true,
};

interface FormErrors {
  costCap?: string;
  tokenCap?: string;
  warning?: string;
  critical?: string;
  block?: string;
}

const validate = (form: BudgetFormValues): FormErrors => {
  const errors: FormErrors = {};

  if (form.costCap !== undefined && form.costCap <= 0) {
    errors.costCap = 'Cost cap must be a positive number';
  }
  if (form.tokenCap !== undefined && form.tokenCap <= 0) {
    errors.tokenCap = 'Token cap must be a positive number';
  }
  if (!form.costCap && !form.tokenCap) {
    errors.costCap = 'At least one of Cost Cap or Token Cap is required';
  }

  const { warning, critical, block } = form.alertThresholds;
  if (warning <= 0 || warning >= 100) errors.warning = 'Must be between 1 and 99';
  if (critical <= warning)             errors.critical = `Must be greater than warning (${warning}%)`;
  if (block < critical)                errors.block = `Must be ≥ critical (${critical}%)`;

  return errors;
};

// ============================================================================
// Props
// ============================================================================

interface BudgetFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: BudgetFormValues, editingBudget: Budget | null) => void;
  editingBudget: Budget | null;
}

// ============================================================================
// Component
// ============================================================================

export const BudgetForm: React.FC<BudgetFormProps> = ({
  open,
  onClose,
  onSave,
  editingBudget,
}) => {
  const [form, setForm] = useState<BudgetFormValues>({ ...DEFAULT_FORM });
  const [inheritFromOrg, setInheritFromOrg] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Populate form when editing
  useEffect(() => {
    if (!open) return;
    if (editingBudget) {
      setForm({
        scope: editingBudget.scope,
        targetId: editingBudget.targetId ?? '',
        period: editingBudget.period,
        tokenCap: editingBudget.tokenCap,
        costCap: editingBudget.costCap,
        alertThresholds: { ...editingBudget.alertThresholds },
        blockRequestsOnLimit: editingBudget.blockRequestsOnLimit,
      });
      setInheritFromOrg(false);
    } else {
      setForm({ ...DEFAULT_FORM });
      setInheritFromOrg(false);
    }
    setErrors({});
  }, [open, editingBudget]);

  // Field helpers
  const setField = <K extends keyof BudgetFormValues>(key: K, value: BudgetFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const setThreshold = (key: keyof BudgetFormValues['alertThresholds'], raw: string) => {
    const value = parseFloat(raw) || 0;
    setForm((prev) => ({
      ...prev,
      alertThresholds: { ...prev.alertThresholds, [key]: value },
    }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleScopeChange = (e: SelectChangeEvent<BudgetScope>) => {
    const scope = e.target.value as BudgetScope;
    setField('scope', scope);
    if (scope === 'organization') setField('targetId', '');
  };

  const handleSave = () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const payload: BudgetFormValues = {
      ...form,
      tokenCap: inheritFromOrg ? undefined : form.tokenCap,
      costCap: inheritFromOrg ? undefined : form.costCap,
    };
    onSave(payload, editingBudget);
  };

  const isUserOrTeam = form.scope !== 'organization';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingBudget ? 'Edit Budget' : 'Configure Budget'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          {/* Scope & Period */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Scope</InputLabel>
              <Select value={form.scope} onChange={handleScopeChange} label="Scope">
                <MenuItem value="organization">Organization</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="team">Team</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={form.period}
                onChange={(e) => setField('period', e.target.value as BudgetPeriod)}
                label="Period"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Target ID — only for user/team scope */}
          {isUserOrTeam && (
            <TextField
              fullWidth
              label={form.scope === 'user' ? 'User ID' : 'Team ID'}
              value={form.targetId ?? ''}
              onChange={(e) => setField('targetId', e.target.value)}
              placeholder={`Enter ${form.scope} ID`}
              helperText="Leave blank to apply as a default for all users/teams"
            />
          )}

          <Divider />

          {/* Caps */}
          <Typography variant="subtitle2" color="text.secondary">
            Budget Caps
          </Typography>

          {isUserOrTeam && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={inheritFromOrg}
                  onChange={(e) => setInheritFromOrg(e.target.checked)}
                />
              }
              label="Inherit caps from organization default"
            />
          )}

          {!inheritFromOrg && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label={`${form.period.charAt(0).toUpperCase() + form.period.slice(1)} Cost Cap`}
                type="number"
                value={form.costCap ?? ''}
                onChange={(e) =>
                  setField('costCap', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                inputProps={{ min: 0.01, step: 0.01 }}
                error={!!errors.costCap}
                helperText={errors.costCap ?? 'Max USD spend this period'}
              />
              <TextField
                fullWidth
                label="Token Cap"
                type="number"
                value={form.tokenCap ?? ''}
                onChange={(e) =>
                  setField('tokenCap', e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
                inputProps={{ min: 1, step: 1000 }}
                error={!!errors.tokenCap}
                helperText={errors.tokenCap ?? 'Max tokens this period'}
              />
            </Box>
          )}

          <Divider />

          {/* Alert Thresholds */}
          <Typography variant="subtitle2" color="text.secondary">
            Alert Thresholds (% of cap)
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Warning"
              type="number"
              value={form.alertThresholds.warning}
              onChange={(e) => setThreshold('warning', e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              inputProps={{ min: 1, max: 99, step: 5 }}
              error={!!errors.warning}
              helperText={errors.warning ?? 'Default 80%'}
            />
            <TextField
              fullWidth
              label="Critical"
              type="number"
              value={form.alertThresholds.critical}
              onChange={(e) => setThreshold('critical', e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              inputProps={{ min: 1, max: 100, step: 5 }}
              error={!!errors.critical}
              helperText={errors.critical ?? 'Default 90%'}
            />
            <TextField
              fullWidth
              label="Block"
              type="number"
              value={form.alertThresholds.block}
              onChange={(e) => setThreshold('block', e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              inputProps={{ min: 1, max: 100, step: 5 }}
              error={!!errors.block}
              helperText={errors.block ?? 'Default 100%'}
            />
          </Box>

          <Divider />

          {/* Block requests toggle */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={form.blockRequestsOnLimit}
                  onChange={(e) => setField('blockRequestsOnLimit', e.target.checked)}
                  color="error"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    Block new requests when limit is reached
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    When enabled, LLM requests are blocked once the block threshold is hit.
                    When disabled, only an alert is sent.
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', mt: 0.5 }}
            />
          </Box>

        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {editingBudget ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetForm;
