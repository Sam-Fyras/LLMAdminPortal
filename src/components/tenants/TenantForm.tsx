import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, FormControl, FormControlLabel,
  InputLabel, MenuItem, Select, Switch, TextField, Typography,
} from '@mui/material';
import { OnboardRequest, UpdateRequest } from '../../types/tenant';

// Unified internal form state covering both create and edit
interface FormState {
  tenant_name: string;
  admin_name: string;
  admin_email: string;
  azure_tenant_id: string;
  azure_client_id: string;
  tier_name: string;
  firewall_version: string;
  llm_model: string;
  token_count: number;
  mongo_url: string;
  // edit-only
  status: string;
  is_active: boolean;
  schema_version: number;
  is_deleted: boolean;
}

// What the parent passes in for edit mode (mapped from TenantRow)
export interface TenantEditData {
  tenant_name?: string;
  admin_name?: string;
  admin_email?: string;
  azure_tenant_id?: string;
  azure_client_id?: string;
  tier_name?: string;
  firewall_version?: string;
  llm_model?: string;
  token_count?: number;
  mongo_url?: string;
  status?: string;
  is_active?: boolean;
  schema_version?: number;
  is_deleted?: boolean;
}

interface TenantFormProps {
  open: boolean;
  onClose: () => void;
  editTenant?: TenantEditData | null;
}

const defaultState: FormState = {
  tenant_name: '',
  admin_name: '',
  admin_email: '',
  azure_tenant_id: '',
  azure_client_id: '',
  tier_name: 'Pro',
  firewall_version: 'v1.0.0',
  llm_model: 'gpt-4',
  token_count: 1_000_000,
  mongo_url: '',
  status: 'active',
  is_active: true,
  schema_version: 1,
  is_deleted: false,
};

const TIERS = ['Free', 'Pro', 'Enterprise'];
const LLM_MODELS = ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'gemini-pro'];
const STATUSES = ['active', 'inactive', 'suspended'];

