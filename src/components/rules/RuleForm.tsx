import React, { useState, useEffect } from 'react';
import {
  Box, TextField, MenuItem, Select, FormControl, InputLabel,
  Switch, FormControlLabel, Chip, SelectChangeEvent,
  Checkbox, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography,
} from '@mui/material';
import { TenantRule, RuleType } from '../../types/rule';
import { RULE_TYPE_OPTIONS, ACTION_OPTIONS, MODEL_OPTIONS } from './RuleTypeSelector';

// ============================================================================
// Form Data & Validation
// ============================================================================

export const INITIAL_FORM_DATA = {
  name: '',
  description: '',
  action: 'block',
  priority: 0,
  enabled: true,
  scope: 'user' as 'user' | 'tenant',
  block_message: 'Request blocked by policy',
  // Token limit
  limit_type: 'daily' as string,
  max_tokens: 10000,
  // Model restriction
  restriction_type: 'allowlist' as string,
  models: ['gpt-3.5-turbo'] as string[],
  // Rate limit
  requests_per_minute: 10,
  requests_per_hour: 100,
  requests_per_day: 1000,
  // Content moderation (unified: toxicity blocking + PII redaction)
  check_toxicity: true,
  toxicity_threshold: 0.7,
  block_toxic: true,
  check_pii: true,
  redact_pii: true,
  pii_types: ['email', 'phone', 'ssn', 'credit_card'] as string[],
  // Metadata
  tags: [] as string[],
  // Scheduling
  effective_start: '',
  effective_end: '',
};

export type RuleFormData = typeof INITIAL_FORM_DATA;

export interface ValidationErrors {
  [key: string]: string;
}

export const validateForm = (formData: RuleFormData, ruleType: RuleType): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!formData.name.trim()) {
    errors.name = 'Rule name is required';
  }
  if (formData.priority < 0) {
    errors.priority = 'Priority must be 0 or greater';
  }

  switch (ruleType) {
    case 'token_limit':
      if (formData.max_tokens <= 0) errors.max_tokens = 'Token limit must be a positive number';
      break;
    case 'model_restriction':
      if (formData.models.length === 0) errors.models = 'At least one model must be selected';
      break;
    case 'rate_limit':
      if (formData.requests_per_minute <= 0) errors.requests_per_minute = 'Must be a positive number';
      if (formData.requests_per_hour <= 0) errors.requests_per_hour = 'Must be a positive number';
      break;
    case 'content_moderation':
      if (!formData.check_toxicity && !formData.check_pii) {
        errors.check_toxicity = 'At least one check (toxicity or PII) must be enabled';
      }
      if (formData.check_toxicity && (formData.toxicity_threshold <= 0 || formData.toxicity_threshold > 1)) {
        errors.toxicity_threshold = 'Toxicity threshold must be between 0.01 and 1.0';
      }
      break;
  }

  return errors;
};

/** Build conditions object from form data based on rule type */
export const buildRuleFromForm = (formData: RuleFormData, ruleType: RuleType, editingRule: TenantRule | null): Partial<TenantRule> => {
  const ruleData: any = {
    name: formData.name,
    description: formData.description || undefined,
    type: ruleType,
    priority: formData.priority,
    enabled: formData.enabled,
    conditions: {},
    parameters: { block_message: formData.block_message, action: formData.action },
    tags: formData.tags.length > 0 ? formData.tags : undefined,
    effective_start: formData.effective_start || undefined,
    effective_end: formData.effective_end || undefined,
  };

  switch (ruleType) {
    case 'token_limit':
      ruleData.conditions = {
        limit_type: formData.limit_type,
        max_tokens: formData.max_tokens,
        scope: formData.scope,
      };
      break;
    case 'model_restriction':
      ruleData.conditions = {
        restriction_type: formData.restriction_type,
        models: formData.models,
      };
      break;
    case 'rate_limit':
      ruleData.conditions = {
        requests_per_minute: formData.requests_per_minute,
        requests_per_hour: formData.requests_per_hour,
        scope: formData.scope,
      };
      break;
    case 'content_moderation':
      ruleData.conditions = {
        check_toxicity: formData.check_toxicity,
        toxicity_threshold: formData.check_toxicity ? formData.toxicity_threshold : undefined,
        check_pii: formData.check_pii,
        pii_types: formData.check_pii ? formData.pii_types : undefined,
      };
      ruleData.parameters = {
        block_message: formData.block_message,
        block_toxic: formData.check_toxicity ? formData.block_toxic : undefined,
        redact_pii: formData.check_pii ? formData.redact_pii : undefined,
      };
      break;
  }

  return ruleData;
};