const TenantForm: React.FC<TenantFormProps> = ({ open, onClose, editTenant }) => {
  const [formData, setFormData] = useState<FormState>(defaultState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const isEditMode = Boolean(editTenant);

  useEffect(() => {
    if (editTenant) {
      setFormData({
        ...defaultState,
        tenant_name: editTenant.tenant_name ?? '',
        admin_name: editTenant.admin_name ?? '',
        admin_email: editTenant.admin_email ?? '',
        azure_tenant_id: editTenant.azure_tenant_id ?? '',
        azure_client_id: editTenant.azure_client_id ?? '',
        tier_name: editTenant.tier_name ?? 'Pro',
        firewall_version: editTenant.firewall_version ?? 'v1.0.0',
        llm_model: editTenant.llm_model ?? 'gpt-4',
        token_count: editTenant.token_count ?? 1_000_000,
        mongo_url: editTenant.mongo_url ?? '',
        status: editTenant.status ?? 'active',
        is_active: editTenant.is_active ?? true,
        schema_version: editTenant.schema_version ?? 1,
        is_deleted: editTenant.is_deleted ?? false,
      });
    } else {
      setFormData(defaultState);
    }
    setErrors({});
  }, [editTenant, open]);

  const clearError = (field: keyof FormState) => {
    if (errors[field]) setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    clearError(field);
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};

    if (!formData.tenant_name.trim()) errs.tenant_name = 'Tenant name is required';
    if (isEditMode && !formData.admin_name.trim()) errs.admin_name = 'Admin name is required';
    if (!formData.admin_email.trim()) errs.admin_email = 'Admin email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin_email))
      errs.admin_email = 'Invalid email format';
    if (!formData.azure_tenant_id.trim()) errs.azure_tenant_id = 'Azure Tenant ID is required';
    if (!formData.azure_client_id.trim()) errs.azure_client_id = 'Azure Client ID is required';
    if (!formData.tier_name) errs.tier_name = 'Tier is required';
    if (!formData.firewall_version.trim()) errs.firewall_version = 'Firewall version is required';
    if (!formData.llm_model) errs.llm_model = 'LLM model is required';
    if (!formData.token_count || formData.token_count <= 0)
      errs.token_count = 'Token count must be greater than 0';
    if (formData.mongo_url.trim() && !formData.mongo_url.startsWith('mongodb'))
      errs.mongo_url = 'Must start with mongodb:// or mongodb+srv://';
    if (isEditMode && formData.schema_version < 1)
      errs.schema_version = 'Schema version must be at least 1';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildOnboardPayload = (): OnboardRequest => ({
    tenant_name: formData.tenant_name,
    admin_email: formData.admin_email,
    azure_tenant_id: formData.azure_tenant_id,
    azure_client_id: formData.azure_client_id,
    tier_name: formData.tier_name,
    firewall_version: formData.firewall_version,
    llm_model: formData.llm_model,
    token_count: formData.token_count,
    mongo_url: formData.mongo_url || undefined,
  });

  const buildUpdatePayload = (): UpdateRequest => ({
    tenant_name: formData.tenant_name,
    tenant_admin: { name: formData.admin_name, email: formData.admin_email },
    azure_ad_tenant_id: formData.azure_tenant_id,
    azure_ad_client_id: formData.azure_client_id,
    tier_id: formData.tier_name,
    firewall_version_id: formData.firewall_version,
    llm_use: formData.llm_model,
    token_count: formData.token_count,
    mongo_url: formData.mongo_url || undefined,
    status: formData.status,
    is_active: formData.is_active,
    schema_version: formData.schema_version,
    is_deleted: formData.is_deleted,
  });

  const handleSave = () => {
    if (!validate()) return;
    if (isEditMode) {
      console.log('Updating tenant:', buildUpdatePayload());
    } else {
      console.log('Onboarding tenant:', buildOnboardPayload());
    }
    onClose();
  };

  const handleSaveAndAnother = () => {
    if (!validate()) return;
    console.log('Onboarding tenant & adding another:', buildOnboardPayload());
    setFormData(defaultState);
    setErrors({});
  };

  const handleClose = () => {
    setFormData(defaultState);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Tenant' : 'Onboard New Tenant'}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>

          {/* Tenant Info */}
          <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
            Tenant Info
          </Typography>

          <TextField
            label="Tenant Name"
            required
            fullWidth
            value={formData.tenant_name}
            onChange={set('tenant_name')}
            error={!!errors.tenant_name}
            helperText={errors.tenant_name}
          />

          {/* Admin name — only in edit mode (UpdateRequest has tenant_admin.name) */}
          {isEditMode && (
            <TextField
              label="Admin Name"
              required
              fullWidth
              value={formData.admin_name}
              onChange={set('admin_name')}
              error={!!errors.admin_name}
              helperText={errors.admin_name}
            />
          )}

          <TextField
            label="Admin Email"
            type="email"
            required
            fullWidth
            value={formData.admin_email}
            onChange={set('admin_email')}
            error={!!errors.admin_email}
            helperText={errors.admin_email}
          />

          <FormControl fullWidth required error={!!errors.tier_name}>
            <InputLabel>Tier</InputLabel>
            <Select
              label="Tier"
              value={formData.tier_name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, tier_name: e.target.value }));
                clearError('tier_name');
              }}
            >
              {TIERS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
            {errors.tier_name && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.tier_name}
              </Typography>
            )}
          </FormControl>

          {/* Status + Active — edit mode only */}
          {isEditMode && (
            <>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                >
                  {STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                      color="success"
                    />
                  }
                  label={
                    <Typography variant="body2" color={formData.is_active ? 'success.main' : 'text.secondary'}>
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_deleted}
                      onChange={(e) => setFormData((prev) => ({ ...prev, is_deleted: e.target.checked }))}
                      color="error"
                    />
                  }
                  label={
                    <Typography variant="body2" color={formData.is_deleted ? 'error.main' : 'text.secondary'}>
                      Deleted
                    </Typography>
                  }
                />
              </Box>
            </>
          )}

          <Divider />

          {/* Azure AD */}
          <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
            Azure Active Directory
          </Typography>

          <TextField
            label="Azure Tenant ID"
            required
            fullWidth
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={formData.azure_tenant_id}
            onChange={set('azure_tenant_id')}
            error={!!errors.azure_tenant_id}
            helperText={errors.azure_tenant_id}
          />

          <TextField
            label="Azure Client ID"
            required
            fullWidth
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={formData.azure_client_id}
            onChange={set('azure_client_id')}
            error={!!errors.azure_client_id}
            helperText={errors.azure_client_id}
          />

          <Divider />

          {/* LLM Config */}
          <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
            LLM Configuration
          </Typography>

          <FormControl fullWidth required error={!!errors.llm_model}>
            <InputLabel>LLM Model</InputLabel>
            <Select
              label="LLM Model"
              value={formData.llm_model}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, llm_model: e.target.value }));
                clearError('llm_model');
              }}
            >
              {LLM_MODELS.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </Select>
            {errors.llm_model && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.llm_model}
              </Typography>
            )}
          </FormControl>

          <TextField
            label="Token Count"
            type="number"
            required
            fullWidth
            value={formData.token_count}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, token_count: Number(e.target.value) }));
              clearError('token_count');
            }}
            error={!!errors.token_count}
            helperText={errors.token_count ?? 'Token quota for this tenant'}
            slotProps={{ htmlInput: { min: 1 } }}
          />

          <TextField
            label="Firewall Version"
            required
            fullWidth
            value={formData.firewall_version}
            onChange={set('firewall_version')}
            error={!!errors.firewall_version}
            helperText={errors.firewall_version}
          />

          {/* Schema Version — edit mode only */}
          {isEditMode && (
            <TextField
              label="Schema Version"
              type="number"
              fullWidth
              value={formData.schema_version}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, schema_version: Number(e.target.value) }));
                clearError('schema_version');
              }}
              error={!!errors.schema_version}
              helperText={errors.schema_version}
              slotProps={{ htmlInput: { min: 1 } }}
            />
          )}

          <Divider />

          {/* Database */}
          <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
            Database
          </Typography>

          <TextField
            label="MongoDB URL"
            fullWidth
            placeholder="mongodb+srv://..."
            value={formData.mongo_url}
            onChange={set('mongo_url')}
            error={!!errors.mongo_url}
            helperText={errors.mongo_url ?? 'Leave empty to use the default connection'}
          />

        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose}>Cancel</Button>
        {!isEditMode && (
          <Button variant="outlined" onClick={handleSaveAndAnother}>
            Save & Add Another
          </Button>
        )}
        <Button variant="contained" onClick={handleSave}>
          {isEditMode ? 'Save Changes' : 'Onboard Tenant'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TenantForm;