/** Populate form data from an existing rule */
export const populateFormFromRule = (rule: TenantRule): RuleFormData => {
  const conditions = (rule.conditions as any) || {};
  return {
    ...INITIAL_FORM_DATA,
    name: rule.name,
    description: rule.description || '',
    action: (rule.parameters?.action as string) || 'block',
    priority: rule.priority,
    enabled: rule.enabled,
    scope: conditions.scope || 'user',
    block_message: (rule.parameters?.block_message as string) || 'Request blocked by policy',
    limit_type: conditions.limit_type || 'daily',
    max_tokens: conditions.max_tokens || 10000,
    restriction_type: conditions.restriction_type || 'allowlist',
    models: conditions.models || ['gpt-3.5-turbo'],
    requests_per_minute: conditions.requests_per_minute || 10,
    requests_per_hour: conditions.requests_per_hour || 100,
    requests_per_day: conditions.requests_per_day || 1000,
    tags: rule.tags || [],
    // Extract YYYY-MM-DD from ISO datetime so <input type="date"> renders correctly
    effective_start: rule.effective_start ? rule.effective_start.split('T')[0] : '',
    effective_end: rule.effective_end ? rule.effective_end.split('T')[0] : '',
    check_toxicity: conditions.check_toxicity ?? true,
    toxicity_threshold: conditions.toxicity_threshold ?? 0.7,
    block_toxic: (rule.parameters?.block_toxic as boolean) ?? true,
    check_pii: conditions.check_pii ?? true,
    redact_pii: (rule.parameters?.redact_pii as boolean) ?? true,
    pii_types: conditions.pii_types || ['email', 'phone', 'ssn', 'credit_card'],
  };
};

// ============================================================================
// Component
// ============================================================================

interface RuleFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (ruleData: Partial<TenantRule>, editingRule: TenantRule | null) => void;
  editingRule: TenantRule | null;
}

export const RuleForm: React.FC<RuleFormProps> = ({
  open,
  onClose,
  onSave,
  editingRule,
}) => {
  const [ruleType, setRuleType] = useState<RuleType>('token_limit');
  const [formData, setFormData] = useState<RuleFormData>({ ...INITIAL_FORM_DATA });
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [tagInput, setTagInput] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (!open) return;

    if (editingRule) {
      setRuleType(editingRule.type);
      setFormData(populateFormFromRule(editingRule));
    } else {
      setRuleType('token_limit');
      setFormData({ ...INITIAL_FORM_DATA });
    }
    setFormErrors({});
    setTagInput('');
  }, [open, editingRule]);

  // Field handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleRuleTypeChange = (e: SelectChangeEvent<string>) => {
    const newType = e.target.value as RuleType;
    setRuleType(newType);
    const defaultAction = ACTION_OPTIONS[newType]?.[0]?.value || 'block';
    setFormData(prev => ({ ...prev, action: defaultAction }));
    setFormErrors({});
  };

  const handleSave = () => {
    const errors = validateForm(formData, ruleType);
    if (Object.values(errors).some(Boolean)) {
      setFormErrors(errors);
      return;
    }
    const ruleData = buildRuleFromForm(formData, ruleType, editingRule);
    onSave(ruleData, editingRule);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingRule?.id ? 'Edit Rule' : editingRule ? 'Duplicate Rule' : 'Create New Rule'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Common Fields */}
          <TextField
            fullWidth label="Rule Name" name="name"
            value={formData.name} onChange={handleInputChange}
            required error={!!formErrors.name} helperText={formErrors.name}
          />

          <TextField
            fullWidth label="Description" name="description"
            value={formData.description} onChange={handleInputChange}
            multiline rows={2} placeholder="Optional description of what this rule does"
          />

          <FormControl fullWidth>
            <InputLabel>Rule Type</InputLabel>
            <Select value={ruleType} onChange={handleRuleTypeChange} label="Rule Type" disabled={!!editingRule}>
              {RULE_TYPE_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ my: 1 }} />

          {/* Type-Specific Fields */}
          {ruleType === 'token_limit' && (
            <>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Scope</InputLabel>
                  <Select name="scope" value={formData.scope} onChange={handleSelectChange} label="Scope">
                    <MenuItem value="user">Per User</MenuItem>
                    <MenuItem value="tenant">Per Organization</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Period</InputLabel>
                  <Select name="limit_type" value={formData.limit_type} onChange={handleSelectChange} label="Period">
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <TextField
                fullWidth label="Token Limit" name="max_tokens" type="number"
                value={formData.max_tokens} onChange={handleNumberChange}
                required error={!!formErrors.max_tokens} helperText={formErrors.max_tokens}
                inputProps={{ min: 1 }}
              />
            </>
          )}

          {ruleType === 'model_restriction' && (
            <>
              <FormControl fullWidth>
                <InputLabel>Restriction Type</InputLabel>
                <Select name="restriction_type" value={formData.restriction_type} onChange={handleSelectChange} label="Restriction Type">
                  <MenuItem value="allowlist">Allowlist (only allow specified models)</MenuItem>
                  <MenuItem value="blocklist">Blocklist (block specified models)</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth error={!!formErrors.models}>
                <InputLabel>Models</InputLabel>
                <Select
                  multiple name="models" value={formData.models}
                  onChange={(e) => setFormData(prev => ({ ...prev, models: e.target.value as unknown as string[] }))}
                  label="Models"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((v) => <Chip key={v} label={v} size="small" />)}
                    </Box>
                  )}
                >
                  {MODEL_OPTIONS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
                {formErrors.models && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {formErrors.models}
                  </Typography>
                )}
              </FormControl>
            </>
          )}

          {ruleType === 'rate_limit' && (
            <>
              <FormControl fullWidth>
                <InputLabel>Scope</InputLabel>
                <Select name="scope" value={formData.scope} onChange={handleSelectChange} label="Scope">
                  <MenuItem value="user">Per User</MenuItem>
                  <MenuItem value="tenant">Per Organization</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth label="Requests / Minute" name="requests_per_minute" type="number"
                  value={formData.requests_per_minute} onChange={handleNumberChange}
                  error={!!formErrors.requests_per_minute} helperText={formErrors.requests_per_minute}
                  inputProps={{ min: 1 }}
                />
                <TextField
                  fullWidth label="Requests / Hour" name="requests_per_hour" type="number"
                  value={formData.requests_per_hour} onChange={handleNumberChange}
                  error={!!formErrors.requests_per_hour} helperText={formErrors.requests_per_hour}
                  inputProps={{ min: 1 }}
                />
                <TextField
                  fullWidth label="Requests / Day" name="requests_per_day" type="number"
                  value={formData.requests_per_day} onChange={handleNumberChange}
                  inputProps={{ min: 1 }}
                />
              </Box>
            </>
          )}

          {ruleType === 'content_moderation' && (
            <>
              <Typography variant="subtitle2" color="text.secondary">Toxicity Detection</Typography>
              <FormControlLabel
                control={<Checkbox checked={formData.check_toxicity} onChange={(e) => setFormData(prev => ({ ...prev, check_toxicity: e.target.checked }))} />}
                label="Check for toxic content"
              />
              {formData.check_toxicity && (
                <Box sx={{ display: 'flex', gap: 2, pl: 2 }}>
                  <TextField
                    fullWidth label="Toxicity Threshold (0.01 – 1.0)" name="toxicity_threshold" type="number"
                    value={formData.toxicity_threshold} onChange={handleNumberChange}
                    error={!!formErrors.toxicity_threshold} helperText={formErrors.toxicity_threshold || 'Scores above this value trigger the action'}
                    inputProps={{ min: 0.01, max: 1, step: 0.05 }}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={formData.block_toxic} onChange={(e) => setFormData(prev => ({ ...prev, block_toxic: e.target.checked }))} />}
                    label="Block if toxic (vs log only)"
                    sx={{ whiteSpace: 'nowrap', alignSelf: 'center' }}
                  />
                </Box>
              )}

              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>PII Detection</Typography>
              <FormControlLabel
                control={<Checkbox checked={formData.check_pii} onChange={(e) => setFormData(prev => ({ ...prev, check_pii: e.target.checked }))} />}
                label="Check for PII (Personally Identifiable Information)"
              />
              {formData.check_pii && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pl: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>PII Types to Detect</InputLabel>
                    <Select
                      multiple
                      value={formData.pii_types}
                      onChange={(e) => setFormData(prev => ({ ...prev, pii_types: e.target.value as string[] }))}
                      label="PII Types to Detect"
                      renderValue={(selected) => (selected as string[]).join(', ')}
                    >
                      {['email', 'phone', 'ssn', 'credit_card', 'ip_address', 'name', 'address'].map(type => (
                        <MenuItem key={type} value={type}>
                          <Checkbox checked={formData.pii_types.includes(type)} />
                          {type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={<Checkbox checked={formData.redact_pii} onChange={(e) => setFormData(prev => ({ ...prev, redact_pii: e.target.checked }))} />}
                    label="Redact PII (vs log only)"
                  />
                </Box>
              )}

              {formErrors.check_toxicity && (
                <Typography color="error" variant="caption">{formErrors.check_toxicity}</Typography>
              )}
            </>
          )}

          <Divider sx={{ my: 1 }} />

          {/* Common Bottom Fields */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {ruleType !== 'content_moderation' && (
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Action</InputLabel>
                <Select name="action" value={formData.action} onChange={handleSelectChange} label="Action">
                  {(ACTION_OPTIONS[ruleType] || []).map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              label="Priority" name="priority" type="number" sx={{ flex: ruleType !== 'content_moderation' ? 1 : undefined, minWidth: 160 }}
              value={formData.priority} onChange={handleNumberChange}
              required error={!!formErrors.priority}
              helperText={formErrors.priority || 'Lower numbers = higher priority (0 = highest)'}
              inputProps={{ min: 0 }}
            />
          </Box>

          <TextField
            fullWidth label="Block Message" name="block_message"
            value={formData.block_message} onChange={handleInputChange}
            multiline rows={2}
          />

          {/* Tags */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Tags (optional)</Typography>
            {formData.tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    onDelete={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
                  />
                ))}
              </Box>
            )}
            <TextField
              fullWidth size="small" placeholder="Type a tag and press Enter to add"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                  e.preventDefault();
                  const newTag = tagInput.trim().replace(/,$/, '');
                  if (newTag && !formData.tags.includes(newTag)) {
                    setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
                  }
                  setTagInput('');
                }
              }}
            />
          </Box>

          {/* Scheduling */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth label="Effective From" name="effective_start" type="date"
              value={formData.effective_start} onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              helperText="Optional: rule becomes active on this date"
            />
            <TextField
              fullWidth label="Effective Until" name="effective_end" type="date"
              value={formData.effective_end} onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              helperText="Optional: rule expires on this date"
            />
          </Box>

          <FormControlLabel
            control={
              <Switch checked={formData.enabled} onChange={handleSwitchChange} name="enabled" color="primary" />
            }
            label="Enabled"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          {editingRule?.id ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RuleForm;
